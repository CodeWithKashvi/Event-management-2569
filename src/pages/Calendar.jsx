import { useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router';
import { animate, spring, stagger } from 'animejs';
import { CalendarPlus, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import EventImage from '../components/EventImage.jsx';
import FlapText from '../components/FlapText.jsx';
import { CAT_ICONS } from '../components/categoryIcons.js';
import { CATEGORIES, EVENTS, seatStatus, seatsLeft } from '../data/events.js';
import { FESTIVALS } from '../data/festivals.js';
import { downloadIcs } from '../lib/calendar.js';
import { usePasses } from '../lib/passes.js';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';
import { formatClock, formatPrice, formatTime, istDayKey } from '../lib/schedule.js';
import './Calendar.css';

const DAY_MS = 24 * 60 * 60 * 1000;
const IST_OFFSET_MS = 330 * 60 * 1000;
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// Day cells are built as UTC midnights of India's calendar dates, so format them in UTC.
const fmt = (opts, locale = 'en-IN') => new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...opts });
const longDay = fmt({ weekday: 'long', day: 'numeric', month: 'long' });
const monthShort = fmt({ month: 'short' });
const monthYear = fmt({ month: 'long', year: 'numeric' });
const weekdayEn = fmt({ weekday: 'long' });
const weekdayHi = fmt({ weekday: 'long' }, 'hi-IN');
const monthHi = fmt({ month: 'long' }, 'hi-IN');

/** Events grouped by the day they start on in India: { '2026-11-08': [event, …] }. */
const groupByDay = (events) =>
  events.reduce((map, e) => {
    (map[istDayKey(e.start)] ??= []).push(e);
    return map;
  }, {});

/** Whole weeks (Monday first) from this week until the week of the last event. */
function buildWeeks(now) {
  const ist = new Date(now + IST_OFFSET_MS);
  const monday = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() - ((ist.getUTCDay() + 6) % 7));
  const lastKey = istDayKey(EVENTS[EVENTS.length - 1].start);
  const days = [];
  for (let t = monday; ; t += DAY_MS) {
    const key = new Date(t).toISOString().slice(0, 10);
    if (days.length % 7 === 0 && key > lastKey) break;
    days.push({ key, date: new Date(t) });
  }
  return Array.from({ length: days.length / 7 }, (_, w) => days.slice(w * 7, w * 7 + 7));
}

const plural = (n) => `${n} ${n === 1 ? 'event' : 'events'}`;
const dateOf = (key) => new Date(`${key}T00:00:00Z`);

function whenLabel(key, today) {
  const days = Math.round((dateOf(key) - dateOf(today)) / DAY_MS);
  return days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`;
}

function AgendaRow({ event, passes }) {
  const status = seatStatus(event, passes);
  return (
    <li className="agenda__row" data-cat={event.category}>
      <EventImage event={event} decorative sizes="120px" className="agenda__img" />
      <div className="agenda__body">
        <div className="agenda__meta">
          <FlapText text={formatClock(event.start)} length={5} className="agenda__flap" />
          <time className="sr-only" dateTime={event.start.toISOString()}>
            {formatTime(event.start)}
          </time>
          <span className="pill">{event.category}</span>
        </div>
        <h3 className="agenda__name">
          <Link to={`/events/${event.id}`} viewTransition className="agenda__link">
            {event.title}
          </Link>
        </h3>
        <p className="agenda__where">
          <MapPin size={14} aria-hidden="true" />
          {event.venue}, {event.city}
        </p>
        <div className="agenda__foot">
          <span className="agenda__price">
            {formatPrice(event.price)}
            {status !== 'open' && (
              <small className={`seat-note is-${status}`}>{status === 'full' ? 'Fully booked' : `${seatsLeft(event, passes)} left`}</small>
            )}
          </span>
          <button type="button" className="agenda__ics" onClick={() => downloadIcs(event)}>
            <CalendarPlus size={16} aria-hidden="true" />
            <span className="sr-only">Add {event.title} to your calendar</span>
          </button>
        </div>
      </div>
    </li>
  );
}

export default function Calendar() {
  const passes = usePasses();
  const [params, setParams] = useSearchParams();
  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const agendaRef = useRef(null);
  const sheetRef = useRef(null);
  const pageRef = useRef(null);
  const tearRef = useRef(null);
  const weeks = useRef(buildWeeks(Date.now())).current;
  const today = istDayKey(new Date());

  const cat = CATEGORIES.includes(params.get('cat')) ? params.get('cat') : '';
  const byDay = groupByDay(cat ? EVENTS.filter((e) => e.category === cat) : EVENTS);
  const busyDays = Object.keys(byDay).sort().filter((k) => k >= today);
  // The day in the URL (?day=2026-11-08) if it's on this calendar and not in the past, else the first busy day.
  const asked = params.get('day');
  const askedOk = asked >= today && weeks.some((w) => w.some((d) => d.key === asked));
  const selected = askedOk ? asked : (busyDays[0] ?? today);
  const dayEvents = byDay[selected] ?? [];
  const prevBusy = busyDays.findLast((k) => k < selected);
  const nextBusy = busyDays.find((k) => k > selected);
  const fest = FESTIVALS[selected];
  const sel = dateOf(selected);

  useEffect(() => {
    document.title = 'Calendar | Mela';
  }, []);

  // Page load (GSAP): the days cascade in week by week while the wall calendar drops onto its nail and swings to rest.
  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.cal', { autoAlpha: 0, y: 28, duration: 0.6 })
        .from('.cal-day', { autoAlpha: 0, scale: 0.82, duration: 0.5, stagger: { grid: [weeks.length, 7], from: 'start', amount: 0.55 } }, '-=0.35')
        .from('.sheet', { autoAlpha: 0, y: -70, rotation: -8, transformOrigin: '50% 0%', duration: 1.5, ease: 'elastic.out(1, 0.4)' }, 0.1);
    },
    { scope: rootRef },
  );

  // Changing the category (anime.js): the days that still have events spring up, so you see where they are.
  const shownCat = useRef(cat);
  useEffect(() => {
    if (shownCat.current === cat) return;
    shownCat.current = cat;
    if (reducedMotion()) return;
    animate(gridRef.current.querySelectorAll('.cal-day.has-events'), {
      scale: [0.86, 1],
      delay: stagger(30),
      ease: spring({ stiffness: 320, damping: 14 }),
    });
  }, [cat]);

  // Each time a day is picked, its events slide in one after another.
  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const rows = agendaRef.current?.querySelectorAll('.agenda__row, .agenda__empty');
    if (rows?.length) animate(rows, { opacity: [0, 1], translateY: [16, 0], duration: 450, delay: stagger(60), ease: 'out(3)' });
  }, [selected, cat]);

  const pick = (key) => {
    if (key === selected) return;
    // Tear the current page off the wall calendar: a copy of it falls away, uncovering the new day.
    if (!reducedMotion()) {
      const page = pageRef.current.cloneNode(true);
      tearRef.current.append(page);
      animate(page, {
        rotate: [0, -4, 18],
        y: [0, 14, 240],
        opacity: [1, 1, 0],
        duration: 850,
        ease: 'in(2)',
        onComplete: () => page.remove(),
      });
    }
    setParams(
      (p) => {
        p.set('day', key);
        return p;
      },
      { replace: true, preventScrollReset: true },
    );
    // When the page is stacked, bring the day's sheet into view.
    if (sheetRef.current.getBoundingClientRect().top > innerHeight * 0.65) {
      sheetRef.current.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }
  };

  const filter = (c) => setParams(c ? { cat: c } : {}, { replace: true, preventScrollReset: true });

  // Arrow keys move between days (Home/End jump to the ends of the week); Enter or Space picks one.
  const onGridKey = (e) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    const i = Number(document.activeElement?.dataset.i);
    if (Number.isNaN(i) || (!step && e.key !== 'Home' && e.key !== 'End')) return;
    const to = step ? i + step : e.key === 'Home' ? i - (i % 7) : i - (i % 7) + 6;
    const btn = e.currentTarget.querySelector(`[data-i="${to}"]:not(:disabled)`);
    e.preventDefault();
    btn?.focus();
  };

  const months = [...new Set(weeks.flat().map((d) => monthYear.format(d.date)))];

  return (
    <div className="container calendar-page" ref={rootRef}>
      <header className="page-head">
        <h1 className="page-title" data-page-title tabIndex={-1}>
          What’s on
        </h1>
        <p className="page-sub">
          {plural(EVENTS.length)} over the next {weeks.length} weeks, across India. Pick a day to tear off its page.
        </p>
      </header>

      <div className="calendar">
        <section className="cal" aria-labelledby="cal-title">
          <div className="cal__top">
            <h2 id="cal-title" className="cal__title">
              {months.join(' – ')}
            </h2>
            <div className="cal__filters" role="group" aria-label="Show category">
              {['', ...CATEGORIES].map((c) => {
                const Icon = CAT_ICONS[c];
                return (
                  <button
                    key={c || 'all'}
                    type="button"
                    className="chip chip--icon"
                    data-cat={c || undefined}
                    aria-pressed={cat === c}
                    onClick={() => filter(c)}
                  >
                    <Icon size={15} aria-hidden="true" />
                    {c || 'All'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="cal__grid" role="grid" aria-labelledby="cal-title" onKeyDown={onGridKey} ref={gridRef}>
            <div className="cal__row cal__row--head" role="row">
              {WEEKDAYS.map((d) => (
                <span key={d} role="columnheader" className="cal__weekday">
                  {d}
                </span>
              ))}
            </div>
            {weeks.map((week, w) => (
              <div className="cal__row" role="row" key={week[0].key}>
                {week.map(({ key, date }, d) => {
                  const events = byDay[key] ?? [];
                  const past = key < today;
                  const isFirst = date.getUTCDate() === 1 || (w === 0 && d === 0);
                  const dayFest = FESTIVALS[key];
                  return (
                    <div role="gridcell" key={key} className="cal__cell">
                      <button
                        type="button"
                        data-i={w * 7 + d}
                        data-cat={events[0]?.category}
                        tabIndex={key === selected ? 0 : -1}
                        className={`cal-day${key === today ? ' is-today' : ''}${events.length ? ' has-events' : ''}${dayFest ? ' is-fest' : ''}`}
                        aria-pressed={key === selected}
                        aria-label={`${longDay.format(date)}${key === today ? ', today' : ''}${dayFest ? `, ${dayFest[0]}` : ''}: ${events.length ? plural(events.length) : 'no events'}`}
                        disabled={past}
                        onClick={() => pick(key)}
                      >
                        <span className="cal-day__top" aria-hidden="true">
                          <span className="cal-day__num">{date.getUTCDate()}</span>
                          {isFirst && <span className="cal-day__mon">{monthShort.format(date)}</span>}
                          {dayFest && <span className="cal-day__fest">{dayFest[0]}</span>}
                        </span>
                        {events.length > 0 && (
                          <span className="cal-day__photos" aria-hidden="true">
                            {events.slice(0, 2).map((e) => (
                              <EventImage key={e.id} event={e} decorative sizes="80px" />
                            ))}
                          </span>
                        )}
                        <span className="cal-day__events" aria-hidden="true">
                          {events.slice(0, 2).map((e) => (
                            <span key={e.id} className="cal-day__name" data-cat={e.category}>
                              {e.board}
                            </span>
                          ))}
                          {events.length > 2 && <span className="cal-day__more">+{events.length - 2} more</span>}
                        </span>
                        <span className="cal-day__dots" aria-hidden="true">
                          {events.map((e) => (
                            <i key={e.id} data-cat={e.category} />
                          ))}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        <section className="sheet" ref={sheetRef} aria-labelledby="agenda-title" aria-live="polite">
          <div className="sheet__band" aria-hidden="true">
            <span lang="hi">मेला</span> {sel.getUTCFullYear()}
          </div>
          <div className="sheet__pad">
            <div className={`sheet__page${sel.getUTCDay() === 0 ? ' is-sunday' : ''}`} ref={pageRef} aria-hidden="true">
              <p className="sheet__month">
                {monthYear.format(sel)} <span lang="hi">{monthHi.format(sel)}</span>
              </p>
              <p className="sheet__date">{sel.getUTCDate()}</p>
              <p className="sheet__weekday">
                {weekdayEn.format(sel)} <span lang="hi">{weekdayHi.format(sel)}</span>
              </p>
              {fest && (
                <p className="sheet__fest">
                  {fest[0]} <span lang="hi">{fest[1]}</span>
                </p>
              )}
            </div>
            <div className="sheet__tear" ref={tearRef} aria-hidden="true" />
          </div>

          <h2 id="agenda-title" className="sr-only">
            {selected === today ? 'Today, ' : ''}
            {longDay.format(sel)}
            {fest ? `, ${fest[0]}` : ''}
          </h2>
          <div className="sheet__nav">
            <button
              type="button"
              className="sheet__step"
              disabled={!prevBusy}
              onClick={() => pick(prevBusy)}
              aria-label="Previous day with events"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <p className="sheet__count">
              <strong>{whenLabel(selected, today)}</strong>
              {dayEvents.length ? plural(dayEvents.length) : 'Nothing on'}
              {cat && dayEvents.length > 0 ? ` in ${cat}` : ''}
            </p>
            <button
              type="button"
              className="sheet__step"
              disabled={!nextBusy}
              onClick={() => pick(nextBusy)}
              aria-label="Next day with events"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>

          <ol className="agenda__list" ref={agendaRef}>
            {dayEvents.map((e) => (
              <AgendaRow key={e.id} event={e} passes={passes} />
            ))}
            {!dayEvents.length && (
              <li className="agenda__empty">
                <p>A quiet day on the board{cat ? ` for ${cat}` : ''}.</p>
                {nextBusy && (
                  <button type="button" className="btn" onClick={() => pick(nextBusy)}>
                    Jump to {longDay.format(dateOf(nextBusy))}
                  </button>
                )}
              </li>
            )}
          </ol>
        </section>
      </div>
    </div>
  );
}
