import { useState } from "react";
import { backspace, isComplete, NAME_LENGTH, typeLetter } from "../game/nameEntry";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface NameEntryProps {
  score: number;
  onSubmit: (name: string) => void;
}

/**
 * Names are entered on an on-screen pad, not a text field, so no system keyboard opens on iPad
 * and nothing on screen moves while typing.
 */
export function NameEntry({ score, onSubmit }: NameEntryProps) {
  const [name, setName] = useState("");
  const slots = Array.from({ length: NAME_LENGTH }, (_, index) => name[index] ?? "_");

  return (
    <div className="menu">
      <h1>NEW TOP 10!</h1>
      <p>
        Score <span className="points">{score}</span>
      </p>

      <div className="name-slots" data-testid="name-slots">
        {slots.map((letter, index) => (
          <span key={index} className="slot">
            {letter}
          </span>
        ))}
      </div>

      <div className="letter-pad">
        {LETTERS.map((letter) => (
          <button key={letter} type="button" onClick={() => setName((current) => typeLetter(current, letter))}>
            {letter}
          </button>
        ))}
      </div>

      <div className="btn-row">
        <button type="button" onClick={() => setName(backspace)}>
          DEL
        </button>
        <button type="button" disabled={!isComplete(name)} onClick={() => onSubmit(name)}>
          DONE
        </button>
      </div>
    </div>
  );
}
