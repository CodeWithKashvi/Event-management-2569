// Shared animation setup. GSAP handles the page-load and scroll moments;
// anime.js handles the split-flap board, layout changes and feedback micro-animations.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { animate, random, spring, stagger } from 'animejs';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
export const reducedMotion = () => motionQuery.matches;

export { gsap, ScrollTrigger, SplitText, useGSAP };

const GLYPHS = 'ABCDEFGHIJKLMNOPRSTUVWXYZ0123456789';

/**
 * Split-flap flip for one board cell: the flap squashes shut, a new glyph drops in,
 * it opens again, a few times, landing on `to`. With `scramble: false` it flips once.
 */
export function flipCell(cell, to, { delay = 0, scramble = true } = {}) {
  if (cell.textContent === to && !cell.dataset.flipping) return;
  if (reducedMotion()) {
    cell.textContent = to;
    return;
  }
  const flips = scramble ? 2 + Math.floor(Math.random() * 4) : 1;
  let shut = 0;
  cell.dataset.flipping = '1';
  animate(cell, {
    scaleY: [1, 0.06],
    duration: 65,
    delay,
    ease: 'in(2)',
    alternate: true,
    loop: flips * 2 - 1,
    onLoop: () => {
      shut += 1;
      if (shut % 2) cell.textContent = (shut + 1) / 2 >= flips ? to : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    },
    onComplete: () => {
      cell.textContent = to;
      delete cell.dataset.flipping;
    },
  });
}

/** Little horizontal shake for an invalid field. */
export function shake(el) {
  if (!el || reducedMotion()) return;
  animate(el, { x: [{ to: -7 }, { to: 6 }, { to: -4 }, { to: 2 }, { to: 0 }], duration: 380, ease: 'inOut(2)' });
}

/** The ticket slides out of the "printer", then the CONFIRMED stamp thumps down. */
export function printTicket(ticket, stamp) {
  if (!ticket || reducedMotion()) return;
  animate(ticket, { y: ['-18%', '0%'], opacity: [0, 1], duration: 700, ease: 'out(4)' });
  if (stamp) {
    animate(stamp, {
      scale: [2.6, 1],
      rotate: [-32, -12],
      opacity: [0, 1],
      delay: 520,
      ease: spring({ stiffness: 260, damping: 13 }),
    });
  }
}

/** A shower of marigold petals from `origin`, the way good news is celebrated in India. */
export function petalShower(origin) {
  if (!origin || reducedMotion()) return;
  const { left, top, width } = origin.getBoundingClientRect();
  const layer = document.createElement('div');
  layer.className = 'petals';
  layer.setAttribute('aria-hidden', 'true');
  const colours = ['#ffb627', '#f28c28', '#ffd166', '#e4472f'];
  const petals = Array.from({ length: 42 }, (_, i) => {
    const p = document.createElement('i');
    p.style.left = `${left + width / 2}px`;
    p.style.top = `${top}px`;
    p.style.background = colours[i % colours.length];
    layer.append(p);
    return p;
  });
  document.body.append(layer);
  animate(petals, {
    x: () => random(-300, 300),
    y: [
      { to: () => random(-320, -140), duration: 520, ease: 'out(3)' },
      { to: () => random(240, 560), duration: 1500, ease: 'in(1.6)' },
    ],
    rotate: () => random(-720, 720),
    scale: () => random(0.6, 1.3, 2),
    opacity: [{ to: 1, duration: 80 }, { to: 0, duration: 500, delay: 1400 }],
    delay: stagger(6),
    onComplete: () => layer.remove(),
  });
}
