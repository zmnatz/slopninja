import { useEffect, useRef, type PointerEvent } from "react";
import { releasePointer, touchPoint } from "../game/engine";
import { drawGame } from "../game/render";
import { fitCanvas, startSession } from "../game/session";
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

    // The backing store is scaled by devicePixelRatio so lines stay sharp on retina iPads.
    const resize = () =>
      fitCanvas(canvas, game, {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      });

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [game]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!game || !ctx) return;

    return startSession(game, {
      draw: (frame) => drawGame(ctx, frame),
      onChange,
      schedule: (callback) => requestAnimationFrame(callback),
      cancel: (id) => cancelAnimationFrame(id),
      now: () => performance.now(),
    });
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
