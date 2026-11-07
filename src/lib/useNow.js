// One shared 1-second clock for every countdown on the page.
import { useSyncExternalStore } from 'react';

let now = Date.now();
let timer = null;
const subs = new Set();

function subscribe(cb) {
  subs.add(cb);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      subs.forEach((f) => f());
    }, 1000);
  }
  return () => {
    subs.delete(cb);
    if (!subs.size) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export const useNow = () => useSyncExternalStore(subscribe, () => now);
