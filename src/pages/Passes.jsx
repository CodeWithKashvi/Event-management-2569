import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { CalendarPlus, Trash2 } from 'lucide-react';
import Ticket from '../components/Ticket.jsx';
import { getEvent } from '../data/events.js';
import { cancelPass, usePasses } from '../lib/passes.js';
import { downloadIcs } from '../lib/calendar.js';
import './Passes.css';

export default function Passes() {
  const passes = usePasses();
  const dialog = useRef(null);
  const [toCancel, setToCancel] = useState(null);
  const sorted = [...passes].sort((a, b) => new Date(a.start) - new Date(b.start));
  const now = Date.now();

  useEffect(() => {
    document.title = 'My passes | Mela';
  }, []);

  const askCancel = (pass) => {
    setToCancel(pass);
    dialog.current.showModal();
  };

  return (
    <div className="container passes-page">
      <h1 className="page-title" data-page-title tabIndex={-1}>
        My passes
      </h1>

      {sorted.length === 0 ? (
        <div className="empty empty--passes">
          <h2>No passes yet</h2>
          <p>When you book an event, your pass shows up here with its PNR, ready to show at the gate.</p>
          <Link to="/" state={{ explore: true }} className="btn btn--primary" viewTransition>
            Browse events
          </Link>
        </div>
      ) : (
        <>
          <p className="passes-page__lede">
            {sorted.length} {sorted.length === 1 ? 'booking' : 'bookings'} saved on this device.
          </p>
          <ul className="pass-list">
            {sorted.map((p) => {
              const event = getEvent(p.eventId);
              const past = new Date(p.start) < now;
              return (
                <li key={p.pnr} className="pass-list__item">
                  <Ticket pass={p} past={past} />
                  <div className="pass-list__actions">
                    {event && (
                      <Link to={`/events/${event.id}`} viewTransition className="btn">
                        View event
                      </Link>
                    )}
                    {event && !past && (
                      <button type="button" className="btn" onClick={() => downloadIcs({ ...event, start: p.start }, p.pnr)}>
                        <CalendarPlus size={18} aria-hidden="true" /> Add to calendar
                      </button>
                    )}
                    <button type="button" className="btn btn--danger-ghost" onClick={() => askCancel(p)}>
                      <Trash2 size={18} aria-hidden="true" /> {past ? 'Remove' : 'Cancel pass'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <p className="passes-page__fine">
        Passes are stored in this browser&rsquo;s Local Storage. They stay after you close the tab, but clearing your
        browsing data removes them.
      </p>

      <dialog ref={dialog} className="dialog" aria-labelledby="cancel-title" onClose={() => setToCancel(null)}>
        {toCancel && (
          <form method="dialog">
            <h2 id="cancel-title">Cancel this pass?</h2>
            <p>
              Your {toCancel.tickets === 1 ? 'pass' : `${toCancel.tickets} passes`} for <strong>{toCancel.eventTitle}</strong>{' '}
              (PNR {toCancel.pnr}) will be removed from this device and the seats go back on sale.
            </p>
            <div className="dialog__actions">
              <button value="keep" className="btn" autoFocus>
                Keep my pass
              </button>
              <button value="cancel" className="btn btn--danger" onClick={() => cancelPass(toCancel.pnr)}>
                Cancel pass
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}
