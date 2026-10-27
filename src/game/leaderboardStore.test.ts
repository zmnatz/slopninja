import { describe, expect, it } from "vitest";
import { loadLeaderboard, saveLeaderboard, type KeyValueStore } from "./leaderboardStore";

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

const brokenStore: KeyValueStore = {
  getItem: () => {
    throw new Error("storage is disabled");
  },
  setItem: () => {
    throw new Error("storage is full");
  },
};

describe("leaderboardStore", () => {
  it("saves the board and loads the same board back", () => {
    const store = memoryStore();
    const board = [{ name: "ZZZ", score: 99 }];

    saveLeaderboard(store, board);

    expect(loadLeaderboard(store)).toEqual(board);
  });

  it("starts with an empty board when nothing has been saved", () => {
    expect(loadLeaderboard(memoryStore())).toEqual([]);
  });

  it("keeps the game working with an empty board when storage is unavailable", () => {
    expect(loadLeaderboard(brokenStore)).toEqual([]);
    expect(() => saveLeaderboard(brokenStore, [{ name: "ABC", score: 1 }])).not.toThrow();
  });
});
