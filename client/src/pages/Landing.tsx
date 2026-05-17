/**
 * ApartmentCorp — Portal Landing Page
 * Brand: Dark navy oklch(0.13 0.06 258), teal accent oklch(0.72 0.12 220)
 * Typography: Cormorant Garamond (headings) + Inter (body)
 * Logo: /manus-storage/ac-logo_324ddb7c.webp (white version via CSS filter)
 */

import { motion } from "framer-motion";
import { ChevronRight, ClipboardList, UserCheck } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

// Brand constants
const AC = {
  bg:       "oklch(0.13 0.06 258)",
  bgCard:   "oklch(0.18 0.065 258)",
  bgRaised: "oklch(0.22 0.07 258)",
  nav:      "oklch(0.10 0.06 258 / 0.95)",
  teal:     "oklch(0.72 0.12 220)",
  tealDim:  "oklch(0.58 0.14 240)",
  fg:       "oklch(0.97 0.005 220)",
  fgMuted:  "oklch(0.65 0.02 230)",
  border:   "oklch(1 0 0 / 0.09)",
  borderStrong: "oklch(1 0 0 / 0.15)",
  heading: "'Cormorant Garamond', Georgia, serif",
  body:    "'Inter', 'Helvetica Neue', Arial, sans-serif",
};

export default function Landing() {
  const [, navigate] = useLocation();
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [adminError, setAdminError] = useState(false);

  const handleAdminDigit = (digit: string) => {
    if (adminCode.length < 4) {
      const next = adminCode + digit;
      setAdminCode(next);
      if (next.length === 4) {
        setTimeout(() => checkAdminCode(next), 120);
      }
    }
  };

  const checkAdminCode = (code?: string) => {
    const check = code ?? adminCode;
    if (check === "3060") {
      setShowAdminPasscode(false);
      setAdminCode("");
      setAdminError(false);
      navigate("/admin");
    } else {
      setAdminError(true);
      setAdminCode("");
      setTimeout(() => setAdminError(false), 1500);
    }
  };

  // Keyboard support for admin passcode modal
  useEffect(() => {
    if (!showAdminPasscode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleAdminDigit(e.key);
      } else if (e.key === "Backspace") {
        setAdminCode(c => c.slice(0, -1));
      } else if (e.key === "Escape") {
        setShowAdminPasscode(false);
        setAdminCode("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAdminPasscode, adminCode]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: AC.bg, fontFamily: AC.body, color: AC.fg }}>
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: AC.nav, borderColor: AC.border, backdropFilter: "blur(12px)", overflow: "visible" }}>
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between" style={{ height: "80px" }}>
          <a
            href="https://apartmentcorp.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center transition-opacity hover:opacity-80"
            title="Visit ApartmentCorp.com"
          >
          <img
            src="/manus-storage/AptCorpShimmer_nobg_db1667d2.gif"
            alt="ApartmentCorp"
            className="h-10 w-auto object-contain"
            style={{ maxWidth: "180px" }}
          />
          </a>
          <a
            href="https://propertymax.ai/app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center transition-opacity hover:opacity-80"
            title="Open PropertyMAX.ai"
          >
            <img
              src="/manus-storage/PropertyMaxShimmer_5e119ab3_5fd51363.gif"
              alt="PropertyMAX.ai"
              className="object-contain flex-shrink-0"
              style={{ width: "90px", height: "90px", objectFit: "contain" }}
            />
          </a>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(160deg, oklch(0.10 0.06 258) 0%, oklch(0.16 0.08 250) 100%)` }}>
        {/* Subtle diamond grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 0L40 20L20 40L0 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px"
        }} />

        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Animated Logo */}
            <div className="flex justify-center mb-8">
              <a
                href="https://apartmentcorp.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
                title="Visit ApartmentCorp.com"
              >
                <img
                  src="/manus-storage/AptCorpShimmer_nobg_db1667d2.gif"
                  alt="ApartmentCorp"
                  className="h-28 w-auto object-contain"
                  style={{ maxWidth: "380px" }}
                />
              </a>
            </div>
            <h1
              className="text-5xl sm:text-6xl font-semibold mb-4 leading-tight"
              style={{ fontFamily: AC.heading, color: AC.fg }}
            >
              Welcome to <em style={{ color: AC.teal, fontStyle: "italic" }}>ApartmentCorp</em>
            </h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: AC.fgMuted }}>
              Building great communities together — starting with a great first day.
            </p>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-12"
          style={{ background: `linear-gradient(to bottom, transparent, ${AC.bg})` }} />
      </div>

      {/* Portal Cards */}
      <div className="flex-1 max-w-4xl mx-auto px-6 py-14 w-full">
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-center text-xs font-semibold uppercase tracking-[0.2em] mb-10"
          style={{ color: AC.fgMuted }}
        >
          Select your portal
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* New Employee */}
          <motion.button
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => navigate("/onboarding")}
            className="group text-left rounded-2xl p-8 transition-all hover:shadow-2xl active:scale-[0.98]"
            style={{
              backgroundColor: AC.bgCard,
              border: `1px solid ${AC.border}`,
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = AC.teal + "55")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = AC.border)}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all group-hover:scale-110"
              style={{ backgroundColor: AC.teal + "18", border: `1px solid ${AC.teal}33` }}
            >
              <UserCheck className="w-6 h-6" style={{ color: AC.teal }} />
            </div>
            <h2
              className="text-2xl font-semibold mb-2"
              style={{ fontFamily: AC.heading, color: AC.fg }}
            >
              New Employee
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: AC.fgMuted }}>
              Complete your onboarding paperwork, review company policies, and get set up for your first day — all in one welcoming place.
            </p>
            <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color: AC.teal }}>
              Start my onboarding
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.button>

          {/* HR Admin */}
          <motion.button
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => { setShowAdminPasscode(true); setAdminCode(""); setAdminError(false); }}
            className="group text-left rounded-2xl p-8 transition-all hover:shadow-2xl active:scale-[0.98]"
            style={{
              backgroundColor: AC.bgCard,
              border: `1px solid ${AC.border}`,
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = AC.borderStrong)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = AC.border)}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all group-hover:scale-110"
              style={{ backgroundColor: "oklch(1 0 0 / 0.06)", border: `1px solid ${AC.borderStrong}` }}
            >
              <ClipboardList className="w-6 h-6" style={{ color: AC.fgMuted }} />
            </div>
            <h2
              className="text-2xl font-semibold mb-2"
              style={{ fontFamily: AC.heading, color: AC.fg }}
            >
              HR Admin Dashboard
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: AC.fgMuted }}>
              Manage onboarding checklists, track new hire progress, access document hubs, and view company platform logins.
            </p>
            <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color: AC.fgMuted }}>
              Open admin dashboard
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.button>
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-center text-xs mt-12"
          style={{ color: "oklch(0.45 0.02 230)" }}
        >
          Questions? Contact HR at{" "}
          <a href="mailto:hr@apartmentcorp.com" style={{ color: AC.teal }} className="hover:underline">
            hr@apartmentcorp.com
          </a>
        </motion.p>
      </div>

      {/* Admin Passcode Modal */}
      {showAdminPasscode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "oklch(0 0 0 / 0.65)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowAdminPasscode(false); setAdminCode(""); } }}
        >
          <div
            className="rounded-2xl p-8 w-80 shadow-2xl"
            style={{ backgroundColor: "oklch(0.15 0.06 258)", border: "1px solid oklch(0.28 0.08 256)" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "oklch(0.22 0.07 258)", border: "1px solid oklch(0.30 0.08 256)" }}
              >
                <ClipboardList className="w-5 h-5" style={{ color: AC.fgMuted }} />
              </div>
              <div>
                <div className="text-white font-semibold text-sm" style={{ fontFamily: AC.heading }}>HR Admin Dashboard</div>
                <div className="text-xs" style={{ color: "oklch(0.55 0.03 250)" }}>Enter passcode to continue</div>
              </div>
            </div>

            {/* Digit display */}
            <div className="flex justify-center gap-3 mb-6">
              {[0,1,2,3].map(i => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all"
                  style={{
                    backgroundColor: adminError ? "oklch(0.45 0.18 25 / 0.3)" : "oklch(0.22 0.07 258)",
                    border: `2px solid ${
                      adminError ? "oklch(0.65 0.2 25)" :
                      adminCode.length > i ? AC.teal : "oklch(0.30 0.08 256)"
                    }`,
                    color: adminError ? "oklch(0.65 0.2 25)" : "white",
                    transform: adminError ? "translateX(-2px)" : "none",
                  }}
                >
                  {adminCode.length > i ? "●" : ""}
                </div>
              ))}
            </div>

            {adminError && (
              <p className="text-center text-xs mb-4" style={{ color: "oklch(0.65 0.2 25)" }}>Incorrect passcode — try again</p>
            )}

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button
                  key={n}
                  onClick={() => handleAdminDigit(String(n))}
                  className="h-12 rounded-xl text-white font-semibold text-base transition-all active:scale-95"
                  style={{ backgroundColor: "oklch(0.22 0.07 258)", border: "1px solid oklch(0.30 0.08 256)" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(0.28 0.08 256)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "oklch(0.22 0.07 258)")}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setAdminCode(c => c.slice(0, -1))}
                className="h-12 rounded-xl text-xs font-semibold transition-all active:scale-95"
                style={{ backgroundColor: "oklch(0.22 0.07 258)", border: "1px solid oklch(0.30 0.08 256)", color: "oklch(0.65 0.05 250)" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(0.28 0.08 256)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "oklch(0.22 0.07 258)")}
              >
                ⌫
              </button>
              <button
                onClick={() => handleAdminDigit("0")}
                className="h-12 rounded-xl text-white font-semibold text-base transition-all active:scale-95"
                style={{ backgroundColor: "oklch(0.22 0.07 258)", border: "1px solid oklch(0.30 0.08 256)" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(0.28 0.08 256)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "oklch(0.22 0.07 258)")}
              >
                0
              </button>
              <button
                onClick={() => checkAdminCode()}
                className="h-12 rounded-xl text-white font-semibold text-sm transition-all active:scale-95"
                style={{ backgroundColor: AC.tealDim, border: `1px solid ${AC.teal}` }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = AC.teal)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = AC.tealDim)}
              >
                ✓
              </button>
            </div>

            <button
              onClick={() => { setShowAdminPasscode(false); setAdminCode(""); }}
              className="w-full text-xs py-2 rounded-lg transition-all"
              style={{ color: "oklch(0.45 0.02 230)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t py-5" style={{ borderColor: AC.border }}>
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <a
            href="https://apartmentcorp.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-70"
            title="Visit ApartmentCorp.com"
          >
            <img
              src="/manus-storage/AptCorpShimmer_nobg_db1667d2.gif"
              alt="ApartmentCorp"
              className="h-6 w-auto object-contain opacity-50"
              style={{ maxWidth: "120px" }}
            />
          </a>
          <p className="text-xs" style={{ color: "oklch(0.40 0.02 230)" }}>
            © {new Date().getFullYear()} ApartmentCorp. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
