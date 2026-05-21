/**
 * NewHireReviewTab — Admin Dashboard panel for reviewing new hire form submissions
 * Ethan can: see all registered new hires, assign building + position, review/approve forms, manage logins
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Users, Building2, ChevronDown, ChevronRight, CheckCircle2, XCircle,
  Clock, AlertCircle, FileText, Eye, EyeOff, X, KeyRound, Save, Copy
} from "lucide-react";
import { toast } from "sonner";

type Position = "leasing" | "maintenance" | "management" | "admin_staff" | "other";
type OnboardingStatus = "pending" | "in_progress" | "submitted" | "brandon_approved" | "robert_approved" | "ethan_approved" | "nicole_approved" | "marc_approved" | "rejected";
type ApproverRole = "brandon" | "robert" | "ethan" | "nicole" | "marc";

const POSITION_LABELS: Record<Position, string> = {
  leasing: "Leasing Agent",
  maintenance: "Maintenance",
  management: "Management",
  admin_staff: "Admin Staff",
  other: "Other",
};

const STATUS_CONFIG: Record<OnboardingStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:          { label: "Pending",              color: "oklch(0.65 0.05 250)",  icon: <Clock className="w-3 h-3" /> },
  in_progress:      { label: "In Progress",          color: "oklch(0.72 0.12 220)",  icon: <AlertCircle className="w-3 h-3" /> },
  submitted:        { label: "Submitted",             color: "oklch(0.72 0.15 200)",  icon: <FileText className="w-3 h-3" /> },
  brandon_approved: { label: "Brandon ✓ → Robert",    color: "oklch(0.65 0.15 165)",  icon: <CheckCircle2 className="w-3 h-3" /> },
  robert_approved:  { label: "Robert ✓ → Ethan",     color: "oklch(0.65 0.16 155)",  icon: <CheckCircle2 className="w-3 h-3" /> },
  ethan_approved:   { label: "Ethan ✓ → Nicole",     color: "oklch(0.65 0.17 148)",  icon: <CheckCircle2 className="w-3 h-3" /> },
  nicole_approved:  { label: "Nicole ✓ → Marc",      color: "oklch(0.65 0.18 145)",  icon: <CheckCircle2 className="w-3 h-3" /> },
  marc_approved:    { label: "Fully Onboarded ✓",    color: "oklch(0.55 0.20 145)",  icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected:         { label: "Rejected",              color: "oklch(0.60 0.20 25)",   icon: <XCircle className="w-3 h-3" /> },
};

const FORM_TYPE_LABELS: Record<string, string> = {
  employment_application: "Employment Application",
  confidentiality_agreement: "Confidentiality Agreement",
  tracking_agreement: "GPS/Tracking Agreement",
  policies_acknowledgment: "Policies Acknowledgment",
  direct_deposit: "Direct Deposit",
  w4: "Federal W-4",
  it2104: "NY IT-2104",
  i9: "I-9 Employment Eligibility",
  maintenance_test: "Maintenance Skills Test",
};

// All platforms from the image provided
const ALL_PLATFORMS = [
  "Paychex", "AppWork", "Connecteam", "Sensor", "Phone Portal",
  "Yardi", "Inspections", "Genesis", "Webster", "B of A",
  "Purchasing", "Vacancy", "AI Bot", "OneSite",
];

interface CredentialRow {
  platform: string;
  required: boolean;
  username: string;
  password: string;
  notes: string;
}

function buildDefaultCredentials(existing: any[]): CredentialRow[] {
  const map = new Map(existing.map((c: any) => [c.platform, c]));
  return ALL_PLATFORMS.map(platform => {
    const saved = map.get(platform);
    return {
      platform,
      required: saved?.required ?? false,
      username: saved?.username ?? "",
      password: saved?.password ?? "",
      notes: saved?.notes ?? "",
    };
  });
}

// ─── Credentials Modal ────────────────────────────────────────────────────────
function CredentialsModal({
  hire,
  onClose,
}: {
  hire: { id: number; email: string };
  onClose: () => void;
}) {
  const { data: existing, isLoading } = trpc.admin.getCredentials.useQuery({ newHireId: hire.id });
  const [rows, setRows] = useState<CredentialRow[]>([]);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const utils = trpc.useUtils();

  useEffect(() => {
    if (existing !== undefined) {
      setRows(buildDefaultCredentials(existing));
    }
  }, [existing]);

  const saveMutation = trpc.admin.saveCredentials.useMutation({
    onSuccess: () => {
      utils.admin.getCredentials.invalidate({ newHireId: hire.id });
      toast.success("Credentials saved successfully");
    },
    onError: () => toast.error("Failed to save credentials"),
  });

  const toggleRequired = (platform: string) => {
    setRows(prev => prev.map(r => r.platform === platform ? { ...r, required: !r.required } : r));
  };

  const updateField = (platform: string, field: "username" | "password" | "notes", value: string) => {
    setRows(prev => prev.map(r => r.platform === platform ? { ...r, [field]: value } : r));
  };

  const toggleReveal = (platform: string) => {
    setRevealedPasswords(prev => {
      const next = new Set(prev);
      if (next.has(platform)) next.delete(platform);
      else next.add(platform);
      return next;
    });
  };

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value).then(() => toast.success(`${label} copied`));
  };

  const handleSave = () => {
    saveMutation.mutate({
      newHireId: hire.id,
      credentials: rows.map(r => ({
        platform: r.platform,
        required: r.required,
        username: r.username || null,
        password: r.password || null,
        notes: r.notes || null,
      })),
    });
  };

  const requiredCount = rows.filter(r => r.required).length;
  const filledCount = rows.filter(r => r.required && r.username).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "oklch(0 0 0 / 0.75)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        style={{ backgroundColor: "oklch(0.14 0.06 258)", border: "1px solid oklch(0.28 0.08 256)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "oklch(0.25 0.07 256)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "oklch(0.22 0.12 220)" }}>
              <KeyRound className="w-4 h-4" style={{ color: "oklch(0.72 0.15 220)" }} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Platform Logins
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.03 250)" }}>{hire.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {requiredCount > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "oklch(0.22 0.07 258)", color: "oklch(0.72 0.12 220)", border: "1px solid oklch(0.30 0.08 256)" }}>
                {filledCount}/{requiredCount} filled
              </span>
            )}
            <button onClick={onClose} style={{ color: "oklch(0.55 0.03 250)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-6 py-3 flex-shrink-0" style={{ backgroundColor: "oklch(0.17 0.07 258)", borderBottom: "1px solid oklch(0.22 0.07 256)" }}>
          <p className="text-xs" style={{ color: "oklch(0.65 0.05 250)" }}>
            Check the platforms this employee needs access to, then enter their credentials. Only checked platforms will be visible to the new hire.
          </p>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2">
          {isLoading ? (
            <p className="text-xs text-center py-8" style={{ color: "oklch(0.55 0.03 250)" }}>Loading...</p>
          ) : (
            rows.map(row => (
              <div
                key={row.platform}
                className="rounded-xl overflow-hidden transition-all"
                style={{
                  backgroundColor: row.required ? "oklch(0.18 0.07 258)" : "oklch(0.15 0.05 258)",
                  border: `1px solid ${row.required ? "oklch(0.32 0.10 256)" : "oklch(0.22 0.06 256)"}`,
                }}
              >
                {/* Platform header row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        backgroundColor: row.required ? "oklch(0.55 0.14 40)" : "oklch(0.22 0.07 258)",
                        border: `1px solid ${row.required ? "oklch(0.55 0.14 40)" : "oklch(0.35 0.08 256)"}`,
                      }}
                      onClick={() => toggleRequired(row.platform)}
                    >
                      {row.required && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: row.required ? "white" : "oklch(0.55 0.04 250)" }}
                      onClick={() => toggleRequired(row.platform)}
                    >
                      {row.platform}
                    </span>
                  </label>
                  {row.required && row.username && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "oklch(0.22 0.10 145)", color: "oklch(0.65 0.18 145)" }}>
                      ✓ Set
                    </span>
                  )}
                  {row.required && !row.username && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "oklch(0.22 0.08 40)", color: "oklch(0.72 0.15 40)" }}>
                      Pending
                    </span>
                  )}
                </div>

                {/* Credential fields — only show when required */}
                {row.required && (
                  <div className="px-4 pb-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ borderTop: "1px solid oklch(0.22 0.07 256)" }}>
                    {/* Username */}
                    <div className="mt-3">
                      <label className="text-xs mb-1 block" style={{ color: "oklch(0.65 0.05 250)" }}>Username / Email</label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={row.username}
                          onChange={e => updateField(row.platform, "username", e.target.value)}
                          placeholder="username or email"
                          className="flex-1 text-xs rounded-lg px-3 py-2 outline-none text-white"
                          style={{ backgroundColor: "oklch(0.20 0.07 258)", border: "1px solid oklch(0.30 0.08 256)" }}
                        />
                        {row.username && (
                          <button
                            onClick={() => copyToClipboard(row.username, "Username")}
                            className="px-2 rounded-lg transition-all flex-shrink-0"
                            style={{ backgroundColor: "oklch(0.22 0.07 258)", color: "oklch(0.65 0.05 250)", border: "1px solid oklch(0.30 0.08 256)" }}
                            title="Copy username"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Password */}
                    <div className="mt-3">
                      <label className="text-xs mb-1 block" style={{ color: "oklch(0.65 0.05 250)" }}>Password</label>
                      <div className="flex gap-1">
                        <input
                          type={revealedPasswords.has(row.platform) ? "text" : "password"}
                          value={row.password}
                          onChange={e => updateField(row.platform, "password", e.target.value)}
                          placeholder="password"
                          className="flex-1 text-xs rounded-lg px-3 py-2 outline-none text-white"
                          style={{ backgroundColor: "oklch(0.20 0.07 258)", border: "1px solid oklch(0.30 0.08 256)" }}
                        />
                        <button
                          onClick={() => toggleReveal(row.platform)}
                          className="px-2 rounded-lg transition-all flex-shrink-0"
                          style={{ backgroundColor: "oklch(0.22 0.07 258)", color: "oklch(0.65 0.05 250)", border: "1px solid oklch(0.30 0.08 256)" }}
                          title={revealedPasswords.has(row.platform) ? "Hide password" : "Show password"}
                        >
                          {revealedPasswords.has(row.platform) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        {row.password && (
                          <button
                            onClick={() => copyToClipboard(row.password, "Password")}
                            className="px-2 rounded-lg transition-all flex-shrink-0"
                            style={{ backgroundColor: "oklch(0.22 0.07 258)", color: "oklch(0.65 0.05 250)", border: "1px solid oklch(0.30 0.08 256)" }}
                            title="Copy password"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notes — full width */}
                    <div className="sm:col-span-2">
                      <label className="text-xs mb-1 block" style={{ color: "oklch(0.65 0.05 250)" }}>Notes (optional)</label>
                      <input
                        type="text"
                        value={row.notes}
                        onChange={e => updateField(row.platform, "notes", e.target.value)}
                        placeholder="e.g. change password on first login, assigned to Region 3..."
                        className="w-full text-xs rounded-lg px-3 py-2 outline-none text-white"
                        style={{ backgroundColor: "oklch(0.20 0.07 258)", border: "1px solid oklch(0.30 0.08 256)" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between flex-shrink-0" style={{ borderColor: "oklch(0.25 0.07 256)" }}>
          <p className="text-xs" style={{ color: "oklch(0.45 0.04 250)" }}>
            Checked platforms are visible to the new hire in their portal.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="text-xs px-4 py-2 rounded-lg transition-all"
              style={{ color: "oklch(0.55 0.03 250)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="text-xs px-5 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
              style={{ backgroundColor: "oklch(0.55 0.14 40)", color: "white" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(0.60 0.16 40)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "oklch(0.55 0.14 40)")}
            >
              <Save className="w-3.5 h-3.5" />
              {saveMutation.isPending ? "Saving..." : "Save Logins"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function NewHireReviewTab() {
  const [expandedHireId, setExpandedHireId] = useState<number | null>(null);
  const [assigningHireId, setAssigningHireId] = useState<number | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<number | "">("");
  const [selectedPosition, setSelectedPosition] = useState<Position | "">("");
  const [reviewingSubmission, setReviewingSubmission] = useState<{ id: number; newHireId: number; formType: string; formData: unknown } | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [approverName, setApproverName] = useState("Brandon Cowles");
  const [approverEmail, setApproverEmail] = useState("brandon@apartmentcorp.com");
  const [approverRole, setApproverRole] = useState<ApproverRole>("brandon");
  const [credentialsHire, setCredentialsHire] = useState<{ id: number; email: string } | null>(null);

  const { data: hires, refetch: refetchHires } = trpc.admin.listNewHires.useQuery();
  const { data: buildings } = trpc.buildings.list.useQuery();
  const { data: selectedHireData, refetch: refetchHireData } = trpc.admin.getNewHireSubmissions.useQuery(
    { newHireId: expandedHireId! },
    { enabled: expandedHireId !== null }
  );

  const assignMutation = trpc.admin.assignNewHire.useMutation({
    onSuccess: () => {
      refetchHires();
      if (expandedHireId) refetchHireData();
      setAssigningHireId(null);
    },
  });

  const reviewMutation = trpc.admin.reviewSubmission.useMutation({
    onSuccess: () => {
      refetchHires();
      if (expandedHireId) refetchHireData();
      setReviewingSubmission(null);
      setApprovalNotes("");
    },
  });

  const handleAssign = (hireId: number) => {
    if (!selectedBuilding && !selectedPosition) return;
    assignMutation.mutate({
      newHireId: hireId,
      buildingId: selectedBuilding ? Number(selectedBuilding) : undefined,
      position: selectedPosition || undefined,
    });
  };

  const handleReview = (action: "approved" | "rejected") => {
    if (!reviewingSubmission) return;
    reviewMutation.mutate({
      submissionId: reviewingSubmission.id,
      newHireId: reviewingSubmission.newHireId,
      action,
      approverName,
      approverEmail,
      approverRole,
      notes: approvalNotes || undefined,
    });
  };

  const toggleExpand = (hireId: number) => {
    if (expandedHireId === hireId) {
      setExpandedHireId(null);
    } else {
      setExpandedHireId(hireId);
    }
  };

  const startAssign = (hireId: number, currentBuildingId?: number | null, currentPosition?: string | null) => {
    setAssigningHireId(hireId);
    setSelectedBuilding(currentBuildingId ?? "");
    setSelectedPosition((currentPosition as Position) ?? "");
  };

  if (!hires) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-sm" style={{ color: "oklch(0.65 0.05 250)" }}>Loading new hire data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" style={{ color: "oklch(0.72 0.12 220)" }} />
          <h2 className="font-semibold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            New Hire Review Panel
          </h2>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: "oklch(0.22 0.07 258)", color: "oklch(0.72 0.12 220)", border: "1px solid oklch(0.30 0.08 256)" }}
          >
            {hires.length} registered
          </span>
        </div>
      </div>

      {hires.length === 0 ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{ backgroundColor: "oklch(0.18 0.06 258)", border: "1px solid oklch(0.28 0.08 256)" }}
        >
          <Users className="w-8 h-8 mx-auto mb-3" style={{ color: "oklch(0.40 0.05 250)" }} />
          <p className="text-sm font-medium text-white mb-1">No new hires registered yet</p>
          <p className="text-xs" style={{ color: "oklch(0.55 0.03 250)" }}>
            New hires will appear here once they register on the portal.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {hires.map((hire: any) => {
            const status = (hire.onboardingStatus as OnboardingStatus) ?? "pending";
            const statusCfg = STATUS_CONFIG[status];
            const isExpanded = expandedHireId === hire.id;
            const isAssigning = assigningHireId === hire.id;

            return (
              <div
                key={hire.id}
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: "oklch(0.18 0.06 258)", border: "1px solid oklch(0.28 0.08 256)" }}
              >
                {/* Hire Row */}
                <div className="flex items-center gap-3 p-4">
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: "oklch(0.55 0.14 40)" }}
                  >
                    {hire.email.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white text-sm font-medium truncate">{hire.email}</span>
                      <span
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: "oklch(0.22 0.07 258)", color: statusCfg.color, border: `1px solid ${statusCfg.color}40` }}
                      >
                        {statusCfg.icon}
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {hire.building ? (
                        <span className="text-xs flex items-center gap-1" style={{ color: "oklch(0.72 0.12 220)" }}>
                          <Building2 className="w-3 h-3" />
                          {hire.building.name}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "oklch(0.45 0.04 250)" }}>No building assigned</span>
                      )}
                      {hire.position && (
                        <span className="text-xs" style={{ color: "oklch(0.65 0.05 250)" }}>
                          · {POSITION_LABELS[hire.position as Position] ?? hire.position}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: "oklch(0.40 0.04 250)" }}>
                        Registered {new Date(hire.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                    <button
                      onClick={() => startAssign(hire.id, hire.buildingId, hire.position)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                      style={{ backgroundColor: "oklch(0.22 0.07 258)", color: "oklch(0.72 0.12 220)", border: "1px solid oklch(0.30 0.08 256)" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(0.28 0.08 256)")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "oklch(0.22 0.07 258)")}
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => setCredentialsHire({ id: hire.id, email: hire.email })}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1"
                      style={{ backgroundColor: "oklch(0.22 0.10 220)", color: "oklch(0.72 0.15 220)", border: "1px solid oklch(0.30 0.12 220)" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(0.28 0.12 220)")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "oklch(0.22 0.10 220)")}
                    >
                      <KeyRound className="w-3 h-3" />
                      Logins
                    </button>
                    <button
                      onClick={() => toggleExpand(hire.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1"
                      style={{ backgroundColor: "oklch(0.22 0.07 258)", color: "oklch(0.65 0.05 250)", border: "1px solid oklch(0.30 0.08 256)" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(0.28 0.08 256)")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "oklch(0.22 0.07 258)")}
                    >
                      <Eye className="w-3 h-3" />
                      Forms
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Assign Panel */}
                {isAssigning && (
                  <div
                    className="px-4 pb-4 pt-0 border-t"
                    style={{ borderColor: "oklch(0.25 0.07 256)" }}
                  >
                    <div className="mt-3 p-3 rounded-lg space-y-3" style={{ backgroundColor: "oklch(0.15 0.06 258)" }}>
                      <p className="text-xs font-semibold text-white">Assign Building & Position</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Building select */}
                        <div>
                          <label className="text-xs mb-1 block" style={{ color: "oklch(0.65 0.05 250)" }}>Building</label>
                          <select
                            value={selectedBuilding}
                            onChange={e => setSelectedBuilding(e.target.value ? Number(e.target.value) : "")}
                            className="w-full text-xs rounded-lg px-3 py-2 outline-none"
                            style={{ backgroundColor: "oklch(0.22 0.07 258)", color: "white", border: "1px solid oklch(0.30 0.08 256)" }}
                          >
                            <option value="">— Select Building —</option>
                            {buildings?.map((b: any) => (
                              <option key={b.id} value={b.id}>{b.name} ({b.region})</option>
                            ))}
                          </select>
                        </div>
                        {/* Position select */}
                        <div>
                          <label className="text-xs mb-1 block" style={{ color: "oklch(0.65 0.05 250)" }}>Position</label>
                          <select
                            value={selectedPosition}
                            onChange={e => setSelectedPosition(e.target.value as Position | "")}
                            className="w-full text-xs rounded-lg px-3 py-2 outline-none"
                            style={{ backgroundColor: "oklch(0.22 0.07 258)", color: "white", border: "1px solid oklch(0.30 0.08 256)" }}
                          >
                            <option value="">— Select Position —</option>
                            {Object.entries(POSITION_LABELS).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {/* Show regional manager info if building selected */}
                      {selectedBuilding && buildings && (
                        (() => {
                          const b = buildings.find((bld: any) => bld.id === Number(selectedBuilding));
                          if (!b) return null;
                          return (
                            <div className="text-xs p-2 rounded" style={{ backgroundColor: "oklch(0.18 0.06 258)", color: "oklch(0.65 0.05 250)" }}>
                              <span className="font-medium text-white">Regional Manager:</span>{" "}
                              {b.regionalManagerName ?? "TBD"}{b.regionalManagerEmail ? ` (${b.regionalManagerEmail})` : ""}
                              {b.managerName && (
                                <span className="ml-3">
                                  <span className="font-medium text-white">Property Manager:</span>{" "}
                                  {b.managerName}{b.managerEmail ? ` (${b.managerEmail})` : ""}
                                </span>
                              )}
                            </div>
                          );
                        })()
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAssign(hire.id)}
                          disabled={assignMutation.isPending}
                          className="text-xs px-4 py-1.5 rounded-lg font-semibold transition-all"
                          style={{ backgroundColor: "oklch(0.55 0.14 40)", color: "white" }}
                        >
                          {assignMutation.isPending ? "Saving..." : "Save Assignment"}
                        </button>
                        <button
                          onClick={() => setAssigningHireId(null)}
                          className="text-xs px-3 py-1.5 rounded-lg transition-all"
                          style={{ color: "oklch(0.55 0.03 250)" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Submissions Panel */}
                {isExpanded && (
                  <div
                    className="px-4 pb-4 pt-0 border-t"
                    style={{ borderColor: "oklch(0.25 0.07 256)" }}
                  >
                    <div className="mt-3">
                      {!selectedHireData ? (
                        <p className="text-xs py-3" style={{ color: "oklch(0.55 0.03 250)" }}>Loading submissions...</p>
                      ) : selectedHireData.submissions.length === 0 ? (
                        <p className="text-xs py-3" style={{ color: "oklch(0.55 0.03 250)" }}>No form submissions yet.</p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold mb-2" style={{ color: "oklch(0.65 0.05 250)" }}>
                            Form Submissions ({selectedHireData.submissions.length})
                          </p>
                          {selectedHireData.submissions.map((sub: any) => {
                            const subStatus = sub.status as string;
                            const isApproved = subStatus.includes("approved");
                            const isRejected = subStatus.includes("rejected");
                            const isPending = subStatus === "submitted";
                            return (
                              <div
                                key={sub.id}
                                className="flex items-center justify-between p-3 rounded-lg"
                                style={{ backgroundColor: "oklch(0.15 0.06 258)", border: "1px solid oklch(0.25 0.07 256)" }}
                              >
                                <div>
                                  <p className="text-xs font-medium text-white">
                                    {FORM_TYPE_LABELS[sub.formType] ?? sub.formType}
                                  </p>
                                  <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.03 250)" }}>
                                    {subStatus.replace(/_/g, " ")} · {new Date(sub.submittedAt ?? sub.updatedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isApproved && (
                                    <span className="text-xs flex items-center gap-1" style={{ color: "oklch(0.65 0.18 145)" }}>
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                                    </span>
                                  )}
                                  {isRejected && (
                                    <span className="text-xs flex items-center gap-1" style={{ color: "oklch(0.60 0.20 25)" }}>
                                      <XCircle className="w-3.5 h-3.5" /> Rejected
                                    </span>
                                  )}
                                  {isPending && (
                                    <button
                                      onClick={() => setReviewingSubmission({ id: sub.id, newHireId: hire.id, formType: sub.formType, formData: sub.formData })}
                                      className="text-xs px-3 py-1 rounded-lg font-medium transition-all"
                                      style={{ backgroundColor: "oklch(0.55 0.14 40)", color: "white" }}
                                    >
                                      Review
                                    </button>
                                  )}
                                  {!isPending && !isApproved && !isRejected && (
                                    <button
                                      onClick={() => setReviewingSubmission({ id: sub.id, newHireId: hire.id, formType: sub.formType, formData: sub.formData })}
                                      className="text-xs px-3 py-1 rounded-lg font-medium transition-all"
                                      style={{ backgroundColor: "oklch(0.22 0.07 258)", color: "oklch(0.65 0.05 250)", border: "1px solid oklch(0.30 0.08 256)" }}
                                    >
                                      View
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Credentials Modal */}
      {credentialsHire && (
        <CredentialsModal
          hire={credentialsHire}
          onClose={() => setCredentialsHire(null)}
        />
      )}

      {/* Review Modal */}
      {reviewingSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "oklch(0 0 0 / 0.7)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) setReviewingSubmission(null); }}
        >
          <div
            className="rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
            style={{ backgroundColor: "oklch(0.15 0.06 258)", border: "1px solid oklch(0.28 0.08 256)" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "oklch(0.25 0.07 256)" }}>
              <div>
                <h3 className="text-white font-semibold text-sm" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Review: {FORM_TYPE_LABELS[reviewingSubmission.formType] ?? reviewingSubmission.formType}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.03 250)" }}>Submission #{reviewingSubmission.id}</p>
              </div>
              <button onClick={() => setReviewingSubmission(null)} style={{ color: "oklch(0.55 0.03 250)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Data Preview */}
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "oklch(0.65 0.05 250)" }}>Submitted Data</p>
                <div
                  className="rounded-lg p-3 text-xs font-mono overflow-auto max-h-48"
                  style={{ backgroundColor: "oklch(0.12 0.05 258)", color: "oklch(0.72 0.05 250)", border: "1px solid oklch(0.22 0.07 256)" }}
                >
                  {Object.entries(reviewingSubmission.formData as Record<string, unknown>).map(([key, val]) => (
                    <div key={key} className="flex gap-2 py-0.5">
                      <span style={{ color: "oklch(0.65 0.12 220)" }}>{key}:</span>
                      <span className="break-all">{String(val ?? "—")}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approver Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "oklch(0.65 0.05 250)" }}>Approver Name</label>
                  <input
                    type="text"
                    value={approverName}
                    onChange={e => setApproverName(e.target.value)}
                    className="w-full text-xs rounded-lg px-3 py-2 outline-none text-white"
                    style={{ backgroundColor: "oklch(0.22 0.07 258)", border: "1px solid oklch(0.30 0.08 256)" }}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "oklch(0.65 0.05 250)" }}>Approver Email</label>
                  <input
                    type="email"
                    value={approverEmail}
                    onChange={e => setApproverEmail(e.target.value)}
                    className="w-full text-xs rounded-lg px-3 py-2 outline-none text-white"
                    style={{ backgroundColor: "oklch(0.22 0.07 258)", border: "1px solid oklch(0.30 0.08 256)" }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: "oklch(0.65 0.05 250)" }}>Approver</label>
                <select
                  value={approverRole}
                  onChange={e => setApproverRole(e.target.value as ApproverRole)}
                  className="w-full text-xs rounded-lg px-3 py-2 outline-none text-white"
                  style={{ backgroundColor: "oklch(0.22 0.07 258)", border: "1px solid oklch(0.30 0.08 256)" }}
                >
                  <option value="brandon">Brandon</option>
                  <option value="robert">Robert</option>
                  <option value="ethan">Ethan</option>
                  <option value="nicole">Nicole</option>
                  <option value="marc">Marc</option>
                </select>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: "oklch(0.65 0.05 250)" }}>Notes (optional)</label>
                <textarea
                  value={approvalNotes}
                  onChange={e => setApprovalNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes or feedback..."
                  className="w-full text-xs rounded-lg px-3 py-2 outline-none text-white resize-none"
                  style={{ backgroundColor: "oklch(0.22 0.07 258)", border: "1px solid oklch(0.30 0.08 256)" }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleReview("approved")}
                  disabled={reviewMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: "oklch(0.45 0.18 145)", color: "white" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(0.50 0.20 145)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "oklch(0.45 0.18 145)")}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {reviewMutation.isPending ? "Saving..." : "Approve"}
                </button>
                <button
                  onClick={() => handleReview("rejected")}
                  disabled={reviewMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: "oklch(0.45 0.18 25)", color: "white" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(0.50 0.20 25)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "oklch(0.45 0.18 25)")}
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
