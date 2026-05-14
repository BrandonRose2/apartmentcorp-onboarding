/**
 * ApartmentCorp — Reminders & Discussion Checklist (Admin)
 * A personal scratchpad for items to discuss with existing COO and upcoming COO.
 * Features: add/edit/delete items, priority tags, assignee labels, done toggle, notes, localStorage persistence.
 * Brand: Warm Professional — navy/terracotta/cream palette, Playfair Display headings
 */

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Pencil, Check, X, ChevronDown, ChevronUp, StickyNote } from "lucide-react";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

type Priority = "urgent" | "high" | "normal" | "low";
type Assignee = "Both COOs" | "Existing COO" | "Upcoming COO" | "Self" | "Team";

interface ReminderItem {
  id: string;
  text: string;
  note: string;
  done: boolean;
  priority: Priority;
  assignee: Assignee;
  createdAt: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "ac_reminders_v1";

const PRIORITY_META: Record<Priority, { label: string; dot: string; badge: string; text: string }> = {
  urgent: { label: "Urgent",  dot: "oklch(0.65 0.22 25)",  badge: "oklch(0.65 0.22 25 / 0.15)",  text: "oklch(0.65 0.22 25)" },
  high:   { label: "High",    dot: "oklch(0.55 0.14 40)",  badge: "oklch(0.55 0.14 40 / 0.15)",  text: "oklch(0.55 0.14 40)" },
  normal: { label: "Normal",  dot: "oklch(0.40 0.12 220)", badge: "oklch(0.40 0.12 220 / 0.15)", text: "oklch(0.40 0.12 220)" },
  low:    { label: "Low",     dot: "oklch(0.55 0.04 250)", badge: "oklch(0.55 0.04 250 / 0.12)", text: "oklch(0.55 0.04 250)" },
};

const ASSIGNEE_META: Record<Assignee, { emoji: string; color: string }> = {
  "Both COOs":    { emoji: "👥", color: "oklch(0.38 0.12 290)" },
  "Existing COO": { emoji: "🏛️", color: "oklch(0.40 0.12 160)" },
  "Upcoming COO": { emoji: "🚀", color: "oklch(0.55 0.14 40)"  },
  "Self":         { emoji: "👤", color: "oklch(0.22 0.06 250)" },
  "Team":         { emoji: "🤝", color: "oklch(0.55 0.14 70)"  },
};

const PRIORITIES: Priority[]  = ["urgent", "high", "normal", "low"];
const ASSIGNEES: Assignee[]   = ["Both COOs", "Existing COO", "Upcoming COO", "Self", "Team"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const DEFAULT_REMINDERS: ReminderItem[] = [
  {
    id: "default-1",
    text: "Design Ethan Fowler's Technology Onboarding admin flow — credential provisioning ecosystem",
    note: "Full blueprint:\n\n1. BUILD: Ethan's fillable Technology Onboarding intake form (already started in the Technology Onboarding tab) — he fills in every login/credential for each new hire across all platforms.\n\n2. AUTO-POPULATE: Once Ethan marks a record complete, the new hire's Company Websites & Logins tab is automatically populated with their personal credentials.\n\n3. SHAREPOINT SYNC: All completed records auto-sync to a SharePoint file in the ApartmentCorp OneDrive as a permanent HR record — accessible to Ethan, Admin Staff, and the new hire via unique PIN #.\n\n4. SECURE ACCESS: New hire accesses their credential page via a unique PIN # — Ethan and Admin see all employees, new hire sees only their own.\n\n5. SEND ETHAN: Send Ethan a fillable form webpage of everything included in his onboarding process — the information he inputs will auto-populate the Company Websites & Logins tab once complete.\n\nNeeds: Microsoft 365 tenant domain, Ethan's admin email, SharePoint folder path.",
    done: false,
    priority: "urgent",
    assignee: "Both COOs",
    createdAt: Date.now() - 5 * 86400000,
  },
  {
    id: "default-2",
    text: "Collect current new hire forms (W-4, I-9, direct deposit, etc.) and build them as interactive fillable forms in the employee onboarding portal",
    note: "Upload the actual current new hire paperwork to Manus and the forms will be converted into interactive, fillable chapters in the employee-facing onboarding portal. Replaces the placeholder 'forms coming soon' sections in Chapters 2–6 of the employee journey.",
    done: false,
    priority: "high",
    assignee: "Self",
    createdAt: Date.now() - 4 * 86400000,
  },
  {
    id: "default-3",
    text: "Build PropertyMAX.ai Training Videos & Modules section — a dedicated area to house all screen recording training videos",
    note: "Create a Training Videos & Modules section in association with the training phase of the onboarding portal. This will be a library where screen recording videos made for PropertyMAX.ai can be uploaded and organized by topic/module. New hires can watch and mark videos as complete as part of their onboarding journey.",
    done: false,
    priority: "high",
    assignee: "Self",
    createdAt: Date.now() - 3 * 86400000,
  },
  {
    id: "default-4",
    text: "Revise and update the ApartmentCorp Employee Handbook",
    note: "The Employee Handbook needs to be reviewed, revised, and updated to reflect current company policies, procedures, and culture. Once updated, upload to the portal so new hires can access and sign the acknowledgment digitally during onboarding.",
    done: false,
    priority: "high",
    assignee: "Both COOs",
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: "default-5",
    text: "Create a browser bookmarks HTML file that new employees can download and import to instantly load all ApartmentCorp company bookmarks",
    note: "Build a downloadable browser bookmarks file (.html) pre-loaded with all company website links (PropertyMAX.ai, OneSite, AppWork, Connecteam, Paychex, Yardi, etc.). New hire downloads the file, imports it into Chrome/Edge, and instantly has all company bookmarks organized in a folder. Add download link to the Useful Resources tab.",
    done: false,
    priority: "normal",
    assignee: "Self",
    createdAt: Date.now() - 1 * 86400000,
  },
  {
    id: "default-6",
    text: "Add UC Connect or ConnectUP phone app/website into the Communication & Collaboration section of the Technology Onboarding form",
    note: "Research whether it is UC Connect or ConnectUP, confirm the correct login URL, and add it as a dedicated field in the Phone Portal or Communication section of Ethan's Technology Onboarding form. Also add to the Company Websites & Logins tab.",
    done: false,
    priority: "normal",
    assignee: "Self",
    createdAt: Date.now(),
  },
  {
    id: "default-7",
    text: "Review, verify & finalize all new hire fillable forms — ensure every applicable document is complete, accurate, and live in the employee onboarding portal",
    note: "NEW HIRE FORMS CHECKLIST — verify each is built, fillable, auto-saving, PDF-exportable, and files to the correct ecosystem folder:\n\n☐ W-4 — Federal Employee's Withholding Certificate\n☐ State Tax Withholding Form (state-specific)\n☐ I-9 — Employment Eligibility Verification\n☐ Direct Deposit Authorization Form\n☐ Emergency Contact & Personal Information Form\n☐ Offer Letter Acknowledgment\n☐ Background Check Authorization\n☐ Employee Handbook Acknowledgment & Signature\n☐ Benefits Enrollment Form (health, dental, vision, 401k)\n☐ Drug & Alcohol Policy Acknowledgment\n☐ At-Will Employment Acknowledgment\n☐ Non-Disclosure Agreement (NDA)\n☐ Code of Conduct & Ethics Acknowledgment\n☐ Fair Housing Training Acknowledgment\n☐ OSHA / Safety Training Acknowledgment\n☐ Payroll Schedule & Pay Method Confirmation\n☐ IT Equipment & Acceptable Use Policy\n☐ Social Media Policy Acknowledgment\n\nEach form must have:\n✓ Auto-save every 30 seconds\n✓ Export to PDF button\n✓ File to Ecosystem Folder button (saves to 03 - Human Resources > 01 - New Hire Onboarding)\n✓ Completion confirmation notification",
    done: false,
    priority: "urgent",
    assignee: "Self",
    createdAt: Date.now() + 1000,
  },
];

function loadItems(): ReminderItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: ReminderItem[] = JSON.parse(raw);
      // Merge: keep user items, add any default items not already present
      const existingIds = new Set(parsed.map(i => i.id));
      const missing = DEFAULT_REMINDERS.filter(d => !existingIds.has(d.id));
      return missing.length > 0 ? [...missing, ...parsed] : parsed;
    }
    return DEFAULT_REMINDERS;
  } catch {
    return DEFAULT_REMINDERS;
  }
}

function saveItems(items: ReminderItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ── Main Component ────────────────────────────────────────────────────────────

export function RemindersTab() {
  const [items, setItems] = useState<ReminderItem[]>(loadItems);
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [filterAssignee, setFilterAssignee] = useState<Assignee | "all">("all");
  const [showAdd, setShowAdd] = useState(false);

  // Persist on every change
  useEffect(() => { saveItems(items); }, [items]);

  const update = (id: string, patch: Partial<ReminderItem>) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));

  const remove = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Reminder removed");
  };

  const toggle = (id: string) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));

  const add = (item: Omit<ReminderItem, "id" | "createdAt">) => {
    setItems(prev => [{ ...item, id: uid(), createdAt: Date.now() }, ...prev]);
    setShowAdd(false);
    toast.success("Reminder added");
  };

  const visible = items
    .filter(i => filter === "all" || (filter === "open" ? !i.done : i.done))
    .filter(i => filterAssignee === "all" || i.assignee === filterAssignee)
    .sort((a, b) => {
      const pOrder: Priority[] = ["urgent", "high", "normal", "low"];
      if (a.done !== b.done) return a.done ? 1 : -1;
      return pOrder.indexOf(a.priority) - pOrder.indexOf(b.priority) || b.createdAt - a.createdAt;
    });

  const openCount = items.filter(i => !i.done).length;
  const doneCount = items.filter(i => i.done).length;

  return (
    <div style={{ fontFamily: "'Source Sans 3', 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="w-8 h-0.5 rounded-full mb-3" style={{ backgroundColor: "oklch(0.55 0.14 40)" }} />
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "oklch(0.22 0.06 250)" }}>
              Reminders &amp; Discussion Items
            </h2>
            <p className="text-sm" style={{ color: "oklch(0.50 0.03 250)" }}>
              Track items to discuss with your existing COO and upcoming COO. Saves automatically.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ backgroundColor: "oklch(0.55 0.14 40 / 0.12)", color: "oklch(0.45 0.12 40)" }}>
              {openCount} open
            </span>
            {doneCount > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ backgroundColor: "oklch(0.94 0.01 80)", color: "oklch(0.55 0.03 250)" }}>
                {doneCount} done
              </span>
            )}
            <button
              onClick={() => setShowAdd(v => !v)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95"
              style={{ backgroundColor: "oklch(0.22 0.06 250)", color: "white" }}
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </div>

        {/* Add Form */}
        {showAdd && (
          <AddForm onAdd={add} onCancel={() => setShowAdd(false)} />
        )}

        {/* Filters */}
        <div className="mt-5 flex flex-wrap gap-2 items-center">
          {/* Status filter */}
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "oklch(0.88 0.02 80)" }}>
            {(["all", "open", "done"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 text-xs font-medium capitalize transition-all"
                style={{
                  backgroundColor: filter === f ? "oklch(0.22 0.06 250)" : "white",
                  color: filter === f ? "white" : "oklch(0.50 0.03 250)",
                }}
              >
                {f === "all" ? `All (${items.length})` : f === "open" ? `Open (${openCount})` : `Done (${doneCount})`}
              </button>
            ))}
          </div>

          {/* Assignee filter */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterAssignee("all")}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor: filterAssignee === "all" ? "oklch(0.22 0.06 250)" : "oklch(0.94 0.01 80)",
                color: filterAssignee === "all" ? "white" : "oklch(0.40 0.03 250)",
              }}
            >
              All People
            </button>
            {ASSIGNEES.map(a => {
              const meta = ASSIGNEE_META[a];
              const isActive = filterAssignee === a;
              return (
                <button
                  key={a}
                  onClick={() => setFilterAssignee(a)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? meta.color : "oklch(0.94 0.01 80)",
                    color: isActive ? "white" : "oklch(0.40 0.03 250)",
                  }}
                >
                  <span>{meta.emoji}</span>
                  <span className="hidden sm:inline">{a}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {visible.length === 0 && (
        <div
          className="text-center py-16 rounded-xl border-2 border-dashed"
          style={{ borderColor: "oklch(0.88 0.02 80)", color: "oklch(0.60 0.03 250)" }}
        >
          <StickyNote className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {items.length === 0 ? "No reminders yet — add your first item above." : "No items match your current filters."}
          </p>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {visible.map(item => (
          <ReminderCard
            key={item.id}
            item={item}
            onToggle={() => toggle(item.id)}
            onUpdate={patch => update(item.id, patch)}
            onDelete={() => remove(item.id)}
          />
        ))}
      </div>

      {/* Footer hint */}
      {items.length > 0 && (
        <p className="mt-6 text-xs text-center" style={{ color: "oklch(0.65 0.02 250)" }}>
          All reminders save automatically in your browser. Clear your browser data to reset.
        </p>
      )}
    </div>
  );
}

// ── Add Form ──────────────────────────────────────────────────────────────────

function AddForm({ onAdd, onCancel }: { onAdd: (item: Omit<ReminderItem, "id" | "createdAt">) => void; onCancel: () => void }) {
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [assignee, setAssignee] = useState<Assignee>("Both COOs");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => {
    if (!text.trim()) { toast.error("Please enter a reminder item."); return; }
    onAdd({ text: text.trim(), note: note.trim(), done: false, priority, assignee });
  };

  return (
    <div
      className="mt-4 rounded-xl border p-4 space-y-3"
      style={{ backgroundColor: "oklch(0.99 0.005 80)", borderColor: "oklch(0.88 0.02 80)" }}
    >
      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "oklch(0.55 0.03 250)" }}>
        New Reminder
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="What needs to be discussed or done?"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
        className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none transition-all"
        style={{ borderColor: "oklch(0.88 0.02 80)", color: "oklch(0.22 0.06 250)" }}
        onFocus={e => (e.target.style.borderColor = "oklch(0.22 0.06 250)")}
        onBlur={e => (e.target.style.borderColor = "oklch(0.88 0.02 80)")}
      />
      <textarea
        placeholder="Optional note or context..."
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all resize-none"
        style={{ borderColor: "oklch(0.88 0.02 80)", color: "oklch(0.22 0.06 250)" }}
        onFocus={e => (e.target.style.borderColor = "oklch(0.22 0.06 250)")}
        onBlur={e => (e.target.style.borderColor = "oklch(0.88 0.02 80)")}
      />
      <div className="flex flex-wrap gap-3 items-center">
        {/* Priority */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium" style={{ color: "oklch(0.55 0.03 250)" }}>Priority:</span>
          <div className="flex gap-1">
            {PRIORITIES.map(p => {
              const meta = PRIORITY_META[p];
              return (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    backgroundColor: priority === p ? meta.badge : "oklch(0.94 0.01 80)",
                    color: priority === p ? meta.text : "oklch(0.55 0.03 250)",
                    border: `1px solid ${priority === p ? meta.dot : "transparent"}`,
                  }}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* Assignee */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium" style={{ color: "oklch(0.55 0.03 250)" }}>For:</span>
          <select
            value={assignee}
            onChange={e => setAssignee(e.target.value as Assignee)}
            className="px-2.5 py-1 rounded-lg border text-xs focus:outline-none"
            style={{ borderColor: "oklch(0.88 0.02 80)", color: "oklch(0.22 0.06 250)" }}
          >
            {ASSIGNEES.map(a => (
              <option key={a} value={a}>{ASSIGNEE_META[a].emoji} {a}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={submit}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95"
          style={{ backgroundColor: "oklch(0.22 0.06 250)", color: "white" }}
        >
          <Plus className="w-4 h-4" /> Add Reminder
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ backgroundColor: "oklch(0.94 0.01 80)", color: "oklch(0.50 0.03 250)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Reminder Card ─────────────────────────────────────────────────────────────

function ReminderCard({
  item,
  onToggle,
  onUpdate,
  onDelete,
}: {
  item: ReminderItem;
  onToggle: () => void;
  onUpdate: (patch: Partial<ReminderItem>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editNote, setEditNote] = useState(item.note);
  const [editPriority, setEditPriority] = useState<Priority>(item.priority);
  const [editAssignee, setEditAssignee] = useState<Assignee>(item.assignee);
  const [expanded, setExpanded] = useState(false);

  const pMeta = PRIORITY_META[item.priority];
  const aMeta = ASSIGNEE_META[item.assignee];

  const saveEdit = () => {
    if (!editText.trim()) return;
    onUpdate({ text: editText.trim(), note: editNote.trim(), priority: editPriority, assignee: editAssignee });
    setEditing(false);
    toast.success("Reminder updated");
  };

  const cancelEdit = () => {
    setEditText(item.text);
    setEditNote(item.note);
    setEditPriority(item.priority);
    setEditAssignee(item.assignee);
    setEditing(false);
  };

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all"
      style={{
        borderColor: item.done ? "oklch(0.92 0.01 80)" : "oklch(0.88 0.02 80)",
        backgroundColor: item.done ? "oklch(0.97 0.005 80)" : "white",
        opacity: item.done ? 0.75 : 1,
      }}
    >
      {editing ? (
        /* Edit Mode */
        <div className="p-4 space-y-3">
          <input
            autoFocus
            type="text"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && saveEdit()}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={{ borderColor: "oklch(0.22 0.06 250)", color: "oklch(0.22 0.06 250)" }}
          />
          <textarea
            value={editNote}
            onChange={e => setEditNote(e.target.value)}
            rows={2}
            placeholder="Optional note..."
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none resize-none"
            style={{ borderColor: "oklch(0.88 0.02 80)", color: "oklch(0.22 0.06 250)" }}
          />
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium" style={{ color: "oklch(0.55 0.03 250)" }}>Priority:</span>
              <div className="flex gap-1">
                {PRIORITIES.map(p => {
                  const meta = PRIORITY_META[p];
                  return (
                    <button key={p} onClick={() => setEditPriority(p)}
                      className="px-2 py-0.5 rounded-full text-xs font-medium transition-all"
                      style={{
                        backgroundColor: editPriority === p ? meta.badge : "oklch(0.94 0.01 80)",
                        color: editPriority === p ? meta.text : "oklch(0.55 0.03 250)",
                        border: `1px solid ${editPriority === p ? meta.dot : "transparent"}`,
                      }}
                    >{meta.label}</button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium" style={{ color: "oklch(0.55 0.03 250)" }}>For:</span>
              <select value={editAssignee} onChange={e => setEditAssignee(e.target.value as Assignee)}
                className="px-2 py-0.5 rounded-lg border text-xs focus:outline-none"
                style={{ borderColor: "oklch(0.88 0.02 80)", color: "oklch(0.22 0.06 250)" }}
              >
                {ASSIGNEES.map(a => <option key={a} value={a}>{ASSIGNEE_META[a].emoji} {a}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveEdit}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
              style={{ backgroundColor: "oklch(0.22 0.06 250)", color: "white" }}>
              <Check className="w-3.5 h-3.5" /> Save
            </button>
            <button onClick={cancelEdit}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ backgroundColor: "oklch(0.94 0.01 80)", color: "oklch(0.50 0.03 250)" }}>
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        /* View Mode */
        <>
          <div className="flex items-start gap-3 px-4 py-3">
            {/* Checkbox */}
            <button
              onClick={onToggle}
              className="flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
              style={{
                borderColor: item.done ? "oklch(0.55 0.14 40)" : "oklch(0.75 0.03 250)",
                backgroundColor: item.done ? "oklch(0.55 0.14 40)" : "transparent",
              }}
            >
              {item.done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <span
                  className="text-sm font-medium leading-snug"
                  style={{
                    color: item.done ? "oklch(0.60 0.03 250)" : "oklch(0.22 0.06 250)",
                    textDecoration: item.done ? "line-through" : "none",
                  }}
                >
                  {item.text}
                </span>
                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setEditing(true)}
                    className="p-1.5 rounded-lg transition-all hover:bg-[oklch(0.94_0.01_80)]"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" style={{ color: "oklch(0.60 0.03 250)" }} />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-1.5 rounded-lg transition-all hover:bg-[oklch(0.65_0.22_25_/_0.10)]"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.22 25)" }} />
                  </button>
                </div>
              </div>

              {/* Tags row */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {/* Priority badge */}
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: pMeta.badge, color: pMeta.text }}
                >
                  {pMeta.label}
                </span>
                {/* Assignee badge */}
                <span
                  className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${aMeta.color}22`, color: aMeta.color }}
                >
                  <span>{aMeta.emoji}</span>
                  <span>{item.assignee}</span>
                </span>
                {/* Note toggle */}
                {item.note && (
                  <button
                    onClick={() => setExpanded(v => !v)}
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all"
                    style={{ backgroundColor: "oklch(0.94 0.01 80)", color: "oklch(0.50 0.03 250)" }}
                  >
                    <StickyNote className="w-3 h-3" />
                    Note
                    {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {/* Expanded note */}
              {expanded && item.note && (
                <div
                  className="mt-2 px-3 py-2 rounded-lg text-xs leading-relaxed"
                  style={{ backgroundColor: "oklch(0.97 0.01 80)", color: "oklch(0.40 0.03 250)", borderLeft: "3px solid oklch(0.55 0.14 40)" }}
                >
                  {item.note}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
