import { definePreview } from "@storybook/react-vite";
import "../src/index.css";

const preview = definePreview({
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
});

export default preview;
