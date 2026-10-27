import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  afterEach(cleanup);

  it("shows the mode menu first", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "FRUIT NINJA" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SOLO" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "FACE-TO-FACE" })).toBeInTheDocument();
  });

  it("starts a 1-player game with a score and three lives", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "SOLO" }));

    expect(screen.getByText("SCORE: 0")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "SOLO" })).not.toBeInTheDocument();
    expect(screen.queryByText(/FACE-TO-FACE/)).not.toBeInTheDocument();
  });

  it("adds a second HUD and divider in 2-player mode", () => {
    const { container } = render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "FACE-TO-FACE" }));

    expect(screen.getAllByText(/SCORE: 0/)).toHaveLength(2);
    expect(container.querySelector(".divider")).not.toBeNull();
  });
});
