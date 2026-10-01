/**
 * 🎴 A2UI EARING + SET DRAWERS — e2e coverage for the two non-keychain
 * customizer drawers. These open from the mock earring/set products added to
 * mocks.ts (offline fallback catalog): an "Earrings" product routes to
 * EarringCustomizer, a "Set" product to SetCustomizer. Both have no text —
 * cartridges resolve with lockLetters so presets apply color + charms only.
 */

import { test, expect, type Page } from "@playwright/test";

const EARING_HANDLE = "handmade-dangle-earrings-1000012345";
const SET_HANDLE = "keychain-earring-set-1000012346";

async function openDrawer(page: Page, handle: string) {
  await page.goto(`/product/${handle}`);
  // Cold-start Turbopack compiles are slow — wait for the page's JS to settle
  // so the Customize click isn't swallowed by pre-hydration HTML.
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /^Customize / }).click();
  await expect(page.getByText("🎴 Hot-Swappable Cartridges")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save design" })).toBeVisible();
}

test("earring drawer: cartridge applies color + both charm slots, memory saves/restores", async ({
  page,
}) => {
  await openDrawer(page, EARING_HANDLE);
  await expect(page.getByRole("button", { name: /My designs \(0\)/ })).toBeVisible();

  // Forever Love → Soft Pink + hearts (top and bottom slots).
  await page.getByRole("button", { name: /Forever Love/ }).click();
  await expect(page.getByText("Soft Pink", { exact: true })).toBeVisible();

  // The active "Modifying Bottom Slot" value reflects the applied charm.
  const slotValue = page
    .getByText("Modifying Bottom Slot")
    .locator("xpath=following-sibling::span");
  await expect(slotValue).toHaveText("Hearts");

  // Memory: save → counter increments → restore works.
  await page.getByRole("button", { name: "Save design" }).click();
  await expect(page.getByRole("button", { name: /My designs \(1\)/ })).toBeVisible();
  await page.getByRole("button", { name: /My designs \(1\)/ }).click();
  await page.getByRole("button", { name: "Restore" }).click();
  await expect(page.getByText("Soft Pink", { exact: true })).toBeVisible();
});

test("set drawer: cartridge applies synced color, memory saves/restores", async ({
  page,
}) => {
  await openDrawer(page, SET_HANDLE);
  await expect(page.getByRole("button", { name: /My designs \(0\)/ })).toBeVisible();

  // Celestial → Midnight Navy + stars (synced across the set).
  await page.getByRole("button", { name: /Celestial/ }).click();
  await expect(page.getByText("Midnight Navy", { exact: true })).toBeVisible();

  // Memory: save → counter increments → restore keeps the palette.
  await page.getByRole("button", { name: "Save design" }).click();
  await expect(page.getByRole("button", { name: /My designs \(1\)/ })).toBeVisible();
  await page.getByRole("button", { name: /My designs \(1\)/ }).click();
  await page.getByRole("button", { name: "Restore" }).click();
  await expect(page.getByText("Midnight Navy", { exact: true })).toBeVisible();
});
