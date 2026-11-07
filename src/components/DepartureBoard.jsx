import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Pause, Play } from 'lucide-react';
import FlapText from './FlapText.jsx';
import { EVENTS, seatStatus } from '../data/events.js';
import { usePasses } from '../lib/passes.js';
import { useNow } from '../lib/useNow.js';
import { reducedMotion } from '../lib/motion.js';
import { IST, formatBoardDate, formatClock, formatDate, formatTime, pad2, timeLeft } from '../lib/schedule.js';
import './DepartureBoard.css';

const ROWS = 6;
const PAGE_MS = 9000;
const STATUS = { open: 'BOARDING', final: 'FINAL CALL', full: 'FULL' };
const STATUS_TEXT = { open: 'Registration open.', final: 'Only a few seats left.', full: 'Fully booked.' };
const PAGES = Math.ceil(EVENTS.length / ROWS);
const clock = new Intl.DateTimeFormat('en-IN', { timeZone: IST, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });

/** Hindi and English take turns, the way station boards alternate languages. */
const Bi = ({ hi, en }) => (
  <span className="bi">
    <span lang="hi">{hi}</span>
    <span>{en}</span>
  </span>
);

function Clock() {
  const now = useNow();
  return (
    <p className="board__clock">
      <span className="sr-only">Time in India: </span>
      {clock.format(now)} <abbr title="Indian Standard Time">IST</abbr>
    </p>
  );
}

function NextDeparture() {
  const now = useNow();
  const next = EVENTS.find((e) => e.start > now) ?? EVENTS[0];
  const t = timeLeft(next.start, now);
  return (
    <p className="board__next">
      Next departure:{' '}
      <Link to={`/events/${next.id}`} viewTransition>
        {next.title}
      </Link>{' '}
      in{' '}
      <span className="board__eta">
        {t.days > 0 && `${t.days}d `}
        {pad2(t.hours)}:{pad2(t.minutes)}:{pad2(t.seconds)}
      </span>
    </p>
  );
}

function BoardRow({ event, status, delay, waiting }) {
  const cols = event
    ? [formatClock(event.start), formatBoardDate(event.start), event.board, event.city, STATUS[status]]
    : ['', '', '', '', ''];
  return (
    <li className={`board__row is-${event ? status : waiting ? 'waiting' : 'blank'}`} aria-hidden={event ? undefined : true}>
      {event && (
        <Link to={`/events/${event.id}`} viewTransition className="board__link">
          <span className="sr-only">
            {event.title}, {event.city}, {formatDate(event.start)} at {formatTime(event.start)}. {STATUS_TEXT[status]}
          </span>
        </Link>
      )}
      <FlapText className="col-time" text={cols[0]} length={5} delay={delay} />
      <FlapText className="col-date" text={cols[1]} length={6} delay={delay + 60} />
      <FlapText className="col-event" text={cols[2]} length={19} delay={delay + 120} />
      <FlapText className="col-city" text={cols[3]} length={11} delay={delay + 200} />
      <FlapText className="col-status" text={cols[4]} length={10} delay={delay + 260} />
    </li>
  );
}

export default function DepartureBoard() {
  const passes = usePasses();
  const [page, setPage] = useState(0);
  const [playing, setPlaying] = useState(() => !reducedMotion());
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  // The board stays blank until it scrolls into view, then every row flips in.
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setVisible(true);
      io.disconnect();
    }, { threshold: 0.35 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  // Rotate pages like a real board; pause on hover/focus or with the button.
  useEffect(() => {
    if (!playing || hovered || !visible) return;
    const id = setInterval(() => setPage((p) => (p + 1) % PAGES), PAGE_MS);
    return () => clearInterval(id);
  }, [playing, hovered, visible]);

  const rows = visible ? EVENTS.slice(page * ROWS, page * ROWS + ROWS) : [];

  return (
    <div
      ref={ref}
      className="board"
      role="region"
      aria-label="Departure board"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <header className="board__top">
        <p className="board__title">
          <span lang="hi">प्रस्थान</span> Departures
        </p>
        <Clock />
      </header>

      <div className="board__head" aria-hidden="true">
        <span className="col-time" style={{ '--n': 5 }}><Bi hi="समय" en="Time" /></span>
        <span className="col-date" style={{ '--n': 6 }}><Bi hi="तारीख" en="Date" /></span>
        <span className="col-event" style={{ '--n': 19 }}><Bi hi="कार्यक्रम" en="Event" /></span>
        <span className="col-city" style={{ '--n': 11 }}><Bi hi="शहर" en="City" /></span>
        <span className="col-status" style={{ '--n': 10 }}><Bi hi="स्थिति" en="Status" /></span>
      </div>

      <ol className="board__rows">
        {Array.from({ length: ROWS }, (_, i) => (
          <BoardRow key={i} event={rows[i]} status={rows[i] && seatStatus(rows[i], passes)} delay={i * 110} waiting={!visible} />
        ))}
      </ol>

      <footer className="board__foot">
        <NextDeparture />
        <div className="board__pager">
          <span>
            Page {page + 1} of {PAGES}
          </span>
          <button
            type="button"
            className="board__btn"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause the board' : 'Rotate the board'}
          >
            {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="board__btn board__btn--text"
            onClick={() => setPage((p) => (p + 1) % PAGES)}
          >
            Next page
          </button>
        </div>
      </footer>
    </div>
  );
}
