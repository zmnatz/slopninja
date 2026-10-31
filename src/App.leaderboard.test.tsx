import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Snapshot } from "./game/types";

let report: (snapshot: Snapshot) => void = () => {};
vi.mock("./components/GameCanvas", () => ({
  GameCanvas: ({ onChange }: { onChange: (s: Snapshot) => void }) => {
    report = onChange;
    return null;
  },
}));

const { default: App } = await import("./App");

const over = (mode: 1 | 2, bottom: number, top = 0): Snapshot => ({
  status: "over",
  mode,
  bottom: { score: bottom, lives: 0 },
  top: { score: top, lives: 0 },
});

describe("App leaderboard", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("asks for a name, saves it, and shows it on the leaderboard", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "SOLO" }));
    act(() => report(over(1, 30)));

    for (const letter of ["Z", "A", "V"]) fireEvent.click(screen.getByRole("button", { name: letter }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));

    expect(screen.getByText("ZAV")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("slopninja.leaderboard")!)).toEqual([{ name: "ZAV", score: 30 }]);

    fireEvent.click(screen.getByRole("button", { name: "NEW GAME" }));
    expect(screen.getByRole("button", { name: "SOLO" })).toBeInTheDocument();
  });

  it("shows the leaderboard directly when the score misses the top 10", () => {
    const full = Array.from({ length: 10 }, () => ({ name: "AAA", score: 100 }));
    localStorage.setItem("slopninja.leaderboard", JSON.stringify(full));
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "SOLO" }));
    act(() => report(over(1, 5)));

    expect(screen.getByRole("heading", { name: "TOP 10" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NEW GAME" })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Name" })).not.toBeInTheDocument();
  });

  it("does not show the leaderboard after a two-player round", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "FACE-TO-FACE" }));
    act(() => report(over(2, 50, 10)));

    expect(screen.getByRole("heading", { name: "PLAYER 1 (BOTTOM) WINS!" })).toBeInTheDocument();
    expect(screen.queryByText("NEW GAME")).not.toBeInTheDocument();
  });
});
