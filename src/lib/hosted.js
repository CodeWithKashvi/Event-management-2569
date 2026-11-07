// Event listings submitted through "Host an event", saved in Local Storage.
import { createListStore, randomDigits } from './store.js';

const store = createListStore('mela.hosted.v1');

export const useListings = store.use;

export function addListing(details) {
  const listing = { ...details, ref: `MH-${randomDigits(6)}`, submittedAt: new Date().toISOString() };
  store.set([listing, ...store.get()]);
  return listing;
}

export const removeListing = (ref) => store.set(store.get().filter((l) => l.ref !== ref));
