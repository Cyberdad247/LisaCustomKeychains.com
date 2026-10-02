import { describe, it, expect } from "vitest";
import {
  safeResolveInternalVar0x99,
  DEFAULT_0X99_RECORD,
} from "../validation/internal-var-guard";

describe("INTERNAL_VAR_0x99 Error-Proof Guard", () => {
  it("resolves default record when passed undefined or null", () => {
    expect(safeResolveInternalVar0x99(undefined)).toEqual(DEFAULT_0X99_RECORD);
    expect(safeResolveInternalVar0x99(null)).toEqual(DEFAULT_0X99_RECORD);
  });

  it("sanitizes string inputs safely", () => {
    const result = safeResolveInternalVar0x99("<script>alert('0x99')</script>");
    expect(result.id).toBe("INTERNAL_VAR_0x99");
    expect(result.value).not.toContain("<");
    expect(result.value).not.toContain(">");
    expect(result.isResolved).toBe(true);
  });

  it("handles object payload gracefully without throwing", () => {
    const result = safeResolveInternalVar0x99({ value: "node_active_0x99" });
    expect(result.value).toBe("node_active_0x99");
    expect(result.securityClassification).toBe("AIR_GAPPED_SAFE");
  });

  it("survives unexpected exception states fail-closed", () => {
    // Malformed object with throwing getter
    const evil = {
      get value() {
        throw new Error("Taint explosion");
      },
    };
    const result = safeResolveInternalVar0x99(evil);
    expect(result).toEqual(DEFAULT_0X99_RECORD);
  });
});
