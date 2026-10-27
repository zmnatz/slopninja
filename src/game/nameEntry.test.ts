import { describe, expect, it } from "vitest";
import { backspace, isComplete, NAME_LENGTH, typeLetter } from "./nameEntry";

describe("typeLetter", () => {
  it("fills the next slot with the letter", () => {
    expect(typeLetter("", "A")).toBe("A");
    expect(typeLetter("AB", "C")).toBe("ABC");
  });

  it("ignores a letter once all slots are full", () => {
    expect(typeLetter("ABC", "D")).toBe("ABC");
  });

  it("ignores anything that is not an uppercase letter", () => {
    expect(typeLetter("A", "1")).toBe("A");
    expect(typeLetter("A", "b")).toBe("A");
  });
});

describe("backspace", () => {
  it("removes the last letter", () => {
    expect(backspace("ABC")).toBe("AB");
  });

  it("does nothing on an empty name", () => {
    expect(backspace("")).toBe("");
  });
});

describe("isComplete", () => {
  it("is true only when every slot is filled", () => {
    expect(NAME_LENGTH).toBe(3);
    expect(isComplete("AB")).toBe(false);
    expect(isComplete("ABC")).toBe(true);
  });
});
