import { inSide, midline, sideRect, type Rect } from "./playfield";
import type {
  Field,
  Fruit,
  FruitHalf,
  FruitKind,
  Game,
  Particle,
  Splatter,
  TrailPoint,
} from "./types";

type Ctx = CanvasRenderingContext2D;

// Drawn over the previous frame instead of clearing it, which leaves a smear behind moving objects.
const FADE = "rgba(26, 26, 26, 0.4)";
const DIVIDER = "rgba(255, 255, 255, 0.3)";
const TRAIL = "#00ffff";
const ELIMINATED = "#ff3333";

export function drawGame(ctx: Ctx, game: Game): void {
  ctx.fillStyle = FADE;
  ctx.fillRect(0, 0, game.width, game.height);

  if (game.mode === 2) {
    drawSplitScreen(ctx, game);
  } else {
    drawField(ctx, game.bottom);
  }

  drawTrails(ctx, game.trails);
}

function drawSplitScreen(ctx: Ctx, game: Game): void {
  const { width, height } = game;

  // The top player's half is drawn in their flipped frame, so it reads from across the table.
  inSide(ctx, width, height, "top", () => drawField(ctx, game.top));
  if (game.top.lives <= 0) drawEliminated(ctx, sideRect(width, height, "top"), true);

  inSide(ctx, width, height, "bottom", () => drawField(ctx, game.bottom));
  if (game.bottom.lives <= 0) drawEliminated(ctx, sideRect(width, height, "bottom"), false);

  const y = midline(height);
  ctx.strokeStyle = DIVIDER;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();
}

function drawEliminated(ctx: Ctx, rect: Rect, rotated: boolean): void {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

  ctx.fillStyle = ELIMINATED;
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
  if (rotated) ctx.rotate(Math.PI);
  ctx.fillText("ELIMINATED", 0, 0);
  ctx.restore();
}

function drawField(ctx: Ctx, field: Field): void {
  field.splatters.forEach((splatter) => drawSplatter(ctx, splatter));
  field.fruits.forEach((fruit) => drawFruit(ctx, fruit));
  field.halves.forEach((half) => drawHalf(ctx, half));
  field.particles.forEach((particle) => drawParticle(ctx, particle));
}

function drawSplatter(ctx: Ctx, splatter: Splatter): void {
  ctx.save();
  ctx.globalAlpha = splatter.alpha;
  ctx.fillStyle = splatter.color;
  ctx.beginPath();
  ctx.arc(splatter.x, splatter.y, splatter.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFruit(ctx: Ctx, fruit: Fruit): void {
  ctx.save();
  ctx.translate(fruit.x, fruit.y);
  ctx.rotate(fruit.rotation);
  drawFruitArt(ctx, fruit.kind);
  ctx.restore();
}

/** A cut half: the whole fruit clipped to one side, with the juicy inside showing. */
function drawHalf(ctx: Ctx, half: FruitHalf): void {
  const { kind } = half;
  const r = kind.radius;

  ctx.save();
  ctx.globalAlpha = Math.max(0, half.alpha);
  ctx.translate(half.x, half.y);
  ctx.rotate(half.rotation);

  ctx.beginPath();
  if (half.isLeft) {
    ctx.rect(-r * 1.5, -r * 1.5, r * 1.5, r * 3);
  } else {
    ctx.rect(0, -r * 1.5, r * 1.5, r * 3);
  }
  ctx.clip();

  ctx.fillStyle = kind.juiceColor;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
  ctx.fill();

  drawFruitArt(ctx, kind);
  ctx.restore();
}

function drawParticle(ctx: Ctx, particle: Particle): void {
  ctx.save();
  ctx.globalAlpha = Math.max(0, particle.alpha);
  ctx.fillStyle = particle.color;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFruitArt(ctx: Ctx, kind: FruitKind): void {
  const r = kind.radius;
  switch (kind.name) {
    case "bomb":
      drawBomb(ctx, r);
      break;
    case "watermelon":
      drawWatermelon(ctx, r);
      break;
    case "apple":
      drawApple(ctx, r);
      break;
    case "banana":
      drawBanana(ctx, r);
      break;
    case "orange":
      drawOrange(ctx, r);
      break;
  }
}

function drawBomb(ctx: Ctx, r: number): void {
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ff3333";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.strokeStyle = "#cc9900";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(15, -r - 15, 20, -r - 25);
  ctx.stroke();

  ctx.fillStyle = "#ffcc00";
  ctx.beginPath();
  ctx.arc(20, -r - 25, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawWatermelon(ctx: Ctx, r: number): void {
  ctx.fillStyle = "#227722";
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#114411";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-15, -r * 0.8);
  ctx.lineTo(-5, r * 0.8);
  ctx.moveTo(10, -r * 0.8);
  ctx.lineTo(0, r * 0.8);
  ctx.stroke();
}

function drawApple(ctx: Ctx, r: number): void {
  ctx.fillStyle = "#cc1111";
  ctx.beginPath();
  ctx.arc(0, 4, r * 0.9, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#663300";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.7);
  ctx.quadraticCurveTo(8, -r - 10, 12, -r - 8);
  ctx.stroke();

  ctx.fillStyle = "#44cc44";
  ctx.beginPath();
  ctx.ellipse(10, -r - 3, 8, 4, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawBanana(ctx: Ctx, r: number): void {
  ctx.strokeStyle = "#e6c619";
  ctx.lineWidth = 20;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, 5, r * 0.8, Math.PI * 1.1, Math.PI * 1.9, false);
  ctx.stroke();

  ctx.strokeStyle = "#735212";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 5, r * 0.8, Math.PI * 1.85, Math.PI * 1.9, false);
  ctx.stroke();
}

function drawOrange(ctx: Ctx, r: number): void {
  ctx.fillStyle = "#ff8800";
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#cc6600";
  ctx.beginPath();
  ctx.arc(0, -r + 4, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawTrails(ctx: Ctx, trails: Map<number, TrailPoint[]>): void {
  for (const trail of trails.values()) {
    if (trail.length < 2) continue;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    for (let i = 1; i < trail.length; i++) {
      ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.strokeStyle = TRAIL;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 15;
    ctx.shadowColor = TRAIL;
    ctx.stroke();
    ctx.restore();
  }
}
