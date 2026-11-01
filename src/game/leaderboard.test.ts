import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { addEntry, loadLeaderboard, qualifies, saveLeaderboard, type LeaderboardEntry } from "./leaderboard";

const full = (): LeaderboardEntry[] =>
  Array.from({ length: 10 }, (_, i) => ({ name: "AAA", score: (10 - i) * 10 }));

describe("leaderboard", () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("starts empty on the first run", () => {
    expect(loadLeaderboard()).toEqual([]);
  });

  it("reloads what was saved", () => {
    saveLeaderboard([{ name: "ZAV", score: 5 }]);
    expect(loadLeaderboard()).toEqual([{ name: "ZAV", score: 5 }]);
  });

  it("is empty when storage holds bad data", () => {
    localStorage.setItem("slopninja.leaderboard", "{not json");
    expect(loadLeaderboard()).toEqual([]);
    localStorage.setItem("slopninja.leaderboard", JSON.stringify({ a: 1 }));
    expect(loadLeaderboard()).toEqual([]);
    localStorage.setItem("slopninja.leaderboard", JSON.stringify([{ name: "A" }, { name: "BOB", score: 3 }]));
    expect(loadLeaderboard()).toEqual([{ name: "BOB", score: 3 }]);
  });

  it("keeps running when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(loadLeaderboard()).toEqual([]);
    expect(() => saveLeaderboard([])).not.toThrow();
  });

  it("qualifies any positive score while there is room, but never zero", () => {
    expect(qualifies([], 1)).toBe(true);
    expect(qualifies([], 0)).toBe(false);
  });

  it("qualifies a full board only for a score that beats the last place", () => {
    expect(qualifies(full(), 10)).toBe(false);
    expect(qualifies(full(), 11)).toBe(true);
  });

  it("inserts in score order, below ties, capped at 10", () => {
    const next = addEntry(full(), { name: "NEW", score: 50 });
    expect(next).toHaveLength(10);
    expect(next.map((e) => e.score)).toEqual([100, 90, 80, 70, 60, 50, 50, 40, 30, 20]);
    expect(next[5].name).toBe("AAA");
    expect(next[6].name).toBe("NEW");
  });
});
