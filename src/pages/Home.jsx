import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowUpRight, CalendarDays, MapPin, Pause, Play, Search } from 'lucide-react';
import DepartureBoard from '../components/DepartureBoard.jsx';
import BookingJourney from '../components/BookingJourney.jsx';
import CityMap from '../components/CityMap.jsx';
import Countdown from '../components/Countdown.jsx';
import EventImage from '../components/EventImage.jsx';
import Explorer from '../components/Explorer.jsx';
import FlapText from '../components/FlapText.jsx';
import NextChip from '../components/NextChip.jsx';
import PosterMarquee from '../components/PosterMarquee.jsx';
import { CATEGORIES, CITIES, EVENTS, getEvent, seatsLeft } from '../data/events.js';
import { usePasses } from '../lib/passes.js';
import { gsap, reducedMotion, ScrollTrigger, SplitText, useGSAP } from '../lib/motion.js';
import { formatDate, formatPrice, formatTime } from '../lib/schedule.js';
import './Home.css';

// Words that flip into the headline, each in its category's colour.
const FLAP_WORDS = [
  ['CONCERT', 'Music'],
  ['FOOD WALK', 'Food'],
  ['HACKATHON', 'Tech'],
  ['NIGHT RUN', 'Sports'],
  ['STAND-UP', 'Culture'],
  ['WORKSHOP', 'Workshops'],
  ['KUTCHERI', 'Music'],
  ['BOOK SWAP', 'Culture'],
];
const FLAP_LEN = 9;

const POPULAR = [
  { label: 'Food walks', to: '/?cat=Food' },
  { label: 'Bhubaneswar', to: '/?city=Bhubaneswar' },
  { label: 'Hackathons', to: '/?q=hackathon' },
  { label: 'Free entry', to: '/?q=free' },
];

const SCENES = {
  Music: { photo: 'carnatic-at-dawn', text: 'Ragas, rooftops and sunrise kutcheris' },
  Food: { photo: 'biryani-trail', text: 'Walks through India’s great food streets' },
  Culture: { photo: 'odissi-under-the-stars', text: 'Dance, stand-up and book addas' },
  Tech: { photo: 'build-weekend', text: 'Hackathons and pitch nights' },
  Sports: { photo: 'marine-drive-10k', text: 'Night runs, surf and gully cricket' },
  Workshops: { photo: 'paint-a-pattachitra', text: 'Make something with master craftspeople' },
};

function Hero() {
  const ref = useRef(null);
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [word, setWord] = useState(0);
  const [paused, setPaused] = useState(reducedMotion);

  // The headline's split-flap word changes every few seconds.
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setWord((w) => (w + 1) % FLAP_WORDS.length), 2600);
    return () => clearInterval(id);
  }, [paused]);

  // The one orchestrated page-load moment: the headline rises, the flap word lands, the posters roll in.
  useGSAP(
    () => {
      if (reducedMotion()) return;
      SplitText.create('.hero__line', {
        type: 'words',
        mask: 'words',
        autoSplit: true,
        onSplit: (self) => gsap.from(self.words, { yPercent: 115, duration: 1.1, ease: 'expo.out', stagger: 0.07, delay: 0.1 }),
      });
      gsap.from('.hero__flapword', { scale: 0.85, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.6)', delay: 0.25 });
      gsap.from('.hero__sign, .next-chip, .hero__row', {
        y: 18,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08,
        delay: 0.45,
      });
      gsap.from('.marquee', { y: 90, autoAlpha: 0, duration: 1.3, ease: 'expo.out', delay: 0.6 });
    },
    { scope: ref },
  );

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate({ pathname: '/', search: term ? `?q=${encodeURIComponent(term)}` : '' }, { state: { explore: true }, preventScrollReset: true });
  };

  const [text, cat] = FLAP_WORDS[word];

  return (
    <section className="hero" ref={ref} aria-labelledby="hero-title">
      <div className="container hero__copy">
        <p className="hero__sign">
          <span lang="hi">यात्री कृपया ध्यान दें</span>
          <span className="hero__sign-en">Attention, please</span>
        </p>

        <div className="hero__head">
          <h1 id="hero-title" className="hero__title" data-page-title tabIndex={-1}>
            <span className="sr-only">Your next plan is now boarding.</span>
            <span className="hero__l1" aria-hidden="true">
              <span className="hero__line">Your next</span>
              <span className="hero__flapword" data-cat={cat}>
                <FlapText text={text} length={FLAP_LEN} />
              </span>
            </span>
            <span className="hero__l2" aria-hidden="true">
              <span className="hero__line">is now boarding.</span>
            </span>
          </h1>
          <NextChip />
        </div>

        <div className="hero__row">
          <p className="hero__lede">
            Concerts, food walks, hackathons and workshops in {CITIES.length} Indian cities. Find one you like and get
            your pass in under a minute.
          </p>
          <div className="hero__find">
            <form className="hero__search" role="search" onSubmit={submit}>
              <Search size={20} aria-hidden="true" />
              <label htmlFor="hero-q" className="sr-only">
                Search events
              </label>
              <input
                id="hero-q"
                type="search"
                placeholder="Try “biryani”, “Mumbai” or “hackathon”"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button type="submit" className="btn btn--primary">
                Find events
              </button>
            </form>
            <div className="hero__popular">
              <span>Popular:</span>
              <ul>
                {POPULAR.map((p) => (
                  <li key={p.label}>
                    <Link to={p.to} state={{ explore: true }} preventScrollReset>
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <PosterMarquee paused={paused} />

      <div className="container hero__foot">
        <button type="button" className="hero__pause" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          {paused ? 'Play motion' : 'Pause motion'}
        </button>
      </div>
    </section>
  );
}

function Departures() {
  return (
    <section className="section section--soft" id="departures" aria-labelledby="departures-title">
      <div className="container">
        <div className="section-head" data-reveal>
          <div>
            <h2 id="departures-title" className="section-title">
              Live departures
            </h2>
            <p className="section-sub">The next events across India, updated as seats fill up. Tap a row to see the event.</p>
          </div>
        </div>
        <DepartureBoard />
      </div>
    </section>
  );
}

function Scenes() {
  return (
    <section className="section" aria-labelledby="scenes-title">
      <div className="container">
        <div className="section-head" data-reveal>
          <div>
            <h2 id="scenes-title" className="section-title">
              Find your scene
            </h2>
            <p className="section-sub">Six kinds of plans, from sunrise kutcheris to midnight runs.</p>
          </div>
        </div>
        <ul className="scenes">
          {CATEGORIES.map((c) => {
            const count = EVENTS.filter((e) => e.category === c).length;
            return (
              <li key={c} className={`scene scene--${c.toLowerCase()}`} data-cat={c} data-reveal>
                <Link to={`/?cat=${c}`} state={{ explore: true }} preventScrollReset className="scene__link">
                  <EventImage event={getEvent(SCENES[c].photo)} decorative sizes="(min-width: 900px) 620px, 100vw" />
                  <span className="scene__text">
                    <span className="scene__name">{c}</span>
                    <span className="scene__desc">{SCENES[c].text}</span>
                  </span>
                  <span className="scene__count">
                    {count} {count === 1 ? 'event' : 'events'}
                  </span>
                  <span className="scene__go" aria-hidden="true">
                    <ArrowUpRight size={20} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Featured() {
  const ref = useRef(null);
  const passes = usePasses();
  const event = EVENTS.find((e) => e.featured) ?? EVENTS[0];
  const left = seatsLeft(event, passes);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.fromTo(
        '.feature__media img',
        { scale: 1.16, yPercent: -4 },
        { scale: 1, yPercent: 4, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    },
    { scope: ref },
  );

  return (
    <section className="section section--tight" ref={ref} aria-labelledby="featured-title">
      <div className="container">
        <article className="feature" data-cat={event.category} data-reveal>
          <div className="feature__media">
            <EventImage event={event} sizes="(min-width: 960px) 620px, 100vw" />
            <span className="pill pill--on-photo" data-cat={event.category}>
              Featured this week
            </span>
          </div>
          <div className="feature__body">
            <span className="pill" data-cat={event.category}>
              {event.category}
            </span>
            <h2 id="featured-title" className="feature__title">
              {event.title}
            </h2>
            <ul className="feature__meta">
              <li>
                <CalendarDays size={18} aria-hidden="true" />
                {formatDate(event.start)}, {formatTime(event.start)}
              </li>
              <li>
                <MapPin size={18} aria-hidden="true" />
                {event.venue}, {event.city}
              </li>
            </ul>
            <p className="feature__blurb">{event.blurb}</p>
            <Countdown target={event.start} />
            <div className="feature__actions">
              <Link to={`/events/${event.id}`} viewTransition className="btn btn--dark">
                Book a pass
              </Link>
              <p>
                {formatPrice(event.price)} per person, {left} seats left
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function Cities() {
  return (
    <section className="section section--tight" id="cities" aria-labelledby="cities-title">
      <div className="container">
        <div className="section-head" data-reveal>
          <div>
            <h2 id="cities-title" className="section-title">
              Pick a city
            </h2>
            <p className="section-sub">Eleven stops on this season’s route, from Puri to Hyderabad. Tap a city to see what’s on.</p>
          </div>
        </div>
        <CityMap />
      </div>
    </section>
  );
}

export default function Home() {
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => {
    document.title = 'Mela: events across India';
  }, []);

  // Links like "Events", a city stop or the footer ask to land on a section (the list by default).
  useEffect(() => {
    const id = location.state?.section ?? (location.state?.explore ? 'explore' : null);
    if (!id) return;
    // Wait a frame so the router's scroll-to-top on navigation runs first and doesn't cancel this.
    const raf = requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' }),
    );
    return () => cancelAnimationFrame(raf);
  }, [location.key, location.state]);

  // Sections ease in once as they scroll into view.
  useGSAP(
    () => {
      if (reducedMotion()) return;
      const items = gsap.utils.toArray('[data-reveal]');
      gsap.set(items, { autoAlpha: 0, y: 32 });
      ScrollTrigger.batch(items, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref}>
      <Hero />
      <Departures />
      <Scenes />
      <Featured />
      <Cities />
      <BookingJourney />
      <Explorer />
    </div>
  );
}
