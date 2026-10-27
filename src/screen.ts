/** The screen the player is looking at. The game flow moves between these explicitly. */
export type Screen = "menu" | "playing" | "over";

export type ScreenEvent = { type: "start" } | { type: "ended" };

export function transition(screen: Screen, event: ScreenEvent): Screen {
  switch (event.type) {
    case "start":
      return "playing";
    case "ended":
      return screen === "playing" ? "over" : screen;
  }
}
