/**
 * ChecklistTab — Main checklist with expandable phase cards
 * Design: Warm Professional — cream cards, navy phase headers, terracotta accents
 * Features: Expand/collapse phases, task checkboxes, sub-sections, notes, critical badges
 */

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
  CheckCircle2,
  ChevronsDown,
  ChevronsUp,
} from "lucide-react";
import type { Phase, Task } from "@/lib/onboardingData";

interface ChecklistTabProps {
  phases: Phase[];
  activePhaseId: string;
  onPhaseChange: (id: string) => void;
  checkedTasks: Record<string, boolean>;
  onToggleTask: (id: string) => void;
  getPhaseProgress: (id: string) => { completed: number; total: number; percent: number };
}

export function ChecklistTab({
  phases,
  activePhaseId,
  onPhaseChange,
  checkedTasks,
  onToggleTask,
  getPhaseProgress,
}: ChecklistTabProps) {
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>(
    Object.fromEntries(phases.map((p) => [p.id, p.id === activePhaseId]))
  );
  const phaseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Sync active phase from navigator
  useEffect(() => {
    setExpandedPhases((prev) => ({ ...prev, [activePhaseId]: true }));
    const el = phaseRefs.current[activePhaseId];
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [activePhaseId]);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = { ...prev, [phaseId]: !prev[phaseId] };
      return next;
    });
    onPhaseChange(phaseId);
  };

  const expandAll = () =>
    setExpandedPhases(Object.fromEntries(phases.map((p) => [p.id, true])));
  const collapseAll = () =>
    setExpandedPhases(Object.fromEntries(phases.map((p) => [p.id, false])));

  const allExpanded = phases.every((p) => expandedPhases[p.id]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-bold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "oklch(0.22 0.06 250)" }}
        >
          Onboarding Checklist
        </h2>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-all hover:bg-gray-50"
            style={{ borderColor: "oklch(0.88 0.02 80)", color: "oklch(0.40 0.03 250)" }}
          >
            <ChevronsDown className="w-3.5 h-3.5" />
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-all hover:bg-gray-50"
            style={{ borderColor: "oklch(0.88 0.02 80)", color: "oklch(0.40 0.03 250)" }}
          >
            <ChevronsUp className="w-3.5 h-3.5" />
            Collapse All
          </button>
        </div>
      </div>

      {/* Phase Cards */}
      <div className="space-y-4">
        {phases.map((phase, phaseIndex) => {
          const progress = getPhaseProgress(phase.id);
          const isExpanded = expandedPhases[phase.id];
          const isComplete = progress.percent === 100;
          const isNavy = phase.color === "navy";

          return (
            <div
              key={phase.id}
              ref={(el) => { phaseRefs.current[phase.id] = el; }}
              className="phase-card rounded-xl border overflow-hidden animate-fade-in-up"
              style={{
                borderColor: "oklch(0.88 0.02 80)",
                animationDelay: `${phaseIndex * 80}ms`,
              }}
            >
              {/* Phase Header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all"
                style={{
                  backgroundColor: isNavy ? "oklch(0.22 0.06 250)" : "oklch(0.55 0.14 40)",
                }}
              >
                {/* Phase Number Badge */}
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: isComplete
                      ? "oklch(0.65 0.12 40)"
                      : "oklch(1 0 0 / 0.15)",
                    color: "white",
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  {isComplete ? <CheckCircle2 className="w-5 h-5" /> : phase.number}
                </div>

                {/* Phase Title & Subtitle */}
                <div className="flex-1 min-w-0">
                  <div
                    className="font-bold text-white text-base leading-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {phase.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "oklch(0.85 0.02 80)" }}>
                    {phase.subtitle}
                  </div>
                </div>

                {/* Progress + Toggle */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Progress pill */}
                  <div
                    className="hidden sm:flex flex-col items-end"
                  >
                    <span className="text-xs font-semibold text-white">
                      {progress.completed}/{progress.total}
                    </span>
                    <div
                      className="w-20 h-1.5 rounded-full overflow-hidden mt-1"
                      style={{ backgroundColor: "oklch(1 0 0 / 0.20)" }}
                    >
                      <div
                        className="h-full rounded-full progress-segment"
                        style={{
                          width: `${progress.percent}%`,
                          backgroundColor: "oklch(1 0 0 / 0.80)",
                        }}
                      />
                    </div>
                  </div>
                  {/* Timeline badge */}
                  <span
                    className="hidden md:block text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "oklch(1 0 0 / 0.15)", color: "oklch(0.92 0.01 80)" }}
                  >
                    {phase.timeline}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-white" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white" />
                  )}
                </div>
              </button>

              {/* Phase Body */}
              {isExpanded && (
                <div className="divide-y divide-[oklch(0.94_0.01_80)]">
                  {phase.sections.map((section) => (
                    <div key={section.id} className="px-5 py-4">
                      {/* Section Label */}
                      <div
                        className="text-xs font-semibold uppercase tracking-wider mb-3"
                        style={{ color: "oklch(0.55 0.03 250)" }}
                      >
                        {section.label}
                      </div>

                      {/* Tasks */}
                      <div className="space-y-2">
                        {section.tasks.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            checked={!!checkedTasks[task.id]}
                            onToggle={() => onToggleTask(task.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Phase Complete Banner */}
                  {isComplete && (
                    <div
                      className="px-5 py-3 flex items-center gap-2"
                      style={{ backgroundColor: "oklch(0.55 0.14 40 / 0.08)" }}
                    >
                      <CheckCircle2 className="w-4 h-4" style={{ color: "oklch(0.55 0.14 40)" }} />
                      <span className="text-sm font-medium" style={{ color: "oklch(0.45 0.12 40)" }}>
                        Phase complete! Great work.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskItem({
  task,
  checked,
  onToggle,
}: {
  task: Task;
  checked: boolean;
  onToggle: () => void;
}) {
  const [showNote, setShowNote] = useState(false);

  return (
    <div>
      <div
        className={`flex items-start gap-3 p-2 rounded-lg transition-all ${checked ? "task-completed" : ""}`}
        style={{
          backgroundColor: checked ? "oklch(0.97 0.01 80)" : "transparent",
        }}
      >
        {/* Custom Checkbox */}
        <button
          onClick={onToggle}
          className="task-checkbox flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
          style={{
            borderColor: checked ? "oklch(0.55 0.14 40)" : "oklch(0.75 0.02 80)",
            backgroundColor: checked ? "oklch(0.55 0.14 40)" : "transparent",
          }}
          aria-checked={checked}
          role="checkbox"
        >
          {checked && (
            <svg viewBox="0 0 12 10" className="w-3 h-2.5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1,5 4,9 11,1" />
            </svg>
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <label
              onClick={onToggle}
              className="text-sm leading-snug flex-1 min-w-0"
              style={{ color: checked ? "oklch(0.60 0.02 250)" : "oklch(0.22 0.06 250)" }}
            >
              {task.label}
            </label>
            <div className="flex gap-1 flex-shrink-0">
              {task.critical && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-semibold"
                  style={{ backgroundColor: "oklch(0.577 0.245 27.325 / 0.12)", color: "oklch(0.50 0.20 27)" }}
                >
                  CRITICAL
                </span>
              )}
              {task.required && !task.critical && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-medium"
                  style={{ backgroundColor: "oklch(0.22 0.06 250 / 0.08)", color: "oklch(0.35 0.05 250)" }}
                >
                  Required
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "oklch(0.50 0.02 250)" }}>
              {task.description}
            </p>
          )}

          {/* Note Toggle */}
          {task.note && (
            <div>
              <button
                onClick={() => setShowNote(!showNote)}
                className="flex items-center gap-1 text-xs mt-1 transition-all"
                style={{ color: "oklch(0.45 0.08 250)" }}
              >
                <Info className="w-3 h-3" />
                {showNote ? "Hide note" : "View note"}
              </button>
              {showNote && (
                <div
                  className="mt-2 px-3 py-2 rounded text-xs leading-relaxed border-l-2"
                  style={{
                    backgroundColor: "oklch(0.97 0.01 80)",
                    borderLeftColor: "oklch(0.55 0.14 40)",
                    color: "oklch(0.40 0.03 250)",
                  }}
                >
                  {task.note}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
