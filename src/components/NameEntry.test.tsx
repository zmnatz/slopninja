import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NameEntry } from "./NameEntry";

describe("NameEntry", () => {
  afterEach(cleanup);

  it("fills the three slots from the letter pad, in order", () => {
    render(<NameEntry score={42} onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Z" }));
    fireEvent.click(screen.getByRole("button", { name: "A" }));

    expect(screen.getByTestId("name-slots")).toHaveTextContent("ZA");
  });

  it("keeps DONE disabled until all three letters are entered", () => {
    render(<NameEntry score={42} onSubmit={vi.fn()} />);
    const done = screen.getByRole("button", { name: "DONE" });

    fireEvent.click(screen.getByRole("button", { name: "A" }));
    fireEvent.click(screen.getByRole("button", { name: "B" }));
    expect(done).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "C" }));
    expect(done).toBeEnabled();
  });

  it("removes the last letter with DEL", () => {
    render(<NameEntry score={42} onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "A" }));
    fireEvent.click(screen.getByRole("button", { name: "B" }));
    fireEvent.click(screen.getByRole("button", { name: "DEL" }));

    expect(screen.getByTestId("name-slots")).toHaveTextContent("A");
    expect(screen.getByTestId("name-slots")).not.toHaveTextContent("B");
  });

  it("submits the name with DONE once it is complete", () => {
    const onSubmit = vi.fn();
    render(<NameEntry score={42} onSubmit={onSubmit} />);

    for (const letter of ["J", "A", "M"]) {
      fireEvent.click(screen.getByRole("button", { name: letter }));
    }
    fireEvent.click(screen.getByRole("button", { name: "DONE" }));

    expect(onSubmit).toHaveBeenCalledWith("JAM");
  });

  it("shows the score the player is entering a name for", () => {
    render(<NameEntry score={42} onSubmit={vi.fn()} />);

    expect(screen.getByText("42")).toBeInTheDocument();
  });
});
