import { expect, test } from "@playwright/test";

test("user can sign up, onboard, and return via sign-in", async ({ page }) => {
  await page.goto("/sign-up");

  await page.getByLabel("Full name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Password").fill("S3curePass!");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/onboarding/);
  await page.getByLabel("Workspace name").fill("Acme Finance");
  await page.getByLabel("Workspace slug").fill("acme-finance");
  await page.getByRole("button", { name: "Create workspace" }).click();

  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/sign-in/);

  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Password").fill("S3curePass!");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/dashboard/);
});
