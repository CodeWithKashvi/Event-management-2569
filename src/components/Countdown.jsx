import FlapText from './FlapText.jsx';
import { useNow } from '../lib/useNow.js';
import { pad2, timeLeft } from '../lib/schedule.js';
import './Countdown.css';

/** Live days/hours/minutes/seconds countdown on split-flap digits. */
export default function Countdown({ target, label = 'Starts in' }) {
  const t = timeLeft(target, useNow());
  if (t.ms === 0) return <p className="countdown-done">Happening now</p>;

  const units = [
    ['days', t.days],
    ['hrs', t.hours],
    ['min', t.minutes],
    ['sec', t.seconds],
  ];
  return (
    <div className="countdown">
      <p className="countdown__label">{label}</p>
      <div
        className="countdown__units"
        role="timer"
        aria-label={`${label} ${t.days} days, ${t.hours} hours and ${t.minutes} minutes`}
      >
        {units.map(([unit, n]) => (
          <div className="countdown__unit" key={unit}>
            <FlapText text={pad2(n)} length={2} scramble={false} className="countdown__flap" />
            <span aria-hidden="true">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
