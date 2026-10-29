import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    include: [
      "src/**/__tests__/*.test.{ts,tsx}",
      "src/components/**/index.test.tsx",
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
});
