import { describe, expect, it } from "vitest";
import { locate, sideRect, toScreen } from "./playfield";

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
