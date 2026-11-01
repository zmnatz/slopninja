export interface LeaderboardEntry {
  name: string;
  score: number;
}

export const LEADERBOARD_SIZE = 10;
export const NAME_LENGTH = 3;
const STORAGE_KEY = "slopninja.leaderboard";

function isEntry(value: unknown): value is LeaderboardEntry {
  if (typeof value !== "object" || value === null) return false;
  const { name, score } = value as Record<string, unknown>;
  return typeof name === "string" && typeof score === "number" && Number.isFinite(score);
}

/** Reads the saved top 10. Missing storage or bad data yields an empty leaderboard. */
export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isEntry)
      .sort((a, b) => b.score - a.score)
      .slice(0, LEADERBOARD_SIZE);
  } catch {
    return [];
  }
}

export function saveLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage is unavailable or full. The game keeps running with an unsaved leaderboard.
  }
}

/** A score makes the top 10 if it beats a taken spot or there is a free one. Zero never does. */
export function qualifies(entries: LeaderboardEntry[], score: number): boolean {
  if (score <= 0) return false;
  return entries.length < LEADERBOARD_SIZE || score > entries[entries.length - 1].score;
}

/** Adds an entry below any equal scores, and keeps only the top 10. */
export function addEntry(entries: LeaderboardEntry[], entry: LeaderboardEntry): LeaderboardEntry[] {
  const index = entries.findIndex((existing) => existing.score < entry.score);
  const at = index === -1 ? entries.length : index;
  return [...entries.slice(0, at), entry, ...entries.slice(at)].slice(0, LEADERBOARD_SIZE);
}
