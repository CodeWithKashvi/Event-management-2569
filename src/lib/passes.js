// Registrations ("passes") saved in Local Storage.
import { createListStore, randomDigits } from './store.js';

const store = createListStore('mela.passes.v1');

export const usePasses = store.use;

/** A 10-digit PNR, shown as "482-1937065" like a railway ticket. */
function makePnr() {
  const digits = randomDigits(10);
  return `${(Number(digits[0]) % 9) + 1}${digits.slice(1, 3)}-${digits.slice(3)}`;
}

export function addPass(details) {
  const pass = { ...details, pnr: makePnr(), bookedAt: new Date().toISOString() };
  store.set([pass, ...store.get()]);
  return pass;
}

export const cancelPass = (pnr) => store.set(store.get().filter((p) => p.pnr !== pnr));
