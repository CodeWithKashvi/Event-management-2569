// Run with `npm test` (Node's built-in test runner, no extra packages).
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalisePhone, validateAll, validateField, validateHost, validateHostField } from '../src/lib/validate.js';
import { formatPrice, fromTimeParts, istDayKey, startsAt, timeLeft, timeParts } from '../src/lib/schedule.js';
import { EVENTS, filterEvents, seatStatus, seatsLeft } from '../src/data/events.js';

const ok = { name: 'Kashvi Jain', email: 'kashvi@example.com', phone: '98765 43210', eventId: 'x', tickets: '2' };
const ctx = { event: { id: 'x' }, seatsLeft: 10, alreadyRegistered: false };

test('a complete, valid registration has no errors', () => {
  assert.deepEqual(validateAll(ok, ctx), {});
});

test('name: required, at least 2 letters, any Indian script', () => {
  assert.match(validateField('name', { name: '' }), /Enter your full name/);
  assert.match(validateField('name', { name: 'K' }), /at least 2/);
  assert.match(validateField('name', { name: 'R2D2' }), /letters/);
  assert.equal(validateField('name', { name: 'काश्वी जैन' }), '');
  assert.equal(validateField('name', { name: "D'Souza-Rao" }), '');
});

test('email: format and duplicate booking', () => {
  assert.match(validateField('email', { email: 'kashvi@' }), /name@example.com/);
  assert.match(validateField('email', ok, { ...ctx, alreadyRegistered: true }), /already has a pass/);
});

test('phone: Indian mobile numbers with or without +91 / 0', () => {
  for (const p of ['9876543210', '+91 98765 43210', '098765-43210', '919876543210']) {
    assert.equal(normalisePhone(p), '9876543210', p);
    assert.equal(validateField('phone', { phone: p }), '', p);
  }
  for (const p of ['12345', '5876543210', '98765432101']) assert.notEqual(validateField('phone', { phone: p }), '', p);
});

test('event and tickets respect seats left', () => {
  assert.match(validateField('eventId', { eventId: '' }), /Choose an event/);
  assert.match(validateField('eventId', ok, { ...ctx, seatsLeft: 0 }), /full/);
  assert.match(validateField('tickets', { tickets: '' }, ctx), /how many passes/);
  for (const t of ['0', '11', '2.5', 'abc']) assert.match(validateField('tickets', { tickets: t }, ctx), /from 1 to 10/, t);
  assert.match(validateField('tickets', { tickets: '3' }, { ...ctx, seatsLeft: 2 }), /Only 2 seats/);
});

test('schedule: events are always in the future, at the right IST time', () => {
  const now = new Date('2026-11-06T20:00:00+05:30');
  assert.equal(startsAt({ day: 2, time: '19:30' }, now).toISOString(), '2026-11-08T14:00:00.000Z');
  // Earlier today has already passed, so it moves to next week.
  assert.equal(startsAt({ day: 0, time: '09:00' }, now).toISOString(), '2026-11-13T03:30:00.000Z');
  assert.deepEqual(timeLeft(90_061_000, 0), { ms: 90_061_000, days: 1, hours: 1, minutes: 1, seconds: 1 });
  assert.equal(formatPrice(0), 'Free');
  assert.equal(formatPrice(1200), '₹1,200');
});

test('search, filters and sorting', () => {
  assert.ok(filterEvents(EVENTS, { q: 'biryani' }).every((e) => e.city === 'Hyderabad'));
  assert.ok(filterEvents(EVENTS, { city: 'Bhubaneswar', category: 'Music' }).length >= 1);
  assert.equal(filterEvents(EVENTS, { q: 'zzz-nothing' }).length, 0);
  const byPrice = filterEvents(EVENTS, { sort: 'price' }).map((e) => e.price);
  assert.deepEqual(byPrice, [...byPrice].sort((a, b) => a - b));
});

test('seats: own bookings reduce what is left', () => {
  const e = EVENTS.find((x) => x.id === 'paint-a-pattachitra');
  const before = seatsLeft(e);
  assert.equal(seatsLeft(e, [{ eventId: e.id, tickets: 2 }]), before - 2);
  assert.equal(seatStatus(EVENTS.find((x) => x.id === 'night-sky-camp')), 'full');
});

test('host form: a complete listing is valid; each rule catches its mistake', () => {
  const ctx = { today: '2026-11-07', maxDate: '2027-11-07' };
  const listing = {
    title: 'Rooftop Ghazal Night', category: 'Music', blurb: 'An evening of ghazals under the stars, with chai.',
    date: '2026-11-20', time: '19:30', city: 'Lucknow', venue: 'Hazratganj rooftop', price: '0', capacity: '80',
    organiser: 'Awadh Arts', email: 'hello@awadh.in', agree: true,
  };
  assert.deepEqual(validateHost(listing, ctx), {});
  const bad = (field, value) => validateHostField(field, { ...listing, [field]: value }, ctx);
  assert.match(bad('title', 'Gig'), /at least 4/);
  assert.match(bad('date', '2026-11-06'), /future/);
  assert.match(bad('date', '2028-01-01'), /a year ahead/);
  assert.match(bad('time', '25:00'), /like 18:30/);
  assert.match(bad('price', '-5'), /whole number/);
  assert.match(bad('price', '12.5'), /whole number/);
  assert.match(bad('capacity', '3'), /at least 5/);
  assert.match(bad('blurb', 'Too short'), /at least 20/);
  assert.match(bad('blurb', 'x'.repeat(141)), /140/);
  assert.match(bad('city', 'C1ty'), /letters/);
  assert.match(bad('agree', false), /Confirm/);
});

test('istDayKey uses the date in India, not the local time zone', () => {
  assert.equal(istDayKey(new Date('2026-11-07T19:00:00Z')), '2026-11-08'); // 00:30 IST next day
  assert.equal(istDayKey(new Date('2026-11-07T18:00:00Z')), '2026-11-07'); // 23:30 IST
});

test('time picker: 12-hour parts round-trip to 24-hour HH:MM, including midnight and noon', () => {
  assert.deepEqual(timeParts('19:30'), { h: 7, m: '30', p: 'PM' });
  assert.deepEqual(timeParts('00:15'), { h: 12, m: '15', p: 'AM' });
  assert.deepEqual(timeParts('12:00'), { h: 12, m: '00', p: 'PM' });
  assert.equal(timeParts('24:00'), null);
  assert.equal(timeParts(''), null);
  for (const t of ['00:00', '00:45', '09:15', '11:30', '12:00', '12:45', '13:00', '23:45']) assert.equal(fromTimeParts(timeParts(t)), t);
});
