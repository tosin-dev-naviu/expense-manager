import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

const composeFile = readFileSync(join(rootDir, "docker-compose.yml"), "utf8");
const envExample = readFileSync(join(rootDir, ".env.example"), "utf8");
const dockerfiles = [
  readFileSync(join(rootDir, "Dockerfile.web"), "utf8"),
  readFileSync(join(rootDir, "Dockerfile.worker"), "utf8"),
  readFileSync(join(rootDir, "apps/web/Dockerfile"), "utf8"),
  readFileSync(join(rootDir, "apps/worker/Dockerfile"), "utf8"),
];

describe("local infrastructure baseline", () => {
  it("defines the required local services and environment variable groups", () => {
    for (const serviceName of [
      "web:",
      "worker:",
      "postgres:",
      "redis:",
      "minio:",
      "mailhog:",
    ]) {
      expect(composeFile).toContain(serviceName);
    }

    for (const envVariable of [
      "DATABASE_URL=",
      "AUTH_SECRET=",
      "AUTH_URL=",
      "AUTH_TRUST_HOST=",
      "SMTP_HOST=",
      "SMTP_PORT=",
      "SMTP_USER=",
      "SMTP_PASSWORD=",
      "EMAIL_FROM=",
      "REDIS_URL=",
      "S3_ENDPOINT=",
      "S3_REGION=",
      "S3_BUCKET=",
      "S3_ACCESS_KEY_ID=",
      "S3_SECRET_ACCESS_KEY=",
      "S3_FORCE_PATH_STYLE=",
      "OPENAI_API_KEY=",
    ]) {
      expect(envExample).toContain(envVariable);
    }
  });

  it("keeps container dependency installation aligned with the pnpm workspace", () => {
    expect(readFileSync(join(rootDir, "package.json"), "utf8")).toContain('"packageManager": "pnpm@');
    expect(readFileSync(join(rootDir, "pnpm-lock.yaml"), "utf8")).toContain("lockfileVersion:");

    for (const dockerfile of dockerfiles) {
      expect(dockerfile).toContain("pnpm-lock.yaml");
      expect(dockerfile).not.toContain("package-lock.json");
    }
  });
});
