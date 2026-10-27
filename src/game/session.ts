import { resizeGame, stepGame, summarize } from "./engine";
import type { Game, Snapshot } from "./types";

export interface SessionDeps {
  draw: (game: Game) => void;
  onChange: (snapshot: Snapshot) => void;
  schedule: (callback: () => void) => number;
  cancel: (id: number) => void;
  now: () => number;
}

/**
 * Runs frames for a game until it ends or the returned stop function is called. The frame
 * clock, the drawing, and the clock time are all injected, so a session runs without a browser.
 */
export function startSession(game: Game, deps: SessionDeps): () => void {
  let scheduled = 0;
  let last: Snapshot | null = null;

  const tick = () => {
    stepGame(game, deps.now());
    deps.draw(game);

    const next = summarize(game);
    if (!sameSnapshot(next, last)) {
      last = next;
      deps.onChange(next);
    }

    if (game.status === "playing") scheduled = deps.schedule(tick);
  };

  tick();
  return () => deps.cancel(scheduled);
}

export interface Viewport {
  width: number;
  height: number;
  ratio: number;
}

/** Sizes the canvas backing store for the viewport and keeps the playfield in step with it. */
export function fitCanvas(canvas: HTMLCanvasElement, game: Game | null, viewport: Viewport): void {
  canvas.width = viewport.width * viewport.ratio;
  canvas.height = viewport.height * viewport.ratio;
  canvas.getContext("2d")?.setTransform(viewport.ratio, 0, 0, viewport.ratio, 0, 0);
  if (game) resizeGame(game, viewport.width, viewport.height);
}

/**
 * Fits the canvas now, and again whenever the viewport changes. `subscribe` registers a
 * listener for viewport changes and returns the function that removes it.
 */
export function followViewport(
  canvas: HTMLCanvasElement,
  game: Game | null,
  viewport: () => Viewport,
  subscribe: (listener: () => void) => () => void,
): () => void {
  const resize = () => fitCanvas(canvas, game, viewport());

  resize();
  return subscribe(resize);
}

function sameSnapshot(a: Snapshot, b: Snapshot | null): boolean {
  return (
    b !== null &&
    a.status === b.status &&
    a.mode === b.mode &&
    a.bottom.score === b.bottom.score &&
    a.bottom.lives === b.bottom.lives &&
    a.top.score === b.top.score &&
    a.top.lives === b.top.lives
  );
}
