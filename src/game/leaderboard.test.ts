import { describe, expect, it } from "vitest";
import { insertScore, LEADERBOARD_SIZE, parseLeaderboard, qualifies, serializeLeaderboard } from "./leaderboard";

function fullBoard(scores: number[]) {
  return scores.map((score, index) => ({ name: `P${index}`, score }));
}

describe("qualifies", () => {
  it("lets any scoring round onto an empty board", () => {
    expect(qualifies([], 1)).toBe(true);
  });

  it("does not let a zero-point round onto the board", () => {
    expect(qualifies([], 0)).toBe(false);
  });

  it("lets a score onto a board with free places", () => {
    expect(qualifies(fullBoard([50, 40]), 5)).toBe(true);
  });

  it("needs to beat the lowest score once the board is full", () => {
    const board = fullBoard([100, 90, 80, 70, 60, 50, 40, 30, 20, 10]);

    expect(qualifies(board, 11)).toBe(true);
    expect(qualifies(board, 10)).toBe(false);
    expect(qualifies(board, 9)).toBe(false);
  });
});

describe("insertScore", () => {
  it("keeps the board sorted from highest to lowest score", () => {
    const board = insertScore(fullBoard([50, 10]), { name: "ZAP", score: 30 });

    expect(board.map((entry) => entry.score)).toEqual([50, 30, 10]);
    expect(board[1]).toEqual({ name: "ZAP", score: 30 });
  });

  it("drops the lowest entry so the board never holds more than the top 10", () => {
    const board = insertScore(fullBoard([100, 90, 80, 70, 60, 50, 40, 30, 20, 10]), {
      name: "NEW",
      score: 55,
    });

    expect(board).toHaveLength(LEADERBOARD_SIZE);
    expect(board.map((entry) => entry.score)).toEqual([100, 90, 80, 70, 60, 55, 50, 40, 30, 20]);
  });
});

describe("parseLeaderboard", () => {
  it("reads back what was serialized", () => {
    const board = [
      { name: "ABC", score: 42 },
      { name: "XYZ", score: 7 },
    ];

    expect(parseLeaderboard(serializeLeaderboard(board))).toEqual(board);
  });

  it("returns an empty board when nothing is stored", () => {
    expect(parseLeaderboard(null)).toEqual([]);
  });

  it("returns an empty board for corrupt or wrongly shaped data", () => {
    expect(parseLeaderboard("{not json")).toEqual([]);
    expect(parseLeaderboard(JSON.stringify({ top: "ten" }))).toEqual([]);
    expect(parseLeaderboard(JSON.stringify([{ name: 5, score: "high" }]))).toEqual([]);
  });
});
