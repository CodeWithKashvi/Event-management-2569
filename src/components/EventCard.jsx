import { Link, useViewTransitionState } from 'react-router';
import { ArrowUpRight, Clock, MapPin } from 'lucide-react';
import EventImage from './EventImage.jsx';
import { seatStatus, seatsLeft } from '../data/events.js';
import { IST, formatDate, formatPrice, formatTime } from '../lib/schedule.js';
import './EventCard.css';

const dayFmt = new Intl.DateTimeFormat('en-IN', { timeZone: IST, day: 'numeric' });
const monFmt = new Intl.DateTimeFormat('en-IN', { timeZone: IST, month: 'short' });

export default function EventCard({ event, passes, hidden = false }) {
  const to = `/events/${event.id}`;
  // Only the card being opened gets the shared view-transition name, so its photo morphs into the page header.
  const opening = useViewTransitionState(to);
  const status = seatStatus(event, passes);
  const left = seatsLeft(event, passes);
  const booked = Math.round(((event.capacity - left) / event.capacity) * 100);

  return (
    <article className={`event-card${hidden ? ' is-hidden' : ''}`} data-cat={event.category}>
      <div className="event-card__media">
        <EventImage
          event={event}
          decorative
          sizes="(min-width: 1200px) 400px, (min-width: 700px) 46vw, 92vw"
          style={opening ? { viewTransitionName: 'event-photo' } : undefined}
        />
        <span className="pill pill--on-photo" data-cat={event.category}>
          {event.category}
        </span>
        <span className="event-card__go" aria-hidden="true">
          <ArrowUpRight size={18} />
        </span>
        <span className="date-badge" aria-hidden="true">
          <strong>{dayFmt.format(event.start)}</strong>
          {monFmt.format(event.start)}
        </span>
      </div>

      <div className="event-card__body">
        <h3 className="event-card__title">
          <Link to={to} viewTransition className="event-card__link">
            {event.title}
          </Link>
        </h3>
        <p className="event-card__where">
          <MapPin size={16} aria-hidden="true" />
          <span>
            <strong>{event.city}</strong>, {event.venue}
          </span>
        </p>
        <p className="event-card__blurb">{event.blurb}</p>
      </div>

      <div className={`event-card__stub is-${status}`}>
        <p className="event-card__when">
          <Clock size={16} aria-hidden="true" />
          <time dateTime={event.start.toISOString()}>
            {formatDate(event.start)}, {formatTime(event.start)}
          </time>
        </p>
        <p className="event-card__price">
          {formatPrice(event.price)}
          {status !== 'open' && (
            <span className={`seat-note is-${status}`}>{status === 'full' ? 'Fully booked' : `Only ${left} left`}</span>
          )}
        </p>
        <span className="event-card__meter" aria-hidden="true">
          <span style={{ width: `${booked}%` }} />
        </span>
      </div>
    </article>
  );
}
