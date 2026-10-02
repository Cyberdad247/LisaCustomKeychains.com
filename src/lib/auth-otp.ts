import { createHmac, randomInt, timingSafeEqual } from "crypto";

export const OTP_TTL_SECONDS = 60 * 10; // 10 minutes

export function getAuthSecret(): string {
  const secret =
    process.env.OWNER_DASHBOARD_SECRET || process.env.OWNER_DASHBOARD_PASSWORD;
  if (!secret) {
    // Fail closed: never sign OTP challenges with a guessable fallback.
    // Set OWNER_DASHBOARD_SECRET (or OWNER_DASHBOARD_PASSWORD) in the environment.
    throw new Error(
      "[auth-otp] OWNER_DASHBOARD_SECRET is not configured. Refusing to issue OTP challenges.",
    );
  }
  return secret;
}

export function generateOtpCode(): string {
  return randomInt(100000, 1000000).toString();
}

export interface OtpChallengePayload {
  email: string;
  expiresAt: number;
}

// In-memory fallback cache for fast multi-check within the server runtime
const memoryOtpCache = new Map<string, { code: string; expiresAt: number }>();

export function signOtpChallenge(email: string, code: string): string {
  const secret = getAuthSecret();
  const normalizedEmail = email.trim().toLowerCase();
  const expiresAt = Date.now() + OTP_TTL_SECONDS * 1000;
  
  // Store in memory cache
  memoryOtpCache.set(normalizedEmail, { code, expiresAt });

  const payload: OtpChallengePayload = { email: normalizedEmail, expiresAt };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  
  const signature = createHmac("sha256", secret)
    .update(`lisa-otp:${payloadB64}:${code}`)
    .digest("hex");

  return `${payloadB64}.${signature}`;
}

export function verifyOtpChallenge(
  token: string | undefined,
  inputEmail: string,
  inputCode: string,
): { valid: boolean; error?: string } {
  const normalizedEmail = inputEmail.trim().toLowerCase();
  const cleanCode = inputCode.trim();

  if (!cleanCode || cleanCode.length < 6) {
    return { valid: false, error: "Please enter a valid 6-digit verification code." };
  }

  // 1. Validate stateless signed token (crucial for multi-container/serverless environments)
  if (!token) {
    return { valid: false, error: "No active verification challenge found. Please request a new code." };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Malformed verification challenge. Please request a new code." };
  }

  const [payloadB64, signature] = parts;

  let payload: OtpChallengePayload;
  try {
    const jsonStr = Buffer.from(payloadB64, "base64url").toString("utf8");
    payload = JSON.parse(jsonStr);
  } catch {
    return { valid: false, error: "Invalid verification session data." };
  }

  if (Date.now() > payload.expiresAt) {
    return { valid: false, error: "Verification code has expired. Please request a new one." };
  }

  if (payload.email !== normalizedEmail) {
    return { valid: false, error: "Submitted email does not match the verification session." };
  }

  const secret = getAuthSecret();
  const expectedSig = createHmac("sha256", secret)
    .update(`lisa-otp:${payloadB64}:${cleanCode}`)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expectedSig, "hex");

  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return { valid: false, error: "Incorrect verification code. Please check and try again." };
  }

  // Clean memory cache if it was there
  memoryOtpCache.delete(normalizedEmail);
  return { valid: true };
}

export function isEmailValid(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function isEmailAuthorized(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!isEmailValid(normalized)) return false;

  const strictWhitelist = process.env.STRICT_EMAIL_WHITELIST === "true";
  if (!strictWhitelist) {
    // Permissive by default so owner/Lisa is never locked out
    return true;
  }

  const allowedList = [
    "cyberdad247@gmail.com",
    "lisascustomkeychains@gmail.com",
    "lisa@lisascustomkeychains.com",
    "vizion711@gmail.com",
    "admin@lisascustomkeychains.com",
    ...(process.env.AUTHORIZED_EMAILS?.split(",") || []).map((e) => e.trim().toLowerCase()),
    process.env.OWNER_EMAIL?.trim().toLowerCase(),
  ].filter(Boolean);

  return allowedList.includes(normalized);
}

export interface SendOtpResult {
  success: boolean;
  simulated: boolean;
  code?: string;
  message: string;
}

export async function sendOtpEmail(email: string, code: string): Promise<SendOtpResult> {
  const normalizedEmail = email.trim().toLowerCase();
  
  // 1. Resend API
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const fromAddr = process.env.EMAIL_FROM || "Lisa Custom Keychains <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddr,
          to: normalizedEmail,
          subject: `Your Lisa Custom Keychains verification code`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #7c3aed; background: #f5f3ff; padding: 6px 14px; border-radius: 9999px;">
                  Lisa Custom Keychains
                </span>
                <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 16px 0 8px;">Editor Security Code</h1>
                <p style="font-size: 14px; color: #64748b; margin: 0;">Use the code below to access the Boutique Command Center & Editor.</p>
              </div>

              <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 2px dashed #c084fc; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #581c87; font-family: monospace; display: block;">
                  ${code}
                </span>
                <span style="display: block; font-size: 12px; color: #7e22ce; margin-top: 8px; font-weight: 600;">
                  Valid for 10 minutes
                </span>
              </div>

              <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 24px 0 0;">
                If you did not request this code, no action is needed. Your session remains secure.
              </p>
            </div>
          `,
        }),
      });

      if (res.ok) {
        return {
          success: true,
          simulated: false,
          message: `Verification code sent to ${normalizedEmail}. Check your inbox.`,
        };
      }
      console.error("[auth-otp] Resend API error response:", await res.text());
    } catch (err) {
      console.error("[auth-otp] Resend API exception:", err);
    }
  }

  // 2. SendGrid API
  const sendgridKey = process.env.SENDGRID_API_KEY;
  if (sendgridKey) {
    try {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: normalizedEmail }] }],
          from: {
            email: process.env.EMAIL_FROM || "orders@lisascustomkeychains.com",
            name: "Lisa Custom Keychains",
          },
          subject: `Your Lisa Custom Keychains verification code`,
          content: [
            {
              type: "text/html",
              value: `<p>Your single-use verification code for Lisa Custom Keychains Editor is: <strong>${code}</strong> (Expires in 10 minutes).</p>`,
            },
          ],
        }),
      });

      if (res.ok || res.status === 202) {
        return {
          success: true,
          simulated: false,
          message: `Verification code sent to ${normalizedEmail}. Check your inbox.`,
        };
      }
      console.error("[auth-otp] SendGrid API error response:", await res.text());
    } catch (err) {
      console.error("[auth-otp] SendGrid API exception:", err);
    }
  }

  // 3. No email provider configured.
  // In production this FAILS CLOSED: returning the live code to the browser
  // would let anyone self-serve owner access ("Sandbox Mode" bypass).
  // The simulated fallback below is strictly for local development.
  if (process.env.NODE_ENV === "production") {
    console.error(
      "[auth-otp] No email provider configured (RESEND_API_KEY / SENDGRID_API_KEY). Refusing to issue OTP in production.",
    );
    return {
      success: false,
      simulated: false,
      message:
        "Email sending is not configured on this server. Use password login instead, or ask the administrator to configure an email provider.",
    };
  }

  console.log(`\n==================================================`);
  console.log(`[LISA-AUTH-OTP] SINGLE-USE CODE FOR: ${normalizedEmail} (dev sandbox)`);
  console.log(`[LISA-AUTH-OTP] CODE: ${code}`);
  console.log(`==================================================\n`);

  return {
    success: true,
    simulated: true,
    code,
    message: `Verification code dispatched for ${normalizedEmail} (dev sandbox)`,
  };
}
