import { useEffect, useRef } from 'react';
import { Link, useViewTransitionState } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import CityMap from '../components/CityMap.jsx';
import EventImage from '../components/EventImage.jsx';
import { getEvent } from '../data/events.js';
import { CITY_LIST } from '../data/cities.js';
import { gsap, reducedMotion, ScrollTrigger, useGSAP } from '../lib/motion.js';
import './Cities.css';

function CityCard({ city }) {
  const to = `/cities/${city.slug}`;
  const opening = useViewTransitionState(to);
  const n = city.events.length;
  return (
    <Link to={to} viewTransition className="city-card">
      <EventImage
        event={getEvent(city.photo)}
        decorative
        sizes="(min-width: 1100px) 300px, (min-width: 640px) 45vw, 92vw"
        style={opening ? { viewTransitionName: 'city-photo' } : undefined}
      />
      <span className="city-card__state">{city.state}</span>
      <span className="city-card__go" aria-hidden="true">
        <ArrowUpRight size={20} />
      </span>
      <span className="city-card__text">
        <span className="city-card__hi" lang="hi" aria-hidden="true">
          {city.hi}
        </span>
        <strong className="city-card__name">{city.name}</strong>
        <span className="city-card__count">
          {n} {n === 1 ? 'event' : 'events'} on the board
        </span>
      </span>
    </Link>
  );
}

export default function Cities() {
  const ref = useRef(null);

  useEffect(() => {
    document.title = 'Cities | Mela';
  }, []);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.set('.city-grid > li', { autoAlpha: 0, y: 40 });
      ScrollTrigger.batch('.city-grid > li', {
        start: 'top 92%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07 }),
      });
    },
    { scope: ref },
  );

  return (
    <div className="cities-page" ref={ref}>
      <div className="container">
        <header className="page-head">
          <h1 className="page-title" data-page-title tabIndex={-1}>
            Cities on the route
          </h1>
          <p className="page-sub">
            {CITY_LIST.length} stations, from the temple towns of Odisha to the beaches of Goa. Pick one to see what’s on
            there.
          </p>
        </header>
        <ul className="city-grid">
          {CITY_LIST.map((c) => (
            <li key={c.slug}>
              <CityCard city={c} />
            </li>
          ))}
        </ul>
      </div>

      <section className="section section--soft" aria-labelledby="route-title">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 id="route-title" className="section-title">
                The whole route
              </h2>
              <p className="section-sub">One line joins every city. Hover a stop to find it on the map.</p>
            </div>
          </div>
          <CityMap />
        </div>
      </section>
    </div>
  );
}
