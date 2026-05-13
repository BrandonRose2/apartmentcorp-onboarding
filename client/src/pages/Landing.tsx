/**
 * ApartmentCorp — Portal Landing Page
 * Brand: Dark navy oklch(0.13 0.06 258), teal accent oklch(0.72 0.12 220)
 * Typography: Cormorant Garamond (headings) + Inter (body)
 * Logo: /manus-storage/ac-logo_324ddb7c.webp (white version via CSS filter)
 */

import { motion } from "framer-motion";
import { ChevronRight, ClipboardList, UserCheck } from "lucide-react";
import { useLocation } from "wouter";

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

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: AC.bg, fontFamily: AC.body, color: AC.fg }}>
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: AC.nav, borderColor: AC.border, backdropFilter: "blur(12px)" }}>
        <div className="max-w-5xl mx-auto px-6 flex items-center h-16">
          <img
            src="/manus-storage/ac-logo_324ddb7c.webp"
            alt="ApartmentCorp"
            className="h-7 w-auto"
            style={{ filter: "brightness(0) invert(1)" }}
          />
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
            {/* Teal accent line */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-0.5 rounded-full" style={{ backgroundColor: AC.teal }} />
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
            onClick={() => navigate("/admin")}
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

      {/* Footer */}
      <footer className="border-t py-5" style={{ borderColor: AC.border }}>
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <img
            src="/manus-storage/ac-logo_324ddb7c.webp"
            alt="ApartmentCorp"
            className="h-5 w-auto opacity-30"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <p className="text-xs" style={{ color: "oklch(0.40 0.02 230)" }}>
            © {new Date().getFullYear()} ApartmentCorp. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
