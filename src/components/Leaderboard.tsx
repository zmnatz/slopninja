import type { LeaderboardEntry } from "../game/leaderboard";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  /** The row just added by this round's player, if any. */
  highlight?: number;
  score: number;
  onNewGame: () => void;
}

function ordinal(n: number): string {
  const rem = n % 100;
  if (rem >= 11 && rem <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

export function Leaderboard({ entries, highlight, score, onNewGame }: LeaderboardProps) {
  return (
    <div className="menu leaderboard">
      <h1>TOP 10</h1>
      <p>
        Your score: {score}
        {highlight !== undefined && ` — you placed ${ordinal(highlight + 1)}!`}
      </p>
      {entries.length === 0 ? (
        <p>No scores yet.</p>
      ) : (
        <ol className="scores">
          {entries.map((entry, i) => (
            <li key={i} className="score-row" data-you={i === highlight}>
              <span className="score-name">{entry.name}</span>
              <span className="score-value">{entry.score}</span>
            </li>
          ))}
        </ol>
      )}
      <button type="button" onClick={onNewGame}>
        NEW GAME
      </button>
    </div>
  );
}
