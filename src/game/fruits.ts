import type { FruitKind } from "./types";

export type FruitName = "watermelon" | "apple" | "banana" | "orange" | "bomb";

export const FRUIT_KINDS: Record<FruitName, FruitKind> = {
  watermelon: { name: "watermelon", juiceColor: "#ff2244", radius: 40, points: 1, isBomb: false },
  apple: { name: "apple", juiceColor: "#ff3333", radius: 32, points: 1, isBomb: false },
  banana: { name: "banana", juiceColor: "#ffee55", radius: 32, points: 2, isBomb: false },
  orange: { name: "orange", juiceColor: "#ff9900", radius: 35, points: 1, isBomb: false },
  bomb: { name: "bomb", juiceColor: "#444444", radius: 32, points: 0, isBomb: true },
};
