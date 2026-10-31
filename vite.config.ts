import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";

// https://viteplus.dev/config/
export default defineConfig({
  // PR previews are served from a sub-path, so the workflow overrides the base.
  base: process.env.BASE_PATH ?? "/slopninja/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
  lint: {
    plugins: ["react", "typescript", "oxc"],
    rules: {
      "react/rules-of-hooks": "error",
      "react/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
});
