import { describe, expect, it } from "vitest";
import { transition } from "./screen";

describe("transition", () => {
  it("starts a game from the menu", () => {
    expect(transition("menu", { type: "start" })).toBe("playing");
  });

  it("asks for a name when a single-player round makes the top 10", () => {
    expect(transition("playing", { type: "ended", mode: 1, qualifies: true })).toBe("naming");
  });

  it("shows the leaderboard when a single-player round does not make the top 10", () => {
    expect(transition("playing", { type: "ended", mode: 1, qualifies: false })).toBe("leaderboard");
  });

  it("moves a finished two-player round to the game-over screen", () => {
    expect(transition("playing", { type: "ended", mode: 2, qualifies: false })).toBe("over");
  });

  it("shows the leaderboard once a name is entered", () => {
    expect(transition("naming", { type: "named" })).toBe("leaderboard");
  });

  it("starts a new game from the game-over screen", () => {
    expect(transition("over", { type: "start" })).toBe("playing");
  });

  it("returns to the menu from the leaderboard for a new game", () => {
    expect(transition("leaderboard", { type: "newGame" })).toBe("menu");
  });

  it("ignores an end event when no game is running", () => {
    expect(transition("menu", { type: "ended", mode: 1, qualifies: true })).toBe("menu");
  });
});
