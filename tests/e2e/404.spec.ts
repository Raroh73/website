import { expect, test } from "@playwright/test";

test("404", async ({ page }) => {
  const response = await page.goto("/does-not-exist");
  expect.soft(response?.status(), "Expect status to be 404").toBe(404);
  await expect
    .soft(
      page.getByRole("heading", { level: 1, name: "Error 404" }),
      "Expect heading to be 'Error 404'",
    )
    .toBeVisible();
});
