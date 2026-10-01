/**
 * 🧪 A2UI COMPILE FLOW — e2e coverage for the /customize page.
 *
 * The /customize page renders KeychainBuilder with the A2UICompiler mounted
 * as section 00 ("Compile Your Vision"). Locally, getAllProducts() falls back
 * to mock products ($5.95 → tier 2: color + charm + 8-char text required), so
 * the full compile → gate → apply loop is testable with no Shopify creds.
 *
 * Pipeline timing: the deterministic compile animates for ~1.05s before the
 * result renders; when a field is missing, a 🧠 DEEP COMPILE fetch runs (which
 * returns the local result fast when no AI provider is configured).
 */

import { test, expect, type Locator, type Page } from "@playwright/test";

/** The A2UI intent input on /customize. */
const intentInput = (page: Page): Locator =>
  page.getByLabel("Describe your custom design");

/** Section 00 — the A2UI compiler. Chip assertions are scoped here because
 *  e.g. "Royal Purple" also appears in the builder's thread header and
 *  "Basketball" in the vibe charm grid. */
const compilerSection = (page: Page): Locator =>
  page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: /00\. Compile Your Vision/ }) });

/** The "01. Choose Your Thread" section — scoped assertions avoid clashing
 *  with the compiler's own resolved-color chips. */
const threadSection = (page: Page): Locator =>
  page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: /01\. Choose Your Thread/ }) });

test.beforeEach(async ({ page }) => {
  await page.goto("/customize");
  // Wait for hydration so Compile clicks land on React's handlers, not the
  // pre-hydration DOM (cold-start Turbopack compiles are slow).
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { name: "Build Your Own" })).toBeVisible();
  await expect(intentInput(page)).toBeVisible();
});

test("compiles a full intent and applies it to the builder", async ({ page }) => {
  await intentInput(page).fill(
    'Royal purple with a basketball charm, name "JAYDEN" for my son'
  );
  await page.getByRole("button", { name: /Compile/i }).click();

  // Compiler resolves all fields and routes the design (chips scoped to the
  // compiler section to avoid matches in the builder's own UI).
  await expect(page.getByText("Applied ✓", { exact: true })).toBeVisible();
  await expect(compilerSection(page).getByText("Royal Purple", { exact: true })).toBeVisible();
  await expect(compilerSection(page).getByText("Basketball", { exact: true })).toBeVisible();
  await expect(compilerSection(page).getByText("JAYDEN", { exact: true })).toBeVisible();

  // Builder state updated: thread color header + beaded text input.
  await expect(threadSection(page).getByText("Royal Purple", { exact: true })).toBeVisible();
  await expect(page.getByPlaceholder("YOUR TEXT")).toHaveValue("JAYDEN");
});

test("grille gate asks for the missing field and the quick-pick applies it", async ({
  page,
}) => {
  // Color + charm resolve; text is missing → gate must ask (ASK_SOVEREIGN).
  await intentInput(page).fill("purple with a basketball charm");
  await page.getByRole("button", { name: /Compile/i }).click();

  const gatePanel = page.getByText(/ASK_SOVEREIGN/);
  await expect(gatePanel).toBeVisible();

  await page.getByLabel("Enter custom text").fill("MAYA");
  await page.getByRole("button", { name: "Apply", exact: true }).click();

  // The gated field lands in the builder's text input.
  await expect(page.getByPlaceholder("YOUR TEXT")).toHaveValue("MAYA");
});

test("grille gate color quick-pick updates the thread selection", async ({
  page,
}) => {
  // Nothing resolvable → gate offers color swatches, charm chips, and text.
  await intentInput(page).fill("I want something nice");
  await page.getByRole("button", { name: /Compile/i }).click();

  const gatePanel = page.getByText(/ASK_SOVEREIGN/);
  await expect(gatePanel).toBeVisible();

  // One tap on a swatch (aria-label: "Pick <Color Name>") updates the builder.
  await page.getByLabel("Pick Soft Pink").click();
  await expect(
    threadSection(page).getByText("Soft Pink", { exact: true })
  ).toBeVisible();
});
