import { expect, test } from "@playwright/test";

test("onboarded user can create and edit a draft expense", async ({ page }) => {
  await page.goto("/sign-in");

  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Password").fill("S3curePass!");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/dashboard/);
  await page.getByRole("link", { name: "Create draft expense" }).click();

  await expect(page).toHaveURL(/expenses\/new/);
  await page.getByLabel("Merchant").fill("Chipotle");
  await page.getByLabel("Description").fill("Team lunch");
  await page.getByRole("button", { name: "Save draft" }).click();

  await expect(page.getByText("Draft saved")).toBeVisible();
  await page.getByLabel("Description").fill("Team lunch with clients");
  await page.getByRole("button", { name: "Update draft" }).click();

  await expect(page.getByText("Draft updated")).toBeVisible();
  await page.goto("/dashboard");
  await expect(page.getByText("Chipotle")).toBeVisible();
});
