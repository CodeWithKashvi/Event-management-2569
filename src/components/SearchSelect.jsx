import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Plus, Search } from 'lucide-react';
import './SearchSelect.css';

/** Options whose label or hint contains every typed word. */
export function filterOptions(options, query) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return options;
  return options.filter((o) => {
    const text = `${o.label} ${o.hint ?? ''}`.toLowerCase();
    return words.every((w) => text.includes(w));
  });
}

const nextEnabled = (list, from, step) => {
  for (let i = from; i >= 0 && i < list.length; i += step) if (!list[i].disabled) return i;
  return -1;
};

/** Shows the typed text in bold inside an option's label. */
function Highlight({ text, query }) {
  const q = query.trim();
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark>{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  );
}

/**
 * A searchable dropdown (like Select2), following the WAI-ARIA combobox pattern:
 * a button shows the choice; opening it gives a search box over a listbox of options.
 *
 * options: [{ value, label, hint?, cat?, disabled? }]
 * creatable: lets people use what they typed when nothing matches (e.g. a new city).
 * onClose: called when the list closes without a new choice (useful for "touched" validation).
 */
export default function SearchSelect({
  id,
  name,
  label,
  value,
  options,
  onChange,
  onClose,
  placeholder = 'Choose…',
  searchPlaceholder = 'Type to search',
  creatable = false,
  invalid = false,
  describedBy,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const [up, setUp] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const input = useRef(null);
  const list = useRef(null);
  const uid = useId().replace(/[^\w-]/g, '');
  const listId = `${uid}-list`;

  // What the list shows for a search: the matches, plus "Use what I typed" when creatable.
  const listFor = (q) => {
    const matches = filterOptions(options, q);
    const t = q.trim();
    const isNew = creatable && t && !options.some((o) => o.label.toLowerCase() === t.toLowerCase());
    return isNew ? [...matches, { value: t, label: t, create: true }] : matches;
  };
  const typed = query.trim();
  const shown = listFor(query);
  const selected = options.find((o) => o.value === value) ?? (value ? { value, label: value } : null);

  const show = (initial = '') => {
    const r = trigger.current.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    setUp(below < 330 && r.top > below);
    setQuery(initial);
    const first = listFor(initial);
    const current = initial ? -1 : first.findIndex((o) => o.value === value && !o.disabled);
    setActive(current >= 0 ? current : nextEnabled(first, 0, 1));
    setOpen(true);
  };

  const hide = (refocus, chose = false) => {
    setOpen(false);
    setQuery('');
    if (refocus) trigger.current?.focus();
    if (!chose) onClose?.();
  };

  const choose = (o) => {
    if (!o || o.disabled) return;
    onChange(o.value);
    hide(true, true);
  };

  // Focus the search box when the list opens.
  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  // Close on a click or tap anywhere else.
  useEffect(() => {
    if (!open) return;
    const away = (e) => !root.current.contains(e.target) && hide(false);
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  });

  // Keep the highlighted option in view while arrowing through a long list.
  useEffect(() => {
    if (open && active >= 0) list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const onTriggerKey = (e) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      show();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      show(e.key); // start typing straight away, like a native select
    }
  };

  const onSearchKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const n = nextEnabled(shown, active + 1, 1);
      if (n >= 0) setActive(n);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const n = nextEnabled(shown, active - 1, -1);
      if (n >= 0) setActive(n);
    } else if (e.key === 'Enter') {
      e.preventDefault(); // never submit the surrounding form from here
      choose(shown[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      hide(true);
    } else if (e.key === 'Tab') {
      hide(false);
    }
  };

  const onSearch = (e) => {
    const q = e.target.value;
    setQuery(q);
    setActive(nextEnabled(listFor(q), 0, 1));
  };

  return (
    <div className={`ss${open ? ' is-open' : ''}${up ? ' is-up' : ''}`} ref={root}>
      <button
        ref={trigger}
        id={id}
        name={name}
        type="button"
        className="ss__trigger"
        aria-label={`${label}: ${selected ? selected.label : 'not chosen'}`} // its <label> alone would hide the choice
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? hide(true) : show())}
        onKeyDown={onTriggerKey}
      >
        {selected?.cat && <span className="ss__dot" data-cat={selected.cat} aria-hidden="true" />}
        <span className={`ss__value${selected ? '' : ' is-placeholder'}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className="ss__chevron" size={18} aria-hidden="true" />
      </button>

      {open && (
        <div className="ss__panel">
          <div className="ss__search">
            <Search size={16} aria-hidden="true" />
            <input
              ref={input}
              type="text"
              role="combobox"
              aria-label={`Search ${label}`}
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 ? `${uid}-o${active}` : undefined}
              placeholder={searchPlaceholder}
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={onSearch}
              onKeyDown={onSearchKey}
            />
          </div>
          <ul className="ss__list" id={listId} role="listbox" aria-label={label} ref={list}>
            {shown.map((o, i) => (
              <li
                key={`${o.create ? 'new:' : ''}${o.value}`}
                id={`${uid}-o${i}`}
                data-i={i}
                role="option"
                aria-selected={o.value === value && !o.create}
                aria-disabled={o.disabled || undefined}
                className={`ss__option${i === active ? ' is-active' : ''}`}
                onPointerMove={() => !o.disabled && i !== active && setActive(i)}
                onMouseDown={(e) => e.preventDefault()} // keep focus in the search box
                onClick={() => choose(o)}
              >
                {o.create ? (
                  <Plus className="ss__icon" size={16} aria-hidden="true" />
                ) : (
                  o.cat && <span className="ss__dot" data-cat={o.cat} aria-hidden="true" />
                )}
                <span className="ss__text">
                  {o.create ? (
                    <>
                      Use “<strong>{o.label}</strong>”
                    </>
                  ) : (
                    <Highlight text={o.label} query={query} />
                  )}
                  {o.hint && <small>{o.hint}</small>}
                </span>
                {o.value === value && !o.create && <Check className="ss__icon ss__check" size={16} aria-hidden="true" />}
              </li>
            ))}
            {shown.length === 0 && (
              <li className="ss__empty" role="presentation">
                Nothing matches “{typed}”. Try another word.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
