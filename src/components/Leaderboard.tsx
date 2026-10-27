import type { LeaderboardEntry } from "../game/leaderboard";

interface LeaderboardProps {
  entries: readonly LeaderboardEntry[];
  onNewGame: () => void;
}

export function Leaderboard({ entries, onNewGame }: LeaderboardProps) {
  return (
    <div className="menu">
      <h1>TOP 10</h1>
      {entries.length === 0 ? (
        <p>No scores yet</p>
      ) : (
        <ol className="scores">
          {entries.map((entry, index) => (
            <li key={`${index}-${entry.name}-${entry.score}`}>
              <span className="rank">{index + 1}</span>
              <span className="name">{entry.name}</span>
              <span className="points">{entry.score}</span>
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
