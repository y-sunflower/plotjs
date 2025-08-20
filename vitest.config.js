import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/test-javascript/*.test.js"],
    exclude: ["node_modules", ".venv"], // skip python venv
  },
});
