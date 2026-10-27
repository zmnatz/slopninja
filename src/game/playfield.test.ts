import { describe, expect, it } from "vitest";
import { inSide, locate, midline, sideRect, toScreen } from "./playfield";

// Records the canvas transform that inSide sets up, so the test can apply it to a point.
function recordingContext() {
  const transform = { tx: 0, ty: 0, angle: 0 };
  const ctx = {
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    rect: () => {},
    clip: () => {},
    translate: (x: number, y: number) => {
      transform.tx = x;
      transform.ty = y;
    },
    rotate: (angle: number) => {
      transform.angle = angle;
    },
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, transform };
}

// Canvas applies translate then rotate: a frame point p lands at t + R(angle) * p.
function applyTransform(transform: { tx: number; ty: number; angle: number }, x: number, y: number) {
  const cos = Math.cos(transform.angle);
  const sin = Math.sin(transform.angle);
  return {
    x: transform.tx + cos * x - sin * y,
    y: transform.ty + sin * x + cos * y,
  };
}

describe("drawing transform", () => {
  it("draws each half where toScreen says its points belong, for both players", () => {
    for (const side of ["top", "bottom"] as const) {
      const { ctx, transform } = recordingContext();
      let drawn = { x: 0, y: 0 };
      inSide(ctx, 800, 600, side, () => {
        drawn = applyTransform(transform, 100, 50);
      });

      const expected = toScreen(800, 600, side, 100, 50);
      expect(drawn.x).toBeCloseTo(expected.x);
      expect(drawn.y).toBeCloseTo(expected.y);
    }
  });
});

describe("midline", () => {
  it("is half the screen height, and both halves meet there", () => {
    expect(midline(600)).toBe(300);
    expect(sideRect(800, 600, "top").height + midline(600)).toBe(600);
  });
});

describe("locate", () => {
  it("puts a touch on the bottom half into the bottom player's frame", () => {
    expect(locate(2, 800, 600, 100, 400)).toEqual({ side: "bottom", x: 100, y: 100 });
  });

  it("mirrors a touch on the top half into the top player's frame", () => {
    // The top frame is flipped, so screen (700, 250) is local (100, 50).
    expect(locate(2, 800, 600, 700, 250)).toEqual({ side: "top", x: 100, y: 50 });
  });

  it("treats a touch exactly on the midline as top, matching the original split", () => {
    expect(locate(2, 800, 600, 400, 300)).toEqual({ side: "top", x: 400, y: 0 });
  });

  it("always uses the bottom frame in 1-player mode", () => {
    expect(locate(1, 800, 600, 100, 400)).toEqual({ side: "bottom", x: 100, y: 400 });
  });
});

describe("toScreen", () => {
  it("is the inverse of locate, so a mirrored touch maps back to where it was", () => {
    for (const point of [
      { x: 100, y: 400 },
      { x: 700, y: 250 },
      { x: 400, y: 300 },
    ]) {
      const local = locate(2, 800, 600, point.x, point.y);
      expect(toScreen(800, 600, local.side, local.x, local.y)).toEqual(point);
    }
  });
});

describe("sideRect", () => {
  it("covers the top half for the top player", () => {
    expect(sideRect(800, 600, "top")).toEqual({ x: 0, y: 0, width: 800, height: 300 });
  });

  it("covers the bottom half for the bottom player", () => {
    expect(sideRect(800, 600, "bottom")).toEqual({ x: 0, y: 300, width: 800, height: 300 });
  });
});
