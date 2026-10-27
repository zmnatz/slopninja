import { GAME_MODES, type ModeOption } from "../game/modes";
import type { GameMode } from "../game/types";

interface MenuProps {
  title: string;
  detail: string;
  onStart: (mode: GameMode) => void;
  modes?: readonly ModeOption[];
}

export function Menu({ title, detail, onStart, modes = GAME_MODES }: MenuProps) {
  return (
    <div className="menu">
      <h1>{title}</h1>
      <p>{detail}</p>
      <div className="mode-grid">
        {modes.map((option) => (
          <button
            key={option.label}
            type="button"
            className="mode-button"
            aria-label={option.label}
            onClick={() => onStart(option.mode)}
          >
            <span className="mode-icon" aria-hidden="true">
              {option.icon}
            </span>
            <span className="mode-label" aria-hidden="true">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
