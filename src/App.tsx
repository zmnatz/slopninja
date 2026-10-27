import { useCallback, useState } from "react";
import "./App.css";
import { GameCanvas } from "./components/GameCanvas";
import { Hud } from "./components/Hud";
import { Menu } from "./components/Menu";
import { createGame, describeResult, summarize } from "./game/engine";
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
    if (next.status === "over") setScreen((current) => transition(current, { type: "ended" }));
  }, []);

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

      {!playing && <Menu title={menu.title} detail={menu.detail} onStart={startGame} />}
    </div>
  );
}
