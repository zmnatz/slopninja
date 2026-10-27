import type { GameMode } from "../game/types";

interface MenuProps {
  title: string;
  detail: string;
  onStart: (mode: GameMode) => void;
}

export function Menu({ title, detail, onStart }: MenuProps) {
  return (
    <div className="menu">
      <h1>{title}</h1>
      <p>{detail}</p>
      <div className="btn-row">
        <button type="button" onClick={() => onStart(1)}>
          1 PLAYER
        </button>
        <button type="button" onClick={() => onStart(2)}>
          2 PLAYER (FACE-TO-FACE)
        </button>
      </div>
    </div>
  );
}
