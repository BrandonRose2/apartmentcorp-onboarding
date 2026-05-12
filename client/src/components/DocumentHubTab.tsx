/**
 * DocumentHubTab — Document upload and organization hub
 * Design: Warm Professional — file folder cards grouped by phase
 * Features: Drag-and-drop upload, file list, remove files, export summary
 */

import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, Download, FolderOpen } from "lucide-react";
import { DOC_CATEGORIES, PHASES, type UploadedFile } from "@/lib/onboardingData";
import { nanoid } from "nanoid";
import { toast } from "sonner";

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
  const handleExportSummary = () => {
    const lines: string[] = [
      "ApartmentCorp Onboarding — Document Summary",
      `Generated: ${new Date().toLocaleString()}`,
      `Total Files: ${totalFiles} across ${categoriesFiled} categories`,
      "",
    ];

    PHASES.forEach((phase) => {
      const phaseCats = DOC_CATEGORIES.filter((c) => c.phaseId === phase.id);
      lines.push(`=== ${phase.title} (${phase.timeline}) ===`);
      phaseCats.forEach((cat) => {
        const files = uploadedFiles[cat.id] || [];
        lines.push(`  ${cat.icon} ${cat.title}: ${files.length} file(s)`);
        files.forEach((f) => lines.push(`    - ${f.name} (${formatFileSize(f.size)})`));
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "oklch(0.22 0.06 250)" }}
          >
            Document Hub
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "oklch(0.50 0.03 250)" }}>
            Upload and organize all required onboarding documents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm" style={{ color: "oklch(0.50 0.03 250)" }}>
            <span className="font-semibold" style={{ color: "oklch(0.22 0.06 250)" }}>{totalFiles}</span> files total &nbsp;·&nbsp;
            <span className="font-semibold" style={{ color: "oklch(0.22 0.06 250)" }}>{categoriesFiled}</span> categories filed
          </div>
          <button
            onClick={handleExportSummary}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95"
            style={{ backgroundColor: "oklch(0.22 0.06 250)", color: "white" }}
          >
            <Download className="w-4 h-4" />
            Export Summary
          </button>
        </div>
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

function DocCategoryCard({
  category,
  files,
  onAddFile,
  onRemoveFile,
}: {
  category: (typeof DOC_CATEGORIES)[0];
  files: UploadedFile[];
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

  const hasFiled = files.length > 0;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor: hasFiled ? "oklch(0.55 0.14 40 / 0.40)" : "oklch(0.88 0.02 80)",
        backgroundColor: "oklch(1 0 0)",
      }}
    >
      {/* Card "Tab" Header — file folder aesthetic */}
      <div
        className="px-4 py-3 border-b flex items-start gap-2"
        style={{
          backgroundColor: hasFiled ? "oklch(0.55 0.14 40 / 0.07)" : "oklch(0.97 0.01 80)",
          borderColor: hasFiled ? "oklch(0.55 0.14 40 / 0.25)" : "oklch(0.92 0.01 80)",
        }}
      >
        <span className="text-xl flex-shrink-0">{category.icon}</span>
        <div className="flex-1 min-w-0">
          <div
            className="text-sm font-semibold leading-tight"
            style={{ color: "oklch(0.22 0.06 250)" }}
          >
            {category.title}
          </div>
          <div className="text-xs mt-0.5 leading-snug" style={{ color: "oklch(0.55 0.03 250)" }}>
            {category.description}
          </div>
        </div>
        {hasFiled && (
          <span
            className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full font-semibold"
            style={{ backgroundColor: "oklch(0.55 0.14 40)", color: "white" }}
          >
            {files.length}
          </span>
        )}
      </div>

      {/* Drop Zone */}
      <div className="p-3">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="drop-zone rounded-lg border-2 border-dashed flex flex-col items-center justify-center py-4 cursor-pointer transition-all"
          style={{
            borderColor: isDragging ? "oklch(0.55 0.14 40)" : "oklch(0.85 0.02 80)",
            backgroundColor: isDragging ? "oklch(0.55 0.14 40 / 0.05)" : "transparent",
          }}
        >
          <Upload
            className="w-5 h-5 mb-1"
            style={{ color: isDragging ? "oklch(0.55 0.14 40)" : "oklch(0.65 0.02 250)" }}
          />
          <span className="text-xs" style={{ color: "oklch(0.55 0.03 250)" }}>
            Drop or click to add files
          </span>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleChange}
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-2 space-y-1">
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
