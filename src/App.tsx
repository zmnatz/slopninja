import { useCallback, useState } from "react";
import "./App.css";
import { GameCanvas } from "./components/GameCanvas";
import { Hud } from "./components/Hud";
import { Leaderboard } from "./components/Leaderboard";
import { Menu } from "./components/Menu";
import { NameEntry } from "./components/NameEntry";
import { createGame, describeResult, summarize } from "./game/engine";
import { insertScore, qualifies } from "./game/leaderboard";
import { browserStorage, loadLeaderboard, saveLeaderboard } from "./game/leaderboardStore";
import type { Game, GameMode, Snapshot } from "./game/types";
import { type Screen, transition } from "./screen";

const INTRO = {
  title: "FRUIT NINJA",
  detail: "Slice the fruit, avoid bombs! Choose your game mode:",
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [game, setGame] = useState<Game | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  const handleChange = useCallback((next: Snapshot) => {
    setSnapshot(next);
    if (next.status === "over") {
      const board = loadLeaderboard(browserStorage());
      const event = {
        type: "ended" as const,
        mode: next.mode,
        qualifies: qualifies(board, next.bottom.score),
      };
      setScreen((current) => transition(current, event));
    }
  }, []);

  const submitName = (name: string) => {
    const store = browserStorage();
    const score = snapshot?.bottom.score ?? 0;
    saveLeaderboard(store, insertScore(loadLeaderboard(store), { name, score }));
    setScreen((current) => transition(current, { type: "named" }));
  };

  const startGame = (mode: GameMode) => {
    const next = createGame(mode, window.innerWidth, window.innerHeight);
    setSnapshot(summarize(next));
    setGame(next);
    setScreen((current) => transition(current, { type: "start" }));
  };

  const newGame = () => setScreen((current) => transition(current, { type: "newGame" }));

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

      {screen === "naming" && snapshot && (
        <NameEntry score={snapshot.bottom.score} onSubmit={submitName} />
      )}

      {screen === "leaderboard" && (
        <Leaderboard entries={loadLeaderboard(browserStorage())} onNewGame={newGame} />
      )}

      {(screen === "menu" || screen === "over") && (
        <Menu title={menu.title} detail={menu.detail} onStart={startGame} />
      )}
    </div>
  );
}
