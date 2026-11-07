import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, BadgeCheck, CalendarDays, CalendarPlus, Check, MapPin, Share2, Ticket as TicketIcon, Users } from 'lucide-react';
import Countdown from '../components/Countdown.jsx';
import EventCard from '../components/EventCard.jsx';
import EventImage from '../components/EventImage.jsx';
import RegisterForm from '../components/RegisterForm.jsx';
import NotFound from './NotFound.jsx';
import { EVENTS, getEvent, seatStatus, seatsLeft } from '../data/events.js';
import { usePasses } from '../lib/passes.js';
import { downloadIcs, mapsUrl } from '../lib/calendar.js';
import { formatLongDate, formatPrice, formatTime } from '../lib/schedule.js';
import './EventPage.css';

const hours = (mins) => (mins >= 1440 ? `${Math.round(mins / 60)} hours` : mins % 60 ? `${(mins / 60).toFixed(1)} hours` : `${mins / 60} hours`);

function ShareButton({ event }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const data = { title: event.title, text: event.blurb, url: location.href };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        // The person closed the share sheet.
      }
      return;
    }
    await navigator.clipboard?.writeText(location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  return (
    <button type="button" className="btn" onClick={share}>
      {copied ? <Check size={18} aria-hidden="true" /> : <Share2 size={18} aria-hidden="true" />}
      <span aria-live="polite">{copied ? 'Link copied' : 'Share'}</span>
    </button>
  );
}

function SeatMeter({ event, left }) {
  const pct = Math.round(((event.capacity - left) / event.capacity) * 100);
  return (
    <div className="seats">
      <p className="seats__text">
        <Users size={18} aria-hidden="true" />
        {left === 0 ? 'Fully booked' : `${left} of ${event.capacity} seats left`}
      </p>
      <div className="seats__bar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Seats booked">
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** On phones the booking form sits below the details, so a bar at the bottom jumps to it. */
function MobileBookBar({ event, targetRef }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), { threshold: 0.05 });
    io.observe(targetRef.current);
    return () => io.disconnect();
  }, [targetRef]);
  return (
    <div className={`book-bar${hidden ? ' is-hidden' : ''}`} aria-hidden={hidden}>
      <p>
        <strong>{formatPrice(event.price)}</strong> per person
      </p>
      <button
        type="button"
        className="btn btn--primary"
        tabIndex={hidden ? -1 : 0}
        onClick={() => {
          targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          targetRef.current.querySelector('input, select')?.focus({ preventScroll: true });
        }}
      >
        Book a pass
      </button>
    </div>
  );
}

export default function EventPage() {
  const { id } = useParams();
  const event = getEvent(id);
  const passes = usePasses();
  const asideRef = useRef(null);

  useEffect(() => {
    document.title = event ? `${event.title}, ${event.city} | Mela` : 'Event not found | Mela';
  }, [event]);

  if (!event) return <NotFound />;

  const left = seatsLeft(event, passes);
  const full = seatStatus(event, passes) === 'full';
  const similar = EVENTS.filter((e) => e.id !== event.id && (e.category === event.category || e.city === event.city)).slice(0, 3);

  return (
    <article className="event-page">
      <div className="container">
        <Link to="/" state={{ explore: true }} viewTransition className="back-link">
          <ArrowLeft size={18} aria-hidden="true" /> All events
        </Link>

        <div className="event-hero">
          <EventImage event={event} eager sizes="(min-width: 1240px) 1200px, 100vw" style={{ viewTransitionName: 'event-photo' }} />
          <span className="pill pill--on-photo" data-cat={event.category}>
            {event.category}
          </span>
        </div>

        <div className="event-layout">
          <div className="event-main">
            <h1 className="event-title" data-page-title tabIndex={-1}>
              {event.title}
            </h1>
            <p className="event-blurb">{event.blurb}</p>

            <ul className="event-facts" data-cat={event.category}>
              <li>
                <CalendarDays aria-hidden="true" />
                <span>
                  <strong>{formatLongDate(event.start)}</strong>
                  {formatTime(event.start)} IST, about {hours(event.duration)}
                </span>
              </li>
              <li>
                <MapPin aria-hidden="true" />
                <span>
                  <strong>{event.venue}</strong>
                  {event.city}.{' '}
                  <a href={mapsUrl(event)} target="_blank" rel="noopener noreferrer">
                    Get directions
                  </a>
                </span>
              </li>
              <li>
                <TicketIcon aria-hidden="true" />
                <span>
                  <strong>{formatPrice(event.price)}</strong>
                  {event.price === 0 ? 'Registration required' : 'per person, taxes included'}
                </span>
              </li>
              <li>
                <BadgeCheck aria-hidden="true" />
                <span>
                  <strong>Hosted by {event.organiser}</strong>
                  Questions? Ask at the help desk at the venue.
                </span>
              </li>
            </ul>

            <div className="event-actions">
              <button type="button" className="btn" onClick={() => downloadIcs(event)}>
                <CalendarPlus size={18} aria-hidden="true" /> Add to calendar
              </button>
              <ShareButton event={event} />
            </div>

            <section className="event-section" aria-labelledby="about-title">
              <h2 id="about-title">About this event</h2>
              {event.about.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </section>

            <section className="event-section" aria-labelledby="expect-title">
              <h2 id="expect-title">What to expect</h2>
              <ul className="checklist">
                {event.highlights.map((h) => (
                  <li key={h}>
                    <Check size={18} aria-hidden="true" />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="event-aside" ref={asideRef} aria-label="Booking">
            <div className="book-card">
              <p className="book-card__price">
                {formatPrice(event.price)}
                {event.price > 0 && <small>per person</small>}
              </p>
              <SeatMeter event={event} left={left} />
              <Countdown target={event.start} />
              {full ? (
                <div className="book-card__full">
                  <h2>This event is fully booked</h2>
                  <p>Seats sometimes open up when people cancel. Meanwhile, these have space:</p>
                  <ul>
                    {similar
                      .filter((e) => seatsLeft(e, passes) > 0)
                      .map((e) => (
                        <li key={e.id}>
                          <Link to={`/events/${e.id}`} viewTransition>
                            {e.title}, {e.city}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ) : (
                <RegisterForm key={event.id} initialEventId={event.id} />
              )}
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="similar" aria-labelledby="similar-title">
            <h2 id="similar-title" className="section-title">
              You might also like
            </h2>
            <div className="event-grid">
              {similar.map((e) => (
                <EventCard key={e.id} event={e} passes={passes} />
              ))}
            </div>
          </section>
        )}
      </div>
      {!full && <MobileBookBar event={event} targetRef={asideRef} />}
    </article>
  );
}
