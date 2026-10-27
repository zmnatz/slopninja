import type { GameMode } from "./game/types";

/** The screen the player is looking at. The game flow moves between these explicitly. */
export type Screen = "menu" | "playing" | "over" | "naming" | "leaderboard";

export type ScreenEvent =
  | { type: "start" }
  | { type: "ended"; mode: GameMode; qualifies: boolean }
  | { type: "named" }
  | { type: "newGame" };

export function transition(screen: Screen, event: ScreenEvent): Screen {
  switch (event.type) {
    case "start":
      return "playing";
    case "ended":
      if (screen !== "playing") return screen;
      if (event.mode === 2) return "over";
      return event.qualifies ? "naming" : "leaderboard";
    case "named":
      return screen === "naming" ? "leaderboard" : screen;
    case "newGame":
      return "menu";
  }
}
