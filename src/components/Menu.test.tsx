import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Menu } from "./Menu";

describe("Menu", () => {
  afterEach(cleanup);

  it("shows one square button per game mode, with its number and label", () => {
    render(<Menu title="FRUIT NINJA" detail="" onStart={vi.fn()} />);

    const solo = screen.getByRole("button", { name: "SOLO" });
    const faceToFace = screen.getByRole("button", { name: "FACE-TO-FACE" });
    expect(solo).toHaveTextContent("1");
    expect(faceToFace).toHaveTextContent("2");
  });

  it("starts the mode whose button is pressed", () => {
    const onStart = vi.fn();
    render(<Menu title="FRUIT NINJA" detail="" onStart={onStart} />);

    fireEvent.click(screen.getByRole("button", { name: "FACE-TO-FACE" }));

    expect(onStart).toHaveBeenCalledWith(2);
  });

  it("adds a button for every mode in the list, so new modes need no other change", () => {
    const modes = [
      { mode: 1 as const, icon: "1", label: "SOLO" },
      { mode: 2 as const, icon: "2", label: "FACE-TO-FACE" },
      { mode: 1 as const, icon: "3", label: "PRACTICE" },
    ];
    render(<Menu title="FRUIT NINJA" detail="" onStart={vi.fn()} modes={modes} />);

    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "PRACTICE" })).toHaveTextContent("3");
  });
});
