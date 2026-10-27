import {
  type LeaderboardEntry,
  parseLeaderboard,
  serializeLeaderboard,
} from "./leaderboard";

const STORAGE_KEY = "fruit-ninja.leaderboard";

/** The part of the browser's storage that the leaderboard needs. */
export interface KeyValueStore {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

/**
 * Local storage can be missing or throw (private browsing, disabled site data). In that case the
 * leaderboard reads as empty and writes are dropped, and the game carries on.
 */
export function browserStorage(): KeyValueStore {
  try {
    return window.localStorage;
  } catch {
    return { getItem: () => null, setItem: () => {} };
  }
}

export function loadLeaderboard(store: KeyValueStore): LeaderboardEntry[] {
  try {
    return parseLeaderboard(store.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

export function saveLeaderboard(store: KeyValueStore, board: readonly LeaderboardEntry[]): void {
  try {
    store.setItem(STORAGE_KEY, serializeLeaderboard(board));
  } catch {
    // Storage is full or disabled. The score is lost, but the game does not stop.
  }
}
