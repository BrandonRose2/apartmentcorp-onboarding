/**
 * NewHireAuth — Gate component for the New Employee portal.
 * - First visit: shows email input + passcode creation
 * - Return visit: shows passcode-only numpad
 * - On success: renders children
 * - Supports both on-screen numpad AND physical keyboard digit input
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";

const AC = {
  bg:       "oklch(0.13 0.06 258)",
  bgCard:   "oklch(0.18 0.065 258)",
  bgRaised: "oklch(0.22 0.07 258)",
  teal:     "oklch(0.72 0.12 220)",
  tealDim:  "oklch(0.58 0.14 240)",
  fg:       "oklch(0.97 0.005 220)",
  fgMuted:  "oklch(0.65 0.02 230)",
  border:   "oklch(1 0 0 / 0.09)",
  heading:  "'Cormorant Garamond', Georgia, serif",
  body:     "'Inter', 'Helvetica Neue', Arial, sans-serif",
};

type AuthStep = "checking" | "register" | "login" | "authenticated";

interface Props {
  children: React.ReactNode;
}

export function NewHireAuth({ children }: Props) {
  const [step, setStep] = useState<AuthStep>("checking");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [confirmingPasscode, setConfirmingPasscode] = useState(false);
  const [passcodeError, setPasscodeError] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [loginCode, setLoginCode] = useState("");

  const { data: session, isLoading } = trpc.newHire.checkSession.useQuery();
  const registerMutation = trpc.newHire.register.useMutation();
  const loginMutation = trpc.newHire.loginWithPasscode.useMutation();

  // Whether the email input is focused (so keyboard digits go to email, not numpad)
  const emailFocused = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (session?.registered) {
      setRegisteredEmail(session.email);
      setStep("login");
    } else {
      setStep("register");
    }
  }, [session, isLoading]);

  // ── Registration flow ──────────────────────────────────────────────────────

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setPasscode("");
    setConfirmingPasscode(false);
    setRegisteredEmail(trimmed);
  };

  const handleRegisterDigit = useCallback((digit: string) => {
    if (!confirmingPasscode) {
      setPasscode(prev => {
        if (prev.length >= 4) return prev;
        const next = prev + digit;
        if (next.length === 4) {
          setTimeout(() => setConfirmingPasscode(true), 150);
        }
        return next;
      });
    } else {
      setConfirmPasscode(prev => {
        if (prev.length >= 4) return prev;
        const next = prev + digit;
        if (next.length === 4) {
          setTimeout(() => submitRegistration(next), 150);
        }
        return next;
      });
    }
  }, [confirmingPasscode]);

  const submitRegistration = async (confirmCode: string) => {
    // Need to read passcode from state — use a ref trick via closure
    setPasscode(currentPasscode => {
      if (confirmCode !== currentPasscode) {
        setPasscodeError(true);
        setConfirmPasscode("");
        setTimeout(() => {
          setPasscodeError(false);
          setConfirmingPasscode(false);
          setPasscode("");
        }, 1500);
        return currentPasscode;
      }

      // Passcodes match — register
      registerMutation.mutateAsync({
        email: registeredEmail!,
        passcode: currentPasscode,
      }).then(result => {
        if (result.success) {
          setStep("authenticated");
        } else if (result.error === "email_taken") {
          setConfirmPasscode("");
          setPasscode("");
          setConfirmingPasscode(false);
          setStep("login");
        }
      }).catch(() => {
        setPasscodeError(true);
        setConfirmPasscode("");
        setTimeout(() => setPasscodeError(false), 1500);
      });

      return currentPasscode;
    });
  };

  // ── Login flow ─────────────────────────────────────────────────────────────

  const handleLoginDigit = useCallback((digit: string) => {
    setLoginCode(prev => {
      if (prev.length >= 4) return prev;
      const next = prev + digit;
      if (next.length === 4) {
        setTimeout(() => submitLogin(next), 120);
      }
      return next;
    });
  }, []);

  const submitLogin = async (code: string) => {
    try {
      const result = await loginMutation.mutateAsync({ passcode: code });
      if (result.success) {
        setRegisteredEmail(result.email);
        setStep("authenticated");
        setLoginCode("");
      } else {
        setPasscodeError(true);
        setLoginCode("");
        setTimeout(() => setPasscodeError(false), 1500);
      }
    } catch {
      setPasscodeError(true);
      setLoginCode("");
      setTimeout(() => setPasscodeError(false), 1500);
    }
  };

  // ── Global keyboard listener for PIN screens ───────────────────────────────

  useEffect(() => {
    const isOnPinScreen =
      (step === "register" && registeredEmail !== null) ||
      step === "login";

    if (!isOnPinScreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if email input is focused
      if (emailFocused.current) return;

      if (/^[0-9]$/.test(e.key)) {
        if (step === "login") {
          handleLoginDigit(e.key);
        } else {
          handleRegisterDigit(e.key);
        }
      } else if (e.key === "Backspace") {
        if (step === "login") {
          setLoginCode(c => c.slice(0, -1));
        } else if (confirmingPasscode) {
          setConfirmPasscode(p => p.slice(0, -1));
        } else {
          setPasscode(p => p.slice(0, -1));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, registeredEmail, confirmingPasscode, handleLoginDigit, handleRegisterDigit]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (step === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: AC.bg }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: AC.teal, borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (step === "authenticated") {
    return <>{children}</>;
  }

  const NumPad = ({ onDigit, onBackspace, currentCode, error }: {
    onDigit: (d: string) => void;
    onBackspace: () => void;
    currentCode: string;
    error: boolean;
  }) => (
    <>
      {/* Dot display */}
      <div className="flex justify-center gap-3 mb-2">
        {[0,1,2,3].map(i => (
          <div
            key={i}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all"
            style={{
              backgroundColor: error ? "oklch(0.45 0.18 25 / 0.3)" : AC.bgRaised,
              border: `2px solid ${error ? "oklch(0.65 0.2 25)" : currentCode.length > i ? AC.teal : "oklch(0.30 0.08 256)"}`,
              color: error ? "oklch(0.65 0.2 25)" : "white",
              transform: error ? "translateX(-2px)" : "none",
            }}
          >
            {currentCode.length > i ? "●" : ""}
          </div>
        ))}
      </div>

      <p className="text-center text-xs mb-4" style={{ color: error ? "oklch(0.65 0.2 25)" : "oklch(0.45 0.02 230)" }}>
        {error
          ? (step === "login" ? "Incorrect passcode — try again" : "Passcodes don't match — try again")
          : "You can also type digits on your keyboard"}
      </p>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button
            key={n}
            onClick={() => onDigit(String(n))}
            className="h-12 rounded-xl text-white font-semibold text-base transition-all active:scale-95"
            style={{ backgroundColor: AC.bgRaised, border: "1px solid oklch(0.30 0.08 256)" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(0.28 0.08 256)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = AC.bgRaised)}
          >
            {n}
          </button>
        ))}
        <button
          onClick={onBackspace}
          className="h-12 rounded-xl text-xs font-semibold transition-all active:scale-95"
          style={{ backgroundColor: AC.bgRaised, border: "1px solid oklch(0.30 0.08 256)", color: AC.fgMuted }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(0.28 0.08 256)")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = AC.bgRaised)}
        >
          ⌫
        </button>
        <button
          onClick={() => onDigit("0")}
          className="h-12 rounded-xl text-white font-semibold text-base transition-all active:scale-95"
          style={{ backgroundColor: AC.bgRaised, border: "1px solid oklch(0.30 0.08 256)" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(0.28 0.08 256)")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = AC.bgRaised)}
        >
          0
        </button>
        <div />
      </div>
    </>
  );

  // Also add keyboard support to the Brandon passcode modal in Home.tsx
  // by dispatching a custom event that Home.tsx can listen to — handled separately.

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: AC.bg, fontFamily: AC.body }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/manus-storage/AptCorpShimmer_nobg_db1667d2.gif"
            alt="ApartmentCorp"
            className="h-20 w-auto object-contain"
          />
        </div>

        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{ backgroundColor: AC.bgCard, border: `1px solid ${AC.border}` }}
        >
          {/* ── REGISTER: Email step ── */}
          {step === "register" && !registeredEmail && (
            <>
              <h2 className="text-2xl font-semibold mb-1 text-white" style={{ fontFamily: AC.heading }}>
                Welcome to ApartmentCorp
              </h2>
              <p className="text-sm mb-6" style={{ color: AC.fgMuted }}>
                Enter your company email to get started.
              </p>
              <form onSubmit={handleEmailSubmit}>
                <label className="block text-xs font-medium mb-1.5" style={{ color: AC.fgMuted }}>
                  Company Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(""); }}
                  placeholder="you@apartmentcorp.com"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none mb-1 transition-all"
                  style={{
                    backgroundColor: AC.bgRaised,
                    border: `1px solid ${emailError ? "oklch(0.65 0.2 25)" : "oklch(0.30 0.08 256)"}`,
                  }}
                  onFocus={e => {
                    emailFocused.current = true;
                    e.currentTarget.style.borderColor = AC.teal;
                  }}
                  onBlur={e => {
                    emailFocused.current = false;
                    e.currentTarget.style.borderColor = emailError ? "oklch(0.65 0.2 25)" : "oklch(0.30 0.08 256)";
                  }}
                  autoFocus
                />
                {emailError && (
                  <p className="text-xs mb-3" style={{ color: "oklch(0.65 0.2 25)" }}>{emailError}</p>
                )}
                <button
                  type="submit"
                  className="w-full mt-4 py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98]"
                  style={{ backgroundColor: AC.tealDim, border: `1px solid ${AC.teal}` }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = AC.teal)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = AC.tealDim)}
                >
                  Continue
                </button>
              </form>
            </>
          )}

          {/* ── REGISTER: Passcode creation step ── */}
          {step === "register" && registeredEmail && (
            <>
              <h2 className="text-2xl font-semibold mb-1 text-white" style={{ fontFamily: AC.heading }}>
                {confirmingPasscode ? "Confirm your passcode" : "Create a passcode"}
              </h2>
              <p className="text-sm mb-6" style={{ color: AC.fgMuted }}>
                {confirmingPasscode
                  ? "Enter the same 4-digit passcode again to confirm."
                  : "Choose a 4-digit passcode. You'll use this to log in on future visits."}
              </p>
              <NumPad
                onDigit={handleRegisterDigit}
                onBackspace={() => {
                  if (confirmingPasscode) {
                    setConfirmPasscode(p => p.slice(0, -1));
                  } else {
                    setPasscode(p => p.slice(0, -1));
                  }
                }}
                currentCode={confirmingPasscode ? confirmPasscode : passcode}
                error={passcodeError}
              />
              <button
                onClick={() => { setRegisteredEmail(null); setPasscode(""); setConfirmPasscode(""); setConfirmingPasscode(false); }}
                className="w-full text-xs py-2 rounded-lg transition-all"
                style={{ color: "oklch(0.45 0.02 230)" }}
              >
                ← Back
              </button>
            </>
          )}

          {/* ── LOGIN: Passcode-only step ── */}
          {step === "login" && (
            <>
              <h2 className="text-2xl font-semibold mb-1 text-white" style={{ fontFamily: AC.heading }}>
                Welcome back
              </h2>
              <p className="text-sm mb-6" style={{ color: AC.fgMuted }}>
                Enter your 4-digit passcode to continue.
              </p>
              <NumPad
                onDigit={handleLoginDigit}
                onBackspace={() => setLoginCode(c => c.slice(0, -1))}
                currentCode={loginCode}
                error={passcodeError}
              />
              <button
                onClick={() => { setStep("register"); setRegisteredEmail(null); setPasscode(""); setLoginCode(""); }}
                className="w-full text-xs py-2 rounded-lg transition-all"
                style={{ color: "oklch(0.45 0.02 230)" }}
              >
                Use a different email
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
