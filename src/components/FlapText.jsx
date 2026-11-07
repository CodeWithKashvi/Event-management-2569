import { useEffect, useRef } from 'react';
import { flipCell } from '../lib/motion.js';

/**
 * Text shown on split-flap cells, like an Indian Railways departure board.
 * React renders empty cells; anime.js owns their text so it can flip them.
 * Decorative only (aria-hidden): give the surrounding element a readable label.
 */
export default function FlapText({ text, length, className = '', delay = 0, scramble = true }) {
  const ref = useRef(null);
  const value = String(text).toUpperCase().slice(0, length).padEnd(length, ' ');

  useEffect(() => {
    [...ref.current.children].forEach((cell, i) => {
      const to = value[i];
      if (to === ' ' && !cell.textContent.trim()) cell.textContent = ' ';
      else flipCell(cell, to, { delay: delay + i * 24, scramble });
    });
    // `delay` only staggers the flip; it should not trigger one.
  }, [value, scramble]);

  return (
    <span ref={ref} className={`flap ${className}`} style={{ '--n': length }} aria-hidden="true">
      {Array.from({ length }, (_, i) => (
        <span key={i} className="flap__cell" />
      ))}
    </span>
  );
}
