import { config as baseConfig } from "@repo/eslint-config/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: [".mastra/**", ".agents/**", "node_modules/**", "dist/**"],
  },
];
