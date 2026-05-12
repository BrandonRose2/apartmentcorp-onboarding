/**
 * WelcomeBanner — Personalized welcome header for the new hire
 * Design: Warm Professional — dark overlay on banner image, navy/terracotta accents
 */

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

interface WelcomeBannerProps {
  employeeName: string;
  startDate: string;
  role: string;
  onSave: (name: string, startDate: string, role: string) => void;
  overallProgress: number;
  completedTasks: number;
  totalTasks: number;
  bannerImageUrl: string;
}

export function WelcomeBanner({
  employeeName,
  startDate,
  role,
  onSave,
  overallProgress,
  completedTasks,
  totalTasks,
  bannerImageUrl,
}: WelcomeBannerProps) {
  const [editing, setEditing] = useState(!employeeName);
  const [draftName, setDraftName] = useState(employeeName || "");
  const [draftDate, setDraftDate] = useState(startDate || "");
  const [draftRole, setDraftRole] = useState(role || "");

  const handleSave = () => {
    onSave(draftName, draftDate, draftRole);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraftName(employeeName);
    setDraftDate(startDate);
    setDraftRole(role);
    setEditing(false);
  };

  const displayName = employeeName || "New Team Member";
  const displayRole = role || "Your Role";
  const displayDate = startDate
    ? new Date(startDate + "T00:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Start Date TBD";

  return (
    <div
      className="relative overflow-hidden"
      style={{ minHeight: "180px" }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerImageUrl})` }}
      />
      {/* Dark overlay for text legibility — image is light/warm so use dark overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "oklch(0.22 0.06 250 / 0.72)" }}
      />

      <div className="relative container py-8">
        {editing ? (
          /* Edit Mode */
          <div className="animate-fade-in-up">
            <p className="text-sm font-medium mb-3" style={{ color: "oklch(0.80 0.03 80)" }}>
              Tell us about yourself to personalize your onboarding experience
            </p>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs mb-1" style={{ color: "oklch(0.70 0.03 80)" }}>
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  className="px-3 py-2 rounded text-sm border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "oklch(1 0 0 / 0.12)",
                    borderColor: "oklch(1 0 0 / 0.25)",
                    color: "white",
                    minWidth: "180px",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "oklch(0.70 0.03 80)" }}>
                  Your Role / Title
                </label>
                <input
                  type="text"
                  value={draftRole}
                  onChange={(e) => setDraftRole(e.target.value)}
                  placeholder="e.g. Leasing Agent"
                  className="px-3 py-2 rounded text-sm border focus:outline-none"
                  style={{
                    backgroundColor: "oklch(1 0 0 / 0.12)",
                    borderColor: "oklch(1 0 0 / 0.25)",
                    color: "white",
                    minWidth: "180px",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "oklch(0.70 0.03 80)" }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                  className="px-3 py-2 rounded text-sm border focus:outline-none"
                  style={{
                    backgroundColor: "oklch(1 0 0 / 0.12)",
                    borderColor: "oklch(1 0 0 / 0.25)",
                    color: "white",
                    colorScheme: "dark",
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-semibold transition-all active:scale-95"
                  style={{ backgroundColor: "oklch(0.55 0.14 40)", color: "white" }}
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
                {employeeName && (
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-3 py-2 rounded text-sm transition-all"
                    style={{ backgroundColor: "oklch(1 0 0 / 0.12)", color: "white" }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Display Mode */
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1
                  className="text-2xl sm:text-3xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Welcome, {displayName}
                </h1>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1 rounded transition-all hover:opacity-80"
                  style={{ color: "oklch(0.75 0.03 80)" }}
                  title="Edit your info"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-3 text-sm" style={{ color: "oklch(0.82 0.03 80)" }}>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: "oklch(0.55 0.14 40 / 0.80)", color: "white" }}
                >
                  {displayRole}
                </span>
                <span>Start Date: {displayDate}</span>
              </div>
            </div>

            {/* Progress Summary */}
            <div
              className="flex gap-4 text-center px-5 py-3 rounded-lg"
              style={{ backgroundColor: "oklch(1 0 0 / 0.10)", backdropFilter: "blur(4px)" }}
            >
              <div>
                <div className="text-2xl font-bold text-white">{overallProgress}%</div>
                <div className="text-xs" style={{ color: "oklch(0.75 0.03 80)" }}>Complete</div>
              </div>
              <div className="w-px" style={{ backgroundColor: "oklch(1 0 0 / 0.20)" }} />
              <div>
                <div className="text-2xl font-bold text-white">{completedTasks}</div>
                <div className="text-xs" style={{ color: "oklch(0.75 0.03 80)" }}>of {totalTasks} Tasks</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
