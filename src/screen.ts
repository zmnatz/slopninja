import type { GameMode } from "./game/types";

/** The screen the player is looking at. The game flow moves between these explicitly. */
export type Screen = "menu" | "playing" | "over" | "leaderboard";

export type ScreenEvent =
  | { type: "start" }
  | { type: "ended"; mode: GameMode }
  | { type: "newGame" };

export function transition(screen: Screen, event: ScreenEvent): Screen {
  switch (event.type) {
    case "start":
      return "playing";
    case "ended":
      if (screen !== "playing") return screen;
      return event.mode === 1 ? "leaderboard" : "over";
    case "newGame":
      return "menu";
  }
}
