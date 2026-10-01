import { describe, it, expect } from "vitest";
import { compileDesignIntent } from "../compiler";

describe("A2UI compiler — full sentence intent", () => {
  it("compiles a full sentence into color, charm, and quoted text", () => {
    const result = compileDesignIntent(
      'Royal purple with a basketball charm, name "JAYDEN" for my son',
      { tier: 3 }
    );
    expect(result.design.color?.id).toBe("purple");
    expect(result.design.charms.map((c) => c.id)).toContain("basketball");
    expect(result.design.text).toBe("JAYDEN");
    expect(result.missing).toEqual([]);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it("prefers quoted text over ALL-CAPS words", () => {
    const result = compileDesignIntent('pink "SAM" keychain', { tier: 2 });
    expect(result.design.text).toBe("SAM");
    expect(result.design.color?.id).toBe("pink");
  });

  it("excludes color/charm words from ALL-CAPS text extraction", () => {
    const result = compileDesignIntent("BLUE FOOTBALL JAYDEN", { tier: 2 });
    expect(result.design.color?.id).toBe("blue");
    expect(result.design.charms.map((c) => c.id)).toContain("football");
    expect(result.design.text).toBe("JAYDEN");
  });
});

describe("A2UI compiler — quantize (color/charm matching)", () => {
  it("matches color synonyms", () => {
    expect(compileDesignIntent("mint", { tier: 1 }).design.color?.name).toBe(
      "Fresh Mint"
    );
    expect(compileDesignIntent("navy", { tier: 1 }).design.color?.name).toBe(
      "Midnight Navy"
    );
    expect(compileDesignIntent("rainbow", { tier: 1 }).design.color?.id).toBe(
      "rainbow"
    );
  });

  it("matches charm aliases", () => {
    const result = compileDesignIntent("soccer", { tier: 3 });
    expect(result.design.charms.map((c) => c.id)).toContain("soccer");
  });

  it("maps vibe words onto charms", () => {
    const result = compileDesignIntent("love pink", { tier: 3 });
    expect(result.design.charms.map((c) => c.id)).toContain("hearts");
    expect(result.design.vibeLabel).toBe("Romantic");
  });

  it("resolves at most 2 charms", () => {
    const result = compileDesignIntent(
      "football basketball soccer softball",
      { tier: 3 }
    );
    expect(result.design.charms.length).toBeLessThanOrEqual(2);
  });
});

describe("A2UI compiler — grille gate (ASK_SOVEREIGN)", () => {
  it("reports missing color and text for vague input on tier 2", () => {
    const result = compileDesignIntent("I want something nice", { tier: 2 });
    expect(result.missing).toContain("color");
    expect(result.missing).toContain("text");
  });

  it("tier 1 only requires a color", () => {
    const result = compileDesignIntent("purple", { tier: 1 });
    expect(result.design.color?.id).toBe("purple");
    expect(result.design.text).toBeUndefined();
    expect(result.missing).toEqual([]);
  });

  it("suppresses text when letters are locked", () => {
    const result = compileDesignIntent('purple "JAYDEN"', {
      tier: 2,
      lockLetters: true,
    });
    expect(result.design.color?.id).toBe("purple");
    expect(result.design.text).toBeUndefined();
    expect(result.missing).not.toContain("text");
  });

  it("empty input produces empty design with zero confidence", () => {
    const result = compileDesignIntent("", { tier: 3 });
    expect(result.design.charms).toEqual([]);
    expect(result.design.color).toBeUndefined();
    expect(result.missing).toEqual(["color", "charm", "text"]);
    expect(result.confidence).toBe(0);
  });
});

describe("A2UI compiler — constraints", () => {
  it("respects allowedColors filter", () => {
    const filtered = compileDesignIntent("purple", {
      tier: 1,
      allowedColors: ["mint", "pink"],
    });
    expect(filtered.design.color).toBeUndefined();
    expect(filtered.missing).toContain("color");

    const allowed = compileDesignIntent("mint", {
      tier: 1,
      allowedColors: ["mint", "pink"],
    });
    expect(allowed.design.color?.id).toBe("mint");
  });

  it("respects sports charm category", () => {
    const result = compileDesignIntent("hearts", {
      tier: 3,
      charmCategory: "sports",
    });
    expect(result.design.charms).toEqual([]);
    expect(result.missing).toContain("charm");

    const sports = compileDesignIntent("basketball", {
      tier: 3,
      charmCategory: "sports",
    });
    expect(sports.design.charms.map((c) => c.id)).toContain("basketball");
  });

  it("caps text at the tier character limit", () => {
    const result = compileDesignIntent('"ABCDEFGHIJKLMNOPQRST"', { tier: 2 });
    expect(result.design.text).toBe("ABCDEFGH");
  });
});
