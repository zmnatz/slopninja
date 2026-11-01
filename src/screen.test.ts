import { describe, expect, it } from "vitest";
import { transition } from "./screen";

describe("transition", () => {
  it("starts a game from the menu", () => {
    expect(transition("menu", { type: "start" })).toBe("playing");
  });

  it("moves from playing to the game-over screen when the game ends", () => {
    expect(transition("playing", { type: "ended" })).toBe("over");
  });

  it("starts a new game from the game-over screen", () => {
    expect(transition("over", { type: "start" })).toBe("playing");
  });

  it("ignores an end event when no game is running", () => {
    expect(transition("menu", { type: "ended" })).toBe("menu");
  });
});

describe("transition with a leaderboard", () => {
  it("asks for a name when the score qualifies, then shows the leaderboard", () => {
    const naming = transition("playing", { type: "ended", after: "naming" });
    expect(naming).toBe("naming");
    expect(transition(naming, { type: "named" })).toBe("leaderboard");
  });

  it("goes straight to the leaderboard when the score does not qualify", () => {
    expect(transition("playing", { type: "ended", after: "leaderboard" })).toBe("leaderboard");
  });

  it("returns to the menu from the leaderboard", () => {
    expect(transition("leaderboard", { type: "newGame" })).toBe("menu");
  });

  it("ignores naming and new-game events on the wrong screen", () => {
    expect(transition("playing", { type: "named" })).toBe("playing");
    expect(transition("menu", { type: "newGame" })).toBe("menu");
  });
});

describe("transition to the browsable leaderboard", () => {
  it("opens the leaderboard from the menu and returns to it", () => {
    const scores = transition("menu", { type: "viewScores" });
    expect(scores).toBe("scores");
    expect(transition(scores, { type: "back" })).toBe("menu");
  });

  it("ignores view and back events on the wrong screen", () => {
    expect(transition("playing", { type: "viewScores" })).toBe("playing");
    expect(transition("menu", { type: "back" })).toBe("menu");
  });

  it("starts a game from the leaderboard", () => {
    expect(transition("leaderboard", { type: "start" })).toBe("playing");
  });
});
