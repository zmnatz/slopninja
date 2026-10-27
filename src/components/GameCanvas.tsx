import { useEffect, useRef, type PointerEvent } from "react";
import { releasePointer, resizeGame, stepGame, summarize, touchPoint } from "../game/engine";
import { drawGame } from "../game/render";
import type { Game, Snapshot } from "../game/types";

interface GameCanvasProps {
  game: Game | null;
  onChange: (snapshot: Snapshot) => void;
}

export function GameCanvas({ game, onChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Backing store is scaled by devicePixelRatio so lines stay sharp on retina iPads.
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (game) resizeGame(game, window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [game]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!game || !ctx) return;

    let frame = 0;
    let last: Snapshot | null = null;

    const tick = () => {
      stepGame(game, performance.now());
      drawGame(ctx, game);

      const next = summarize(game);
      if (!sameSnapshot(next, last)) {
        last = next;
        onChange(next);
      }

      if (game.status === "playing") frame = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(frame);
  }, [game, onChange]);

  const handlePointer = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!game) return;
    const rect = event.currentTarget.getBoundingClientRect();
    touchPoint(
      game,
      event.pointerId,
      event.clientX - rect.left,
      event.clientY - rect.top,
      performance.now(),
    );
  };

  const handlePointerEnd = (event: PointerEvent<HTMLCanvasElement>) => {
    if (game) releasePointer(game, event.pointerId);
  };

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      onPointerDown={handlePointer}
      onPointerMove={handlePointer}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    />
  );
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
