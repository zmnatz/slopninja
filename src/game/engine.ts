import { FRUIT_KINDS } from "./fruits";
import type {
  Field,
  Fruit,
  FruitHalf,
  Game,
  GameMode,
  Particle,
  Snapshot,
  Splatter,
} from "./types";

export const STARTING_LIVES = 3;

// Spawning gets faster as a player's score climbs, up to a cap.
const SPAWN_INTERVAL_FRAMES = 55;
const MAX_SPAWN_SPEEDUP = 25;
const POINTS_PER_SPEEDUP = 5;

const FRUIT_GRAVITY = 0.35;
const FRUIT_FLOOR_MARGIN = 100;
const FRUIT_CEILING_MARGIN = 50;

const HALF_GRAVITY = 0.38;
const HALF_DECAY = 0.02;
const HALF_SEPARATION = 3;
const HALF_SPIN = 0.1;

const PARTICLE_COUNT = 15;
const PARTICLE_GRAVITY = 0.3;
const BOMB_PARTICLE_COLOR = "#ff3333";
const BOMB_SPLATTER_COLOR = "#333333";
const SPLATTER_ALPHA = 0.5;

const SLICE_PADDING = 20;
const TRAIL_LIFETIME_MS = 150;

export function createGame(
  mode: GameMode,
  width: number,
  height: number,
  random: () => number = Math.random,
): Game {
  return {
    mode,
    status: "playing",
    width,
    height,
    bottom: createField(),
    top: createField(),
    trails: new Map(),
    random,
  };
}

/** Keeps the playfield in step with the window. Fruit already in the air is not re-laid out. */
export function resizeGame(game: Game, width: number, height: number): void {
  game.width = width;
  game.height = height;
}

export function summarize(game: Game): Snapshot {
  return {
    status: game.status,
    mode: game.mode,
    bottom: { score: game.bottom.score, lives: game.bottom.lives },
    top: { score: game.top.score, lives: game.top.lives },
  };
}

export function describeResult(snapshot: Snapshot): { title: string; detail: string } {
  if (snapshot.mode === 1) {
    return { title: "GAME OVER", detail: `Final Score: ${snapshot.bottom.score}` };
  }

  const { bottom, top } = snapshot;
  let title = "IT'S A TIE!";
  if (bottom.score > top.score) title = "PLAYER 1 (BOTTOM) WINS!";
  if (top.score > bottom.score) title = "PLAYER 2 (TOP) WINS!";

  return { title, detail: `Final Scores — Bottom: ${bottom.score} | Top: ${top.score}` };
}

/** Advances one frame: spawns, moves and culls fruit, and expires old trail points. */
export function stepGame(game: Game, now: number): void {
  if (game.status !== "playing") return;

  stepField(game, game.bottom);
  if (game.mode === 2) stepField(game, game.top);
  pruneTrails(game, now);
}

/** Records a pointer position (in screen pixels) and slices anything under it. */
export function touchPoint(game: Game, pointerId: number, x: number, y: number, now: number): void {
  if (game.status !== "playing") return;

  const trail = game.trails.get(pointerId) ?? [];
  trail.push({ x, y, time: now });
  game.trails.set(pointerId, trail);

  sliceAt(game, x, y);
}

export function releasePointer(game: Game, pointerId: number): void {
  game.trails.delete(pointerId);
}

/**
 * In 2-player mode the screen is split at the midline. Each player's coordinates
 * are local to their own half, so touches are translated into that frame here.
 */
export function sliceAt(game: Game, x: number, y: number): void {
  if (game.status !== "playing") return;

  if (game.mode === 1) {
    sliceField(game, game.bottom, x, y);
    return;
  }

  const midY = game.height / 2;
  if (y > midY) {
    sliceField(game, game.bottom, x, y - midY);
  } else {
    sliceField(game, game.top, game.width - x, midY - y);
  }
}

export function createField(): Field {
  return {
    score: 0,
    lives: STARTING_LIVES,
    spawnTimer: 0,
    fruits: [],
    halves: [],
    particles: [],
    splatters: [],
  };
}

function between(game: Game, min: number, max: number): number {
  return min + game.random() * (max - min);
}

function spawnFruit(game: Game): Fruit {
  const { random, width, height } = game;
  const x = between(game, 100, width - 100);
  const kind = FRUIT_KINDS[Math.floor(random() * FRUIT_KINDS.length)];

  return {
    kind,
    x,
    y: height / 2,
    // Fruit is lobbed toward the middle of the screen so it stays in reach.
    vx: (width / 2 - x) / 35 + (random() - 0.5) * 4,
    vy: -(random() * 4 + 13),
    rotation: 0,
    vRot: (random() - 0.5) * 0.08,
  };
}

function stepField(game: Game, field: Field): void {
  if (field.lives > 0) {
    field.spawnTimer++;
    const interval =
      SPAWN_INTERVAL_FRAMES -
      Math.min(MAX_SPAWN_SPEEDUP, Math.floor(field.score / POINTS_PER_SPEEDUP));
    if (field.spawnTimer > interval) {
      field.fruits.push(spawnFruit(game));
      field.spawnTimer = 0;
    }
  }

  const floor = game.height / 2 + FRUIT_FLOOR_MARGIN;
  for (const fruit of field.fruits) {
    fruit.x += fruit.vx;
    fruit.y += fruit.vy;
    fruit.vy += FRUIT_GRAVITY;
    fruit.rotation += fruit.vRot;
  }
  field.fruits = field.fruits.filter(
    (fruit) => fruit.y <= floor && fruit.y >= -FRUIT_CEILING_MARGIN,
  );

  for (const half of field.halves) {
    half.x += half.vx;
    half.y += half.vy;
    half.vy += HALF_GRAVITY;
    half.rotation += half.vRot;
    half.alpha -= HALF_DECAY;
  }
  field.halves = field.halves.filter((half) => half.alpha > 0);

  for (const particle of field.particles) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += PARTICLE_GRAVITY;
    particle.alpha -= particle.decay;
  }
  field.particles = field.particles.filter((particle) => particle.alpha > 0);
}

function sliceField(game: Game, field: Field, x: number, y: number): void {
  if (field.lives <= 0) return;

  const hits = field.fruits.filter(
    (fruit) => Math.hypot(fruit.x - x, fruit.y - y) < fruit.kind.radius + SLICE_PADDING,
  );
  if (hits.length === 0) return;

  for (const fruit of hits) {
    if (fruit.kind.isBomb) {
      field.lives--;
      field.splatters.push(makeSplatter(game, fruit.x, fruit.y, BOMB_SPLATTER_COLOR));
      pushParticles(game, field, fruit.x, fruit.y, BOMB_PARTICLE_COLOR);
    } else {
      field.score += fruit.kind.points;
      field.halves.push(...makeHalves(fruit));
      field.splatters.push(makeSplatter(game, fruit.x, fruit.y, fruit.kind.juiceColor));
      pushParticles(game, field, fruit.x, fruit.y, fruit.kind.juiceColor);
    }
  }

  field.fruits = field.fruits.filter((fruit) => !hits.includes(fruit));
  checkGameOver(game);
}

function checkGameOver(game: Game): void {
  const outOfLives =
    game.mode === 1 ? game.bottom.lives <= 0 : game.bottom.lives <= 0 && game.top.lives <= 0;

  if (outOfLives) game.status = "over";
}

function makeHalves(fruit: Fruit): FruitHalf[] {
  return [true, false].map((isLeft) => ({
    kind: fruit.kind,
    isLeft,
    x: fruit.x,
    y: fruit.y,
    vx: fruit.vx + (isLeft ? -HALF_SEPARATION : HALF_SEPARATION),
    vy: fruit.vy - 1,
    rotation: fruit.rotation,
    vRot: fruit.vRot + (isLeft ? -HALF_SPIN : HALF_SPIN),
    alpha: 1,
  }));
}

function makeSplatter(game: Game, x: number, y: number, color: string): Splatter {
  return { x, y, color, radius: between(game, 12, 32), alpha: SPLATTER_ALPHA };
}

function pushParticles(game: Game, field: Field, x: number, y: number, color: string): void {
  const { random } = game;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const particle: Particle = {
      x,
      y,
      color,
      vx: (random() - 0.5) * 10,
      vy: (random() - 0.5) * 10,
      alpha: 1,
      decay: random() * 0.03 + 0.02,
      radius: random() * 5 + 3,
    };
    field.particles.push(particle);
  }
}

function pruneTrails(game: Game, now: number): void {
  for (const [pointerId, trail] of game.trails) {
    while (trail.length > 0 && now - trail[0].time > TRAIL_LIFETIME_MS) trail.shift();
    if (trail.length === 0) game.trails.delete(pointerId);
  }
}
