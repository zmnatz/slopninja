export type GameMode = 1 | 2;

export type GameStatus = "playing" | "over";

export interface FruitKind {
  name: string;
  juiceColor: string;
  radius: number;
  points: number;
  isBomb: boolean;
}

export interface Fruit {
  kind: FruitKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
}

export interface FruitHalf {
  kind: FruitKind;
  isLeft: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  alpha: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  decay: number;
}

export interface Splatter {
  x: number;
  y: number;
  color: string;
  radius: number;
  alpha: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

/** One player's half of the table: their fruit, juice, and score. */
export interface Field {
  score: number;
  lives: number;
  spawnTimer: number;
  fruits: Fruit[];
  halves: FruitHalf[];
  particles: Particle[];
  splatters: Splatter[];
}

export interface Game {
  mode: GameMode;
  status: GameStatus;
  width: number;
  height: number;
  /** Player 1, drawn upright along the bottom half of the screen. */
  bottom: Field;
  /** Player 2, drawn upside down along the top half. Idle in 1-player mode. */
  top: Field;
  trails: Map<number, TrailPoint[]>;
  random: () => number;
}

export interface PlayerScore {
  score: number;
  lives: number;
}

/** Plain-data view of a game, safe to pass to React state. */
export interface Snapshot {
  status: GameStatus;
  mode: GameMode;
  bottom: PlayerScore;
  top: PlayerScore;
}
