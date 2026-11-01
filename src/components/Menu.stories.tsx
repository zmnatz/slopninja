import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { describeResult } from "../game/engine";
import { Menu } from "./Menu";

const meta = {
  title: "Components/Menu",
  component: Menu,
  args: {
    title: "FRUIT NINJA",
    detail: "Slice the fruit, avoid bombs! Choose your game mode:",
    onStart: fn(),
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The menu the player sees on first load. */
export const Intro: Story = {};

/** The copy the app shows after a solo run ends. */
export const SoloGameOver: Story = {
  args: describeResult({
    status: "over",
    mode: 1,
    bottom: { score: 42, lives: 0 },
    top: { score: 0, lives: 0 },
  }),
};

/** The copy the app shows after a face-to-face match, won by the top player. */
export const TopPlayerWins: Story = {
  args: describeResult({
    status: "over",
    mode: 2,
    bottom: { score: 18, lives: 0 },
    top: { score: 31, lives: 0 },
  }),
};

/** A face-to-face match that ends level. */
export const Tie: Story = {
  args: describeResult({
    status: "over",
    mode: 2,
    bottom: { score: 20, lives: 0 },
    top: { score: 20, lives: 0 },
  }),
};

/** The first-load menu with the Top 10 button. */
export const WithTopTen: Story = { args: { onShowScores: fn() } };
