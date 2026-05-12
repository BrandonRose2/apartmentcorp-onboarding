/**
 * PhaseNavigator — Sticky left sidebar with vertical phase stepper
 * Design: Navy sidebar with terracotta active state, decorative apartment image at bottom
 */

import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { Phase } from "@/lib/onboardingData";

interface PhaseNavigatorProps {
  phases: Phase[];
  activePhaseId: string;
  onSelectPhase: (id: string) => void;
  getPhaseProgress: (id: string) => { completed: number; total: number; percent: number };
  decorativeImageUrl: string;
}

export function PhaseNavigator({
  phases,
  activePhaseId,
  onSelectPhase,
  getPhaseProgress,
  decorativeImageUrl,
}: PhaseNavigatorProps) {
  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ borderColor: "oklch(0.88 0.02 80)", backgroundColor: "oklch(1 0 0)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{ backgroundColor: "oklch(0.22 0.06 250)", borderColor: "oklch(0.30 0.07 250)" }}
      >
        <h2
          className="text-sm font-semibold text-white"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Your Journey
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "oklch(0.70 0.03 250)" }}>
          90-Day Onboarding Roadmap
        </p>
      </div>

      {/* Phase Steps */}
      <div className="p-3">
        {phases.map((phase, index) => {
          const progress = getPhaseProgress(phase.id);
          const isActive = phase.id === activePhaseId;
          const isComplete = progress.percent === 100;
          const isStarted = progress.completed > 0 && !isComplete;

          return (
            <button
              key={phase.id}
              onClick={() => onSelectPhase(phase.id)}
              className="w-full text-left mb-1 last:mb-0 rounded-lg p-3 transition-all group"
              style={{
                backgroundColor: isActive
                  ? "oklch(0.55 0.14 40 / 0.10)"
                  : "transparent",
                borderLeft: isActive
                  ? "3px solid oklch(0.55 0.14 40)"
                  : "3px solid transparent",
              }}
            >
              <div className="flex items-start gap-3">
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {isComplete ? (
                    <CheckCircle2
                      className="w-5 h-5"
                      style={{ color: "oklch(0.55 0.14 40)" }}
                    />
                  ) : isStarted ? (
                    <Clock
                      className="w-5 h-5"
                      style={{ color: "oklch(0.22 0.06 250)" }}
                    />
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                      style={{
                        borderColor: isActive
                          ? "oklch(0.55 0.14 40)"
                          : "oklch(0.75 0.02 80)",
                        color: isActive
                          ? "oklch(0.55 0.14 40)"
                          : "oklch(0.60 0.02 80)",
                      }}
                    >
                      {phase.number}
                    </div>
                  )}
                </div>

                {/* Phase Info */}
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-semibold leading-tight truncate"
                    style={{
                      color: isActive
                        ? "oklch(0.55 0.14 40)"
                        : "oklch(0.22 0.06 250)",
                    }}
                  >
                    {phase.title}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "oklch(0.55 0.03 250)" }}
                  >
                    {phase.timeline}
                  </div>

                  {/* Mini progress bar */}
                  <div
                    className="mt-1.5 h-1 rounded-full overflow-hidden"
                    style={{ backgroundColor: "oklch(0.92 0.01 80)" }}
                  >
                    <div
                      className="h-full rounded-full progress-segment"
                      style={{
                        width: `${progress.percent}%`,
                        backgroundColor: isComplete
                          ? "oklch(0.55 0.14 40)"
                          : "oklch(0.22 0.06 250)",
                      }}
                    />
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "oklch(0.60 0.03 250)" }}
                  >
                    {progress.completed}/{progress.total} tasks
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Decorative Image */}
      <div className="relative overflow-hidden" style={{ height: "140px" }}>
        <img
          src={decorativeImageUrl}
          alt="ApartmentCorp properties"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, oklch(1 0 0 / 0.3), oklch(0.22 0.06 250 / 0.5))" }}
        />
        <div className="absolute bottom-2 left-3 right-3">
          <p
            className="text-xs font-medium text-white"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
          >
            Building great communities together
          </p>
        </div>
      </div>
    </div>
  );
}
