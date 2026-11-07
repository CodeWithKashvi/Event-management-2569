import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Minus, Plus, Search } from 'lucide-react';
import EventImage from './EventImage.jsx';
import FlapText from './FlapText.jsx';
import Ticket from './Ticket.jsx';
import { getEvent } from '../data/events.js';
import { gsap, printTicket, reducedMotion, ScrollTrigger, useGSAP } from '../lib/motion.js';
import { formatDate, formatPrice, formatTime } from '../lib/schedule.js';
import './BookingJourney.css';

const STEPS = [
  {
    title: 'Find a plan',
    text: 'Search by city, mood or keyword, or tap a departure on the live board. Every event shows the date, venue and price up front.',
    tags: ['16 events', '11 cities'],
  },
  {
    title: 'Book in under a minute',
    text: 'Your name, email and an Indian mobile number. Every field is checked as you type, so there are no surprises when you press Book.',
    tags: ['No sign-up', 'No app'],
  },
  {
    title: 'Show your PNR at the gate',
    text: 'Your pass is saved in My passes with a PNR and barcode, ready on your phone. Add it to your calendar in one tap.',
    tags: ['Works offline', 'Add to calendar'],
  },
];

// The demo searches Bhubaneswar and books Sitar After Dark.
const RESULTS = ['sitar-after-dark', 'odissi-under-the-stars', 'pitch-night', 'night-sky-camp'].map(getEvent);
const DEMO = RESULTS[0];
const DEMO_PASS = {
  pnr: '482-1937065',
  eventTitle: DEMO.title,
  venue: DEMO.venue,
  city: DEMO.city,
  start: DEMO.start.toISOString(),
  tickets: 2,
  name: 'Kashvi Jain',
};
const AUTO_MS = 4200;

function FindScreen() {
  return (
    <>
      <p className="screen__title">Find events</p>
      <div className="demo-search">
        <Search size={14} />
        <span className="typed">Bhubaneswar</span>
      </div>
      <div className="demo-chips">
        <span className="demo-chip is-on" data-cat="Music">All</span>
        <span className="demo-chip">Music</span>
        <span className="demo-chip">Culture</span>
        <span className="demo-chip">Tech</span>
      </div>
      <p className="demo-count">4 events in Bhubaneswar</p>
      <ul className="demo-results">
        {RESULTS.map((e) => (
          <li key={e.id} className="demo-result" data-cat={e.category}>
            <EventImage event={e} decorative sizes="64px" />
            <span>
              <strong>{e.title}</strong>
              <small>
                {e.city}, {formatDate(e.start)}
              </small>
            </span>
            <b>{formatPrice(e.price)}</b>
          </li>
        ))}
      </ul>
    </>
  );
}

function BookScreen() {
  return (
    <>
      <div className="demo-event" data-cat={DEMO.category}>
        <EventImage event={DEMO} decorative sizes="300px" />
        <span>
          <strong>{DEMO.title}</strong>
          <small>
            {formatDate(DEMO.start)}, {formatTime(DEMO.start)}
          </small>
        </span>
      </div>
      <div className="demo-form">
        {[
          ['Full name', 'Kashvi Jain'],
          ['Email', 'kashvi@example.com'],
          ['Mobile number', '+91 98765 43210'],
        ].map(([label, value]) => (
          <label key={label} className="demo-field">
            <span>{label}</span>
            <span className="demo-input">
              <span className="typed">{value}</span>
            </span>
          </label>
        ))}
        <div className="demo-field">
          <span>Number of passes</span>
          <span className="demo-stepper">
            <Minus size={14} />
            <b>2</b>
            <Plus size={14} />
          </span>
        </div>
        <p className="demo-total">
          Total <b>{formatPrice(DEMO.price * 2)}</b>
        </p>
        <span className="demo-button">Book 2 passes</span>
      </div>
    </>
  );
}

function PassScreen({ ticketRef, stampRef }) {
  return (
    <>
      <p className="screen__title screen__title--ok">You’re booked!</p>
      <Ticket pass={DEMO_PASS} ticketRef={ticketRef} stampRef={stampRef} />
      <p className="demo-note">Saved in My passes. Show the PNR at the entry gate.</p>
    </>
  );
}

/**
 * "How booking works" as a short story: three stops on a rail line, with a phone that plays
 * each step. On large screens the section pins and scrolling moves you between stops
 * (GSAP ScrollTrigger); elsewhere the stops are tabs that advance on their own.
 */
export default function BookingJourney() {
  const root = useRef(null);
  const pin = useRef(null);
  const trigger = useRef(null);
  const ticketRef = useRef(null);
  const stampRef = useRef(null);
  const [step, setStep] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [auto, setAuto] = useState(true);
  const current = useRef(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 960px) and (prefers-reduced-motion: no-preference)', () => {
        setPinned(true);
        trigger.current = ScrollTrigger.create({
          trigger: pin.current,
          start: 'top top+=84',
          end: '+=1500',
          pin: true,
          onUpdate: (self) => {
            root.current.style.setProperty('--p', self.progress.toFixed(3));
            const i = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length));
            if (i !== current.current) {
              current.current = i;
              setStep(i);
            }
          },
        });
        return () => {
          trigger.current = null;
          setPinned(false);
        };
      });
    },
    { scope: root },
  );

  // Without pinning (tablets, phones), the stops advance on their own until someone picks one.
  useEffect(() => {
    if (pinned || !auto || reducedMotion()) return;
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), AUTO_MS);
    return () => clearInterval(id);
  }, [pinned, auto]);

  useEffect(() => {
    current.current = step;
    if (!pinned) root.current.style.setProperty('--p', ((step + 1) / STEPS.length).toFixed(3));
    if (step === 2) printTicket(ticketRef.current, stampRef.current);
  }, [step, pinned]);

  const choose = (i) => {
    setAuto(false);
    const st = trigger.current;
    if (st) {
      window.scrollTo({ top: st.start + ((i + 0.5) / STEPS.length) * (st.end - st.start), behavior: 'smooth' });
    } else {
      setStep(i);
    }
  };

  return (
    <section className="section section--soft journey" id="how-it-works" ref={root} aria-labelledby="journey-title">
      <div className="container journey__pin" ref={pin}>
        <div className="journey__copy">
          <h2 id="journey-title" className="section-title">
            Three stops to your seat
          </h2>
          <p className="section-sub">No sign-up and no app. Here is the whole journey, from browsing to boarding.</p>

          <ol className="journey__steps">
            <span className="journey__rail" aria-hidden="true">
              <span className="journey__fill" />
            </span>
            {STEPS.map((s, i) => (
              <li key={s.title} className={`journey__step${i === step ? ' is-on' : ''}${i < step ? ' is-done' : ''}`}>
                <button type="button" className="journey__btn" onClick={() => choose(i)} aria-current={i === step ? 'step' : undefined}>
                  <span className="journey__dot" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="journey__body">
                    <span className="journey__kicker">Stop {i + 1}</span>
                    <strong>{s.title}</strong>
                    <span className="journey__more">
                      <span className="journey__text">{s.text}</span>
                      <span className="journey__tags">
                        {s.tags.map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <Link to="/" state={{ explore: true }} preventScrollReset className="btn btn--dark journey__cta">
            Start with the events
          </Link>
        </div>

        <div className="journey__stage">
          <div className="journey__counter" aria-hidden="true">
            <FlapText text={`STOP ${step + 1}`} length={6} scramble={false} />
            <span>of {STEPS.length}</span>
          </div>
          <div className="phone" role="img" aria-label={`Phone preview of step ${step + 1}: ${STEPS[step].title}`}>
            <div className="phone__screen" aria-hidden="true">
              <div className="phone__status">
                <span>18:30</span>
                <span className="phone__island" />
                <span>5G</span>
              </div>
              {[<FindScreen key="find" />, <BookScreen key="book" />, <PassScreen key="pass" ticketRef={ticketRef} stampRef={stampRef} />].map(
                (screen, i) => (
                  <div key={i} className={`screen${i === step ? ' is-on' : ''}${i < step ? ' is-past' : ''}`}>
                    {screen}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
