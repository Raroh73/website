import { expect, test } from "@playwright/test";

test("index", async ({ page }) => {
  await page.goto("/");
  await expect.soft(page, "Expect URL to be '/'").toHaveURL("/");
  await expect
    .soft(page, "Expect title to be 'Home | Raroh73'")
    .toHaveTitle("Home | Raroh73");
  await expect
    .soft(
      page.getByRole("heading", { level: 1, name: "Raroh73" }),
      "Expect heading to be 'Raroh73'",
    )
    .toBeVisible();
});
