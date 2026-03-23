import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "tests/**/*.test.ts",
      "packages/**/src/**/__tests__/**/*.test.ts",
      "apps/**/tests/**/*.test.ts",
    ],
    exclude: [
      "node_modules/**",
      "dist/**",
      ".next/**",
      "apps/web/e2e/**",
    ],
  },
});
