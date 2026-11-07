// Registration form validation. Pure functions, so they can be unit-tested with `npm test`.

export const FIELDS = ['name', 'email', 'phone', 'eventId', 'tickets'];
export const MAX_TICKETS = 10;

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u; // any script (Hindi, Odia, Tamil…), plus . ' -
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MOBILE_RE = /^[6-9]\d{9}$/; // Indian mobile numbers start with 6, 7, 8 or 9

/** "+91 98765-43210", "098765 43210" and "919876543210" all become "9876543210". */
export function normalisePhone(raw = '') {
  const digits = raw.replace(/[\s\-().]/g, '');
  return digits.replace(/^\+91/, '').replace(/^(91|0)(?=\d{10}$)/, '');
}

/**
 * Returns an error message for one field, or '' when it is valid.
 * `ctx` = { event, seatsLeft, alreadyRegistered } for the currently selected event.
 */
export function validateField(field, values, ctx = {}) {
  const v = String(values[field] ?? '').trim();
  switch (field) {
    case 'name':
      if (!v) return 'Enter your full name.';
      if (v.length < 2) return 'Your name needs at least 2 letters.';
      if (v.length > 60) return 'Keep your name under 60 characters.';
      if (!NAME_RE.test(v)) return 'Use letters, spaces, dots, hyphens or apostrophes only.';
      return '';
    case 'email':
      if (!v) return 'Enter your email address.';
      if (!EMAIL_RE.test(v)) return 'Enter an email like name@example.com.';
      if (ctx.alreadyRegistered) return 'This email already has a pass for this event. You can find it in My passes.';
      return '';
    case 'phone':
      if (!v) return 'Enter your mobile number.';
      if (!MOBILE_RE.test(normalisePhone(v))) return 'Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.';
      return '';
    case 'eventId':
      if (!v) return 'Choose an event.';
      if (!ctx.event) return 'Choose an event from the list.';
      if (ctx.seatsLeft <= 0) return 'This event is full. Choose another one.';
      return '';
    case 'tickets': {
      const n = Number(v);
      if (!v) return 'Enter how many passes you need.';
      if (!Number.isInteger(n) || n < 1 || n > MAX_TICKETS) return `Enter a whole number from 1 to ${MAX_TICKETS}.`;
      if (ctx.seatsLeft > 0 && n > ctx.seatsLeft) return `Only ${ctx.seatsLeft} ${ctx.seatsLeft === 1 ? 'seat is' : 'seats are'} left. Enter a smaller number.`;
      return '';
    }
    default:
      return '';
  }
}

/** Validates every field; returns { field: message } for the invalid ones only. */
export function validateAll(values, ctx) {
  const errors = {};
  for (const f of FIELDS) {
    const msg = validateField(f, values, ctx);
    if (msg) errors[f] = msg;
  }
  return errors;
}

// ---------- "Host an event" form ----------

export const HOST_FIELDS = ['title', 'category', 'blurb', 'date', 'time', 'city', 'venue', 'price', 'capacity', 'organiser', 'email', 'agree'];
export const BLURB_MIN = 20;
export const BLURB_MAX = 140;

const wholeNumber = (v) => (/^\d+$/.test(v) ? Number(v) : NaN);

/**
 * Returns an error message for one listing field, or '' when it is valid.
 * `ctx` = { today: 'YYYY-MM-DD', maxDate: 'YYYY-MM-DD' } (dates in IST).
 */
export function validateHostField(field, values, ctx = {}) {
  const raw = values[field];
  const v = typeof raw === 'string' ? raw.trim() : raw;
  switch (field) {
    case 'title':
      if (!v) return 'Give your event a name.';
      if (v.length < 4) return 'Use at least 4 characters for the name.';
      if (v.length > 60) return 'Keep the name under 60 characters.';
      return '';
    case 'category':
      return v ? '' : 'Choose a category.';
    case 'blurb':
      if (!v) return 'Describe the event in a sentence.';
      if (v.length < BLURB_MIN) return `Write at least ${BLURB_MIN} characters (${v.length} so far).`;
      if (v.length > BLURB_MAX) return `Keep it to ${BLURB_MAX} characters (${v.length} now).`;
      return '';
    case 'date':
      if (!v) return 'Pick a date.';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Pick a date from the calendar.';
      if (ctx.today && v < ctx.today) return 'Pick today or a date in the future.';
      if (ctx.maxDate && v > ctx.maxDate) return 'Events can be listed up to a year ahead.';
      return '';
    case 'time':
      if (!v) return 'Pick a start time.';
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) return 'Enter a time like 18:30.';
      return '';
    case 'city':
      if (!v) return 'Choose a city, or type a new one.';
      if (!NAME_RE.test(v)) return 'Use letters only for the city name.';
      return '';
    case 'venue':
      if (!v) return 'Enter the venue.';
      if (v.length < 3) return 'Use at least 3 characters for the venue.';
      if (v.length > 80) return 'Keep the venue under 80 characters.';
      return '';
    case 'price': {
      if (v === '') return 'Enter a price, or 0 for a free event.';
      const n = wholeNumber(v);
      if (Number.isNaN(n)) return 'Enter a whole number of rupees, or 0 for free.';
      if (n > 100000) return 'Keep the price at ₹1,00,000 or less.';
      return '';
    }
    case 'capacity': {
      if (v === '') return 'Enter how many people can come.';
      const n = wholeNumber(v);
      if (Number.isNaN(n) || n < 5) return 'Enter at least 5 seats.';
      if (n > 50000) return 'Enter 50,000 seats or fewer.';
      return '';
    }
    case 'organiser':
      if (!v) return 'Enter your name or your organisation’s.';
      if (v.length < 2) return 'Use at least 2 characters.';
      if (v.length > 60) return 'Keep it under 60 characters.';
      return '';
    case 'email':
      if (!v) return 'Enter an email so people can reach you.';
      if (!EMAIL_RE.test(v)) return 'Enter an email like name@example.com.';
      return '';
    case 'agree':
      return v ? '' : 'Confirm the details are correct to submit.';
    default:
      return '';
  }
}

export function validateHost(values, ctx) {
  const errors = {};
  for (const f of HOST_FIELDS) {
    const msg = validateHostField(f, values, ctx);
    if (msg) errors[f] = msg;
  }
  return errors;
}
