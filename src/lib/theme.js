// Light/dark mode. The choice is saved in Local Storage; with no saved choice we follow the OS.
import { reducedMotion } from './motion.js';

const KEY = 'mela.theme';
const root = document.documentElement;

export function currentTheme() {
  return root.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

/** Switches theme with a circular reveal from the toggle button (View Transitions API when available). */
export function toggleTheme(button) {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  const apply = () => {
    root.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  };
  if (!document.startViewTransition || reducedMotion() || !button) {
    apply();
    return next;
  }
  const r = button.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.classList.add('theme-switching');
  const t = document.startViewTransition(apply);
  t.ready.then(() =>
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(.2,.75,.2,1)', pseudoElement: '::view-transition-new(root)' },
    ),
  );
  t.finished.finally(() => root.classList.remove('theme-switching'));
  return next;
}
