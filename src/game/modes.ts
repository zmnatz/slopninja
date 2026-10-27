import type { GameMode } from "./types";

export interface ModeOption {
  mode: GameMode;
  /** Shown large on the button. */
  icon: string;
  /** Shown under the icon, and used as the button's accessible name. */
  label: string;
}

/** The modes offered on the menu, in display order. Add a mode here to put a button on the menu. */
export const GAME_MODES: readonly ModeOption[] = [
  { mode: 1, icon: "1", label: "SOLO" },
  { mode: 2, icon: "2", label: "FACE-TO-FACE" },
];
