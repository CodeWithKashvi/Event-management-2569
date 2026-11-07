import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { CalendarPlus, CircleCheck, LoaderCircle, Minus, Plus } from 'lucide-react';
import Field from './Field.jsx';
import SearchSelect from './SearchSelect.jsx';
import Ticket from './Ticket.jsx';
import { EVENTS, getEvent, seatsLeft } from '../data/events.js';
import { addPass, usePasses } from '../lib/passes.js';
import { FIELDS, MAX_TICKETS, normalisePhone, validateAll } from '../lib/validate.js';
import { formatDate, formatPrice } from '../lib/schedule.js';
import { downloadIcs } from '../lib/calendar.js';
import { petalShower, printTicket, shake } from '../lib/motion.js';
import './RegisterForm.css';

const EMPTY = { name: '', email: '', phone: '', eventId: '', tickets: '1' };

/** What validation needs to know about the currently selected event. */
function contextFor(values, passes) {
  const event = getEvent(values.eventId);
  const email = values.email.trim().toLowerCase();
  return {
    event,
    seatsLeft: event ? seatsLeft(event, passes) : 0,
    alreadyRegistered: !!event && passes.some((p) => p.eventId === event.id && p.email.toLowerCase() === email),
  };
}

export default function RegisterForm({ initialEventId = '' }) {
  const passes = usePasses();
  const [values, setValues] = useState({ ...EMPTY, eventId: initialEventId });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [sending, setSending] = useState(false);
  const [booked, setBooked] = useState(null);
  const [summary, setSummary] = useState('');
  const formRef = useRef(null);
  const submitRef = useRef(null);
  const ticketRef = useRef(null);
  const stampRef = useRef(null);
  const doneRef = useRef(null);

  const ctx = contextFor(values, passes);
  const event = ctx.event;
  const typed = Number(values.tickets);
  const count = Number.isInteger(typed) && typed > 0 ? typed : 0; // 0 while the box holds something invalid
  const total = event ? event.price * count : 0;

  // Only show errors for fields the person has already visited.
  const revalidate = (next, seen) => {
    const all = validateAll(next, contextFor(next, passes));
    setErrors(Object.fromEntries(Object.entries(all).filter(([f]) => seen[f])));
  };

  const onChange = (e) => {
    const next = { ...values, [e.target.name]: e.target.value };
    setValues(next);
    revalidate(next, touched);
  };

  // Picking an event counts as visiting the field, so its error (if any) shows straight away.
  const pickEvent = (eventId) => {
    const next = { ...values, eventId };
    const seen = { ...touched, eventId: true };
    setValues(next);
    setTouched(seen);
    revalidate(next, seen);
  };

  // The − / + buttons beside the passes box.
  const step = (by) => {
    const next = { ...values, tickets: String(Math.min(MAX_TICKETS, Math.max(1, count + by))) };
    const seen = { ...touched, tickets: true };
    setValues(next);
    setTouched(seen);
    revalidate(next, seen);
  };

  const onBlur = (e) => {
    const seen = { ...touched, [e.target.name]: true };
    setTouched(seen);
    revalidate(values, seen);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (sending) return;
    const all = validateAll(values, ctx);
    setTouched(Object.fromEntries(FIELDS.map((f) => [f, true])));
    setErrors(all);
    const invalid = FIELDS.filter((f) => all[f]);
    if (invalid.length) {
      setSummary(`${invalid.length} ${invalid.length === 1 ? 'field needs' : 'fields need'} attention.`);
      const form = formRef.current;
      invalid.forEach((f) => shake(form.querySelector(`[data-field="${f}"]`)));
      const first = form.elements[invalid[0]];
      (first instanceof RadioNodeList ? first[0] : first).focus();
      return;
    }
    setSummary('');
    setSending(true);
    // A short pause so the booking feels deliberate; there is no server, passes live in Local Storage.
    setTimeout(() => {
      const pass = addPass({
        eventId: event.id,
        eventTitle: event.title,
        venue: event.venue,
        city: event.city,
        start: event.start.toISOString(),
        price: event.price,
        tickets: Number(values.tickets),
        name: values.name.trim().replace(/\s+/g, ' '),
        email: values.email.trim(),
        phone: normalisePhone(values.phone),
      });
      petalShower(submitRef.current);
      setSending(false);
      setBooked(pass);
    }, 650);
  };

  // After booking: move focus to the confirmation and animate the ticket in.
  useEffect(() => {
    if (!booked) return;
    doneRef.current?.focus();
    printTicket(ticketRef.current, stampRef.current);
  }, [booked]);

  const reset = () => {
    setBooked(null);
    setValues({ ...EMPTY, eventId: initialEventId });
    setErrors({});
    setTouched({});
  };

  if (booked) {
    const bookedEvent = getEvent(booked.eventId);
    return (
      <div className="confirm">
        <div className="confirm__head">
          <CircleCheck aria-hidden="true" />
          <h3 tabIndex={-1} ref={doneRef}>
            You&rsquo;re booked!
          </h3>
        </div>
        <p>
          {booked.tickets} {booked.tickets === 1 ? 'pass' : 'passes'} for <strong>{booked.eventTitle}</strong> saved on
          this device. Show the PNR at the entry gate.
        </p>
        <Ticket pass={booked} ticketRef={ticketRef} stampRef={stampRef} />
        <div className="confirm__actions">
          {bookedEvent && (
            <button type="button" className="btn btn--primary" onClick={() => downloadIcs(bookedEvent, booked.pnr)}>
              <CalendarPlus size={18} aria-hidden="true" /> Add to calendar
            </button>
          )}
          <Link className="btn" to="/passes" viewTransition>
            View my passes
          </Link>
        </div>
        <button type="button" className="link-btn" onClick={reset}>
          Book another pass
        </button>
      </div>
    );
  }

  const describe = (f) => (errors[f] ? `${f}-error` : `${f}-hint`);

  return (
    <form ref={formRef} className="register" noValidate onSubmit={onSubmit} aria-labelledby="register-title">
      <h2 id="register-title" className="register__title">
        Book your pass
      </h2>
      <p className="register__note">All fields are required.</p>

      <Field id="name" label="Full name" error={errors.name}>
        <input id="name" name="name" type="text" autoComplete="name" value={values.name} onChange={onChange} onBlur={onBlur}
          aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
      </Field>

      <Field id="email" label="Email" hint="Your pass is linked to this email." error={errors.email}>
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" value={values.email}
          onChange={onChange} onBlur={onBlur} aria-invalid={!!errors.email} aria-describedby={describe('email')} />
      </Field>

      <Field id="phone" label="Mobile number" hint="10-digit Indian mobile number." error={errors.phone}>
        <div className="input-prefix">
          <span aria-hidden="true">+91</span>
          <input id="phone" name="phone" type="tel" autoComplete="tel-national" placeholder="98765 43210"
            value={values.phone} onChange={onChange} onBlur={onBlur} aria-invalid={!!errors.phone}
            aria-describedby={describe('phone')} />
        </div>
      </Field>

      <Field id="eventId" label="Event" error={errors.eventId}>
        <SearchSelect
          id="eventId"
          name="eventId"
          label="Event"
          value={values.eventId}
          placeholder="Choose an event"
          searchPlaceholder="Search by event, city or date"
          options={EVENTS.map((e) => {
            const full = seatsLeft(e, passes) === 0;
            return {
              value: e.id,
              label: e.title,
              hint: `${e.city}, ${formatDate(e.start)}${full ? ', fully booked' : ''}`,
              cat: e.category,
              disabled: full,
            };
          })}
          onChange={pickEvent}
          onClose={() => onBlur({ target: { name: 'eventId' } })}
          invalid={!!errors.eventId}
          describedBy={errors.eventId ? 'eventId-error' : undefined}
        />
      </Field>

      <Field id="tickets" label="Number of passes" hint={`Up to ${MAX_TICKETS} per booking.`} error={errors.tickets}>
        <div className="stepper">
          <button type="button" className="stepper__btn" onClick={() => step(-1)} disabled={count <= 1} aria-label="One pass fewer">
            <Minus size={18} aria-hidden="true" />
          </button>
          <input id="tickets" name="tickets" type="number" inputMode="numeric" min="1" max={MAX_TICKETS} step="1"
            value={values.tickets} onChange={onChange} onBlur={onBlur} aria-invalid={!!errors.tickets}
            aria-describedby={describe('tickets')} />
          <button type="button" className="stepper__btn" onClick={() => step(1)} disabled={count >= MAX_TICKETS} aria-label="One pass more">
            <Plus size={18} aria-hidden="true" />
          </button>
        </div>
      </Field>

      {event && (
        <p className="register__total">
          <span>Total</span>
          <strong>{event.price === 0 ? 'Free' : formatPrice(total)}</strong>
        </p>
      )}

      <p className="sr-only" aria-live="polite">
        {summary}
      </p>

      <button ref={submitRef} type="submit" className="btn btn--primary btn--block" disabled={sending}>
        {sending ? (
          <>
            <LoaderCircle className="spin" size={18} aria-hidden="true" /> Booking…
          </>
        ) : (
          `Book ${count > 0 ? `${count} ` : ''}${count === 1 ? 'pass' : 'passes'}`
        )}
      </button>
    </form>
  );
}
