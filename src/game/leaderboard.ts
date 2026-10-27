export const LEADERBOARD_SIZE = 10;

export interface LeaderboardEntry {
  name: string;
  score: number;
}

/**
 * A round qualifies if it scored at least a point and either the board has a free place,
 * or it beats the lowest score on a full board. A tie with the lowest score does not qualify.
 */
export function qualifies(board: readonly LeaderboardEntry[], score: number): boolean {
  if (score <= 0) return false;
  if (board.length < LEADERBOARD_SIZE) return true;
  return score > board[board.length - 1].score;
}

/** Adds an entry, keeps the board sorted from highest to lowest, and keeps only the top 10. */
export function insertScore(board: readonly LeaderboardEntry[], entry: LeaderboardEntry): LeaderboardEntry[] {
  return [...board, entry].sort((a, b) => b.score - a.score).slice(0, LEADERBOARD_SIZE);
}

export function serializeLeaderboard(board: readonly LeaderboardEntry[]): string {
  return JSON.stringify(board);
}

/** Reads a stored board. Anything unexpected reads as an empty board rather than an error. */
export function parseLeaderboard(raw: string | null): LeaderboardEntry[] {
  if (raw === null) return [];

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(data) || !data.every(isEntry)) return [];
  return data.slice(0, LEADERBOARD_SIZE);
}

function isEntry(value: unknown): value is LeaderboardEntry {
  if (typeof value !== "object" || value === null) return false;
  const { name, score } = value as Record<string, unknown>;
  return typeof name === "string" && typeof score === "number" && Number.isFinite(score);
}
