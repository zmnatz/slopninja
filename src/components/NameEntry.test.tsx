import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { NameEntry } from "./NameEntry";

describe("NameEntry", () => {
  afterEach(cleanup);

  const press = (...letters: string[]) =>
    letters.forEach((letter) => fireEvent.click(screen.getByRole("button", { name: letter })));

  it("shows entered letters in the slots and only allows three", () => {
    render(<NameEntry score={5} onSubmit={vi.fn()} />);
    press("A", "B", "C");

    expect(screen.getByRole("group", { name: "Name" })).toHaveTextContent("ABC");
    expect(screen.getByRole("button", { name: "D" })).toBeDisabled();
  });

  it("deletes the last letter", () => {
    render(<NameEntry score={5} onSubmit={vi.fn()} />);
    press("A", "B");
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByRole("group", { name: "Name" })).toHaveTextContent("A");
    expect(screen.getByRole("group", { name: "Name" })).not.toHaveTextContent("AB");
  });

  it("submits only a full name", () => {
    const onSubmit = vi.fn();
    render(<NameEntry score={5} onSubmit={onSubmit} />);
    press("Z", "A");
    expect(screen.getByRole("button", { name: "OK" })).toBeDisabled();
    press("V");
    fireEvent.click(screen.getByRole("button", { name: "OK" }));

    expect(onSubmit).toHaveBeenCalledWith("ZAV");
  });
});
