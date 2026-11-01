import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { NameEntry } from "./NameEntry";

const meta = {
  title: "Components/NameEntry",
  component: NameEntry,
  args: { score: 45, onSubmit: fn() },
} satisfies Meta<typeof NameEntry>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The pad and empty slots a player sees after a top-10 score. */
export const Empty: Story = {};
