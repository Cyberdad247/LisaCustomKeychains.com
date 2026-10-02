import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  ownerPasswordConfigured,
  verifyOwnerPassword,
  createOwnerSession,
  isOwnerSessionValid,
  OWNER_SESSION_TTL_SECONDS,
} from "../storefront-config";

describe("Owner Authentication Engine", () => {
  const originalPassword = process.env.OWNER_DASHBOARD_PASSWORD;
  const originalSecret = process.env.OWNER_DASHBOARD_SECRET;

  beforeEach(() => {
    process.env.OWNER_DASHBOARD_PASSWORD = "super-secret-owner-password";
    process.env.OWNER_DASHBOARD_SECRET = "super-secret-session-signing-key";
  });

  afterEach(() => {
    if (originalPassword === undefined) delete process.env.OWNER_DASHBOARD_PASSWORD;
    else process.env.OWNER_DASHBOARD_PASSWORD = originalPassword;

    if (originalSecret === undefined) delete process.env.OWNER_DASHBOARD_SECRET;
    else process.env.OWNER_DASHBOARD_SECRET = originalSecret;
  });

  it("identifies when password is configured", () => {
    expect(ownerPasswordConfigured()).toBe(true);
    delete process.env.OWNER_DASHBOARD_PASSWORD;
    expect(ownerPasswordConfigured()).toBe(false);
  });

  it("verifies matching password correctly", () => {
    expect(verifyOwnerPassword("super-secret-owner-password")).toBe(true);
  });

  it("verifies matching password with accidental whitespace", () => {
    expect(verifyOwnerPassword("  super-secret-owner-password  ")).toBe(true);
  });

  it("rejects non-matching password", () => {
    expect(verifyOwnerPassword("wrong-password")).toBe(false);
  });

  it("fails closed when password is not set", () => {
    delete process.env.OWNER_DASHBOARD_PASSWORD;
    expect(verifyOwnerPassword("super-secret-owner-password")).toBe(false);
  });

  it("mints an HMAC session token that validates successfully", () => {
    const sessionToken = createOwnerSession();
    expect(sessionToken).toContain(".");
    expect(isOwnerSessionValid(sessionToken)).toBe(true);
  });

  it("rejects tampered or forged session token", () => {
    const sessionToken = createOwnerSession();
    const [payload, sig] = sessionToken.split(".");
    // Tamper with payload
    const tampered = `${payload}00.${sig}`;
    expect(isOwnerSessionValid(tampered)).toBe(false);
    // Tamper with signature
    expect(isOwnerSessionValid(`${payload}.forged_signature_123`)).toBe(false);
  });

  it("enforces 8-hour session lifetime", () => {
    expect(OWNER_SESSION_TTL_SECONDS).toBe(28800);
  });
});
