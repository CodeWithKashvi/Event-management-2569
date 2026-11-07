import './Field.css';

/** Label, control, then either a hint or an error. The control's id must match `id`. */
export default function Field({ id, label, hint, error, children }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`} data-field={id}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
