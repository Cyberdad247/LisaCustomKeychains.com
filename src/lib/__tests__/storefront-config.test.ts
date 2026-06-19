import { afterEach, beforeEach, describe, it, expect } from "vitest";
import {
  createOwnerSession,
  defaultStorefrontConfig,
  isOwnerSessionValid,
  OWNER_SESSION_TTL_SECONDS,
  StorefrontConfigSchema,
  saveUploadedImage,
} from "../storefront-config";

describe("StorefrontConfigSchema", () => {
  it("validates the default config without errors", () => {
    expect(() =>
      StorefrontConfigSchema.parse(defaultStorefrontConfig),
    ).not.toThrow();
  });

  it("rejects an empty object", () => {
    expect(() => StorefrontConfigSchema.parse({})).toThrow();
  });

  it("rejects an invalid brand accent color", () => {
    expect(() =>
      StorefrontConfigSchema.parse({
        ...defaultStorefrontConfig,
        brand: { accent: "not-a-hex-color" },
      }),
    ).toThrow();
  });

  it("accepts a valid hex brand accent", () => {
    expect(() =>
      StorefrontConfigSchema.parse({
        ...defaultStorefrontConfig,
        brand: { accent: "#ff0000" },
      }),
    ).not.toThrow();
  });

  it("rejects a hero headlineTop over 80 characters", () => {
    expect(() =>
      StorefrontConfigSchema.parse({
        ...defaultStorefrontConfig,
        hero: { ...defaultStorefrontConfig.hero, headlineTop: "x".repeat(81) },
      }),
    ).toThrow();
  });

  it("rejects a missing storefrontUrl", () => {
    const { storefrontUrl: _, ...rest } = defaultStorefrontConfig;
    expect(() => StorefrontConfigSchema.parse(rest)).toThrow();
  });
});

describe("saveUploadedImage", () => {
  it("returns empty string for null", async () => {
    expect(await saveUploadedImage(null)).toBe("");
  });

  it("returns empty string for a zero-size file", async () => {
    const file = new File([], "empty.png", { type: "image/png" });
    expect(await saveUploadedImage(file)).toBe("");
  });

  it("throws for unsupported file types", async () => {
    const file = new File(["data"], "doc.pdf", { type: "application/pdf" });
    await expect(saveUploadedImage(file)).rejects.toThrow(
      "Unsupported image type",
    );
  });

  it("throws for svg (not in the allowed list)", async () => {
    const file = new File(["<svg/>"], "icon.svg", { type: "image/svg+xml" });
    await expect(saveUploadedImage(file)).rejects.toThrow(
      "Unsupported image type",
    );
  });
});

describe("owner session", () => {
  const originalSecret = process.env.OWNER_DASHBOARD_SECRET;
  const originalPassword = process.env.OWNER_DASHBOARD_PASSWORD;

  beforeEach(() => {
    process.env.OWNER_DASHBOARD_SECRET = "test-secret-value";
    delete process.env.OWNER_DASHBOARD_PASSWORD;
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.OWNER_DASHBOARD_SECRET;
    else process.env.OWNER_DASHBOARD_SECRET = originalSecret;
    if (originalPassword === undefined) delete process.env.OWNER_DASHBOARD_PASSWORD;
    else process.env.OWNER_DASHBOARD_PASSWORD = originalPassword;
  });

  it("validates a freshly minted session", () => {
    expect(isOwnerSessionValid(createOwnerSession())).toBe(true);
  });

  it("rejects undefined", () => {
    expect(isOwnerSessionValid(undefined)).toBe(false);
  });

  it("rejects a tampered signature", () => {
    const token = createOwnerSession();
    const [payload] = token.split(".");
    expect(isOwnerSessionValid(`${payload}.deadbeef`)).toBe(false);
  });

  it("rejects an expired token", () => {
    const expired = String(Date.now() - 1000);
    // A correctly-signed-but-expired token must still fail.
    const token = createOwnerSession().replace(/^\d+/, expired);
    expect(isOwnerSessionValid(token)).toBe(false);
  });

  it("rejects a token signed with a different secret", () => {
    const token = createOwnerSession();
    process.env.OWNER_DASHBOARD_SECRET = "rotated-secret";
    expect(isOwnerSessionValid(token)).toBe(false);
  });

  it("fails closed when no secret is configured", () => {
    const token = createOwnerSession();
    delete process.env.OWNER_DASHBOARD_SECRET;
    expect(isOwnerSessionValid(token)).toBe(false);
    expect(() => createOwnerSession()).toThrow();
  });

  it("uses an 8 hour TTL", () => {
    expect(OWNER_SESSION_TTL_SECONDS).toBe(60 * 60 * 8);
  });
});
