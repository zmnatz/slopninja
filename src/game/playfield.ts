import type { GameMode } from "./types";

/** Which player's half of the screen a point belongs to. */
export type Side = "bottom" | "top";

export interface Point {
  x: number;
  y: number;
}

export interface LocalPoint extends Point {
  side: Side;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Ctx = CanvasRenderingContext2D;

/**
 * Maps a screen touch into the frame of the player it belongs to. In 2-player mode the
 * top player's frame is flipped, so touches on that half are mirrored.
 */
export function locate(mode: GameMode, width: number, height: number, x: number, y: number): LocalPoint {
  if (mode === 1) return { side: "bottom", x, y };

  const midY = height / 2;
  if (y > midY) return { side: "bottom", x, y: y - midY };
  return { side: "top", x: width - x, y: midY - y };
}

/** The inverse of `locate` for the split screen: frame coordinates back to screen pixels. */
export function toScreen(width: number, height: number, side: Side, x: number, y: number): Point {
  const midY = height / 2;
  if (side === "bottom") return { x, y: y + midY };
  return { x: width - x, y: midY - y };
}

/** The screen area a player's half covers. */
export function sideRect(width: number, height: number, side: Side): Rect {
  const halfHeight = height / 2;
  return { x: 0, y: side === "top" ? 0 : halfHeight, width, height: halfHeight };
}

/** Runs `draw` in a player's frame, clipped to their half. The top frame is turned around. */
export function inSide(ctx: Ctx, width: number, height: number, side: Side, draw: () => void): void {
  const rect = sideRect(width, height, side);
  const midY = height / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.clip();
  if (side === "top") {
    ctx.translate(width, midY);
    ctx.rotate(Math.PI);
  } else {
    ctx.translate(0, midY);
  }
  draw();
  ctx.restore();
}
