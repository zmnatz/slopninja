import { describe, expect, it } from "vitest";
import { transition } from "./screen";

describe("transition", () => {
  it("starts a game from the menu", () => {
    expect(transition("menu", { type: "start" })).toBe("playing");
  });

  it("moves a finished single-player round to the leaderboard", () => {
    expect(transition("playing", { type: "ended", mode: 1 })).toBe("leaderboard");
  });

  it("moves a finished two-player round to the game-over screen", () => {
    expect(transition("playing", { type: "ended", mode: 2 })).toBe("over");
  });

  it("starts a new game from the game-over screen", () => {
    expect(transition("over", { type: "start" })).toBe("playing");
  });

  it("returns to the menu from the leaderboard for a new game", () => {
    expect(transition("leaderboard", { type: "newGame" })).toBe("menu");
  });

  it("ignores an end event when no game is running", () => {
    expect(transition("menu", { type: "ended", mode: 1 })).toBe("menu");
  });
});
