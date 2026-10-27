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
