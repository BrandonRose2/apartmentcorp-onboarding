/**
 * ApartmentCorp New Hire Onboarding Portal — Home Page
 * Design: Warm Professional (Cream bg, Navy headers, Terracotta accents)
 * Layout: Two-column desktop (sticky left nav + main content), single column mobile
 * Typography: Playfair Display (headings) + Source Sans 3 (body)
 */

import { useState, useRef } from "react";
import { ChecklistTab } from "@/components/ChecklistTab";
import { DocumentHubTab } from "@/components/DocumentHubTab";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { PhaseNavigator } from "@/components/PhaseNavigator";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { PHASES } from "@/lib/onboardingData";
import { Building2, CheckSquare, FolderOpen, RotateCcw, Save } from "lucide-react";

type ActiveTab = "checklist" | "documents";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("checklist");
  const [activePhaseId, setActivePhaseId] = useState(PHASES[0].id);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "oklch(0.98 0.01 80)" }}>
      {/* Top Header Bar */}
      <header
        className="sticky top-0 z-50 border-b shadow-sm"
        style={{ backgroundColor: "oklch(0.22 0.06 250)", borderColor: "oklch(0.30 0.07 250)" }}
      >
        <div className="container flex items-center justify-between h-14 gap-4">
          {/* Logo + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0"
              style={{ backgroundColor: "oklch(0.55 0.14 40)" }}
            >
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-white font-semibold text-sm leading-tight truncate" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                ApartmentCorp
              </div>
              <div className="text-xs leading-tight" style={{ color: "oklch(0.75 0.03 250)" }}>
                New Hire Onboarding Portal
              </div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="hidden sm:flex items-center gap-3 flex-1 max-w-xs">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1" style={{ color: "oklch(0.80 0.03 250)" }}>
                <span>Overall Progress</span>
                <span className="font-semibold text-white">
                  {onboarding.overallProgress}% ({onboarding.completedTasks}/{onboarding.totalTasks})
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "oklch(0.30 0.07 250)" }}>
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
            <span className="hidden md:flex items-center gap-1 text-xs" style={{ color: "oklch(0.65 0.03 250)" }}>
              <Save className="w-3 h-3" />
              Saved {onboarding.formatLastSaved()}
            </span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all"
              style={{
                backgroundColor: showResetConfirm ? "oklch(0.577 0.245 27.325)" : "oklch(0.30 0.07 250)",
                color: "white",
              }}
            >
              <RotateCcw className="w-3 h-3" />
              {showResetConfirm ? "Confirm Reset?" : "Reset All"}
            </button>
          </div>
        </div>
      </header>

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
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab("checklist")}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all"
              style={{
                borderBottomColor: activeTab === "checklist" ? "oklch(0.55 0.14 40)" : "transparent",
                color: activeTab === "checklist" ? "oklch(0.55 0.14 40)" : "oklch(0.50 0.03 250)",
              }}
            >
              <CheckSquare className="w-4 h-4" />
              Onboarding Checklist
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all"
              style={{
                borderBottomColor: activeTab === "documents" ? "oklch(0.55 0.14 40)" : "transparent",
                color: activeTab === "documents" ? "oklch(0.55 0.14 40)" : "oklch(0.50 0.03 250)",
              }}
            >
              <FolderOpen className="w-4 h-4" />
              Document Hub
              {onboarding.totalFiles > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: "oklch(0.55 0.14 40)", color: "white" }}
                >
                  {onboarding.totalFiles}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6">
        {activeTab === "checklist" ? (
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
        ) : (
          <DocumentHubTab
            uploadedFiles={onboarding.state.uploadedFiles}
            onAddFile={onboarding.addFile}
            onRemoveFile={onboarding.removeFile}
            totalFiles={onboarding.totalFiles}
            categoriesFiled={onboarding.categoriesFiled}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-12 py-4" style={{ borderColor: "oklch(0.88 0.02 80)" }}>
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-2 text-xs" style={{ color: "oklch(0.55 0.03 250)" }}>
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
