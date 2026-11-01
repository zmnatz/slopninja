/** The screen the player is looking at. The game flow moves between these explicitly. */
export type Screen = "menu" | "playing" | "over" | "naming" | "leaderboard" | "scores";

/** Where a finished round leads: the plain result, the name pad, or the leaderboard. */
export type AfterRound = "over" | "naming" | "leaderboard";

export type ScreenEvent =
  | { type: "start" }
  | { type: "ended"; after?: AfterRound }
  | { type: "named" }
  | { type: "newGame" }
  | { type: "viewScores" }
  | { type: "back" };

export function transition(screen: Screen, event: ScreenEvent): Screen {
  switch (event.type) {
    case "start":
      return "playing";
    case "ended":
      return screen === "playing" ? (event.after ?? "over") : screen;
    case "named":
      return screen === "naming" ? "leaderboard" : screen;
    case "newGame":
      return screen === "leaderboard" ? "menu" : screen;
    case "viewScores":
      return screen === "menu" ? "scores" : screen;
    case "back":
      return screen === "scores" ? "menu" : screen;
  }
}
