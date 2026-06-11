import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      auth: path.resolve(__dirname, "./auth.ts"),
      lib: path.resolve(__dirname, "./lib"),
      app: path.resolve(__dirname, "./app"),
      components: path.resolve(__dirname, "./components"),
    },
  },
});
