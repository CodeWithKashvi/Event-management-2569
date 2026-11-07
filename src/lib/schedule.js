// Dates, times and money, all in Indian Standard Time / Indian formats.
export const IST = 'Asia/Kolkata';
const IST_OFFSET_MS = 330 * 60 * 1000; // UTC+5:30, no daylight saving
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Demo events are scheduled relative to "today" in IST (`day` days from now at `time`),
 * so the site always has upcoming events whenever it is opened. If that moment has
 * already passed today, the event moves to the same time next week.
 */
export function startsAt({ day, time }, now = new Date()) {
  const ist = new Date(now.getTime() + IST_OFFSET_MS); // read with getUTC* to get IST wall-clock
  const [h, m] = time.split(':').map(Number);
  let t = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() + day, h, m) - IST_OFFSET_MS;
  if (t <= now.getTime()) t += 7 * DAY_MS;
  return new Date(t);
}

const fmt = (opts) => new Intl.DateTimeFormat('en-IN', { timeZone: IST, ...opts });
const dateFmt = fmt({ weekday: 'short', day: 'numeric', month: 'short' });
const longDateFmt = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const timeFmt = fmt({ hour: 'numeric', minute: '2-digit', hour12: true });
const clockFmt = fmt({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const boardDateFmt = fmt({ day: '2-digit', month: 'short' });
const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const formatDate = (d) => dateFmt.format(d); // "Sat, 8 Nov"
export const formatLongDate = (d) => longDateFmt.format(d); // "Saturday, 8 November 2026"
export const formatTime = (d) => timeFmt.format(d).replace(/\s?([ap])m$/i, ' $1m'); // "7:30 pm"
export const formatClock = (d) => clockFmt.format(d); // "19:30"
export const formatBoardDate = (d) => boardDateFmt.format(d).toUpperCase(); // "08 NOV"
export const formatPrice = (p) => (p === 0 ? 'Free' : rupees.format(p)); // "₹1,200"

/** Whole days/hours/minutes/seconds until `target`, never negative. */
export function timeLeft(target, now = Date.now()) {
  const ms = Math.max(0, target - now);
  const s = Math.floor(ms / 1000);
  return { ms, days: Math.floor(s / 86400), hours: Math.floor(s / 3600) % 24, minutes: Math.floor(s / 60) % 60, seconds: s % 60 };
}

export const pad2 = (n) => String(n).padStart(2, '0');

/** "2026-11-07": the calendar date in India at moment `d`. */
export const istDayKey = (d) => new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

/** '19:30' → { h: 7, m: '30', p: 'PM' } (12-hour parts for the time picker), or null if it isn't HH:MM. */
export function timeParts(value) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value ?? '')) return null;
  const h = Number(value.slice(0, 2));
  return { h: h % 12 || 12, m: value.slice(3), p: h < 12 ? 'AM' : 'PM' };
}

/** { h: 12, m: '00', p: 'AM' } → '00:00': back to 24-hour HH:MM. */
export const fromTimeParts = ({ h, m, p }) => `${pad2((h % 12) + (p === 'PM' ? 12 : 0))}:${m}`;
