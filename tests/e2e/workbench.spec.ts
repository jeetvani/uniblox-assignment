import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page, request }) => {
  await request.post("http://127.0.0.1:4000/api/reset")
  await page.goto("/")
  await expect(
    page.getByRole("heading", { name: "Enrollment review workbench" }),
  ).toBeVisible()
})

test("desktop keeps the workbench inside the viewport", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "Desktop-only behavior",
  )

  await expect(page.getByRole("table")).toBeVisible()
  await expect(page.getByRole("searchbox").last()).toBeVisible()

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(hasHorizontalOverflow).toBe(false)
})

test("extended filters overlay the desktop queue", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "Desktop-only behavior",
  )

  await page.getByRole("button", { name: "Extended filters" }).click()

  await expect(page.getByRole("dialog")).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Coverage range" }),
  ).toBeVisible()
  await expect(
    page.getByRole("slider", { name: "Minimum coverage" }),
  ).toBeVisible()
  await expect(
    page.getByRole("spinbutton", { name: "Maximum coverage" }),
  ).toBeVisible()
})

test("mobile uses review cards and a filter bottom sheet", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile-only behavior")

  await expect(page.getByRole("table")).toBeHidden()
  await expect(
    page.getByRole("button", { name: /Open submission details for/ }).first(),
  ).toBeVisible()
  await page.getByRole("button", { name: /^Filters/ }).click()

  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible()
  await expect(
    dialog.getByRole("heading", { name: "Extended filters" }),
  ).toBeVisible()
  await expect(
    dialog.getByRole("button", { name: "View results" }),
  ).toBeVisible()
})

test("keyboard activation opens details and Escape restores focus", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "Desktop-only behavior",
  )

  const applicant = page
    .getByRole("row", { name: /Open submission details for/ })
    .first()
  await applicant.focus()
  await applicant.press("Enter")

  await expect(page.getByRole("dialog")).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Why this needs attention" }),
  ).toBeVisible()
  await page.keyboard.press("Escape")

  await expect(page.getByRole("dialog")).toBeHidden()
  await expect(applicant).toBeFocused()
})

test("an approved submission leaves the active queue", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "Desktop-only behavior",
  )

  await page.getByRole("searchbox").last().fill("Alex Morgan")
  const applicant = page.getByRole("row", {
    name: "Open submission details for Alex Morgan",
  })
  await expect(applicant).toBeVisible()
  await applicant.click()
  await page.getByRole("button", { name: "Approve" }).click()
  await page.getByRole("button", { name: "Confirm approval" }).click()

  await expect(page.getByRole("status")).toContainText("Decision recorded")
  await page.getByRole("button", { name: "Close", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "No matching submissions" }),
  ).toBeVisible()
})
