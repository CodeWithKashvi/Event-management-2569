import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { enIN } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import FlapText from './FlapText.jsx';
import { FESTIVALS } from '../data/festivals.js';
import { fromTimeParts, pad2, timeParts } from '../lib/schedule.js';
import './SearchSelect.css';
import './Pickers.css';

/*
 * Date and time fields in the style of shadcn/ui's date picker: a button that looks like the other
 * fields opens a panel below it (or above, when there's no room). Values stay plain strings,
 * 'YYYY-MM-DD' and 'HH:MM', so validation and storage don't change. Both reuse SearchSelect's
 * trigger and panel styles, so every dropdown on the form looks the same.
 */

/** Open/close behaviour shared by both pickers: away-click, Escape, Tab out, flip up near the bottom. */
function usePopover(onClose, panelHeight) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);

  const show = () => {
    const r = trigger.current.getBoundingClientRect();
    const below = innerHeight - r.bottom;
    setUp(below < panelHeight && r.top > below);
    setOpen(true);
  };
  // `chose`: closing because a value was picked, so it isn't an "opened and left empty" visit.
  const hide = (refocus, chose = false) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
    if (!chose) onClose?.();
  };

  useEffect(() => {
    if (!open) return;
    const away = (e) => !root.current.contains(e.target) && hide(false);
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  });

  const rootProps = {
    ref: root,
    className: `ss picker${open ? ' is-open' : ''}${up ? ' is-up' : ''}`,
    onKeyDown: (e) => {
      if (e.key !== 'Escape' || !open) return;
      e.preventDefault();
      e.stopPropagation();
      hide(true);
    },
    // Tabbing out closes it. (A click on the panel's padding blurs to nothing, so that's ignored.)
    onBlur: (e) => open && e.relatedTarget && !root.current.contains(e.relatedTarget) && hide(false),
  };
  return { open, show, hide, trigger, rootProps };
}

// A button's <label> would replace its text for screen readers, so the name carries both: "Date: Sun, 8 Nov 2026".
function Trigger({ pop, id, name, icon: Icon, text, placeholder, invalid, describedBy, label }) {
  return (
    <button
      ref={pop.trigger}
      id={id}
      name={name}
      type="button"
      className="ss__trigger"
      aria-label={`${label}: ${text || 'not chosen'}`}
      aria-haspopup="dialog"
      aria-expanded={pop.open}
      aria-controls={pop.open ? `${id}-panel` : undefined}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onClick={() => (pop.open ? pop.hide(true) : pop.show())}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown' && !pop.open) {
          e.preventDefault();
          pop.show();
        }
      }}
    >
      <Icon className="picker__icon" size={18} aria-hidden="true" />
      <span className={`ss__value${text ? '' : ' is-placeholder'}`}>{text || placeholder}</span>
      <ChevronDown className="ss__chevron" size={18} aria-hidden="true" />
    </button>
  );
}

/* ============ Date ============ */

// The calendar works in the browser's local time; a key's parts become a local midnight and back.
const toDate = (key) => (key ? new Date(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10)) : undefined);
const toKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const triggerFmt = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const festFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });
const FEST_DAYS = Object.keys(FESTIVALS).map(toDate);

const Chevron = ({ orientation, className }) =>
  orientation === 'left' ? <ChevronLeft size={16} className={className} /> : <ChevronRight size={16} className={className} />;

export function DatePicker({ id, name, label, value, min, max, onChange, onClose, invalid, describedBy, placeholder = 'Pick a date' }) {
  const pop = usePopover(onClose, 470);
  const selected = toDate(value);
  const first = toDate(min);
  const last = toDate(max);
  const [month, setMonth] = useState(selected ?? first);

  // Opening always shows the chosen month (or this month).
  useEffect(() => {
    if (pop.open) setMonth(toDate(value) ?? toDate(min));
  }, [pop.open]);

  const pick = (d) => {
    if (!d) return;
    onChange(toKey(d));
    pop.hide(true, true);
  };

  // Quick picks, like shadcn's "date picker with presets". "This weekend" is the coming Saturday (or today at the weekend).
  const dow = first.getDay();
  const presets = [
    ['Today', first],
    ['Tomorrow', addDays(first, 1)],
    ['This weekend', dow === 6 || dow === 0 ? first : addDays(first, 6 - dow)],
  ];

  const fests = Object.entries(FESTIVALS).filter(
    ([k]) => +k.slice(0, 4) === month.getFullYear() && +k.slice(5, 7) === month.getMonth() + 1 && k >= min,
  );

  return (
    <div {...pop.rootProps}>
      <Trigger pop={pop} id={id} name={name} icon={CalendarDays} label={label} placeholder={placeholder}
        text={selected && triggerFmt.format(selected)} invalid={invalid} describedBy={describedBy} />

      {pop.open && (
        <div className="ss__panel picker__panel" id={`${id}-panel`} role="dialog" aria-label="Choose a date">
          <div className="picker__presets" role="group" aria-label="Quick picks">
            {presets.map(([label, d]) => (
              <button key={label} type="button" className="picker__preset" aria-pressed={value === toKey(d)} onClick={() => pick(d)}>
                {label}
              </button>
            ))}
          </div>
          <DayPicker
            mode="single"
            required
            autoFocus
            animate
            navLayout="around"
            locale={enIN}
            weekStartsOn={1}
            selected={selected}
            onSelect={pick}
            month={month}
            onMonthChange={setMonth}
            startMonth={first}
            endMonth={last}
            disabled={[{ before: first }, { after: last }]}
            modifiers={{ festival: FEST_DAYS }}
            modifiersClassNames={{ festival: 'is-fest' }}
            components={{ Chevron }}
            footer={
              fests.length > 0 && (
                <p className="picker__fests">
                  {fests.map(([k, [en, hi]]) => (
                    <span key={k}>
                      <strong>{festFmt.format(toDate(k))}</strong> {en} <span lang="hi">{hi}</span>
                    </span>
                  ))}
                </p>
              )
            }
          />
        </div>
      )}
    </div>
  );
}

/* ============ Time ============ */

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = ['00', '15', '30', '45'];

function Options({ legend, name, options, checked, onPick, cols, format = String }) {
  return (
    <fieldset className="tp__group">
      <legend>{legend}</legend>
      <div className="tp__opts" style={{ '--cols': cols }}>
        {options.map((o) => (
          <label key={o} className="tp__opt">
            <input type="radio" name={name} value={o} checked={checked === o} onChange={() => onPick(o)} />
            <span>{format(o)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function TimePicker({ id, name, label, value, onChange, onClose, invalid, describedBy, placeholder = 'Pick a time' }) {
  const pop = usePopover(onClose, 360);
  const panel = useRef(null);
  const parts = timeParts(value);
  // Evening is the usual start for a Mela event, so a first pick fills in the rest around 6:00 pm.
  const setPart = (key, v) => onChange(fromTimeParts({ h: 6, m: '00', p: 'PM', ...parts, [key]: v }));

  // Focus the chosen hour (or the first) when the panel opens; arrow keys then move within each row.
  useEffect(() => {
    if (pop.open) (panel.current.querySelector('input:checked') ?? panel.current.querySelector('input'))?.focus();
  }, [pop.open]);

  const text = parts && `${parts.h}:${parts.m} ${parts.p.toLowerCase()}`;

  return (
    <div {...pop.rootProps}>
      <Trigger pop={pop} id={id} name={name} icon={Clock} label={label} placeholder={placeholder}
        text={text} invalid={invalid} describedBy={describedBy} />

      {pop.open && (
        <div
          ref={panel}
          className="ss__panel picker__panel tp"
          id={`${id}-panel`}
          role="dialog"
          aria-label="Choose a start time"
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault(); // Enter means "done", never "submit the form"
            pop.hide(true, !!parts);
          }}
        >
          <div className="tp__head" aria-hidden="true">
            <FlapText text={parts ? `${pad2(parts.h)}:${parts.m} ${parts.p}` : ''} length={8} className="tp__flap" scramble={false} />
            <span className="tp__zone">IST</span>
          </div>
          <Options legend="Hour" name={`${id}-hour`} options={HOURS} checked={parts?.h} onPick={(v) => setPart('h', v)} cols={6} />
          <div className="tp__row">
            <Options legend="Minutes" name={`${id}-minute`} options={MINUTES} checked={parts?.m} onPick={(v) => setPart('m', v)} cols={4} format={(m) => `:${m}`} />
            <Options legend="am / pm" name={`${id}-period`} options={['AM', 'PM']} checked={parts?.p} onPick={(v) => setPart('p', v)} cols={2} format={(p) => p.toLowerCase()} />
          </div>
          <button type="button" className="btn btn--dark btn--block tp__done" onClick={() => pop.hide(true, !!parts)}>
            {text ? `Use ${text}` : 'Done'}
          </button>
        </div>
      )}
    </div>
  );
}
