import type { FruitKind } from "./types";

export const FRUIT_KINDS: readonly FruitKind[] = [
  { name: "watermelon", juiceColor: "#ff2244", radius: 40, points: 1, isBomb: false },
  { name: "apple", juiceColor: "#ff3333", radius: 32, points: 1, isBomb: false },
  { name: "banana", juiceColor: "#ffee55", radius: 32, points: 2, isBomb: false },
  { name: "orange", juiceColor: "#ff9900", radius: 35, points: 1, isBomb: false },
  { name: "bomb", juiceColor: "#444444", radius: 32, points: 0, isBomb: true },
];
