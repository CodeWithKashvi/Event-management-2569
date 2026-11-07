import { useEffect, useId, useRef } from 'react';
import { animate, svg } from 'animejs';
import { reducedMotion } from '../lib/motion.js';
import './RailTrack.css';

// A gently waving line in a wide, short band. The band is drawn 1:1 (60px tall) and centred,
// so on any screen you see the middle stretch of the line at its true size.
const ROUTE = 'M -80 32 C 300 14 700 48 1200 30 S 2000 14 2480 32';
const CARS = ['engine', 'coach', 'coach', 'coach'];
const CAR_GAP = 0.023; // spacing between cars, as a fraction of the route

/**
 * The railway that runs along the top of the poster conveyor (and the top of the footer): the track draws itself in
 * (anime.js createDrawable) and a little train runs along it on a loop (anime.js createMotionPath).
 */
export default function RailTrack({ paused }) {
  const ref = useRef(null);
  const trains = useRef([]);
  const maskId = `rail-${useId().replace(/[^\w-]/g, '')}`; // unique per rail, so two can share a page

  useEffect(() => {
    if (reducedMotion()) return;
    const root = ref.current;
    const route = root.querySelector('.rail__route');
    const draw = animate(svg.createDrawable(root.querySelector('.rail__reveal')), {
      draw: ['0 0', '0 1'],
      duration: 2400,
      delay: 600,
      ease: 'inOut(2)',
    });
    const cars = [...root.querySelectorAll('.rail__car')];
    trains.current = cars.map((car, i) =>
      animate(car, {
        ...svg.createMotionPath(route, (cars.length - 1 - i) * CAR_GAP),
        opacity: { to: 1, duration: 300 },
        duration: 30000,
        ease: 'linear',
        loop: true,
      }),
    );
    return () => {
      draw.revert();
      trains.current.forEach((t) => t.revert());
      trains.current = [];
    };
  }, []);

  useEffect(() => {
    trains.current.forEach((t) => (paused ? t.pause() : t.resume()));
  }, [paused]);

  return (
    <svg ref={ref} className="rail" viewBox="0 0 2400 60" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="-200" y="-40" width="2800" height="140">
          <path className="rail__reveal" d={ROUTE} fill="none" stroke="#fff" strokeWidth="50" />
        </mask>
      </defs>
      <path className="rail__route" d={ROUTE} fill="none" stroke="none" />
      <g mask={`url(#${maskId})`} fill="none">
        <path className="rail__sleepers" d={ROUTE} />
        <path className="rail__rails" d={ROUTE} />
        <path className="rail__bed" d={ROUTE} />
      </g>
      <g className="rail__train">
        {CARS.map((kind, i) => (
          <g key={i} className={`rail__car rail__car--${kind}`}>
            <rect x="-27" y="-11" width="54" height="22" rx={kind === 'engine' ? 9 : 5} />
            <rect className="rail__stripe" x="-27" y="3" width="54" height="3" />
            {[-16, -4, 8].map((x) => (
              <rect key={x} className="rail__window" x={x} y="-6" width="8" height="6" rx="1.5" />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
