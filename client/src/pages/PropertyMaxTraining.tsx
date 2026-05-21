import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, BookOpen, Award, Clock, PenLine, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

// ── Design tokens (matches EmployeePortal) ───────────────────────────────────
const AC = {
  bg: "oklch(0.13 0.06 258)",
  bgCard: "oklch(0.17 0.07 258)",
  bgRaised: "oklch(0.20 0.07 258)",
  border: "oklch(0.28 0.06 258)",
  fg: "oklch(0.96 0.01 258)",
  fgMuted: "oklch(0.65 0.04 258)",
  fgSubtle: "oklch(0.45 0.04 258)",
  teal: "oklch(0.72 0.14 195)",
  gold: "oklch(0.78 0.16 75)",
  green: "oklch(0.78 0.22 142)",
  orange: "oklch(0.72 0.20 40)",
  heading: "'Playfair Display', Georgia, serif",
};

// ── Training items definition ─────────────────────────────────────────────────
const TRAINING_SECTIONS = [
  {
    section: "Getting Started",
    icon: "🚀",
    items: [
      { id: "pm-01", title: "Portal Login & Navigation Overview" },
      { id: "pm-02", title: "Dashboard Overview & Quick Stats" },
      { id: "pm-03", title: "My Profile Setup" },
    ],
  },
  {
    section: "Requests",
    icon: "📋",
    items: [
      { id: "pm-04", title: "Submitting a New Request" },
      { id: "pm-05", title: "Viewing & Tracking Open Requests" },
      { id: "pm-06", title: "Closing / Resolving a Request" },
      { id: "pm-07", title: "Request History & Reporting" },
    ],
  },
  {
    section: "Narratives",
    icon: "📝",
    items: [
      { id: "pm-08", title: "Creating a Narrative Report" },
      { id: "pm-09", title: "Editing & Submitting Narratives" },
      { id: "pm-10", title: "Reviewing Past Narratives" },
    ],
  },
  {
    section: "Manuals",
    icon: "📚",
    items: [
      { id: "pm-11", title: "Accessing Company Manuals" },
      { id: "pm-12", title: "Navigating Manual Categories" },
      { id: "pm-13", title: "Searching & Downloading Manual Content" },
    ],
  },
  {
    section: "Reports",
    icon: "📊",
    items: [
      { id: "pm-14", title: "Running Standard Reports" },
      { id: "pm-15", title: "Filtering & Customizing Report Views" },
      { id: "pm-16", title: "Exporting & Sharing Reports" },
    ],
  },
  {
    section: "Time Off",
    icon: "🌴",
    items: [
      { id: "pm-17", title: "Submitting a Time Off Request" },
      { id: "pm-18", title: "Viewing Time Off Balances" },
      { id: "pm-19", title: "Manager Approval Workflow for Time Off" },
    ],
  },
  {
    section: "Admin",
    icon: "⚙️",
    items: [
      { id: "pm-20", title: "User Management & Permissions" },
      { id: "pm-21", title: "System Settings Overview" },
      { id: "pm-22", title: "Audit Logs & Activity Tracking" },
    ],
  },
];

const TOTAL_ITEMS = TRAINING_SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

// ── Signature Modal ───────────────────────────────────────────────────────────
function SignatureModal({
  itemTitle,
  onConfirm,
  onCancel,
}: {
  itemTitle: string;
  onConfirm: (signature: string) => void;
  onCancel: () => void;
}) {
  const [sig, setSig] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!sig.trim()) { setError("Please type your full name as your signature."); return; }
    onConfirm(sig.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "oklch(0 0 0 / 0.7)" }}
      onClick={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ backgroundColor: AC.bgCard, border: `1px solid ${AC.border}` }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold" style={{ fontFamily: AC.heading, color: AC.fg }}>
              Confirm Training Completion
            </h3>
            <p className="text-sm mt-1" style={{ color: AC.fgMuted }}>
              "{itemTitle}"
            </p>
          </div>
          <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: AC.bgRaised, color: AC.fgMuted }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: AC.bgRaised, color: AC.fgMuted }}>
          <PenLine className="w-4 h-4 inline mr-2" style={{ color: AC.teal }} />
          By signing below, you confirm that you have watched and understood this training module.
        </div>

        <label className="block mb-1 text-sm font-semibold" style={{ color: AC.fgSubtle }}>
          Electronic Signature (type your full name)
        </label>
        <input
          type="text"
          value={sig}
          onChange={e => { setSig(e.target.value); setError(""); }}
          placeholder="e.g. Jane Smith"
          className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
          style={{
            backgroundColor: AC.bgRaised,
            border: `2px solid ${error ? "oklch(0.65 0.22 25)" : sig.trim() ? AC.green : AC.border}`,
            color: AC.fg,
          }}
          onKeyDown={e => { if (e.key === "Enter") handleConfirm(); }}
          autoFocus
        />
        {error && <p className="text-xs mt-1" style={{ color: "oklch(0.65 0.22 25)" }}>{error}</p>}

        <div className="flex gap-3 mt-5">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
            style={{ backgroundColor: AC.bgRaised, color: AC.fgMuted, border: `1px solid ${AC.border}` }}>
            Cancel
          </button>
          <button onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
            style={{ backgroundColor: AC.green, color: "oklch(0.13 0.06 142)" }}>
            ✓ Confirm & Sign
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PropertyMaxTraining({ onBack }: { onBack?: () => void }) {
  const { data: progress, isLoading, refetch } = trpc.training.getMyProgress.useQuery();
  const completeItem = trpc.training.completeItem.useMutation({ onSuccess: () => refetch() });
  const uncompleteItem = trpc.training.uncompleteItem.useMutation({ onSuccess: () => refetch() });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    Object.fromEntries(TRAINING_SECTIONS.map(s => [s.section, true]))
  );
  const [pendingItem, setPendingItem] = useState<{ id: string; title: string } | null>(null);

  // Build a map of completed items
  const completedMap: Record<string, { completedAt: Date | null; signature: string | null }> = {};
  if (progress) {
    progress.forEach(p => {
      if (p.completed) completedMap[p.itemId] = { completedAt: p.completedAt, signature: p.signature };
    });
  }

  const completedCount = Object.keys(completedMap).length;
  const progressPct = Math.round((completedCount / TOTAL_ITEMS) * 100);

  const toggleSection = (section: string) =>
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

  const handleCheck = (item: { id: string; title: string }, isCompleted: boolean) => {
    if (isCompleted) {
      uncompleteItem.mutate({ itemId: item.id });
    } else {
      setPendingItem(item);
    }
  };

  const handleSignatureConfirm = (signature: string) => {
    if (!pendingItem) return;
    completeItem.mutate({ itemId: pendingItem.id, signature });
    setPendingItem(null);
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto" style={{ color: AC.fg }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <button onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={{ backgroundColor: AC.bgCard, border: `1px solid ${AC.border}`, color: AC.fgMuted }}>
            <ChevronDown className="w-4 h-4 rotate-90" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: AC.heading }}>
            PropertyMAX.ai Training
          </h1>
          <p className="text-sm mt-0.5" style={{ color: AC.fgMuted }}>
            Complete each module and sign off to confirm understanding
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: AC.bgCard, border: `1px solid ${AC.border}` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" style={{ color: AC.teal }} />
            <span className="text-sm font-semibold" style={{ color: AC.fg }}>Overall Progress</span>
          </div>
          <span className="text-sm font-bold" style={{ color: progressPct === 100 ? AC.green : AC.teal }}>
            {completedCount} / {TOTAL_ITEMS} modules
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: AC.bgRaised }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: progressPct === 100 ? AC.green : AC.teal }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        {progressPct === 100 && (
          <div className="flex items-center gap-2 mt-3 text-sm font-semibold" style={{ color: AC.green }}>
            <Award className="w-4 h-4" />
            Training Complete — All modules signed off!
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: AC.teal, borderTopColor: "transparent" }} />
        </div>
      )}

      {/* Sections */}
      {!isLoading && (
        <div className="space-y-3">
          {TRAINING_SECTIONS.map(section => {
            const sectionCompleted = section.items.filter(i => completedMap[i.id]).length;
            const sectionTotal = section.items.length;
            const allDone = sectionCompleted === sectionTotal;
            const isExpanded = expandedSections[section.section];

            return (
              <div key={section.section} className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: AC.bgCard, border: `1px solid ${allDone ? "oklch(0.78 0.22 142 / 0.4)" : AC.border}` }}>

                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.section)}
                  className="w-full flex items-center justify-between p-4 transition-all"
                  style={{ backgroundColor: allDone ? "oklch(0.17 0.08 142)" : AC.bgCard }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{section.icon}</span>
                    <div className="text-left">
                      <div className="font-semibold text-sm" style={{ fontFamily: AC.heading, color: AC.fg }}>
                        {section.section}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: allDone ? AC.green : AC.fgMuted }}>
                        {sectionCompleted}/{sectionTotal} completed
                        {allDone && " ✓"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Mini progress dots */}
                    <div className="flex gap-1">
                      {section.items.map(item => (
                        <div key={item.id} className="w-2 h-2 rounded-full transition-all"
                          style={{ backgroundColor: completedMap[item.id] ? AC.green : AC.bgRaised }} />
                      ))}
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4" style={{ color: AC.fgSubtle }} />
                      : <ChevronDown className="w-4 h-4" style={{ color: AC.fgSubtle }} />
                    }
                  </div>
                </button>

                {/* Items */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}>
                      <div className="px-4 pb-4 space-y-2">
                        {section.items.map((item, idx) => {
                          const done = !!completedMap[item.id];
                          const record = completedMap[item.id];
                          const isPending = completeItem.isPending || uncompleteItem.isPending;

                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.04 }}
                              className="rounded-xl p-3 transition-all"
                              style={{
                                backgroundColor: done ? "oklch(0.16 0.07 142)" : AC.bgRaised,
                                border: `1px solid ${done ? "oklch(0.78 0.22 142 / 0.25)" : AC.border}`,
                              }}>
                              <div className="flex items-start gap-3">
                                {/* Checkbox */}
                                <button
                                  onClick={() => handleCheck(item, done)}
                                  disabled={isPending}
                                  className="mt-0.5 flex-shrink-0 transition-all active:scale-90">
                                  {done
                                    ? <CheckCircle2 className="w-5 h-5" style={{ color: AC.green }} />
                                    : <Circle className="w-5 h-5" style={{ color: AC.fgSubtle }} />
                                  }
                                </button>

                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium" style={{ color: done ? AC.green : AC.fg,
                                    textDecoration: done ? "line-through" : "none",
                                    textDecorationColor: "oklch(0.78 0.22 142 / 0.5)" }}>
                                    {item.title}
                                  </div>

                                  {/* Completion metadata */}
                                  {done && record && (
                                    <div className="mt-1.5 space-y-0.5">
                                      {record.completedAt && (
                                        <div className="flex items-center gap-1.5 text-xs" style={{ color: AC.fgMuted }}>
                                          <Clock className="w-3 h-3" />
                                          Completed {new Date(record.completedAt).toLocaleString()}
                                        </div>
                                      )}
                                      {record.signature && (
                                        <div className="flex items-center gap-1.5 text-xs" style={{ color: AC.fgMuted }}>
                                          <PenLine className="w-3 h-3" />
                                          Signed: <span className="font-semibold italic" style={{ color: AC.green }}>{record.signature}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <div className="mt-6 text-center text-xs" style={{ color: AC.fgSubtle }}>
        Each item requires your electronic signature to confirm completion.
        Your progress is saved automatically.
      </div>

      {/* Signature Modal */}
      <AnimatePresence>
        {pendingItem && (
          <SignatureModal
            itemTitle={pendingItem.title}
            onConfirm={handleSignatureConfirm}
            onCancel={() => setPendingItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
