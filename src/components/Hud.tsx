interface HudProps {
  position: "bottom" | "top";
  score: number;
  lives: number;
}

export function Hud({ position, score, lives }: HudProps) {
  return (
    <div className={`hud hud-${position}`}>
      <span>SCORE: {score}</span>
      <span>LIVES: {"❤️".repeat(Math.max(0, lives))}</span>
    </div>
  );
}
