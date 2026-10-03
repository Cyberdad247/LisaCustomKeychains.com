import { describe, it, expect } from "vitest";
import {
  SIR_BOB_VMAX_BASELINE_OCEAN,
  modulateOceanMatrix,
  validateBudgetGuard,
  optimizeBatchProduction,
  buildSirBobOwnerSystemPrompt,
  buildSirBobCustomerSystemPrompt,
} from "../sir-bob";

describe("Sir BoB vMAX Reforged Architecture", () => {
  it("maintains verified baseline OCEAN parameters", () => {
    expect(SIR_BOB_VMAX_BASELINE_OCEAN.openness).toBe(0.9);
    expect(SIR_BOB_VMAX_BASELINE_OCEAN.conscientiousness).toBe(2.5);
    expect(SIR_BOB_VMAX_BASELINE_OCEAN.extraversion).toBe(1.8);
    expect(SIR_BOB_VMAX_BASELINE_OCEAN.agreeableness).toBe(2.85);
    expect(SIR_BOB_VMAX_BASELINE_OCEAN.neuroticism).toBe(-1.8);
    expect(SIR_BOB_VMAX_BASELINE_OCEAN.theta).toBe("Artisanal_Empathy_Executive");
  });

  describe("Dynamic Empathy Modulation (E_s)", () => {
    it("modulates empathy and agreeableness when memorial keywords appear", () => {
      const messages = [
        { role: "user", content: "I want a custom memorial keychain in memory of my grandmother." },
      ];
      const state = modulateOceanMatrix(messages);

      expect(state.isMemorial).toBe(true);
      expect(state.score).toBeGreaterThan(1.0);
      expect(state.activeOcean.agreeableness).toBe(3.0); // Capped at 3.0
      expect(state.activeOcean.extraversion).toBe(1.2); // Reverent warmth
    });

    it("increases conscientiousness for custom name spellings to protect precision", () => {
      const messages = [
        { role: "user", content: "Can you make sure the letters and spelling of the name are correct?" },
      ];
      const state = modulateOceanMatrix(messages);

      expect(state.isCustomName).toBe(true);
      expect(state.activeOcean.conscientiousness).toBe(2.8);
    });

    it("handles customer frustration with antifragile de-escalation", () => {
      const messages = [
        { role: "user", content: "I am very upset, my keychain arrived broken and damaged!" },
      ];
      const state = modulateOceanMatrix(messages);

      expect(state.isFrustration).toBe(true);
      expect(state.activeOcean.neuroticism).toBe(-2.0);
      expect(state.activeOcean.agreeableness).toBe(3.0);
    });

    it("modulates extraversion and openness for B2B wholesale and Cleveland Bazaar", () => {
      const messages = [
        { role: "user", content: "We are preparing a 50 units bulk corporate order for the Cleveland Bazaar." },
      ];
      const state = modulateOceanMatrix(messages);

      expect(state.isCorporate).toBe(true);
      expect(state.activeOcean.extraversion).toBe(2.2);
      expect(state.activeOcean.openness).toBe(1.2);
    });
  });

  describe("15% Budget Guard Rule", () => {
    it("permits spend within 15% variance", () => {
      const baseline = 1000;
      const spend = 1100; // 10% variance
      const result = validateBudgetGuard(spend, baseline);

      expect(result.allowed).toBe(true);
      expect(result.requiresHitl).toBe(false);
      expect(result.variancePercent).toBe(10);
    });

    it("requires Human-In-The-Loop approval when spend exceeds 15% variance", () => {
      const baseline = 1000;
      const spend = 1250; // 25% variance
      const result = validateBudgetGuard(spend, baseline);

      expect(result.allowed).toBe(false);
      expect(result.requiresHitl).toBe(true);
      expect(result.variancePercent).toBe(25);
      expect(result.reason).toContain("exceeds the strict 15% guardrail");
    });

    it("protects zero baseline budgets", () => {
      const result = validateBudgetGuard(50, 0);
      expect(result.allowed).toBe(false);
      expect(result.requiresHitl).toBe(true);
    });
  });

  describe("Master-Chef Batch Production", () => {
    it("groups items by weave type and thread color to eliminate hand fatigue", () => {
      const items = [
        { id: "1", type: "keychain", color: "purple" },
        { id: "2", type: "keychain", color: "pink" },
        { id: "3", type: "keychain", color: "purple" },
        { id: "4", type: "wristlet", color: "purple" },
      ];
      const batches = optimizeBatchProduction(items);

      expect(batches["keychain::purple"]).toHaveLength(2);
      expect(batches["keychain::pink"]).toHaveLength(1);
      expect(batches["wristlet::purple"]).toHaveLength(1);
    });
  });

  describe("System Prompt Generation", () => {
    it("generates owner prompt containing vMAX directives and zero emoji law", () => {
      const prompt = buildSirBobOwnerSystemPrompt();
      expect(prompt).toContain("Sir BoB (Knight in Shining Armor & Account Manager / Chief Growth Officer");
      expect(prompt).toContain("NO EMOJI");
      expect(prompt).toContain("15% BUDGET GUARD");
      expect(prompt).toContain("MASTER-CHEF BATCH PRODUCTION");
      expect(prompt).toContain("$10,000 monthly targets without hand fatigue");
    });

    it("generates customer prompt with courteous knight persona and zero emoji rule", () => {
      const prompt = buildSirBobCustomerSystemPrompt();
      expect(prompt).toContain("NEVER use emojis");
      expect(prompt).toContain("Queen Lisa handcrafts every single woven keychain");
    });
  });
});
