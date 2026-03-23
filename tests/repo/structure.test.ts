import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

const requiredFiles = [
  "pnpm-workspace.yaml",
  "package.json",
  "turbo.json",
  ".gitignore",
  ".env.example",
  "tsconfig.base.json",
  "apps/web/package.json",
  "apps/worker/package.json",
  "packages/db/package.json",
  "packages/auth/package.json",
  "packages/validation/package.json",
  "packages/queue/package.json",
  "packages/domain/package.json",
];

const requiredDirectories = [
  "apps",
  "apps/web",
  "apps/worker",
  "packages",
  "packages/db",
  "packages/auth",
  "packages/validation",
  "packages/queue",
  "packages/domain",
];

describe("repo structure", () => {
  it("includes the monorepo foundation files and package directories", () => {
    for (const directory of requiredDirectories) {
      const directoryPath = join(rootDir, directory);
      expect(existsSync(directoryPath), `${directory} should exist`).toBe(true);
      expect(statSync(directoryPath).isDirectory(), `${directory} should be a directory`).toBe(true);
    }

    for (const file of requiredFiles) {
      expect(existsSync(join(rootDir, file)), `${file} should exist`).toBe(true);
    }
  });
});
