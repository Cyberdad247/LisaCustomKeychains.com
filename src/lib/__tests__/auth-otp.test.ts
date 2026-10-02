import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  generateOtpCode,
  signOtpChallenge,
  verifyOtpChallenge,
  isEmailValid,
  isEmailAuthorized,
  sendOtpEmail,
  OTP_TTL_SECONDS,
} from "../auth-otp";

describe("auth-otp", () => {
  const originalSecret = process.env.OWNER_DASHBOARD_SECRET;

  beforeEach(() => {
    process.env.OWNER_DASHBOARD_SECRET = "test-otp-secret-key-12345";
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.OWNER_DASHBOARD_SECRET;
    } else {
      process.env.OWNER_DASHBOARD_SECRET = originalSecret;
    }
    vi.restoreAllMocks();
  });

  describe("generateOtpCode", () => {
    it("generates a 6-digit numeric string", () => {
      const code = generateOtpCode();
      expect(code).toMatch(/^\d{6}$/);
      const num = parseInt(code, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThan(1000000);
    });
  });

  describe("signOtpChallenge & verifyOtpChallenge", () => {
    const testEmail = "lisa@lisascustomkeychains.com";
    const testCode = "482910";

    it("verifies a valid challenge token", () => {
      const token = signOtpChallenge(testEmail, testCode);
      const result = verifyOtpChallenge(token, testEmail, testCode);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("verifies case-insensitively for email", () => {
      const token = signOtpChallenge("LISA@lisascustomkeychains.com", testCode);
      const result = verifyOtpChallenge(token, "lisa@lisascustomkeychains.com", testCode);
      expect(result.valid).toBe(true);
    });

    it("rejects an incorrect verification code", () => {
      const token = signOtpChallenge(testEmail, testCode);
      const result = verifyOtpChallenge(token, testEmail, "999999");
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/incorrect/i);
    });

    it("rejects a different email", () => {
      const token = signOtpChallenge(testEmail, testCode);
      const result = verifyOtpChallenge(token, "intruder@domain.com", testCode);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/email does not match/i);
    });

    it("rejects undefined or missing token", () => {
      const result = verifyOtpChallenge(undefined, testEmail, testCode);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/no active verification challenge/i);
    });

    it("rejects malformed token", () => {
      const result = verifyOtpChallenge("invalid-token-without-dot", testEmail, testCode);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/malformed/i);
    });

    it("rejects a tampered signature", () => {
      const token = signOtpChallenge(testEmail, testCode);
      const [payload] = token.split(".");
      const result = verifyOtpChallenge(`${payload}.deadbeef0102030405060708090a0b0c0d0e0f`, testEmail, testCode);
      expect(result.valid).toBe(false);
    });

    it("rejects an expired token", () => {
      const expiredPayload = Buffer.from(
        JSON.stringify({
          email: testEmail,
          expiresAt: Date.now() - 5000,
        }),
      ).toString("base64url");

      const token = `${expiredPayload}.dummy_sig`;
      const result = verifyOtpChallenge(token, testEmail, testCode);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/expired/i);
    });
  });

  describe("isEmailValid", () => {
    it("accepts valid email addresses", () => {
      expect(isEmailValid("lisa@lisascustomkeychains.com")).toBe(true);
      expect(isEmailValid("vizion711@gmail.com")).toBe(true);
      expect(isEmailValid("cyberdad247@gmail.com")).toBe(true);
    });

    it("rejects invalid emails", () => {
      expect(isEmailValid("not-an-email")).toBe(false);
      expect(isEmailValid("missing@dot")).toBe(false);
      expect(isEmailValid("")).toBe(false);
    });
  });

  describe("isEmailAuthorized", () => {
    it("allows valid emails by default when whitelist is not strict", () => {
      delete process.env.STRICT_EMAIL_WHITELIST;
      expect(isEmailAuthorized("anyone@example.com")).toBe(true);
    });

    it("restricts to whitelist when STRICT_EMAIL_WHITELIST=true", () => {
      process.env.STRICT_EMAIL_WHITELIST = "true";
      process.env.AUTHORIZED_EMAILS = "custom@example.com";

      expect(isEmailAuthorized("custom@example.com")).toBe(true);
      expect(isEmailAuthorized("cyberdad247@gmail.com")).toBe(true);
      expect(isEmailAuthorized("random@unauthorized.com")).toBe(false);

      delete process.env.STRICT_EMAIL_WHITELIST;
      delete process.env.AUTHORIZED_EMAILS;
    });
  });

  describe("sendOtpEmail", () => {
    it("simulates email delivery when no external provider is set", async () => {
      delete process.env.RESEND_API_KEY;
      delete process.env.SENDGRID_API_KEY;

      const res = await sendOtpEmail("test@example.com", "123456");
      expect(res.success).toBe(true);
      expect(res.simulated).toBe(true);
      expect(res.code).toBe("123456");
    });
  });
});
