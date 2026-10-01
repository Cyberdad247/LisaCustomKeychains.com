import { describe, it, expect } from "vitest";
import { DESIGN_CARTRIDGES, resolveCartridge } from "../cartridges";

describe("design cartridges", () => {
  it("exposes a non-empty cartridge roster with valid ids", () => {
    expect(DESIGN_CARTRIDGES.length).toBeGreaterThanOrEqual(6);
    const ids = new Set(DESIGN_CARTRIDGES.map((c) => c.id));
    expect(ids.size).toBe(DESIGN_CARTRIDGES.length);
  });

  it("resolves game-day against real registry colors and charms", () => {
    const cartridge = DESIGN_CARTRIDGES.find((c) => c.id === "game-day")!;
    const resolved = resolveCartridge(cartridge, { tier: 3 });
    expect(resolved.color?.id).toBe("orange");
    expect(resolved.charms.map((c) => c.id)).toEqual([
      "football",
      "basketball",
    ]);
  });

  it("falls back to the first allowed color when the cartridge color is filtered out", () => {
    const cartridge = DESIGN_CARTRIDGES.find((c) => c.id === "game-day")!;
    const resolved = resolveCartridge(cartridge, {
      tier: 3,
      allowedColors: ["pink", "mint"],
    });
    expect(resolved.color?.id).toBe("pink");
  });

  it("drops charms outside the sports pool", () => {
    const cartridge = DESIGN_CARTRIDGES.find((c) => c.id === "forever-love")!;
    const resolved = resolveCartridge(cartridge, {
      tier: 3,
      charmCategory: "sports",
    });
    expect(resolved.charms).toEqual([]);
  });

  it("suppresses text on tier 1 and locked letters", () => {
    const cartridge: (typeof DESIGN_CARTRIDGES)[number] = {
      ...DESIGN_CARTRIDGES[0],
      text: "CLASS OF 2026",
    };
    expect(resolveCartridge(cartridge, { tier: 1 }).text).toBeUndefined();
    expect(
      resolveCartridge(cartridge, { tier: 3, lockLetters: true }).text
    ).toBeUndefined();
    expect(resolveCartridge(cartridge, { tier: 3 }).text).toBe("CLASS OF 2026");
  });
});
