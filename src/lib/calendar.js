// "Add to calendar": builds a standard .ics file that Google, Apple and Outlook calendars open.
const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const esc = (s) => String(s).replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

export function downloadIcs(event, pnr) {
  const start = new Date(event.start);
  const end = new Date(start.getTime() + event.duration * 60000);
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mela//Events//EN', 'BEGIN:VEVENT',
    `UID:${event.id}-${pnr ?? stamp(start)}@mela`,
    `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(event.title)}`,
    `LOCATION:${esc(`${event.venue}, ${event.city}`)}`,
    `DESCRIPTION:${esc(pnr ? `Mela pass PNR ${pnr}. ${event.blurb}` : event.blurb)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `${event.id}.ics` });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const mapsUrl = (event) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue}, ${event.city}`)}`;
