import { describe, it, expect } from "vitest";
import {
  defaultStorefrontConfig,
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
