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
  it("only accepts fruit names from the fruit table, checked at compile time", () => {
    const game = createGame(1, 800, 600, noRandom);

    placeFruit(game, "bottom", "apple", 0, 0);
    // @ts-expect-error "durian" is not a fruit in the table, so the typecheck must reject it.
    placeFruit(game, "bottom", "durian", 0, 0);
  });
});

describe("fruit physics", () => {
  // Enough frames for the first fruit to spawn (the spawn timer runs for 56 frames).
  const FIRST_SPAWN_FRAMES = 56;

  it("launches a single-player fruit from the bottom edge of the screen", () => {
    const game = createGame(1, 800, 600, noRandom);

    for (let frame = 0; frame < FIRST_SPAWN_FRAMES; frame++) stepGame(game, frame);

    const [fruit] = game.bottom.fruits;
    expect(fruit).toBeDefined();
    // One frame after launch the fruit has only just left the bottom edge.
    expect(fruit.y).toBeGreaterThan(600 * 0.9);
  });

  it("keeps every two-player fruit inside its own half, however it is thrown", () => {
    for (const random of [() => 0, noRandom, () => 0.999]) {
      const game = createGame(2, 800, 600, random);
      let launched = 0;

      for (let frame = 0; frame < 900; frame++) {
        stepGame(game, frame);
        for (const field of [game.bottom, game.top]) {
          for (const fruit of field.fruits) {
            launched++;
            // Field coordinates measure from the midline, so a fruit may never go below zero.
            expect(fruit.y).toBeGreaterThanOrEqual(0);
          }
        }
      }

      expect(launched).toBeGreaterThan(0);
    }
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
