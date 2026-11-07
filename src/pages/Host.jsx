import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { CircleCheck, Clock, MapPin, Trash2 } from 'lucide-react';
import Field from '../components/Field.jsx';
import { DatePicker, TimePicker } from '../components/Pickers.jsx';
import SearchSelect from '../components/SearchSelect.jsx';
import { CAT_ICONS } from '../components/categoryIcons.js';
import { CATEGORIES } from '../data/events.js';
import { CITY_LIST } from '../data/cities.js';
import { addListing, removeListing, useListings } from '../lib/hosted.js';
import { BLURB_MAX, HOST_FIELDS, validateHost } from '../lib/validate.js';
import { IST, formatDate, formatPrice, formatTime, istDayKey } from '../lib/schedule.js';
import { petalShower, shake } from '../lib/motion.js';
import '../components/EventCard.css';
import './Host.css';

const EMPTY = {
  title: '', category: '', blurb: '', date: '', time: '', city: '', venue: '',
  price: '', capacity: '', organiser: '', email: '', agree: false,
};

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c, cat: c }));
const CITY_OPTIONS = CITY_LIST.map((c) => ({ value: c.name, label: c.name, hint: c.state }));

const dayFmt = new Intl.DateTimeFormat('en-IN', { timeZone: IST, day: 'numeric' });
const monFmt = new Intl.DateTimeFormat('en-IN', { timeZone: IST, month: 'short' });

const today = istDayKey(new Date());
const maxDate = istDayKey(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
const ctx = { today, maxDate };

/** The listing's start as a Date, read as India time, or null while incomplete. */
const startOf = ({ date, time }) => (date ? new Date(`${date}T${time || '00:00'}:00+05:30`) : null);

/** How the listing will look on Mela, updating as the form is filled in. */
function Preview({ values }) {
  const cat = values.category || 'Music';
  const Icon = CAT_ICONS[values.category] ?? CAT_ICONS[''];
  const start = startOf(values);
  const price = values.price === '' ? null : Number(values.price);
  return (
    <article className="event-card host-preview" data-cat={cat}>
      <div className="event-card__media host-preview__poster">
        <Icon className="host-preview__icon" aria-hidden="true" />
        <span className="host-preview__mark" lang="hi" aria-hidden="true">
          मेला
        </span>
        <span className="pill pill--on-photo" data-cat={cat}>
          {values.category || 'Category'}
        </span>
        {start && (
          <span className="date-badge">
            <strong>{dayFmt.format(start)}</strong>
            {monFmt.format(start)}
          </span>
        )}
      </div>
      <div className="event-card__body">
        <h3 className="event-card__title">{values.title.trim() || 'Your event’s name'}</h3>
        <p className="event-card__where">
          <MapPin size={16} aria-hidden="true" />
          <span>
            <strong>{values.city || 'City'}</strong>, {values.venue.trim() || 'venue'}
          </span>
        </p>
        <p className="event-card__blurb">{values.blurb.trim() || 'A one-line description that tells people why they should come.'}</p>
      </div>
      <div className="event-card__stub">
        <p className="event-card__when">
          <Clock size={16} aria-hidden="true" />
          {start ? `${formatDate(start)}${values.time ? `, ${formatTime(start)}` : ''}` : 'Date and time'}
        </p>
        <p className="event-card__price">{price === null || Number.isNaN(price) ? '₹ —' : formatPrice(price)}</p>
      </div>
    </article>
  );
}

export default function Host() {
  const listings = useListings();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [done, setDone] = useState(null);
  const formRef = useRef(null);
  const submitRef = useRef(null);
  const doneRef = useRef(null);

  useEffect(() => {
    document.title = 'Host an event | Mela';
  }, []);

  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  // Errors appear for fields the person has visited, and update as they fix them.
  const revalidate = (next, seen) => {
    const all = validateHost(next, ctx);
    setErrors(Object.fromEntries(Object.entries(all).filter(([f]) => seen[f])));
  };

  const set = (name, value, markSeen = false) => {
    const next = { ...values, [name]: value };
    const seen = markSeen ? { ...touched, [name]: true } : touched;
    setValues(next);
    if (markSeen) setTouched(seen);
    revalidate(next, seen);
  };

  const onChange = (e) => set(e.target.name, e.target.type === 'checkbox' ? e.target.checked : e.target.value, e.target.type === 'checkbox');
  const onBlur = (e) => {
    const seen = { ...touched, [e.target.name]: true };
    setTouched(seen);
    revalidate(values, seen);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const all = validateHost(values, ctx);
    setTouched(Object.fromEntries(HOST_FIELDS.map((f) => [f, true])));
    setErrors(all);
    const invalid = HOST_FIELDS.filter((f) => all[f]);
    if (invalid.length) {
      invalid.forEach((f) => shake(formRef.current.querySelector(`[data-field="${f}"]`)));
      formRef.current.elements[invalid[0]]?.focus();
      return;
    }
    const clean = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
    petalShower(submitRef.current);
    setDone(addListing({ ...clean, price: Number(clean.price), capacity: Number(clean.capacity) }));
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setTouched({});
    setDone(null);
  };

  const err = (f) => errors[f];
  const described = (f, hasHint) => (errors[f] ? `${f}-error` : hasHint ? `${f}-hint` : undefined);
  const blurbLen = values.blurb.trim().length;

  return (
    <div className="container host">
      <header className="page-head">
        <h1 className="page-title" data-page-title tabIndex={-1}>
          Host an event
        </h1>
        <p className="page-sub">
          Running a gig, a food walk or a workshop? Put it on the board. Fill in the details and watch your listing come
          together on the right.
        </p>
      </header>

      <div className="host__layout">
        {done ? (
          <section className="host-done" aria-labelledby="host-done-title">
            <CircleCheck className="host-done__icon" aria-hidden="true" />
            <h2 id="host-done-title" tabIndex={-1} ref={doneRef}>
              Listing submitted
            </h2>
            <p>
              <strong>{done.title}</strong> is saved with reference <strong className="host-done__ref">{done.ref}</strong>.
            </p>
            <p className="host-done__note">
              Mela is a demo, so nothing is sent anywhere: your listing is kept on this device, under Your listings below.
            </p>
            <div className="host-done__actions">
              <button type="button" className="btn btn--primary" onClick={reset}>
                List another event
              </button>
              <Link to="/" state={{ explore: true }} viewTransition className="btn">
                Browse events
              </Link>
            </div>
          </section>
        ) : (
          <form ref={formRef} className="host-form" noValidate onSubmit={onSubmit}>
            <p className="host-form__note">All fields are required.</p>

            <fieldset className="host-group">
              <legend>The event</legend>
              <Field id="title" label="Event name" error={err('title')}>
                <input id="title" name="title" type="text" maxLength={70} value={values.title} onChange={onChange} onBlur={onBlur}
                  aria-invalid={!!err('title')} aria-describedby={described('title')} />
              </Field>
              <Field id="category" label="Category" error={err('category')}>
                <SearchSelect id="category" name="category" label="Category" value={values.category} options={CATEGORY_OPTIONS}
                  placeholder="Choose a category" searchPlaceholder="Search categories"
                  onChange={(v) => set('category', v, true)} onClose={() => onBlur({ target: { name: 'category' } })}
                  invalid={!!err('category')} describedBy={described('category')} />
              </Field>
              <Field id="blurb" label="One-line description" hint={`${blurbLen}/${BLURB_MAX} characters`} error={err('blurb')}>
                <textarea id="blurb" name="blurb" rows={3} maxLength={BLURB_MAX + 40} value={values.blurb} onChange={onChange} onBlur={onBlur}
                  aria-invalid={!!err('blurb')} aria-describedby={described('blurb', true)} />
              </Field>
            </fieldset>

            <fieldset className="host-group">
              <legend>When and where</legend>
              <div className="host-row">
                <Field id="date" label="Date" error={err('date')}>
                  <DatePicker id="date" name="date" label="Date" value={values.date} min={today} max={maxDate}
                    onChange={(v) => set('date', v, true)} onClose={() => onBlur({ target: { name: 'date' } })}
                    invalid={!!err('date')} describedBy={described('date')} />
                </Field>
                <Field id="time" label="Start time (IST)" error={err('time')}>
                  <TimePicker id="time" name="time" label="Start time" value={values.time}
                    onChange={(v) => set('time', v, true)} onClose={() => onBlur({ target: { name: 'time' } })}
                    invalid={!!err('time')} describedBy={described('time')} />
                </Field>
              </div>
              <Field id="city" label="City" hint="Not on the list? Type it and choose “Use”." error={err('city')}>
                <SearchSelect id="city" name="city" label="City" value={values.city} options={CITY_OPTIONS} creatable
                  placeholder="Choose a city" searchPlaceholder="Search or type a city"
                  onChange={(v) => set('city', v, true)} onClose={() => onBlur({ target: { name: 'city' } })}
                  invalid={!!err('city')} describedBy={described('city', true)} />
              </Field>
              <Field id="venue" label="Venue" error={err('venue')}>
                <input id="venue" name="venue" type="text" maxLength={90} placeholder="e.g. Rabindra Mandap" value={values.venue} onChange={onChange} onBlur={onBlur}
                  aria-invalid={!!err('venue')} aria-describedby={described('venue')} />
              </Field>
            </fieldset>

            <fieldset className="host-group">
              <legend>Tickets</legend>
              <div className="host-row">
                <Field id="price" label="Price per person" hint="Enter 0 for a free event." error={err('price')}>
                  <div className="input-prefix">
                    <span aria-hidden="true">₹</span>
                    <input id="price" name="price" type="text" inputMode="numeric" value={values.price} onChange={onChange} onBlur={onBlur}
                      aria-invalid={!!err('price')} aria-describedby={described('price', true)} />
                  </div>
                </Field>
                <Field id="capacity" label="Seats" error={err('capacity')}>
                  <input id="capacity" name="capacity" type="text" inputMode="numeric" value={values.capacity} onChange={onChange} onBlur={onBlur}
                    aria-invalid={!!err('capacity')} aria-describedby={described('capacity')} />
                </Field>
              </div>
            </fieldset>

            <fieldset className="host-group">
              <legend>About you</legend>
              <div className="host-row">
                <Field id="organiser" label="Organiser" error={err('organiser')}>
                  <input id="organiser" name="organiser" type="text" autoComplete="organization" value={values.organiser} onChange={onChange} onBlur={onBlur}
                    aria-invalid={!!err('organiser')} aria-describedby={described('organiser')} />
                </Field>
                <Field id="email" label="Email" error={err('email')}>
                  <input id="email" name="email" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={onChange} onBlur={onBlur}
                    aria-invalid={!!err('email')} aria-describedby={described('email')} />
                </Field>
              </div>
              <div className={`check${err('agree') ? ' has-error' : ''}`} data-field="agree">
                <label>
                  <input type="checkbox" name="agree" checked={values.agree} onChange={onChange}
                    aria-invalid={!!err('agree')} aria-describedby={err('agree') ? 'agree-error' : undefined} />
                  <span>The details are correct, and I have permission to run this event at the venue.</span>
                </label>
                {err('agree') && (
                  <p className="field__error" id="agree-error">
                    {err('agree')}
                  </p>
                )}
              </div>
            </fieldset>

            <button ref={submitRef} type="submit" className="btn btn--primary btn--block">
              Submit listing
            </button>
          </form>
        )}

        <aside className="host__preview" aria-label="Live preview of your listing">
          <p className="host__preview-label">
            <span className="host__live" aria-hidden="true" /> Live preview
          </p>
          <Preview values={done ?? values} />
          <p className="host__preview-tip">This is how your event will appear in All events.</p>
        </aside>
      </div>

      {listings.length > 0 && (
        <section className="host-mine" aria-labelledby="host-mine-title">
          <h2 id="host-mine-title" className="section-title">
            Your listings
          </h2>
          <ul className="host-mine__list">
            {listings.map((l) => {
              const start = startOf(l);
              return (
                <li key={l.ref} className="host-mine__item" data-cat={l.category}>
                  <span className="pill" data-cat={l.category}>
                    {l.category}
                  </span>
                  <span className="host-mine__main">
                    <strong>{l.title}</strong>
                    <span>
                      {l.city}, {formatDate(start)} at {formatTime(start)}, {formatPrice(l.price)}
                    </span>
                  </span>
                  <span className="host-mine__status">In review, {l.ref}</span>
                  <button type="button" className="btn btn--danger-ghost" onClick={() => removeListing(l.ref)}>
                    <Trash2 size={16} aria-hidden="true" /> Remove
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
