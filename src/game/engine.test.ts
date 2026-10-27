import { describe, expect, it } from "vitest";
import {
  createGame,
  describeResult,
  placeFruit,
  sliceAt,
  stepGame,
  summarize,
  touchPoint,
} from "./engine";
import type { Snapshot } from "./types";

const noRandom = () => 0.5;

describe("createGame", () => {
  it("starts both players with three lives and no score", () => {
    const game = createGame(2, 800, 600, noRandom);

    expect(game.status).toBe("playing");
    expect(summarize(game)).toEqual({
      status: "playing",
      mode: 2,
      bottom: { score: 0, lives: 3 },
      top: { score: 0, lives: 3 },
    });
  });
});

describe("sliceAt", () => {
  it("scores a fruit in 1-player mode and splits it into halves", () => {
    const game = createGame(1, 800, 600, noRandom);
    placeFruit(game, "bottom", "apple", 400, 300);

    sliceAt(game, 405, 300);

    expect(game.bottom.score).toBe(1);
    expect(game.bottom.fruits).toHaveLength(0);
    expect(game.bottom.halves).toHaveLength(2);
  });

  it("gives a banana two points", () => {
    const game = createGame(1, 800, 600, noRandom);
    placeFruit(game, "bottom", "banana", 200, 200);

    sliceAt(game, 200, 200);

    expect(game.bottom.score).toBe(2);
  });

  it("costs a life when a bomb is sliced", () => {
    const game = createGame(1, 800, 600, noRandom);
    placeFruit(game, "bottom", "bomb", 100, 100);

    sliceAt(game, 100, 100);

    expect(game.bottom.lives).toBe(2);
    expect(game.status).toBe("playing");
  });

  it("ends a 1-player game when the last life is lost", () => {
    const game = createGame(1, 800, 600, noRandom);
    game.bottom.lives = 1;
    placeFruit(game, "bottom", "bomb", 100, 100);

    sliceAt(game, 100, 100);

    expect(game.status).toBe("over");
  });

  it("keeps a 2-player game going until both players are out of lives", () => {
    const game = createGame(2, 800, 600, noRandom);
    game.top.lives = 0;
    game.bottom.lives = 1;
    placeFruit(game, "bottom", "bomb", 100, 100);

    // Bottom player's touch at screen (100, 400) is local (100, 100).
    sliceAt(game, 100, 400);

    expect(game.bottom.lives).toBe(0);
    expect(game.status).toBe("over");
  });

  it("maps a touch on the top half to the top player's field", () => {
    const game = createGame(2, 800, 600, noRandom);
    // Top player's local coordinates are (width - x, midY - y), so (100, 50) is screen (700, 250).
    placeFruit(game, "top", "orange", 100, 50);

    sliceAt(game, 700, 250);

    expect(game.top.score).toBe(1);
    expect(game.bottom.score).toBe(0);
  });

  it("ignores touches after the game is over", () => {
    const game = createGame(1, 800, 600, noRandom);
    game.status = "over";
    placeFruit(game, "bottom", "apple", 400, 300);

    sliceAt(game, 400, 300);

    expect(game.bottom.score).toBe(0);
  });
});

describe("placeFruit", () => {
  it("rejects a fruit name that is not in the fruit table", () => {
    const game = createGame(1, 800, 600, noRandom);

    expect(() => placeFruit(game, "bottom", "durian", 0, 0)).toThrow("Unknown fruit: durian");
  });
});

describe("touchPoint and stepGame", () => {
  it("drops trail points older than 150ms", () => {
    const game = createGame(1, 800, 600, noRandom);

    touchPoint(game, 1, 10, 10, 0);
    stepGame(game, 200);

    expect(game.trails.has(1)).toBe(false);
  });
});

describe("describeResult", () => {
  const over = (snapshot: Omit<Snapshot, "status">): Snapshot => ({ status: "over", ...snapshot });

  it("reports the final score in 1-player mode", () => {
    const result = describeResult(
      over({ mode: 1, bottom: { score: 7, lives: 0 }, top: { score: 0, lives: 3 } }),
    );

    expect(result).toEqual({ title: "GAME OVER", detail: "Final Score: 7" });
  });

  it("names the higher scorer in 2-player mode", () => {
    const result = describeResult(
      over({ mode: 2, bottom: { score: 5, lives: 0 }, top: { score: 3, lives: 0 } }),
    );

    expect(result.title).toBe("PLAYER 1 (BOTTOM) WINS!");
  });

  it("calls a tie in 2-player mode", () => {
    const result = describeResult(
      over({ mode: 2, bottom: { score: 4, lives: 0 }, top: { score: 4, lives: 0 } }),
    );

    expect(result.title).toBe("IT'S A TIE!");
  });
});
