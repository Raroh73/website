import { expect, test } from "@playwright/test";

test.describe("index", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("title", async ({ page }) => {
    await expect(page).toHaveTitle("Home | Raroh73");
  });

  test("heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "Raroh73" }),
    ).toBeVisible();
  });
});
