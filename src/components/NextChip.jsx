import { Link } from 'react-router';
import { EVENTS } from '../data/events.js';
import { useNow } from '../lib/useNow.js';
import { pad2, timeLeft } from '../lib/schedule.js';
import './NextChip.css';

/** The next event from `events` that hasn't started, with a live countdown. Links to the event. */
export default function NextChip({ events = EVENTS, label = 'Next departure' }) {
  const now = useNow();
  const next = events.find((e) => e.start > now) ?? events[0];
  const t = timeLeft(next.start, now);
  return (
    <Link to={`/events/${next.id}`} viewTransition className="next-chip" data-cat={next.category}>
      <span className="next-chip__live" aria-hidden="true" />
      <span className="next-chip__text">
        <span>{label}</span>
        <strong>{next.title}</strong>
      </span>
      <span className="next-chip__eta">
        <span className="sr-only">starts in </span>
        {t.days > 0 && `${t.days}d `}
        {pad2(t.hours)}:{pad2(t.minutes)}:{pad2(t.seconds)}
      </span>
    </Link>
  );
}
