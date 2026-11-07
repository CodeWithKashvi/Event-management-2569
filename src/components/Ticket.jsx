import { formatDate, formatTime } from '../lib/schedule.js';
import './Ticket.css';

/** Decorative barcode drawn from the PNR digits. */
function Barcode({ value }) {
  const digits = value.replace(/\D/g, '');
  const pattern = digits + [...digits].reverse().join('') + digits;
  let x = 0;
  const bars = [];
  [...pattern].forEach((d, i) => {
    const w = 1 + (Number(d) % 3);
    if (i % 2 === 0) bars.push(<rect key={i} x={x} width={w} height="40" />);
    x += w + 1;
  });
  return (
    <svg className="barcode" viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" aria-hidden="true">
      {bars}
    </svg>
  );
}

/** A railway-style pass. `ticketRef`/`stampRef` let the booking screen animate it in. */
export default function Ticket({ pass, ticketRef, stampRef, past = false }) {
  const start = new Date(pass.start);
  return (
    <div className={`ticket${past ? ' is-past' : ''}`} ref={ticketRef}>
      <div className="ticket__card">
        <div className="ticket__main">
          <p className="ticket__brand">
            <span lang="hi">मेला</span> Mela pass
          </p>
          <h3 className="ticket__title">{pass.eventTitle}</h3>
          <dl className="ticket__grid">
            <div>
              <dt>Date</dt>
              <dd>{formatDate(start)}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{formatTime(start)}</dd>
            </div>
            <div className="ticket__wide">
              <dt>Venue</dt>
              <dd>
                {pass.venue}, {pass.city}
              </dd>
            </div>
            <div>
              <dt>Name</dt>
              <dd>{pass.name}</dd>
            </div>
            <div>
              <dt>Admits</dt>
              <dd>{pass.tickets}</dd>
            </div>
          </dl>
          <span className="ticket__stamp" ref={stampRef} aria-hidden="true">
            {past ? 'Ended' : 'Confirmed'}
          </span>
        </div>
        <div className="ticket__stub">
          <p className="ticket__pnr">
            <span>PNR</span>
            <strong>{pass.pnr}</strong>
          </p>
          <Barcode value={pass.pnr} />
        </div>
      </div>
    </div>
  );
}
