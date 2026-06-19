import { describe, it, expect } from "vitest";

import {
  applyAndValidate,
  computeChanges,
  deepMerge,
  parseProposal,
} from "../config-agent";
import { defaultStorefrontConfig } from "../storefront-config";

describe("deepMerge", () => {
  it("merges nested objects without dropping siblings", () => {
    const base = { hero: { a: "1", b: "2" }, x: "keep" };
    const out = deepMerge(base, { hero: { b: "changed" } });
    expect(out).toEqual({ hero: { a: "1", b: "changed" }, x: "keep" });
  });

  it("replaces arrays wholesale rather than merging by index", () => {
    const base = { list: [{ id: "a" }, { id: "b" }] };
    const out = deepMerge(base, { list: [{ id: "z" }] });
    expect(out.list).toEqual([{ id: "z" }]);
  });

  it("does not mutate the base object", () => {
    const base = { hero: { a: "1" } };
    deepMerge(base, { hero: { a: "2" } });
    expect(base.hero.a).toBe("1");
  });
});

describe("computeChanges", () => {
  it("returns no changes for identical configs", () => {
    expect(computeChanges(defaultStorefrontConfig, defaultStorefrontConfig)).toEqual([]);
  });

  it("reports a single leaf change with before/after", () => {
    const after = { ...defaultStorefrontConfig, announcement: "New summer drop" };
    const changes = computeChanges(defaultStorefrontConfig, after);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({
      path: "announcement",
      before: defaultStorefrontConfig.announcement,
      after: "New summer drop",
    });
  });
});

describe("parseProposal", () => {
  it("parses a bare JSON object", () => {
    const p = parseProposal('{"reply":"ok","patch":{"announcement":"hi"}}');
    expect(p.reply).toBe("ok");
    expect(p.patch).toEqual({ announcement: "hi" });
  });

  it("parses JSON wrapped in a ```json fence with prose", () => {
    const raw = 'Sure!\n```json\n{"reply":"done","patch":null}\n```\nHope that helps';
    const p = parseProposal(raw);
    expect(p.reply).toBe("done");
    expect(p.patch).toBeNull();
  });

  it("coerces a non-object patch to null", () => {
    const p = parseProposal('{"reply":"x","patch":"not-an-object"}');
    expect(p.patch).toBeNull();
  });

  it("throws when there is no JSON object", () => {
    expect(() => parseProposal("no json here")).toThrow();
  });
});

describe("applyAndValidate (containment)", () => {
  it("accepts a valid in-schema change and lists it", () => {
    const result = applyAndValidate(defaultStorefrontConfig, {
      announcement: "Custom orders open now",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.announcement).toBe("Custom orders open now");
      expect(result.changes).toHaveLength(1);
    }
  });

  it("rejects an invalid brand accent (not hex) — cannot escape the schema", () => {
    const result = applyAndValidate(defaultStorefrontConfig, {
      brand: { accent: "hot-pink" },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join()).toMatch(/brand\.accent/);
  });

  it("rejects an over-long announcement", () => {
    const result = applyAndValidate(defaultStorefrontConfig, {
      announcement: "x".repeat(200),
    });
    expect(result.ok).toBe(false);
  });

  it("treats a null patch as a no-op", () => {
    const result = applyAndValidate(defaultStorefrontConfig, null);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.changes).toEqual([]);
  });

  it("ignores unknown top-level keys (schema strips them, no escape)", () => {
    const result = applyAndValidate(defaultStorefrontConfig, {
      maliciousScript: "<script>alert(1)</script>",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect("maliciousScript" in result.config).toBe(false);
      expect(result.changes).toEqual([]);
    }
  });
});
