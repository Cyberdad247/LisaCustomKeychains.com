"use client";

import React, { useState, useTransition } from "react";
import {
  KeyRound,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  loginOwnerPasswordAction,
  requestOtpAction,
  verifyOtpAction,
} from "@/app/client-editor/actions";

interface EditorAuthPortalProps {
  redirectUrl?: string;
  defaultEmail?: string;
}

export default function EditorAuthPortal({
  redirectUrl = "/editor",
  defaultEmail = "",
}: EditorAuthPortalProps) {
  const [authMethod, setAuthMethod] = useState<"password" | "otp">("password");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePasswordLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password) {
      setError("Please enter the owner password.");
      return;
    }

    setError(null);
    setNotice(null);

    startTransition(async () => {
      try {
        const res = await loginOwnerPasswordAction(password);
        if (!res.ok) {
          setError(res.error || "Incorrect owner password. Check capitalization and retry.");
          return;
        }

        // Successfully authenticated! Redirect directly to destination
        window.location.href = redirectUrl;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Authentication failed. Please retry.");
      }
    });
  };

  const handleSendCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setNotice(null);

    startTransition(async () => {
      try {
        const res = await requestOtpAction(email);
        if (!res.ok) {
          setError(res.error || "Failed to dispatch verification code.");
          return;
        }

        if (res.simulated && res.code) {
          setSimulatedCode(res.code);
          setNotice("Verification code generated. (Sandbox Mode)");
        } else {
          setNotice(`Verification code sent to ${email.trim()}`);
        }

        setStep("code");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
    });
  };

  const handleVerifyCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code || code.trim().length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const res = await verifyOtpAction(email, code.trim());
        if (!res.ok) {
          setError(res.error || "The code entered is invalid or expired.");
          return;
        }

        // Successfully authenticated! Redirect to target
        window.location.href = redirectUrl;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Verification failed. Please retry.");
      }
    });
  };

  const handleAutoFillCode = () => {
    if (simulatedCode) {
      setCode(simulatedCode);
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Boutique Header */}
        <div className="bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 p-8 text-white relative">
          <div className="flex items-center space-x-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-200">
              Sovereign Command Center
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-300" />
            Lisa Storefront Editor
          </h1>

          <p className="text-xs text-purple-200 mt-2 font-medium leading-relaxed">
            Direct authenticated access to Lisa&apos;s Content Calendar, AI Cockpit, Ad
            Gallery, and Storefront Controls.
          </p>

          <div className="absolute top-4 right-4 opacity-15">
            <Lock className="w-20 h-20 text-white" />
          </div>
        </div>

        {/* Auth Method Selector */}
        <div className="flex border-b border-stone-200 bg-stone-100/70 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setAuthMethod("password");
              setError(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              authMethod === "password"
                ? "bg-white text-purple-950 shadow-sm border border-stone-200"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Master Password</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod("otp");
              setError(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              authMethod === "otp"
                ? "bg-white text-purple-950 shadow-sm border border-stone-200"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Access Code</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-semibold animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {notice && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-950 text-xs font-semibold animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div className="leading-snug">{notice}</div>
            </div>
          )}

          {authMethod === "password" ? (
            /* Method 1: Password Login */
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.15em] text-slate-700 mb-2">
                  Owner Dashboard Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter owner password..."
                    autoFocus
                    autoComplete="current-password"
                    className="w-full pl-11 pr-11 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-600 transition"
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Direct master authorization configured via <code className="font-mono text-purple-800 bg-purple-50 px-1 py-0.5 rounded">OWNER_DASHBOARD_PASSWORD</code>.
                </p>
              </div>

              <button
                type="submit"
                disabled={isPending || !password}
                className="w-full py-3.5 px-6 bg-slate-950 hover:bg-purple-800 text-white rounded-xl text-xs font-black uppercase tracking-[0.16em] flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authorizing Session...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Sovereign Editor</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Method 2: Email OTP Login */
            <>
              {simulatedCode && step === "code" && (
                <div className="mb-6 p-4 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Sandbox Access Code:</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillCode}
                      className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline"
                    >
                      Auto-fill Code
                    </button>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="font-mono text-2xl font-black tracking-widest text-purple-950 select-all">
                      {simulatedCode}
                    </span>
                  </div>
                </div>
              )}

              {step === "email" ? (
                <form onSubmit={handleSendCode} className="space-y-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-[0.15em] text-slate-700 mb-2">
                      Authorized Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="lisa@lisascustomkeychains.com"
                        autoFocus
                        className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-600 transition"
                      />
                      <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      We will transmit a single-use 6-digit access code directly to your email.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3.5 px-6 bg-slate-950 hover:bg-purple-800 text-white rounded-xl text-xs font-black uppercase tracking-[0.16em] flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Transmitting Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Access Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-700">
                        6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setStep("email");
                          setError(null);
                          setSimulatedCode(null);
                        }}
                        className="text-[11px] font-semibold text-purple-700 hover:text-purple-900"
                      >
                        Change Email
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        required
                        value={code}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setCode(val);
                          if (val.length === 6) {
                            setError(null);
                          }
                        }}
                        placeholder="000000"
                        autoFocus
                        className="w-full py-4 text-center font-mono text-3xl font-black tracking-[0.4em] bg-stone-50 border border-stone-200 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-600 transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 text-center">
                      Sent to <span className="font-semibold text-slate-800">{email}</span>. Valid for 10 minutes.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending || code.length < 6}
                    className="w-full py-3.5 px-6 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black uppercase tracking-[0.16em] flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Verify & Enter Editor</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleSendCode()}
                      className="text-xs font-semibold text-slate-500 hover:text-purple-700 transition"
                    >
                      Didn&apos;t receive code? Resend
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-slate-400">
            <a href="/" className="hover:text-purple-700 transition">
              ← Return to Boutique
            </a>
            <span className="text-[10px] tracking-wider uppercase font-mono">
              v10001 Sovereign Auth
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
