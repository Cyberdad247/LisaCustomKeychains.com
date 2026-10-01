import { describe, it, expect } from "vitest";
import { compileDesignIntent } from "../compiler";
import {
  mergeLLMDesign,
  parseLLMPick,
  shouldUseLLM,
} from "../llm";

describe("shouldUseLLM — trigger rule", () => {
  it("escalates only when the local compiler left a required field missing", () => {
    const vague = compileDesignIntent("I want something nice", { tier: 2 });
    expect(vague.missing.length).toBeGreaterThan(0);
    expect(shouldUseLLM(vague)).toBe(true);
  });

  it("stays offline when the local compiler resolves everything", () => {
    const complete = compileDesignIntent('purple basketball "JAYDEN"', {
      tier: 2,
    });
    expect(complete.missing).toEqual([]);
    expect(shouldUseLLM(complete)).toBe(false);
  });

  it("tier 1 with a resolved color does not escalate", () => {
    const tier1 = compileDesignIntent("mint", { tier: 1 });
    expect(shouldUseLLM(tier1)).toBe(false);
  });
});

describe("parseLLMPick — model output extraction", () => {
  it("parses a plain JSON object", () => {
    const pick = parseLLMPick(
      '{"colorId":"purple","charmIds":["basketball"],"text":"JAYDEN","vibeLabel":null,"explanation":"inferred from request"}'
    );
    expect(pick?.colorId).toBe("purple");
    expect(pick?.charmIds).toEqual(["basketball"]);
    expect(pick?.text).toBe("JAYDEN");
  });

  it("tolerates ```json fences", () => {
    const pick = parseLLMPick('```json\n{"colorId":"pink","charmIds":[]}\n```');
    expect(pick?.colorId).toBe("pink");
    expect(pick?.charmIds).toEqual([]);
  });

  it("returns null for non-JSON prose", () => {
    expect(parseLLMPick("I think purple would be lovely!")).toBeNull();
  });

  it("rejects picks with unknown extra keys instead of crashing", () => {
    const pick = parseLLMPick(
      '{"colorId":"blue","evil":"payload","charmIds":["stars"]}'
    );
    expect(pick?.colorId).toBe("blue");
    expect(pick?.charmIds).toEqual(["stars"]);
  });
});

describe("mergeLLMDesign — validated gap-filling", () => {
  it("fills a missing color with a valid registry color", () => {
    const local = compileDesignIntent("basketball JAYDEN", { tier: 2 });
    expect(local.missing).toContain("color");

    const merged = mergeLLMDesign(
      local,
      { colorId: "purple" },
      { tier: 2 }
    );
    expect(merged.design.color?.id).toBe("purple");
    expect(merged.missing).not.toContain("color");
    expect(merged.design.charms.map((c) => c.id)).toContain("basketball");
    expect(merged.design.text).toBe("JAYDEN");
  });

  it("rejects colors outside the allowedColors pool", () => {
    const local = compileDesignIntent("I need a custom one", { tier: 2 });
    const merged = mergeLLMDesign(
      local,
      { colorId: "black" },
      { tier: 2, allowedColors: ["mint", "pink"] }
    );
    expect(merged.design.color).toBeUndefined();
    expect(merged.missing).toContain("color");
  });

  it("rejects charms outside the sports category", () => {
    const local = compileDesignIntent("a team keychain", {
      tier: 2,
      charmCategory: "sports",
    });
    const merged = mergeLLMDesign(
      local,
      { charmIds: ["hearts"] },
      { tier: 2, charmCategory: "sports" }
    );
    expect(merged.design.charms).toEqual([]);
    expect(merged.missing).toContain("charm");
  });

  it("fills at most 2 charms from the LLM list", () => {
    const local = compileDesignIntent("surprise me", { tier: 3 });
    const merged = mergeLLMDesign(
      local,
      { charmIds: ["stars", "hearts", "flowers"] },
      { tier: 3 }
    );
    expect(merged.design.charms.length).toBe(2);
  });

  it("uppercases, strips punctuation, and caps LLM text to the tier limit", () => {
    const local = compileDesignIntent("with a name on it", { tier: 2 });
    const merged = mergeLLMDesign(
      local,
      { text: "jayden" },
      { tier: 2 }
    );
    expect(merged.design.text).toBe("JAYDEN");

    const clean = mergeLLMDesign(local, { text: "JAY'DEN!" }, { tier: 2 });
    expect(clean.design.text).toBe("JAYDEN");
  });

  it("never overrides a field the local compiler already resolved", () => {
    const local = compileDesignIntent('pink basketball "JAYDEN"', { tier: 2 });
    expect(local.missing).toEqual([]);

    const merged = mergeLLMDesign(
      local,
      { colorId: "black", charmIds: ["skulls"], text: "EVIL" },
      { tier: 2 }
    );
    expect(merged.design.color?.id).toBe("pink");
    expect(merged.design.charms.map((c) => c.id)).toContain("basketball");
    expect(merged.design.text).toBe("JAYDEN");
  });

  it("recomputes confidence and trace after merging", () => {
    const local = compileDesignIntent("basketball JAYDEN", { tier: 2 });
    const before = local.confidence;
    const merged = mergeLLMDesign(
      local,
      { colorId: "purple", explanation: "inferred royal purple" },
      { tier: 2 }
    );
    expect(merged.confidence).toBeGreaterThan(before);
    expect(
      merged.trace.some((line) => line.startsWith("🧠 DEEP COMPILE"))
    ).toBe(true);
    expect(
      merged.trace.some((line) => line.startsWith("⚖️ GRILLE_GATE"))
    ).toBe(true);
  });

  it("resolves a known vibe label", () => {
    const local = compileDesignIntent("something for the beach", { tier: 2 });
    const merged = mergeLLMDesign(
      local,
      { vibeLabel: "coastal" },
      { tier: 2 }
    );
    expect(merged.design.vibeLabel).toBe("Coastal");
  });
});
