import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Leaderboard } from "./Leaderboard";

describe("Leaderboard", () => {
  afterEach(cleanup);

  it("lists each score with its rank, name, and points", () => {
    render(
      <Leaderboard
        entries={[
          { name: "ZAP", score: 42 },
          { name: "ABC", score: 7 },
        ]}
        onNewGame={vi.fn()}
      />,
    );

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("1");
    expect(rows[0]).toHaveTextContent("ZAP");
    expect(rows[0]).toHaveTextContent("42");
  });

  it("says so when no scores have been saved yet", () => {
    render(<Leaderboard entries={[]} onNewGame={vi.fn()} />);

    expect(screen.getByText("No scores yet")).toBeInTheDocument();
  });

  it("offers a New Game button", () => {
    const onNewGame = vi.fn();
    render(<Leaderboard entries={[]} onNewGame={onNewGame} />);

    fireEvent.click(screen.getByRole("button", { name: "NEW GAME" }));

    expect(onNewGame).toHaveBeenCalledOnce();
  });
});
