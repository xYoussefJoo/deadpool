import type { Bets } from "@/domain/deadPool";

// The visitor's bets, kept in localStorage for this browser only.
// Shaped for React's useSyncExternalStore: subscribe + a cached snapshot.

const STORAGE_KEY = "deadpool-bets";
const EMPTY: Bets = Object.freeze({});
const listeners = new Set<() => void>();
let snapshot: Bets | null = null;

function read(): Bets {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Bets;
  } catch {
    return EMPTY;
  }
}

export const betsStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): Bets {
    snapshot ??= read();
    return snapshot;
  },
  getServerSnapshot(): Bets {
    return EMPTY;
  },
  save(bets: Bets) {
    snapshot = bets;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bets));
    } catch {
      // Private mode or blocked storage: the bet still counts for this visit.
    }
    listeners.forEach((listener) => listener());
  },
};
