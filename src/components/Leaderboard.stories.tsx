import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Leaderboard } from "./Leaderboard";

const entries = Array.from({ length: 10 }, (_, i) => ({ name: "CBA", score: (10 - i) * 10 }));

const meta = {
  title: "Components/Leaderboard",
  component: Leaderboard,
  args: { entries, score: 45, onNewGame: fn() },
} satisfies Meta<typeof Leaderboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A round that missed the top 10. */
export const MissedTopTen: Story = {};

/** The player just entered their name and placed 6th. */
export const JustPlaced: Story = { args: { highlight: 5 } };

/** First run, before any score is saved. */
export const Empty: Story = { args: { entries: [], score: 0 } };
