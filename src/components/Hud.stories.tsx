import type { Meta, StoryObj } from "@storybook/react-vite";
import { Hud } from "./Hud";

const meta = {
  title: "Components/Hud",
  component: Hud,
  args: {
    position: "bottom",
    score: 120,
    lives: 3,
  },
} satisfies Meta<typeof Hud>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Player 1's HUD in solo mode, along the bottom edge. */
export const Bottom: Story = {};

/** Player 2's HUD in face-to-face mode, drawn upside down along the top edge. */
export const Top: Story = {
  args: { position: "top", score: 75, lives: 2 },
};

/** Last life lost: one heart left. */
export const OneLifeLeft: Story = {
  args: { lives: 1, score: 340 },
};

/** Out of lives: the score stays visible, no hearts. */
export const OutOfLives: Story = {
  args: { lives: 0, score: 512 },
};
