import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Clock3, Languages, Signpost, Ticket } from 'lucide-react';
import FlapText from '../components/FlapText.jsx';
import { CATEGORIES, CITIES, EVENTS } from '../data/events.js';
import { gsap, reducedMotion, ScrollTrigger, useGSAP } from '../lib/motion.js';
import './About.css';

const NUMBERS = [
  [EVENTS.length, 'events on the board'],
  [CITIES.length, 'cities on the route'],
  [CATEGORIES.length, 'kinds of plans'],
  [0, 'sign-ups needed'],
];

const IDEAS = [
  {
    icon: Clock3,
    cat: 'Music',
    title: 'A departure board',
    text: 'The next events flip in on split-flap cells, just like the boards at Howrah or New Delhi station, with live countdowns.',
  },
  {
    icon: Signpost,
    cat: 'Culture',
    title: 'Station boards',
    text: 'Every city has a yellow signboard, Hindi above English, the way every platform in India announces where you are.',
  },
  {
    icon: Ticket,
    cat: 'Food',
    title: 'Passes with a PNR',
    text: 'Booking prints a railway-style pass with a ten-digit PNR and a barcode, saved right here in your browser.',
  },
  {
    icon: Languages,
    cat: 'Tech',
    title: 'Hindi and English',
    text: 'Headings take turns in both languages, and the station announcement यात्री कृपया ध्यान दें greets you on the home page.',
  },
];

const STACK = [
  ['React 19', 'Components and state, built with Vite'],
  ['React Router', 'Pages with shareable links that work on any host'],
  ['GSAP', 'Scroll-driven moments: the pinned journey, the sidebar, the posters'],
  ['anime.js', 'Split-flap cells, the train, the map drawing in, card fades'],
  ['CSS', 'Custom properties for themes, grid, container queries, view transitions'],
  ['Local Storage', 'Your passes and listings, kept on this device'],
];

const FAQ = [
  ['How do I book a pass?', 'Open any event, fill in your name, email and Indian mobile number, choose how many passes you need, and press Book. It takes under a minute and there is no account to create.'],
  ['Where is my pass saved?', 'In My passes, in this browser’s Local Storage. It stays after you close the tab, but clearing your browsing data removes it.'],
  ['Can I book for friends?', 'Yes, up to 10 passes in one booking, as long as the event has that many seats left. One email can book each event once.'],
  ['Can I cancel?', 'Open My passes and choose Cancel pass. The seats go straight back on sale.'],
  ['Which time zone are the times in?', 'All times are Indian Standard Time (IST), wherever you are reading from.'],
  ['How do I list my own event?', 'Use Host an event. Fill in the details, watch the preview update, and submit. Your listing is saved on this device for review.'],
  ['Are these real events?', 'The events are made up for this project, but the venues are real places across India, and the photos are real photos from Wikimedia Commons.'],
  ['Does the site work without animations?', 'Yes. If your device is set to reduce motion, the flips, the train and the scroll effects switch off and everything still works.'],
];

export default function About() {
  const ref = useRef(null);

  useEffect(() => {
    document.title = 'About & FAQ | Mela';
  }, []);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const items = gsap.utils.toArray('[data-reveal]');
      gsap.set(items, { autoAlpha: 0, y: 30 });
      ScrollTrigger.batch(items, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 }),
      });
    },
    { scope: ref },
  );

  return (
    <div className="about" ref={ref}>
      <div className="container">
        <header className="page-head about-head">
          <h1 className="page-title" data-page-title tabIndex={-1}>
            A railway station for everything worth going to.
          </h1>
          <p className="page-sub">
            Mela (मेला) means a fair, a gathering, the place everyone turns up. This one gathers concerts, food walks,
            hackathons and workshops from across India onto one board, and lets you book a seat in under a minute.
          </p>
        </header>

        <ul className="about-numbers">
          {NUMBERS.map(([n, label]) => (
            <li key={label} data-reveal>
              <FlapText text={String(n).padStart(2, '0')} length={2} scramble={false} />
              <span>{label}</span>
            </li>
          ))}
        </ul>

        <section className="about-section" aria-labelledby="idea-title">
          <div className="section-head" data-reveal>
            <div>
              <h2 id="idea-title" className="section-title">
                Designed like an Indian station
              </h2>
              <p className="section-sub">The one place every Indian city has, and everyone knows how to read.</p>
            </div>
          </div>
          <ul className="ideas">
            {IDEAS.map(({ icon: Icon, cat, title, text }) => (
              <li key={title} className="idea" data-cat={cat} data-reveal>
                <span className="idea__icon" aria-hidden="true">
                  <Icon size={24} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="about-section" aria-labelledby="stack-title">
          <div className="section-head" data-reveal>
            <div>
              <h2 id="stack-title" className="section-title">
                How it’s built
              </h2>
              <p className="section-sub">A K Explore, Web Designing project by Kashvi Jain. No backend: everything runs in your browser.</p>
            </div>
          </div>
          <dl className="stack">
            {STACK.map(([name, use]) => (
              <div key={name} className="stack__item" data-reveal>
                <dt>{name}</dt>
                <dd>{use}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="about-section about-faq" id="faq" aria-labelledby="faq-title">
          <div className="section-head" data-reveal>
            <div>
              <h2 id="faq-title" className="section-title">
                Questions people ask
              </h2>
            </div>
          </div>
          <div className="faq">
            {FAQ.map(([q, a], i) => (
              <details key={q} className="faq__item" name="faq" open={i === 0} data-reveal>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="about-cta" data-reveal aria-labelledby="about-cta-title">
          <h2 id="about-cta-title">Ready to board?</h2>
          <div className="about-cta__actions">
            <Link to="/" state={{ explore: true }} viewTransition className="btn btn--primary">
              Browse events
            </Link>
            <Link to="/host" viewTransition className="btn">
              Host an event
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
