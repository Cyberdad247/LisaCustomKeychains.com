/**
 * 🎴 A2UI DRAWER — e2e coverage for the KeychainCustomizer product drawer.
 *
 * The /product/[handle] page renders one ProductCard; its "Customize" CTA
 * opens the drawer, which mounts the full A2UI suite: compact compiler,
 * hot-swappable cartridges, and design memory. Local mock products are
 * $5.95 → tier 2 (classic, 8-char text, non-earring).
 */

import { test, expect } from "@playwright/test";

const MOCK_HANDLE = "handmade-keychain-1000011817";

test("product drawer mounts cartridges + memory and applies a cartridge", async ({
  page,
}) => {
  await page.goto(`/product/${MOCK_HANDLE}`);
  // Wait for hydration so the Customize click isn't swallowed on cold starts.
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /^Customize / }).click();

  // Drawer opens with the A2UI suite mounted.
  await expect(page.getByText("🎴 Hot-Swappable Cartridges")).toBeVisible();
  await expect(page.getByRole("button", { name: /Game Day/ })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save design" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /My designs \(0\)/ })
  ).toBeVisible();

  // One tap forges the preset → the yarn palette reflects the cartridge color.
  // (Game Day resolves to Amber Orange, its preferred color id.)
  await page.getByRole("button", { name: /Game Day/ }).click();
  await expect(page.getByText("Amber Orange", { exact: true })).toBeVisible();

  // Design memory: saving the current design increments the counter.
  await page.getByRole("button", { name: "Save design" }).click();
  await expect(
    page.getByRole("button", { name: /My designs \(1\)/ })
  ).toBeVisible();

  // The saved design can be opened and restored back into the drawer.
  await page.getByRole("button", { name: /My designs \(1\)/ }).click();
  await expect(page.getByRole("button", { name: "Restore" })).toBeVisible();
  await page.getByRole("button", { name: "Restore" }).click();
  // Palette still reflects the restored cartridge color.
  await expect(page.getByText("Amber Orange", { exact: true })).toBeVisible();
});
