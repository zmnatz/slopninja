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

/**
 * A player's frame: local (0, 0) sits at the origin on screen, and local axes point along the
 * screen axes, or against them when the frame is flipped. Every mapping below comes from this.
 */
interface Frame {
  originX: number;
  originY: number;
  flipped: boolean;
}

type Ctx = CanvasRenderingContext2D;

export function midline(height: number): number {
  return height / 2;
}

function frameFor(width: number, height: number, side: Side): Frame {
  // The top player sits across the table, so their frame is flipped about the midline.
  if (side === "top") return { originX: width, originY: midline(height), flipped: true };
  return { originX: 0, originY: midline(height), flipped: false };
}

/**
 * Maps a screen touch into the frame of the player it belongs to. A touch exactly on the
 * midline belongs to the top player, as it always has.
 */
export function locate(mode: GameMode, width: number, height: number, x: number, y: number): LocalPoint {
  if (mode === 1) return { side: "bottom", x, y };

  const side: Side = y > midline(height) ? "bottom" : "top";
  const frame = frameFor(width, height, side);
  // Subtraction, not multiplying by -1, so a point on the origin never comes out as -0.
  if (frame.flipped) return { side, x: frame.originX - x, y: frame.originY - y };
  return { side, x: x - frame.originX, y: y - frame.originY };
}

/** The inverse of `locate` for the split screen: frame coordinates back to screen pixels. */
export function toScreen(width: number, height: number, side: Side, x: number, y: number): Point {
  const frame = frameFor(width, height, side);
  if (frame.flipped) return { x: frame.originX - x, y: frame.originY - y };
  return { x: frame.originX + x, y: frame.originY + y };
}

/** The screen area a player's half covers. */
export function sideRect(width: number, height: number, side: Side): Rect {
  const frame = frameFor(width, height, side);
  return { x: 0, y: frame.flipped ? 0 : frame.originY, width, height: midline(height) };
}

/** Runs `draw` in a player's frame, clipped to their half. */
export function inSide(ctx: Ctx, width: number, height: number, side: Side, draw: () => void): void {
  const rect = sideRect(width, height, side);
  const frame = frameFor(width, height, side);

  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.clip();
  ctx.translate(frame.originX, frame.originY);
  if (frame.flipped) ctx.rotate(Math.PI);
  draw();
  ctx.restore();
}
