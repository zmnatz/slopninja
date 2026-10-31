import { useState } from "react";
import { NAME_LENGTH } from "../game/leaderboard";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface NameEntryProps {
  score: number;
  onSubmit: (name: string) => void;
}

/** Three big letter slots and a pad drawn in the page, so the system keyboard never opens. */
export function NameEntry({ score, onSubmit }: NameEntryProps) {
  const [name, setName] = useState("");

  return (
    <div className="menu name-entry">
      <h1>TOP 10!</h1>
      <p>Score: {score}. Enter your name:</p>
      <div className="name-slots" role="group" aria-label="Name">
        {Array.from({ length: NAME_LENGTH }, (_, i) => (
          <span key={i} className="name-slot" data-active={i === name.length}>
            {name[i] ?? ""}
          </span>
        ))}
      </div>
      <div className="letter-pad">
        {LETTERS.map((letter) => (
          <button
            key={letter}
            type="button"
            className="pad-key"
            disabled={name.length >= NAME_LENGTH}
            onClick={() => setName((current) => current + letter)}
          >
            {letter}
          </button>
        ))}
        <button
          type="button"
          className="pad-key pad-wide"
          aria-label="Delete"
          disabled={name.length === 0}
          onClick={() => setName((current) => current.slice(0, -1))}
        >
          ⌫
        </button>
        <button
          type="button"
          className="pad-key pad-wide"
          disabled={name.length < NAME_LENGTH}
          onClick={() => onSubmit(name)}
        >
          OK
        </button>
      </div>
    </div>
  );
}
