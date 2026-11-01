import { useCallback, useState } from "react";
import "./App.css";
import { GameCanvas } from "./components/GameCanvas";
import { Hud } from "./components/Hud";
import { Leaderboard } from "./components/Leaderboard";
import { Menu } from "./components/Menu";
import { NameEntry } from "./components/NameEntry";
import { createGame, describeResult, summarize } from "./game/engine";
import { addEntry, loadLeaderboard, qualifies, saveLeaderboard } from "./game/leaderboard";
import type { Game, GameMode, Snapshot } from "./game/types";
import { type AfterRound, type Screen, transition } from "./screen";

const INTRO = {
  title: "FRUIT NINJA",
  detail: "Slice the fruit, avoid bombs! Choose your game mode:",
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [game, setGame] = useState<Game | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  const [entries, setEntries] = useState(loadLeaderboard);
  const [highlight, setHighlight] = useState<number | undefined>();

  const handleChange = useCallback(
    (next: Snapshot) => {
      setSnapshot(next);
      if (next.status !== "over") return;
      let after: AfterRound = "over";
      if (next.mode === 1) after = qualifies(entries, next.bottom.score) ? "naming" : "leaderboard";
      setHighlight(undefined);
      setScreen((current) => transition(current, { type: "ended", after }));
    },
    [entries],
  );

  const submitName = (name: string) => {
    if (!snapshot) return;
    const entry = { name, score: snapshot.bottom.score };
    const next = addEntry(entries, entry);
    saveLeaderboard(next);
    setEntries(next);
    setHighlight(next.indexOf(entry));
    setScreen((current) => transition(current, { type: "named" }));
  };

  const startGame = (mode: GameMode) => {
    const next = createGame(mode, window.innerWidth, window.innerHeight);
    setSnapshot(summarize(next));
    setGame(next);
    setScreen((current) => transition(current, { type: "start" }));
  };

  const playing = screen === "playing";
  const menu = screen === "over" && snapshot ? describeResult(snapshot) : INTRO;

  return (
    <div className="app">
      <GameCanvas game={game} onChange={handleChange} />

      {playing && snapshot && (
        <>
          <Hud position="bottom" score={snapshot.bottom.score} lives={snapshot.bottom.lives} />
          {snapshot.mode === 2 && (
            <>
              <Hud position="top" score={snapshot.top.score} lives={snapshot.top.lives} />
              <div className="divider" />
            </>
          )}
        </>
      )}

      {screen === "naming" && snapshot && <NameEntry score={snapshot.bottom.score} onSubmit={submitName} />}

      {screen === "leaderboard" && snapshot && (
        <Leaderboard
          entries={entries}
          highlight={highlight}
          score={snapshot.bottom.score}
          onNewGame={() => setScreen((current) => transition(current, { type: "newGame" }))}
        />
      )}

      {(screen === "menu" || screen === "over") && <Menu title={menu.title} detail={menu.detail} onStart={startGame} />}
    </div>
  );
}
