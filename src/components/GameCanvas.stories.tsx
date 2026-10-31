import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { useState } from "react";
import { createGame } from "../game/engine";
import type { GameMode, Snapshot } from "../game/types";
import { GameCanvas } from "./GameCanvas";

const meta = {
  title: "Components/GameCanvas",
  component: GameCanvas,
  args: {
    game: null,
    onChange: fn(),
  },
} satisfies Meta<typeof GameCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Before a mode is picked there is no game, so the canvas stays blank. */
export const Idle: Story = {};

/** A solo game on a fixed seed, so fruit and bombs spawn the same way on every run. */
export const SoloGame: Story = {
  render: () => <LiveGame mode={1} />,
};

/** Two players, so fruit is thrown from both edges of the screen. */
export const FaceToFaceGame: Story = {
  render: () => <LiveGame mode={2} />,
};

function LiveGame({ mode }: { mode: GameMode }) {
  const [game] = useState(() => createGame(mode, 1280, 720, seededRandom(7)));
  return <GameCanvas game={game} onChange={(_snapshot: Snapshot) => {}} />;
}

/** Small deterministic PRNG (mulberry32), so the same seed always gives the same sequence. */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
