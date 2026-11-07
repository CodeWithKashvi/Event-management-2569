import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router';
import { animate, stagger } from 'animejs';
import { ArrowRight, ArrowUp, Menu as MenuIcon, Moon, Sun, Ticket as TicketIcon, X } from 'lucide-react';
import FlapText from './FlapText.jsx';
import RailTrack from './RailTrack.jsx';
import { StationRow } from './StationBoard.jsx';
import { CATEGORIES, CITIES, EVENTS } from '../data/events.js';
import { CITY_LIST } from '../data/cities.js';
import credits from '../data/credits.json';
import { usePasses } from '../lib/passes.js';
import { currentTheme, toggleTheme } from '../lib/theme.js';
import { reducedMotion } from '../lib/motion.js';
import { IST, formatDate, formatTime, pad2, timeLeft } from '../lib/schedule.js';
import { useNow } from '../lib/useNow.js';
import './Layout.css';

function Logo() {
  return (
    <>
      <span className="logo__mark" lang="hi" aria-hidden="true">
        मे
      </span>
      <span className="logo__latin">Mela</span>
    </>
  );
}

const NAV = [
  { to: '/', label: 'Events', end: true, state: { explore: true } },
  { to: '/calendar', label: 'Calendar' },
  { to: '/cities', label: 'Cities' },
  { to: '/host', label: 'Host an event' },
  { to: '/about', label: 'About' },
];

function Header() {
  const passes = usePasses();
  const [theme, setTheme] = useState(currentTheme);
  const toggle = useRef(null);
  const menu = useRef(null);
  const { pathname } = useLocation();
  const count = passes.reduce((n, p) => n + p.tickets, 0);

  // Close the phone menu after moving to another page.
  useEffect(() => {
    menu.current?.close();
  }, [pathname]);

  const openMenu = () => {
    menu.current.showModal();
    if (reducedMotion()) return;
    animate(menu.current.querySelectorAll('.menu__link'), {
      opacity: [0, 1],
      translateX: [28, 0],
      duration: 420,
      delay: stagger(45, { start: 90 }),
      ease: 'out(3)',
    });
  };

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="logo" viewTransition aria-label="Mela, home">
          <Logo />
        </Link>
        <nav className="site-nav" aria-label="Main">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} state={n.state} viewTransition className="site-nav__link">
              {n.label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/passes" viewTransition className="passes-link">
          <TicketIcon size={18} aria-hidden="true" />
          <span className="passes-link__text">My passes</span>
          {count > 0 && (
            <span className="badge">
              {count}
              <span className="sr-only"> {count === 1 ? 'pass' : 'passes'}</span>
            </span>
          )}
        </NavLink>
        <button
          ref={toggle}
          type="button"
          className="icon-btn theme-btn"
          onClick={() => setTheme(toggleTheme(toggle.current))}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
        </button>
        <button type="button" className="icon-btn menu-btn" aria-haspopup="dialog" aria-label="Open menu" onClick={openMenu}>
          <MenuIcon size={20} aria-hidden="true" />
        </button>
      </div>

      <dialog ref={menu} className="menu" aria-label="Menu" onClick={(e) => e.target === menu.current && menu.current.close()}>
        <div className="menu__inner">
          <div className="menu__head">
            <span className="logo">
              <Logo />
            </span>
            <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => menu.current.close()}>
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Menu">
            <ul className="menu__list">
              {[...NAV, { to: '/passes', label: 'My passes' }].map((n) => (
                <li key={n.to}>
                  <NavLink to={n.to} end={n.end} state={n.state} viewTransition className="menu__link">
                    {n.label}
                    {n.to === '/passes' && count > 0 && <span className="badge">{count}</span>}
                    <ArrowRight size={20} aria-hidden="true" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <p className="menu__foot">Times in IST. Prices in ₹.</p>
        </div>
      </dialog>
    </header>
  );
}

const PLAN_LINKS = [
  { label: 'All events', to: '/', state: { section: 'explore' } },
  { label: 'Calendar', to: '/calendar' },
  { label: 'Cities', to: '/cities' },
  { label: 'Live departures', to: '/', state: { section: 'departures' } },
];
const MELA_LINKS = [
  { label: 'About & FAQ', to: '/about' },
  { label: 'Host an event', to: '/host' },
  { label: 'My passes', to: '/passes' },
  { label: 'How booking works', to: '/', state: { section: 'how-it-works' } },
];

function FooterLinks({ id, title, links }) {
  return (
    <nav aria-labelledby={id}>
      <h2 id={id} className="site-footer__heading">
        {title}
      </h2>
      <ul className="site-footer__links">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} state={l.state} viewTransition={!l.state}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
const istClock = new Intl.DateTimeFormat('en-IN', { timeZone: IST, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });

/** The big ticket at the top of the footer: a last call, with the next departure on its stub. */
function LastCall() {
  const now = useNow();
  const next = EVENTS.find((e) => e.start > now) ?? EVENTS[0];
  const t = timeLeft(next.start, now);
  const eta = `${t.days > 0 ? `${t.days}D ` : ''}${pad2(t.hours)}:${pad2(t.minutes)}:${pad2(t.seconds)}`;
  return (
    <section className="last-call" data-cat={next.category} aria-labelledby="last-call-title">
      <div className="last-call__main">
        <h2 id="last-call-title" className="last-call__title">
          Your seat is waiting.
        </h2>
        <p className="last-call__text">
          {EVENTS.length} events across {CITIES.length} cities, from sunrise kutcheris in Chennai to midnight runs on
          Marine Drive. Booking takes under a minute.
        </p>
        <div className="last-call__actions">
          <Link to="/" state={{ explore: true }} viewTransition className="btn btn--primary">
            Browse all events
          </Link>
          <Link to="/passes" viewTransition className="btn">
            My passes
          </Link>
        </div>
      </div>
      <div className="last-call__stub">
        <p className="last-call__label">Next departure</p>
        <Link to={`/events/${next.id}`} viewTransition className="last-call__event">
          {next.title}
        </Link>
        <p className="last-call__where">
          {next.city}, {formatDate(next.start)}, {formatTime(next.start)}
        </p>
        <div
          className="last-call__eta"
          role="timer"
          aria-label={`Starts in ${t.days} days, ${t.hours} hours and ${t.minutes} minutes`}
        >
          <FlapText text={eta} length={eta.length} scramble={false} />
        </div>
      </div>
    </section>
  );
}

function FooterClock() {
  const now = useNow();
  return (
    <p className="site-footer__clock">
      <span className="site-footer__live" aria-hidden="true" />
      <span className="sr-only">Time in India: </span>
      {istClock.format(now)} <abbr title="Indian Standard Time">IST</abbr>
    </p>
  );
}

function Footer() {
  const toTop = () => {
    window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    document.querySelector('.site-header .logo')?.focus({ preventScroll: true });
  };

  return (
    <footer className="site-footer">
      <div className="site-footer__rail">
        <RailTrack />
      </div>

      <div className="container">
        <LastCall />

        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <p className="logo logo--footer">
              <Logo />
            </p>
            <p className="site-footer__about">
              Concerts, food walks, workshops and more across India. A student project for K Explore, Web Designing:
              the events are made up, the venues are real places.
            </p>
          </div>

          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore" className="site-footer__heading">
              Explore
            </h2>
            <ul className="site-footer__links site-footer__links--cats">
              {CATEGORIES.map((c) => (
                <li key={c}>
                  <Link to={`/?cat=${c}`} state={{ explore: true }} data-cat={c}>
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <FooterLinks id="footer-plan" title="Plan" links={PLAN_LINKS} />
          <FooterLinks id="footer-mela" title="Mela" links={MELA_LINKS} />
        </div>

        <nav className="stations" aria-labelledby="footer-stations">
          <h2 id="footer-stations" className="site-footer__heading">
            Stations on the route
          </h2>
          <StationRow cities={CITY_LIST} />
        </nav>

        <div className="site-footer__bottom">
          <p>© {new Date().getFullYear()} Mela. Built by Kashvi Jain with React, GSAP and anime.js.</p>
          <FooterClock />
          <button type="button" className="site-footer__top" onClick={toTop}>
            Back to top <ArrowUp size={16} aria-hidden="true" />
          </button>
        </div>

        <details className="site-footer__credits">
          <summary>Photo credits ({Object.keys(credits).length})</summary>
          <p>Event photos from Wikimedia Commons, used under their licences. Map outline from Natural Earth.</p>
          <ul>
            {Object.entries(credits).map(([id, c]) => (
              <li key={id}>
                <a href={c.source} target="_blank" rel="noopener noreferrer">
                  {c.file.replace(/\.\w+$/, '')}
                </a>{' '}
                by {c.author} ({c.license})
              </li>
            ))}
          </ul>
        </details>
      </div>

      <p className="site-footer__word" lang="hi" aria-hidden="true">
        मेला
      </p>
    </footer>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const firstPage = useRef(true);

  // After navigating, move keyboard/screen-reader focus to the new page's heading.
  useEffect(() => {
    if (firstPage.current) {
      firstPage.current = false;
      return;
    }
    document.querySelector('[data-page-title]')?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main').focus();
        }}
      >
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  );
}
