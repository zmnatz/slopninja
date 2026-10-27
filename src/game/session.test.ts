import { describe, expect, it, vi } from "vitest";
import { createGame, placeFruit, sliceAt } from "./engine";
import { fitCanvas, startSession } from "./session";

// A frame clock the test drives by hand, so frames happen only when the test asks.
function manualFrames() {
  const queue = new Map<number, () => void>();
  let nextId = 1;
  return {
    schedule: (callback: () => void) => {
      const id = nextId++;
      queue.set(id, callback);
      return id;
    },
    cancel: (id: number) => {
      queue.delete(id);
    },
    runFrame() {
      const pending = [...queue.values()];
      queue.clear();
      for (const callback of pending) callback();
    },
    pending: () => queue.size,
  };
}

function sessionDeps(frames: ReturnType<typeof manualFrames>, onChange = vi.fn()) {
  return {
    draw: vi.fn(),
    onChange,
    schedule: frames.schedule,
    cancel: frames.cancel,
    now: () => 0,
  };
}

describe("startSession", () => {
  it("reports the opening snapshot, then only when the game changes", () => {
    const game = createGame(1, 800, 600, () => 0.5);
    const frames = manualFrames();
    const onChange = vi.fn();
    startSession(game, sessionDeps(frames, onChange));

    frames.runFrame();
    frames.runFrame();

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("reports a new score on the frame after a slice", () => {
    const game = createGame(1, 800, 600, () => 0.5);
    const frames = manualFrames();
    const onChange = vi.fn();
    startSession(game, sessionDeps(frames, onChange));
    placeFruit(game, "bottom", "apple", 400, 300);

    sliceAt(game, 400, 300);
    frames.runFrame();

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ bottom: { score: 1, lives: 3 } }));
  });

  it("stops scheduling frames once the game is over", () => {
    const game = createGame(1, 800, 600, () => 0.5);
    const frames = manualFrames();
    const onChange = vi.fn();
    startSession(game, sessionDeps(frames, onChange));

    for (let life = 0; life < 3; life++) {
      placeFruit(game, "bottom", "bomb", 100, 100);
      sliceAt(game, 100, 100);
    }
    frames.runFrame();

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ status: "over" }));
    expect(frames.pending()).toBe(0);
  });

  it("cancels the pending frame when stopped", () => {
    const game = createGame(1, 800, 600, () => 0.5);
    const frames = manualFrames();
    const stop = startSession(game, sessionDeps(frames));

    stop();

    expect(frames.pending()).toBe(0);
  });
});

describe("fitCanvas", () => {
  it("sizes the backing store by device pixel ratio and fits the game to the window", () => {
    const setTransform = vi.fn();
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({ setTransform }),
    } as unknown as HTMLCanvasElement;
    const game = createGame(1, 1, 1);

    fitCanvas(canvas, game, { width: 800, height: 600, ratio: 2 });

    expect(canvas.width).toBe(1600);
    expect(canvas.height).toBe(1200);
    expect(setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    expect(game.width).toBe(800);
    expect(game.height).toBe(600);
  });
});
