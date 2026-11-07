import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import EventImage from './EventImage.jsx';
import RailTrack from './RailTrack.jsx';
import { EVENTS } from '../data/events.js';
import { gsap, reducedMotion, ScrollTrigger, useGSAP } from '../lib/motion.js';
import { formatDate } from '../lib/schedule.js';
import './PosterMarquee.css';

/**
 * A tilted, endlessly moving row of event posters. It speeds up while the page is scrolled
 * (like a train picking up pace) and slows to a stop on hover. Decorative for assistive tech:
 * every event is also listed, fully accessible, in the explorer below.
 */
export default function PosterMarquee({ paused }) {
  const ref = useRef(null);
  const loop = useRef(null);
  const hovering = useRef(false);

  // Ease the loop's playback speed (a tween's timeScale can itself be tweened).
  const setSpeed = (timeScale, duration = 0.6) =>
    loop.current && gsap.to(loop.current, { timeScale, duration, ease: 'power2.out', overwrite: true });

  useGSAP(
    () => {
      if (reducedMotion()) return;
      loop.current = gsap.to('.marquee__track', { xPercent: -50, ease: 'none', duration: 80, repeat: -1 });
      let settle;
      ScrollTrigger.create({
        onUpdate: (self) => {
          if (hovering.current) return;
          setSpeed(1 + Math.min(Math.abs(self.getVelocity()) / 250, 8), 0.3);
          settle?.kill();
          settle = gsap.delayedCall(0.3, () => !hovering.current && setSpeed(1, 1.2));
        },
      });
    },
    { scope: ref },
  );

  useEffect(() => {
    if (!loop.current) return;
    if (paused) loop.current.pause();
    else loop.current.resume();
  }, [paused]);

  const glide = (to) => {
    hovering.current = to === 0;
    setSpeed(to);
  };

  return (
    <div
      className="marquee"
      ref={ref}
      aria-hidden="true"
      onPointerEnter={() => glide(0)}
      onPointerLeave={() => glide(1)}
    >
      <div className="marquee__tilt">
        <RailTrack paused={paused} />
        <ul className="marquee__track">
          {[...EVENTS, ...EVENTS].map((e, i) => (
            <li key={`${e.id}-${i}`} className="marquee__item">
              <Link to={`/events/${e.id}`} viewTransition className="poster" data-cat={e.category} tabIndex={-1} draggable="false">
                <EventImage event={e} decorative sizes="260px" />
                <span className="pill pill--on-photo" data-cat={e.category}>
                  {e.category}
                </span>
                <span className="poster__text">
                  <strong>{e.title}</strong>
                  <span>
                    {e.city}, {formatDate(e.start)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
