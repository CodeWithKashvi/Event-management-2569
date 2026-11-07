import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { animate, createTimeline, spring, stagger, svg } from 'animejs';
import { ArrowRight } from 'lucide-react';
import { CITY_LIST, cityPath } from '../data/cities.js';
import { INDIA_PATH, MAP_H, MAP_W, PINS } from '../data/indiaMap.js';
import { reducedMotion } from '../lib/motion.js';
import './CityMap.css';

// Which side of its pin each city's label sits on, so neighbours don't overlap.
const LABEL_LEFT = new Set(['Bhubaneswar', 'Jaipur', 'Mumbai', 'Goa', 'Bengaluru']);

// Stops in route order: [city, state, label side].
const STOPS = CITY_LIST.filter((c) => PINS[c.name]).map((c) => [c.name, c.state, LABEL_LEFT.has(c.name) ? 'left' : 'right']);

const COUNTS = Object.fromEntries(CITY_LIST.map((c) => [c.name, c.events.length]));

/** A gently curving line through every stop, bending to alternate sides like a railway. */
const ROUTE_D = STOPS.reduce((d, [city], i) => {
  const [x, y] = PINS[city];
  if (i === 0) return `M${x} ${y}`;
  const [px, py] = PINS[STOPS[i - 1][0]];
  const bend = (i % 2 ? 1 : -1) * 0.18;
  const cx = (px + x) / 2 - (y - py) * bend;
  const cy = (py + y) / 2 + (x - px) * bend;
  return `${d} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x} ${y}`;
}, '');

export default function CityMap() {
  const ref = useRef(null);
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  // When the map scrolls into view: draw India, then the route, then drop the pins in.
  useEffect(() => {
    if (reducedMotion()) return;
    const root = ref.current;
    const q = (s) => root.querySelector(s);
    const tl = createTimeline({ autoplay: false })
      .add(svg.createDrawable(q('.map__edge')), { draw: ['0 0', '0 1'], duration: 1800, ease: 'inOut(3)' })
      .add(q('.map__land'), { opacity: [0, 1], duration: 700 }, '-=900')
      .add(svg.createDrawable(q('.map__route')), { draw: ['0 0', '0 1'], duration: 1600, ease: 'inOut(2)' }, '-=500')
      .add(root.querySelectorAll('.pin__body'), { scale: [0, 1], opacity: [0, 1], delay: stagger(90), ease: spring({ stiffness: 220, damping: 12 }) }, '-=1400');
    tl.seek(0); // start hidden until the map is in view
    let train;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      tl.play();
      train = animate(q('.map__train'), { ...svg.createMotionPath(q('.map__route')), opacity: { to: 1, duration: 400 }, duration: 16000, delay: 2600, loop: true, ease: 'linear' });
    }, { threshold: 0.3 });
    io.observe(root);
    return () => {
      io.disconnect();
      tl.revert();
      train?.revert();
    };
  }, []);

  const go = (city) => navigate(cityPath(city), { viewTransition: true });

  return (
    <div className={`citymap${active ? ' has-active' : ''}`} ref={ref}>
      <div className="citymap__map">
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label="Map of India with Mela's 11 cities marked">
          <defs>
            <pattern id="map-dots" width="7" height="7" patternUnits="userSpaceOnUse">
              <circle className="map__dot" cx="3.5" cy="3.5" r="1.35" />
            </pattern>
          </defs>
          <g className="map__land">
            <path className="map__fill" d={INDIA_PATH} />
            <path className="map__dots" d={INDIA_PATH} fill="url(#map-dots)" />
          </g>
          <path className="map__edge" d={INDIA_PATH} />
          <path className="map__route" d={ROUTE_D} />
          <circle className="map__train" r="5" />
          {STOPS.map(([city, , side]) => {
            const [x, y] = PINS[city];
            const r = 5 + COUNTS[city] * 1.6;
            return (
              <g
                key={city}
                className={`pin${active === city ? ' is-active' : ''}`}
                transform={`translate(${x} ${y})`}
                onPointerEnter={() => setActive(city)}
                onPointerLeave={() => setActive(null)}
                onClick={() => go(city)}
              >
                <g className="pin__body">
                  <circle className="pin__pulse" r={r + 6} />
                  <circle className="pin__dot" r={r} />
                  <text className="pin__label" x={side === 'left' ? -(r + 6) : r + 6} y="4.5" textAnchor={side === 'left' ? 'end' : 'start'}>
                    {city}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      <ol className="citymap__stops">
        {STOPS.map(([city, state], i) => (
          <li key={city}>
            <Link
              to={cityPath(city)}
              viewTransition
              className={`stop${active === city ? ' is-active' : ''}`}
              onPointerEnter={() => setActive(city)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(city)}
              onBlur={() => setActive(null)}
            >
              <span className="stop__no" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="stop__name">
                <strong>{city}</strong>
                <span>{state}</span>
              </span>
              <span className="stop__count">
                {COUNTS[city]} {COUNTS[city] === 1 ? 'event' : 'events'}
              </span>
              <ArrowRight className="stop__go" size={18} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** A small map of India with one city lit up, for the city pages. */
export function MiniMap({ city }) {
  return (
    <svg className="minimap" viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label={`Map of India showing ${city}`}>
      <defs>
        <pattern id="minimap-dots" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle className="map__dot" cx="3.5" cy="3.5" r="1.35" />
        </pattern>
      </defs>
      <path className="map__fill" d={INDIA_PATH} />
      <path d={INDIA_PATH} fill="url(#minimap-dots)" />
      <path className="map__edge" d={INDIA_PATH} />
      {STOPS.filter(([c]) => c !== city).map(([c]) => (
        <circle key={c} className="minimap__other" cx={PINS[c][0]} cy={PINS[c][1]} r="5" />
      ))}
      <g transform={`translate(${PINS[city][0]} ${PINS[city][1]})`} className="pin is-active">
        <circle className="pin__pulse" r="22" />
        <circle className="pin__dot" r="11" />
      </g>
    </svg>
  );
}
