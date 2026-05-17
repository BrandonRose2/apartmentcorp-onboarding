/**
 * ApartmentCorp New Hire Onboarding Portal — Home Page
 * Design: Warm Professional (Cream bg, Navy headers, Terracotta accents)
 * Layout: Two-column desktop (sticky left nav + main content), single column mobile
 * Typography: Playfair Display (headings) + Source Sans 3 (body)
 * Tabs: Onboarding Checklist | Document Hub | Company Websites & Logins
 */

import { useState, useEffect } from "react";
import { ChecklistTab } from "@/components/ChecklistTab";
import { DocumentHubTab } from "@/components/DocumentHubTab";
import { CompanyWebsitesTab } from "@/components/CompanyWebsitesTab";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { PhaseNavigator } from "@/components/PhaseNavigator";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { PHASES } from "@/lib/onboardingData";
import { Building2, BookOpen, Bell, CheckSquare, FolderOpen, Globe, RotateCcw, Save, Monitor, User, ChevronDown, X } from "lucide-react";
import { UsefulResourcesTab } from "@/components/UsefulResourcesTab";
import { RemindersTab } from "@/components/RemindersTab";
import { TechOnboardingTab } from "@/components/TechOnboardingTab";

type ActiveTab = "checklist" | "documents" | "websites" | "resources" | "tech";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("checklist");
  const [activePhaseId, setActivePhaseId] = useState(PHASES[0].id);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showBrandonPanel, setShowBrandonPanel] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);

  const handleBrandonClick = () => {
    if (showBrandonPanel) {
      setShowBrandonPanel(false);
    } else {
      setShowPasscodeModal(true);
      setPasscode("");
      setPasscodeError(false);
    }
  };

  const handlePasscodeSubmit = (code?: string) => {
    const check = code ?? passcode;
    if (check === "3698") {
      setShowPasscodeModal(false);
      setShowBrandonPanel(true);
      setPasscode("");
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
      setPasscode("");
      setTimeout(() => setPasscodeError(false), 1500);
    }
  };

  const handleDigitPress = (digit: string) => {
    if (passcode.length < 4) {
      const next = passcode + digit;
      setPasscode(next);
      if (next.length === 4) {
        setTimeout(() => handlePasscodeSubmit(next), 120);
      }
    }
  };

  // Keyboard support for Brandon passcode modal
  useEffect(() => {
    if (!showPasscodeModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigitPress(e.key);
      } else if (e.key === "Backspace") {
        setPasscode(p => p.slice(0, -1));
      } else if (e.key === "Escape") {
        setShowPasscodeModal(false);
        setPasscode("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPasscodeModal, passcode]);

  const onboarding = useOnboardingState();

  const handleReset = () => {
    if (showResetConfirm) {
      onboarding.resetAll();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  const tabs: { id: ActiveTab; label: React.ReactNode; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "checklist",
      label: "Onboarding Checklist",
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      id: "documents",
      label: "Document Hub",
      icon: <FolderOpen className="w-4 h-4" />,
      badge: onboarding.totalFiles > 0 ? onboarding.totalFiles : undefined,
    },
    {
      id: "websites",
      label: "Company Websites & Logins",
      icon: <Globe className="w-4 h-4" />,
    },
    {
      id: "resources",
      label: "Useful Resources",
      icon: <BookOpen className="w-4 h-4" />,
    },

    {
      id: "tech",
      label: (
        <span className="flex flex-col items-start leading-tight">
          <span>Technology Onboarding</span>
          <span className="text-[10px] font-normal opacity-60">Ethan Cowles</span>
        </span>
      ),
      icon: <Monitor className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "oklch(0.98 0.01 80)" }}>
      {/* Top Header Bar */}
      {/* Centered Logo Banner */}
      <div
        className="w-full flex justify-center items-center py-3"
        style={{ backgroundColor: "oklch(0.13 0.06 258)" }}
      >
        <img
          src="/manus-storage/AptCorpShimmer_nobg_db1667d2.gif"
          alt="ApartmentCorp"
          className="h-20 w-auto object-contain"
          style={{ maxWidth: "340px" }}
        />
      </div>

      <header
        className="sticky top-0 z-50 border-b shadow-sm"
        style={{ backgroundColor: "oklch(0.22 0.06 250)", borderColor: "oklch(0.30 0.07 250)" }}
      >
        <div className="container flex items-center justify-between h-14 gap-4">
          {/* Logo + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div
                className="text-white font-semibold text-sm leading-tight truncate"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                HR Admin Dashboard
              </div>
              <div className="text-xs leading-tight" style={{ color: "oklch(0.75 0.03 250)" }}>
                New Hire Onboarding Portal
              </div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="hidden sm:flex items-center gap-3 flex-1 max-w-xs">
            <div className="flex-1">
              <div
                className="flex justify-between text-xs mb-1"
                style={{ color: "oklch(0.80 0.03 250)" }}
              >
                <span>Overall Progress</span>
                <span className="font-semibold text-white">
                  {onboarding.overallProgress}% ({onboarding.completedTasks}/{onboarding.totalTasks})
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: "oklch(0.30 0.07 250)" }}
              >
                <div
                  className="h-full rounded-full progress-segment"
                  style={{
                    width: `${onboarding.overallProgress}%`,
                    backgroundColor: "oklch(0.55 0.14 40)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <span
              className="hidden md:flex items-center gap-1 text-xs"
              style={{ color: "oklch(0.65 0.03 250)" }}
            >
              <Save className="w-3 h-3" />
              Saved {onboarding.formatLastSaved()}
            </span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all"
              style={{
                backgroundColor: showResetConfirm
                  ? "oklch(0.577 0.245 27.325)"
                  : "oklch(0.30 0.07 250)",
                color: "white",
              }}
            >
              <RotateCcw className="w-3 h-3" />
              {showResetConfirm ? "Confirm Reset?" : "Reset All"}
            </button>

            {/* Brandon Button */}
            <button
              onClick={handleBrandonClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all"
              style={{
                backgroundColor: showBrandonPanel ? "oklch(0.72 0.12 220)" : "oklch(0.55 0.14 40)",
                color: "white",
              }}
            >
              <User className="w-3.5 h-3.5" />
              Brandon
              <ChevronDown className={`w-3 h-3 transition-transform ${showBrandonPanel ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Brandon Panel — slides down from header */}
      {showBrandonPanel && (
        <div
          className="border-b shadow-lg"
          style={{
            backgroundColor: "oklch(0.15 0.06 258)",
            borderColor: "oklch(0.25 0.08 256)",
          }}
        >
          <div className="container py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: "oklch(0.55 0.14 40)" }}
                >
                  B
                </div>
                <div>
                  <div className="text-white font-semibold text-sm" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                    Brandon's Workspace
                  </div>
                  <div className="text-xs" style={{ color: "oklch(0.72 0.12 220)" }}>Personal reminders &amp; notes</div>
                </div>
              </div>
              <button
                onClick={() => setShowBrandonPanel(false)}
                className="p-1.5 rounded transition-all"
                style={{ color: "oklch(0.65 0.05 250)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <RemindersTab />
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <WelcomeBanner
        employeeName={onboarding.state.employeeName}
        startDate={onboarding.state.startDate}
        role={onboarding.state.role}
        onSave={onboarding.setEmployeeInfo}
        overallProgress={onboarding.overallProgress}
        completedTasks={onboarding.completedTasks}
        totalTasks={onboarding.totalTasks}
        bannerImageUrl="https://d2xsxph8kpxj0f.cloudfront.net/310519663449376037/PxSj4NVMpo7Dbkx2svgNws/onboarding-banner-LwwaaZWiGApi3X2bCSq7mA.webp"
      />

      {/* Tab Navigation */}
      <div
        className="sticky z-40 border-b"
        style={{ top: "56px", backgroundColor: "oklch(1 0 0)", borderColor: "oklch(0.88 0.02 80)" }}
      >
        <div className="container">
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex-shrink-0"
                  style={{
                    borderBottomColor: isActive ? "oklch(0.55 0.14 40)" : "transparent",
                    color: isActive ? "oklch(0.55 0.14 40)" : "oklch(0.50 0.03 250)",
                  }}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.id === "checklist" ? "Checklist" : tab.id === "documents" ? "Documents" : tab.id === "websites" ? "Websites" : tab.id === "resources" ? "Resources" : "Tech"}
                  </span>
                  {tab.badge !== undefined && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: "oklch(0.55 0.14 40)", color: "white" }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6">
        {activeTab === "checklist" && (
          <div className="flex gap-6 items-start">
            {/* Left: Phase Navigator (sticky) */}
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-32">
              <PhaseNavigator
                phases={PHASES}
                activePhaseId={activePhaseId}
                onSelectPhase={setActivePhaseId}
                getPhaseProgress={onboarding.getPhaseProgress}
                decorativeImageUrl="https://d2xsxph8kpxj0f.cloudfront.net/310519663449376037/PxSj4NVMpo7Dbkx2svgNws/onboarding-welcome-gwTiae8oer8KG9czH4hZis.webp"
              />
            </aside>

            {/* Right: Checklist Content */}
            <main className="flex-1 min-w-0">
              <ChecklistTab
                phases={PHASES}
                activePhaseId={activePhaseId}
                onPhaseChange={setActivePhaseId}
                checkedTasks={onboarding.state.checkedTasks}
                onToggleTask={onboarding.toggleTask}
                getPhaseProgress={onboarding.getPhaseProgress}
              />
            </main>
          </div>
        )}

        {activeTab === "documents" && (
          <DocumentHubTab
            uploadedFiles={onboarding.state.uploadedFiles}
            onAddFile={onboarding.addFile}
            onRemoveFile={onboarding.removeFile}
            totalFiles={onboarding.totalFiles}
            categoriesFiled={onboarding.categoriesFiled}
          />
        )}

        {activeTab === "websites" && <CompanyWebsitesTab />}
        {activeTab === "resources" && <UsefulResourcesTab />}
        {activeTab === "tech" && <TechOnboardingTab />}
      </div>

      {/* Passcode Modal */}
      {showPasscodeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "oklch(0 0 0 / 0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowPasscodeModal(false); setPasscode(""); } }}
        >
          <div
            className="rounded-2xl p-8 w-80 shadow-2xl"
            style={{ backgroundColor: "oklch(0.15 0.06 258)", border: "1px solid oklch(0.28 0.08 256)" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: "oklch(0.55 0.14 40)" }}
              >
                B
              </div>
              <div>
                <div className="text-white font-semibold text-sm" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Brandon's Workspace</div>
                <div className="text-xs" style={{ color: "oklch(0.65 0.05 250)" }}>Enter passcode to continue</div>
              </div>
            </div>

            {/* Digit display */}
            <div className="flex justify-center gap-3 mb-6">
              {[0,1,2,3].map(i => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all"
                  style={{
                    backgroundColor: passcodeError ? "oklch(0.45 0.18 25 / 0.3)" : "oklch(0.22 0.07 258)",
                    border: `2px solid ${
                      passcodeError ? "oklch(0.65 0.2 25)" :
                      passcode.length > i ? "oklch(0.72 0.12 220)" : "oklch(0.30 0.08 256)"
                    }`,
                    color: passcodeError ? "oklch(0.65 0.2 25)" : "white",
                    transform: passcodeError ? "translateX(-2px)" : "none",
                  }}
                >
                  {passcode.length > i ? "●" : ""}
                </div>
              ))}
            </div>

            {passcodeError && (
              <p className="text-center text-xs mb-4" style={{ color: "oklch(0.65 0.2 25)" }}>Incorrect passcode — try again</p>
            )}

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button
                  key={n}
                  onClick={() => handleDigitPress(String(n))}
                  className="h-12 rounded-xl text-white font-semibold text-base transition-all active:scale-95"
                  style={{ backgroundColor: "oklch(0.22 0.07 258)", border: "1px solid oklch(0.30 0.08 256)" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(0.28 0.08 256)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "oklch(0.22 0.07 258)")}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPasscode(p => p.slice(0, -1))}
                className="h-12 rounded-xl text-xs font-semibold transition-all active:scale-95"
                style={{ backgroundColor: "oklch(0.22 0.07 258)", border: "1px solid oklch(0.30 0.08 256)", color: "oklch(0.65 0.05 250)" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(0.28 0.08 256)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "oklch(0.22 0.07 258)")}
              >
                ⌫
              </button>
              <button
                onClick={() => handleDigitPress("0")}
                className="h-12 rounded-xl text-white font-semibold text-base transition-all active:scale-95"
                style={{ backgroundColor: "oklch(0.22 0.07 258)", border: "1px solid oklch(0.30 0.08 256)" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(0.28 0.08 256)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "oklch(0.22 0.07 258)")}
              >
                0
              </button>
              <button
                onClick={() => handlePasscodeSubmit()}
                className="h-12 rounded-xl text-white font-semibold text-sm transition-all active:scale-95"
                style={{ backgroundColor: "oklch(0.55 0.14 40)", border: "1px solid oklch(0.60 0.16 40)" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(0.60 0.16 40)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "oklch(0.55 0.14 40)")}
              >
                ✓
              </button>
            </div>

            <button
              onClick={() => { setShowPasscodeModal(false); setPasscode(""); }}
              className="w-full text-xs py-2 rounded-lg transition-all"
              style={{ color: "oklch(0.55 0.03 250)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t mt-12 py-4" style={{ borderColor: "oklch(0.88 0.02 80)" }}>
        <div
          className="container flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
          style={{ color: "oklch(0.55 0.03 250)" }}
        >
          <span>© {new Date().getFullYear()} ApartmentCorp — New Hire Onboarding Portal</span>
          <span className="flex items-center gap-1">
            <Save className="w-3 h-3" />
            Progress saves automatically in your browser
          </span>
        </div>
      </footer>
    </div>
  );
}
