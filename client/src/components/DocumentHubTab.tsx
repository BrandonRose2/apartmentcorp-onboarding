/**
 * DocumentHubTab — Document upload and organization hub
 * Design: Warm Professional — file folder cards grouped by phase
 * Features:
 *   - New hire selector at top: pick a new hire to view their submitted forms
 *   - Submitted forms from DB appear in the correct category cards with status badges
 *   - Manual drag-and-drop upload still works per category
 *   - Export summary
 */

import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, Download, User, ChevronDown, CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import { DOC_CATEGORIES, PHASES, type UploadedFile } from "@/lib/onboardingData";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Maps form submission types → document category IDs
const FORM_TO_CATEGORY: Record<string, string> = {
  employment_application: "doc-employment-application",
  confidentiality_agreement: "doc-confidentiality",
  tracking_agreement: "doc-tracking",
  policies_acknowledgment: "doc-policies",
  i9: "doc-i9",
  w4: "doc-w4",
  it2104: "doc-it2104",
  direct_deposit: "doc-direct-deposit",
  maintenance_test: "doc-maintenance-test",
};

const FORM_TYPE_LABELS: Record<string, string> = {
  employment_application: "Employment Application",
  confidentiality_agreement: "Confidentiality Agreement",
  tracking_agreement: "GPS / Tracking Agreement",
  policies_acknowledgment: "Policies Acknowledgment",
  i9: "I-9 Employment Eligibility",
  w4: "Federal W-4",
  it2104: "NY IT-2104",
  direct_deposit: "Direct Deposit Authorization",
  maintenance_test: "Maintenance Skills Test",
};

type SubmissionStatus = "submitted" | "hr_approved" | "hr_rejected" | "pending" | string;

interface SubmittedForm {
  id: number;
  formType: string;
  status: SubmissionStatus;
  submittedAt: Date | null;
  pdfUrl?: string | null;
}

interface DocumentHubTabProps {
  uploadedFiles: Record<string, UploadedFile[]>;
  onAddFile: (categoryId: string, file: UploadedFile) => void;
  onRemoveFile: (categoryId: string, fileId: string) => void;
  totalFiles: number;
  categoriesFiled: number;
}

export function DocumentHubTab({
  uploadedFiles,
  onAddFile,
  onRemoveFile,
  totalFiles,
  categoriesFiled,
}: DocumentHubTabProps) {
  const [selectedHireId, setSelectedHireId] = useState<number | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);

  // Fetch all new hires for the selector
  const { data: hires } = trpc.admin.listNewHires.useQuery();

  // Fetch submissions for the selected hire
  const { data: hireData, isLoading: loadingSubmissions } = trpc.admin.getNewHireSubmissions.useQuery(
    { newHireId: selectedHireId! },
    { enabled: selectedHireId !== null }
  );

  const selectedHire = hires?.find((h) => h.id === selectedHireId);

  // Build a map: categoryId → submitted form(s)
  const submittedByCategory: Record<string, SubmittedForm[]> = {};
  if (hireData?.submissions) {
    for (const sub of hireData.submissions) {
      const catId = FORM_TO_CATEGORY[sub.formType];
      if (catId) {
        if (!submittedByCategory[catId]) submittedByCategory[catId] = [];
        submittedByCategory[catId].push({
          id: sub.id,
          formType: sub.formType,
          status: sub.status,
          submittedAt: sub.submittedAt,
          pdfUrl: (sub as any).pdfUrl ?? null,
        });
      }
    }
  }

  const handleExportSummary = () => {
    const lines: string[] = [
      "ApartmentCorp Onboarding — Document Summary",
      `Generated: ${new Date().toLocaleString()}`,
      selectedHire ? `New Hire: ${selectedHire.firstName} ${selectedHire.lastName}` : "No new hire selected",
      `Manually Uploaded Files: ${totalFiles} across ${categoriesFiled} categories`,
      "",
    ];

    PHASES.forEach((phase) => {
      const phaseCats = DOC_CATEGORIES.filter((c) => c.phaseId === phase.id);
      lines.push(`=== ${phase.title} (${phase.timeline}) ===`);
      phaseCats.forEach((cat) => {
        const files = uploadedFiles[cat.id] || [];
        const submitted = submittedByCategory[cat.id] || [];
        lines.push(`  ${cat.icon} ${cat.title}:`);
        submitted.forEach((s) =>
          lines.push(`    [FORM] ${FORM_TYPE_LABELS[s.formType] ?? s.formType} — ${s.status}`)
        );
        files.forEach((f) => lines.push(`    [FILE] ${f.name} (${formatFileSize(f.size)})`));
        if (files.length === 0 && submitted.length === 0) lines.push("    (empty)");
      });
      lines.push("");
    });

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "apartmentcorp-onboarding-documents.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Document summary exported!");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "oklch(0.22 0.06 250)" }}
          >
            Document Hub
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "oklch(0.50 0.03 250)" }}>
            Select a new hire to view their submitted forms, then upload any additional supporting documents.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right text-sm hidden sm:block" style={{ color: "oklch(0.50 0.03 250)" }}>
            <span className="font-semibold" style={{ color: "oklch(0.22 0.06 250)" }}>{totalFiles}</span> uploaded &nbsp;·&nbsp;
            <span className="font-semibold" style={{ color: "oklch(0.22 0.06 250)" }}>{categoriesFiled}</span> categories
          </div>
          <button
            onClick={handleExportSummary}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95"
            style={{ backgroundColor: "oklch(0.22 0.06 250)", color: "white" }}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* New Hire Selector */}
      <div className="mb-6">
        <div className="relative inline-block w-full max-w-sm">
          <button
            onClick={() => setSelectorOpen((o) => !o)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all"
            style={{
              backgroundColor: selectedHire ? "oklch(0.55 0.14 40 / 0.06)" : "oklch(0.97 0.01 80)",
              borderColor: selectedHire ? "oklch(0.55 0.14 40 / 0.35)" : "oklch(0.88 0.02 80)",
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
              style={{ backgroundColor: selectedHire ? "oklch(0.55 0.14 40)" : "oklch(0.72 0.04 250)" }}
            >
              {selectedHire
                ? `${selectedHire.firstName[0]}${selectedHire.lastName[0]}`
                : <User className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              {selectedHire ? (
                <>
                  <div className="text-sm font-semibold truncate" style={{ color: "oklch(0.22 0.06 250)" }}>
                    {selectedHire.firstName} {selectedHire.lastName}
                  </div>
                  <div className="text-xs truncate" style={{ color: "oklch(0.55 0.03 250)" }}>
                    {selectedHire.position ?? "Position not assigned"} · {(selectedHire as any).building?.name ?? "No building"}
                  </div>
                </>
              ) : (
                <span className="text-sm" style={{ color: "oklch(0.55 0.03 250)" }}>
                  Select a new hire to view their forms…
                </span>
              )}
            </div>
            <ChevronDown
              className="w-4 h-4 flex-shrink-0 transition-transform"
              style={{
                color: "oklch(0.55 0.03 250)",
                transform: selectorOpen ? "rotate(180deg)" : "none",
              }}
            />
          </button>

          {selectorOpen && (
            <div
              className="absolute z-20 left-0 right-0 mt-1 rounded-xl border shadow-xl overflow-hidden"
              style={{ backgroundColor: "oklch(1 0 0)", borderColor: "oklch(0.88 0.02 80)" }}
            >
              {/* Clear selection */}
              {selectedHireId !== null && (
                <button
                  onClick={() => { setSelectedHireId(null); setSelectorOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all text-left"
                  style={{ color: "oklch(0.60 0.18 27)", borderBottom: "1px solid oklch(0.92 0.01 80)" }}
                >
                  <X className="w-4 h-4" />
                  Clear selection
                </button>
              )}
              {hires && hires.length > 0 ? (
                hires.map((hire) => (
                  <button
                    key={hire.id}
                    onClick={() => { setSelectedHireId(hire.id); setSelectorOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left"
                    style={{
                      backgroundColor: hire.id === selectedHireId ? "oklch(0.55 0.14 40 / 0.08)" : "transparent",
                    }}
                    onMouseEnter={(e) => { if (hire.id !== selectedHireId) (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.97 0.01 80)"; }}
                    onMouseLeave={(e) => { if (hire.id !== selectedHireId) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                      style={{ backgroundColor: "oklch(0.55 0.14 40)" }}
                    >
                      {hire.firstName[0]}{hire.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: "oklch(0.22 0.06 250)" }}>
                        {hire.firstName} {hire.lastName}
                      </div>
                      <div className="text-xs truncate" style={{ color: "oklch(0.55 0.03 250)" }}>
                        {hire.position ?? "No position"} · {(hire as any).building?.name ?? "No building"}
                      </div>
                    </div>
                    {hire.id === selectedHireId && (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.55 0.14 40)" }} />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm" style={{ color: "oklch(0.55 0.03 250)" }}>
                  No new hires registered yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading indicator */}
        {loadingSubmissions && selectedHireId !== null && (
          <p className="mt-2 text-xs" style={{ color: "oklch(0.55 0.03 250)" }}>
            Loading submitted forms…
          </p>
        )}

        {/* Submission count badge */}
        {selectedHire && hireData && (
          <p className="mt-2 text-xs" style={{ color: "oklch(0.55 0.03 250)" }}>
            <span className="font-semibold" style={{ color: "oklch(0.22 0.06 250)" }}>
              {hireData.submissions.length}
            </span>{" "}
            form{hireData.submissions.length !== 1 ? "s" : ""} submitted by {selectedHire.firstName}
          </p>
        )}
      </div>

      {/* Phase Groups */}
      <div className="space-y-8">
        {PHASES.map((phase) => {
          const phaseCats = DOC_CATEGORIES.filter((c) => c.phaseId === phase.id);
          const isNavy = phase.color === "navy";

          return (
            <div key={phase.id}>
              {/* Phase Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg mb-4"
                style={{ backgroundColor: isNavy ? "oklch(0.22 0.06 250)" : "oklch(0.55 0.14 40)" }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{
                    backgroundColor: "oklch(1 0 0 / 0.15)",
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  {phase.number}
                </div>
                <div>
                  <div
                    className="font-semibold text-white text-sm"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {phase.title}
                  </div>
                  <div className="text-xs" style={{ color: "oklch(0.85 0.02 80)" }}>
                    {phase.timeline}
                  </div>
                </div>
              </div>

              {/* Document Category Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {phaseCats.map((cat) => (
                  <DocCategoryCard
                    key={cat.id}
                    category={cat}
                    files={uploadedFiles[cat.id] || []}
                    submittedForms={submittedByCategory[cat.id] || []}
                    onAddFile={(file) => onAddFile(cat.id, file)}
                    onRemoveFile={(fileId) => onRemoveFile(cat.id, fileId)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  if (status === "hr_approved") {
    return (
      <span
        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
        style={{ backgroundColor: "oklch(0.65 0.18 145 / 0.15)", color: "oklch(0.45 0.18 145)" }}
      >
        <CheckCircle2 className="w-3 h-3" /> Approved
      </span>
    );
  }
  if (status === "hr_rejected") {
    return (
      <span
        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
        style={{ backgroundColor: "oklch(0.60 0.20 25 / 0.12)", color: "oklch(0.55 0.20 25)" }}
      >
        <XCircle className="w-3 h-3" /> Rejected
      </span>
    );
  }
  return (
    <span
      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
      style={{ backgroundColor: "oklch(0.72 0.12 220 / 0.15)", color: "oklch(0.45 0.14 220)" }}
    >
      <Clock className="w-3 h-3" /> Submitted
    </span>
  );
}

function DocCategoryCard({
  category,
  files,
  submittedForms,
  onAddFile,
  onRemoveFile,
}: {
  category: (typeof DOC_CATEGORIES)[0];
  files: UploadedFile[];
  submittedForms: SubmittedForm[];
  onAddFile: (file: UploadedFile) => void;
  onRemoveFile: (fileId: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (fileList: FileList) => {
      Array.from(fileList).forEach((file) => {
        const newFile: UploadedFile = {
          id: nanoid(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        };
        onAddFile(newFile);
        toast.success(`"${file.name}" added to ${category.title}`);
      });
    },
    [onAddFile, category.title]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  const totalCount = files.length + submittedForms.length;
  const hasFiled = totalCount > 0;
  const hasApprovedForm = submittedForms.some((s) => s.status === "hr_approved");

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor: hasApprovedForm
          ? "oklch(0.65 0.18 145 / 0.45)"
          : hasFiled
          ? "oklch(0.55 0.14 40 / 0.40)"
          : "oklch(0.88 0.02 80)",
        backgroundColor: "oklch(1 0 0)",
      }}
    >
      {/* Card Header */}
      <div
        className="px-4 py-3 border-b flex items-start gap-2"
        style={{
          backgroundColor: hasApprovedForm
            ? "oklch(0.65 0.18 145 / 0.07)"
            : hasFiled
            ? "oklch(0.55 0.14 40 / 0.07)"
            : "oklch(0.97 0.01 80)",
          borderColor: hasApprovedForm
            ? "oklch(0.65 0.18 145 / 0.25)"
            : hasFiled
            ? "oklch(0.55 0.14 40 / 0.25)"
            : "oklch(0.92 0.01 80)",
        }}
      >
        <span className="text-xl flex-shrink-0">{category.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-tight" style={{ color: "oklch(0.22 0.06 250)" }}>
            {category.title}
          </div>
          <div className="text-xs mt-0.5 leading-snug" style={{ color: "oklch(0.55 0.03 250)" }}>
            {category.description}
          </div>
        </div>
        {hasFiled && (
          <span
            className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full font-semibold"
            style={{
              backgroundColor: hasApprovedForm ? "oklch(0.65 0.18 145)" : "oklch(0.55 0.14 40)",
              color: "white",
            }}
          >
            {totalCount}
          </span>
        )}
      </div>

      <div className="p-3 space-y-2">
        {/* Submitted Forms from DB */}
        {submittedForms.length > 0 && (
          <div className="space-y-1">
            {submittedForms.map((form) => (
              <div
                key={form.id}
                className="flex items-center gap-2 px-2 py-2 rounded-lg"
                style={{ backgroundColor: "oklch(0.96 0.02 145 / 0.4)" }}
              >
                <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.45 0.18 145)" }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate" style={{ color: "oklch(0.22 0.06 250)" }}>
                    {FORM_TYPE_LABELS[form.formType] ?? form.formType}
                  </div>
                  <div className="text-xs" style={{ color: "oklch(0.60 0.02 250)" }}>
                    {form.submittedAt ? new Date(form.submittedAt).toLocaleDateString() : "Date unknown"}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <StatusBadge status={form.status} />
                  {form.pdfUrl && (
                    <a
                      href={form.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded transition-all"
                      style={{ color: "oklch(0.45 0.14 220)" }}
                      title="View PDF"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border-2 border-dashed flex flex-col items-center justify-center py-3 cursor-pointer transition-all"
          style={{
            borderColor: isDragging ? "oklch(0.55 0.14 40)" : "oklch(0.85 0.02 80)",
            backgroundColor: isDragging ? "oklch(0.55 0.14 40 / 0.05)" : "transparent",
          }}
        >
          <Upload
            className="w-4 h-4 mb-1"
            style={{ color: isDragging ? "oklch(0.55 0.14 40)" : "oklch(0.65 0.02 250)" }}
          />
          <span className="text-xs" style={{ color: "oklch(0.55 0.03 250)" }}>
            Drop or click to add files
          </span>
          <input ref={inputRef} type="file" multiple className="hidden" onChange={handleChange} />
        </div>

        {/* Manually Uploaded Files */}
        {files.length > 0 && (
          <div className="space-y-1">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg group"
                style={{ backgroundColor: "oklch(0.97 0.01 80)" }}
              >
                <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.55 0.14 40)" }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: "oklch(0.25 0.04 250)" }}>
                    {file.name}
                  </div>
                  <div className="text-xs" style={{ color: "oklch(0.60 0.02 250)" }}>
                    {formatFileSize(file.size)}
                  </div>
                </div>
                <button
                  onClick={() => onRemoveFile(file.id)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                  style={{ color: "oklch(0.55 0.20 27)" }}
                  title="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
