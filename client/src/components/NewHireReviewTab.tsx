/**
 * NewHireReviewTab — Admin Dashboard panel for reviewing new hire form submissions
 * Ethan can: see all registered new hires, assign building + position, review/approve forms
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Users, Building2, ChevronDown, ChevronRight, CheckCircle2, XCircle, Clock, AlertCircle, FileText, Eye, X } from "lucide-react";

type Position = "leasing" | "maintenance" | "management" | "admin_staff" | "other";
type OnboardingStatus = "pending" | "in_progress" | "submitted" | "manager_approved" | "hr_approved" | "rejected";

const POSITION_LABELS: Record<Position, string> = {
  leasing: "Leasing Agent",
  maintenance: "Maintenance",
  management: "Management",
  admin_staff: "Admin Staff",
  other: "Other",
};

const STATUS_CONFIG: Record<OnboardingStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "oklch(0.65 0.05 250)", icon: <Clock className="w-3 h-3" /> },
  in_progress: { label: "In Progress", color: "oklch(0.72 0.12 220)", icon: <AlertCircle className="w-3 h-3" /> },
  submitted: { label: "Submitted", color: "oklch(0.72 0.15 200)", icon: <FileText className="w-3 h-3" /> },
  manager_approved: { label: "Manager Approved", color: "oklch(0.65 0.18 145)", icon: <CheckCircle2 className="w-3 h-3" /> },
  hr_approved: { label: "Fully Onboarded", color: "oklch(0.55 0.20 145)", icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected: { label: "Rejected", color: "oklch(0.60 0.20 25)", icon: <XCircle className="w-3 h-3" /> },
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

export function NewHireReviewTab() {
  const [expandedHireId, setExpandedHireId] = useState<number | null>(null);
  const [assigningHireId, setAssigningHireId] = useState<number | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<number | "">("");
  const [selectedPosition, setSelectedPosition] = useState<Position | "">("");
  const [reviewingSubmission, setReviewingSubmission] = useState<{ id: number; newHireId: number; formType: string; formData: unknown } | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [approverName, setApproverName] = useState("Ethan Cowles");
  const [approverEmail, setApproverEmail] = useState("ethan@apartmentcorp.com");
  const [approverRole, setApproverRole] = useState<"manager" | "hr">("hr");

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
                  <div className="flex items-center gap-2 flex-shrink-0">
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
                  className="rounded-lg p-3 text-xs space-y-1.5 max-h-60 overflow-y-auto"
                  style={{ backgroundColor: "oklch(0.12 0.05 258)", color: "oklch(0.75 0.03 250)" }}
                >
                  {reviewingSubmission.formData && typeof reviewingSubmission.formData === "object" ? (
                    Object.entries(reviewingSubmission.formData as Record<string, unknown>).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="font-medium text-white min-w-0 flex-shrink-0" style={{ maxWidth: "45%" }}>
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span className="truncate">{String(value ?? "—")}</span>
                      </div>
                    ))
                  ) : (
                    <span>No data available</span>
                  )}
                </div>
              </div>

              {/* Approver Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "oklch(0.65 0.05 250)" }}>Your Name</label>
                  <input
                    value={approverName}
                    onChange={e => setApproverName(e.target.value)}
                    className="w-full text-xs rounded-lg px-3 py-2 outline-none text-white"
                    style={{ backgroundColor: "oklch(0.22 0.07 258)", border: "1px solid oklch(0.30 0.08 256)" }}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "oklch(0.65 0.05 250)" }}>Your Email</label>
                  <input
                    value={approverEmail}
                    onChange={e => setApproverEmail(e.target.value)}
                    className="w-full text-xs rounded-lg px-3 py-2 outline-none text-white"
                    style={{ backgroundColor: "oklch(0.22 0.07 258)", border: "1px solid oklch(0.30 0.08 256)" }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: "oklch(0.65 0.05 250)" }}>Approver Role</label>
                <select
                  value={approverRole}
                  onChange={e => setApproverRole(e.target.value as "manager" | "hr")}
                  className="w-full text-xs rounded-lg px-3 py-2 outline-none text-white"
                  style={{ backgroundColor: "oklch(0.22 0.07 258)", border: "1px solid oklch(0.30 0.08 256)" }}
                >
                  <option value="manager">Regional Manager</option>
                  <option value="hr">HR / Upper Management</option>
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
