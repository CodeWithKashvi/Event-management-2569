import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { animate, stagger, utils } from 'animejs';
import { Search, X } from 'lucide-react';
import { CAT_ICONS } from './categoryIcons.js';
import EventCard from './EventCard.jsx';
import SearchSelect from './SearchSelect.jsx';
import FlapText from './FlapText.jsx';
import { CATEGORIES, EVENTS, filterEvents } from '../data/events.js';
import { CITY_LIST } from '../data/cities.js';
import { usePasses } from '../lib/passes.js';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';
import './Explorer.css';

const SORT_TEXT = { soonest: 'soonest first', price: 'cheapest first', popular: 'most popular first' };
const plural = (n) => `${n} ${n === 1 ? 'event' : 'events'}`;
const CITY_OPTIONS = [
  { value: '', label: 'All cities', hint: `All of India, ${plural(EVENTS.length)}` },
  ...CITY_LIST.map((c) => ({ value: c.name, label: c.name, hint: `${c.state}, ${plural(c.events.length)}` })),
];
const SORT_OPTIONS = [
  { value: 'soonest', label: 'Soonest first', hint: 'By date and time' },
  { value: 'price', label: 'Price: low to high', hint: 'Free events first' },
  { value: 'popular', label: 'Most popular', hint: 'Fullest events first' },
];

/**
 * Search, category, city and sort live in the URL (?q=&cat=&city=&sort=), so a filtered
 * list can be shared and survives the back button. When a filter changes, the cards showing fade
 * out, the new set is applied, and the matching cards fade back in one after another (anime.js
 * animate + stagger). On wide screens the filters become a sticky sidebar that
 * glides in from the middle of the page as the section scrolls into view (GSAP ScrollTrigger).
 */

export default function Explorer() {
  const [params, setParams] = useSearchParams();
  const passes = usePasses();
  const filters = {
    q: params.get('q') ?? '',
    category: params.get('cat') ?? '',
    city: params.get('city') ?? '',
    sort: params.get('sort') ?? 'soonest',
  };
  const [query, setQuery] = useState(filters.q);
  const inputRef = useRef(null);
  const gridRef = useRef(null);
  const root = useRef(null);
  const fadeOut = useRef(null); // the running fade-out, if any
  const queued = useRef(null); // filter changes waiting for that fade-out to finish
  const mounted = useRef(false);

  // Wide screens: the filter panel slides from the centre into its sidebar spot, and the grid rises in.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1100px) and (prefers-reduced-motion: no-preference)', () => {
        const scrollTrigger = (start, end) => ({ trigger: '.explorer__layout', start, end, scrub: 0.8 });
        // Start the panel centred in the layout, then let it travel to the left edge.
        const fromCentre = () => {
          const layoutEl = root.current.querySelector('.explorer__layout');
          const bar = root.current.querySelector('.explorer__toolbar');
          return layoutEl.offsetWidth / 2 - bar.offsetWidth / 2;
        };
        gsap.from('.explorer__toolbar', {
          x: fromCentre,
          scale: 0.94,
          autoAlpha: 0,
          ease: 'power2.out',
          scrollTrigger: { ...scrollTrigger('top 92%', 'top 40%'), invalidateOnRefresh: true },
        });
        gsap.from('.explorer__results', { y: 90, autoAlpha: 0, ease: 'power2.out', scrollTrigger: scrollTrigger('top 95%', 'top 45%') });
      });
    },
    { scope: root },
  );

  useEffect(() => () => fadeOut.current?.cancel(), []);

  const apply = (changes) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
        return next;
      },
      { replace: true, preventScrollReset: true },
    );

  /** Step 1: fade the cards on screen out, then apply every change that came in meanwhile. */
  const update = (changes) => {
    const showing = [...gridRef.current.querySelectorAll('.event-card:not(.is-hidden)')];
    if (reducedMotion() || !showing.length) return apply(changes);
    queued.current = { ...queued.current, ...changes };
    if (fadeOut.current) return; // a fade-out is already running; these changes ride along with it
    fadeOut.current = animate(showing, {
      opacity: 0,
      translateY: 14,
      scale: 0.96,
      duration: 220,
      delay: stagger(15),
      ease: 'in(2)',
      onComplete: () => {
        const all = queued.current;
        queued.current = null;
        fadeOut.current = null;
        apply(all);
      },
    });
  };

  /** Step 2: after the new set renders, the matching cards fade back in, one after another. */
  const key = params.toString();
  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const cards = [...gridRef.current.querySelectorAll('.event-card:not(.is-hidden)')];
    if (reducedMotion()) {
      utils.set(cards, { opacity: 1, translateY: 0, scale: 1 });
    } else {
      utils.set(cards, { opacity: 0, translateY: 28, scale: 0.96 });
      animate(cards, { opacity: 1, translateY: 0, scale: 1, duration: 560, delay: stagger(60, { start: 40 }), ease: 'out(3)' });
    }
    // If the results' top is above the screen (filtering from deep in the grid), bring them back into view.
    const results = root.current.querySelector('.explorer__results');
    if (results.getBoundingClientRect().top < 0) {
      results.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }
  }, [key]);

  // Typing updates the URL after a short pause…
  useEffect(() => {
    if (query === filters.q) return;
    const id = setTimeout(() => update({ q: query.trim() ? query : '' }), 200);
    return () => clearTimeout(id);
  }, [query]);

  // …and a URL change from elsewhere (hero search, back button) updates the box.
  useEffect(() => {
    if (document.activeElement !== inputRef.current) setQuery(filters.q);
  }, [filters.q]);

  const visible = filterEvents(EVENTS, filters);
  const shown = new Set(visible.map((e) => e.id));
  const ordered = [...visible, ...EVENTS.filter((e) => !shown.has(e.id))];
  const active = filters.q || filters.category || filters.city;
  const countFor = (category) => filterEvents(EVENTS, { ...filters, category }).length;

  const clear = () => {
    setQuery('');
    update({ q: '', cat: '', city: '' });
  };

  return (
    <section className="explorer" id="explore" aria-labelledby="explore-title" ref={root}>
      <div className="container">
        <div className="explorer__head">
          <div>
            <h2 id="explore-title" className="section-title">
              All events
            </h2>
            <p className="section-sub">
              Everything on the board across India, sorted {SORT_TEXT[filters.sort] ?? SORT_TEXT.soonest}.
            </p>
          </div>
          <div className="explorer__count">
            <FlapText text={String(visible.length).padStart(2, '0')} length={2} scramble={false} />
            <p className="explorer__status" aria-live="polite">
              {visible.length === EVENTS.length ? (
                <>
                  events <span>showing</span>
                </>
              ) : (
                <>
                  of {EVENTS.length} <span>match</span>
                </>
              )}
              <span className="sr-only">
                {visible.length === EVENTS.length ? `Showing all ${EVENTS.length} events` : `Showing ${visible.length} of ${EVENTS.length} events`}
              </span>
            </p>
          </div>
        </div>

        <div className="explorer__layout">
          <div className="explorer__toolbar">
            <div className="search-box">
              <Search size={18} aria-hidden="true" />
              <label htmlFor="explore-q" className="sr-only">
                Search events
              </label>
              <input
                ref={inputRef}
                id="explore-q"
                type="search"
                placeholder="Search events or cities"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="select">
              <label htmlFor="explore-city">City</label>
              <SearchSelect
                id="explore-city"
                label="City"
                value={filters.city}
                options={CITY_OPTIONS}
                searchPlaceholder="Search cities or states"
                onChange={(v) => update({ city: v })}
              />
            </div>

            <div className="select">
              <label htmlFor="explore-sort">Sort</label>
              <SearchSelect
                id="explore-sort"
                label="Sort order"
                value={filters.sort}
                options={SORT_OPTIONS}
                searchPlaceholder="Search sort options"
                onChange={(v) => update({ sort: v === 'soonest' ? '' : v })}
              />
            </div>

            <p className="explorer__label" aria-hidden="true">
              Category
            </p>
            <div className="chips" role="group" aria-label="Category">
              {['', ...CATEGORIES].map((c) => {
                const Icon = CAT_ICONS[c];
                return (
                  <button
                    key={c || 'all'}
                    type="button"
                    className="chip chip--icon"
                    data-cat={c || undefined}
                    aria-pressed={filters.category === c}
                    onClick={() => update({ cat: c })}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {c || 'All'}
                    <span className="chip__count">{countFor(c)}</span>
                  </button>
                );
              })}
            </div>

            {active && (
              <button type="button" className="link-btn explorer__clear" onClick={clear}>
                <X size={16} aria-hidden="true" /> Clear filters
              </button>
            )}
          </div>

          <div className="explorer__results">
            <div className="event-grid" ref={gridRef}>
              {ordered.map((e) => (
                <EventCard key={e.id} event={e} passes={passes} hidden={!shown.has(e.id)} />
              ))}
            </div>

            {visible.length === 0 && (
              <div className="empty">
                <h3>No events match {filters.q ? <>&ldquo;{filters.q.trim()}&rdquo;</> : 'these filters'}{filters.city && ` in ${filters.city}`}.</h3>
                <p>Try a different word, pick another city, or see everything again.</p>
                <button type="button" className="btn" onClick={clear}>
                  Show all events
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
