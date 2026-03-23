import { defineConfig } from "@playwright/test";

const port = Number(process.env.PORT ?? 3100);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./apps/web/e2e",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `PORT=${port} corepack pnpm --filter @expense-manager/web dev`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
