import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

const composeFile = readFileSync(join(rootDir, "docker-compose.yml"), "utf8");
const envExample = readFileSync(join(rootDir, ".env.example"), "utf8");

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
});
