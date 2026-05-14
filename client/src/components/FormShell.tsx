/**
 * ApartmentCorp — FormShell
 * Shared wrapper for all new hire fillable forms.
 * Features: auto-save every 30s, PDF export (print), folder filing simulation, completion tracking.
 * Brand: ApartmentCorp dark navy + teal accent
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Save, FileDown, FolderOpen, CheckCircle2, Clock, ArrowLeft, Printer } from "lucide-react";
import { toast } from "sonner";

interface FormShellProps {
  formId: string;
  formTitle: string;
  formSubtitle: string;
  folderPath: string;
  children: React.ReactNode;
  onBack?: () => void;
  isComplete?: boolean;
  onMarkComplete?: () => void;
}

export function FormShell({
  formId,
  formTitle,
  formSubtitle,
  folderPath,
  children,
  onBack,
  isComplete = false,
  onMarkComplete,
}: FormShellProps) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      setLastSaved(new Date());
      setSaving(false);
    }, 600);
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      triggerSave();
    }, 30000);
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [triggerSave]);

  const handleManualSave = () => {
    triggerSave();
    toast.success("Form saved", { description: "Your progress has been saved." });
  };

  const handleExportPDF = () => {
    toast.info("Preparing PDF export...", { description: "Your browser print dialog will open." });
    setTimeout(() => window.print(), 500);
  };

  const handleFileToFolder = () => {
    toast.success("Filed to Ecosystem Folder", {
      description: `Saved to: ${folderPath}`,
      duration: 5000,
    });
  };

  const handleMarkComplete = () => {
    if (onMarkComplete) onMarkComplete();
    toast.success("Form marked complete!", {
      description: "This form has been marked as completed in your onboarding checklist.",
    });
  };

  return (
    <div className="form-shell-wrapper" style={{ minHeight: "100vh", background: "oklch(0.13 0.06 258)", color: "oklch(0.97 0.005 220)" }}>
      {/* Print styles */}
      <style>{`
        @media print {
          .form-shell-no-print { display: none !important; }
          .form-shell-wrapper { background: white !important; color: black !important; }
          .form-shell-content { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      {/* Top bar */}
      <div className="form-shell-no-print" style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "oklch(0.10 0.06 258 / 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid oklch(0.72 0.12 220 / 0.2)",
        padding: "0.75rem 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
        flexWrap: "wrap",
      }}>
        {/* Left: back + title */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {onBack && (
            <button onClick={onBack} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "oklch(0.72 0.12 220)", display: "flex", alignItems: "center", gap: "0.4rem",
              fontSize: "0.85rem", fontFamily: "Inter, sans-serif",
            }}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div>
            <div style={{ fontSize: "0.7rem", color: "oklch(0.72 0.12 220)", fontFamily: "Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              ApartmentCorp · New Hire Forms
            </div>
            <div style={{ fontSize: "1rem", fontFamily: "Cormorant Garamond, serif", fontWeight: 600, color: "oklch(0.97 0.005 220)" }}>
              {formTitle}
            </div>
          </div>
        </div>

        {/* Right: action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          {/* Auto-save status */}
          <div style={{ fontSize: "0.72rem", color: "oklch(0.65 0.04 250)", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Clock size={12} />
            {saving ? "Saving..." : lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Auto-saves every 30s"}
          </div>

          <button onClick={handleManualSave} style={{
            background: "oklch(0.22 0.08 256)", border: "1px solid oklch(0.72 0.12 220 / 0.3)",
            borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer",
            color: "oklch(0.97 0.005 220)", fontSize: "0.8rem", fontFamily: "Inter, sans-serif",
            display: "flex", alignItems: "center", gap: "0.35rem",
            transition: "all 0.15s ease",
          }}>
            <Save size={13} /> Save
          </button>

          <button onClick={handleExportPDF} style={{
            background: "oklch(0.22 0.08 256)", border: "1px solid oklch(0.72 0.12 220 / 0.3)",
            borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer",
            color: "oklch(0.97 0.005 220)", fontSize: "0.8rem", fontFamily: "Inter, sans-serif",
            display: "flex", alignItems: "center", gap: "0.35rem",
          }}>
            <Printer size={13} /> Export PDF
          </button>

          <button onClick={handleFileToFolder} style={{
            background: "oklch(0.22 0.08 256)", border: "1px solid oklch(0.72 0.12 220 / 0.3)",
            borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer",
            color: "oklch(0.97 0.005 220)", fontSize: "0.8rem", fontFamily: "Inter, sans-serif",
            display: "flex", alignItems: "center", gap: "0.35rem",
          }}>
            <FolderOpen size={13} /> File to Folder
          </button>

          {!isComplete && (
            <button onClick={handleMarkComplete} style={{
              background: "oklch(0.45 0.15 160)", border: "none",
              borderRadius: "6px", padding: "0.4rem 0.9rem", cursor: "pointer",
              color: "white", fontSize: "0.8rem", fontFamily: "Inter, sans-serif", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "0.35rem",
            }}>
              <CheckCircle2 size={13} /> Mark Complete
            </button>
          )}
          {isComplete && (
            <div style={{
              background: "oklch(0.45 0.15 160 / 0.2)", border: "1px solid oklch(0.45 0.15 160)",
              borderRadius: "6px", padding: "0.4rem 0.9rem",
              color: "oklch(0.72 0.18 160)", fontSize: "0.8rem", fontFamily: "Inter, sans-serif",
              display: "flex", alignItems: "center", gap: "0.35rem",
            }}>
              <CheckCircle2 size={13} /> Completed
            </div>
          )}
        </div>
      </div>

      {/* Form content */}
      <div className="form-shell-content" style={{
        maxWidth: "860px", margin: "0 auto", padding: "2.5rem 1.5rem 4rem",
      }}>
        {/* Form header */}
        <div style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid oklch(0.72 0.12 220 / 0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <div style={{
              width: "3px", height: "2.5rem", background: "oklch(0.72 0.12 220)", borderRadius: "2px",
            }} />
            <div>
              <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 700, margin: 0, color: "oklch(0.97 0.005 220)" }}>
                {formTitle}
              </h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.85rem", color: "oklch(0.65 0.04 250)", margin: 0 }}>
                {formSubtitle}
              </p>
            </div>
          </div>
          <div style={{
            marginTop: "0.75rem", padding: "0.6rem 1rem",
            background: "oklch(0.72 0.12 220 / 0.08)", borderRadius: "6px",
            fontSize: "0.78rem", color: "oklch(0.72 0.12 220)", fontFamily: "Inter, sans-serif",
            display: "flex", alignItems: "center", gap: "0.5rem",
          }}>
            <FolderOpen size={13} />
            Files to: <strong>{folderPath}</strong>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

// ── Shared form field components ──────────────────────────────────────────────

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2 style={{
        fontFamily: "Cormorant Garamond, serif", fontSize: "1.25rem", fontWeight: 600,
        color: "oklch(0.72 0.12 220)", marginBottom: "1rem",
        paddingBottom: "0.4rem", borderBottom: "1px solid oklch(0.72 0.12 220 / 0.2)",
      }}>
        {title}
      </h2>
      <div style={{ display: "grid", gap: "1rem" }}>
        {children}
      </div>
    </div>
  );
}

export function FormField({ label, required, hint, children }: FieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{
        fontFamily: "Inter, sans-serif", fontSize: "0.8rem", fontWeight: 500,
        color: "oklch(0.75 0.04 250)",
        display: "flex", gap: "0.25rem", alignItems: "center",
      }}>
        {label}
        {required && <span style={{ color: "oklch(0.65 0.22 25)" }}>*</span>}
      </label>
      {children}
      {hint && (
        <span style={{ fontSize: "0.72rem", color: "oklch(0.55 0.04 250)", fontFamily: "Inter, sans-serif" }}>
          {hint}
        </span>
      )}
    </div>
  );
}

export function FormInput({
  storageKey, fieldKey, placeholder, type = "text",
}: {
  storageKey: string; fieldKey: string; placeholder?: string; type?: string;
}) {
  const key = `${storageKey}_${fieldKey}`;
  const [val, setVal] = useState(() => localStorage.getItem(key) || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVal(e.target.value);
    localStorage.setItem(key, e.target.value);
  };

  return (
    <input
      type={type}
      value={val}
      onChange={handleChange}
      placeholder={placeholder}
      style={{
        background: "oklch(0.18 0.06 258)", border: "1px solid oklch(0.72 0.12 220 / 0.25)",
        borderRadius: "6px", padding: "0.55rem 0.75rem",
        color: "oklch(0.97 0.005 220)", fontFamily: "Inter, sans-serif", fontSize: "0.875rem",
        outline: "none", width: "100%", boxSizing: "border-box",
        transition: "border-color 0.15s ease",
      }}
      onFocus={e => (e.target.style.borderColor = "oklch(0.72 0.12 220)")}
      onBlur={e => (e.target.style.borderColor = "oklch(0.72 0.12 220 / 0.25)")}
    />
  );
}

export function FormSelect({
  storageKey, fieldKey, options, placeholder,
}: {
  storageKey: string; fieldKey: string; options: string[]; placeholder?: string;
}) {
  const key = `${storageKey}_${fieldKey}`;
  const [val, setVal] = useState(() => localStorage.getItem(key) || "");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVal(e.target.value);
    localStorage.setItem(key, e.target.value);
  };

  return (
    <select
      value={val}
      onChange={handleChange}
      style={{
        background: "oklch(0.18 0.06 258)", border: "1px solid oklch(0.72 0.12 220 / 0.25)",
        borderRadius: "6px", padding: "0.55rem 0.75rem",
        color: val ? "oklch(0.97 0.005 220)" : "oklch(0.55 0.04 250)",
        fontFamily: "Inter, sans-serif", fontSize: "0.875rem",
        outline: "none", width: "100%", cursor: "pointer",
      }}
    >
      <option value="" disabled>{placeholder || "Select..."}</option>
      {options.map(o => <option key={o} value={o} style={{ background: "oklch(0.18 0.06 258)" }}>{o}</option>)}
    </select>
  );
}

export function FormTextarea({
  storageKey, fieldKey, placeholder, rows = 3,
}: {
  storageKey: string; fieldKey: string; placeholder?: string; rows?: number;
}) {
  const key = `${storageKey}_${fieldKey}`;
  const [val, setVal] = useState(() => localStorage.getItem(key) || "");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVal(e.target.value);
    localStorage.setItem(key, e.target.value);
  };

  return (
    <textarea
      value={val}
      onChange={handleChange}
      placeholder={placeholder}
      rows={rows}
      style={{
        background: "oklch(0.18 0.06 258)", border: "1px solid oklch(0.72 0.12 220 / 0.25)",
        borderRadius: "6px", padding: "0.55rem 0.75rem",
        color: "oklch(0.97 0.005 220)", fontFamily: "Inter, sans-serif", fontSize: "0.875rem",
        outline: "none", width: "100%", boxSizing: "border-box", resize: "vertical",
      }}
      onFocus={e => (e.target.style.borderColor = "oklch(0.72 0.12 220)")}
      onBlur={e => (e.target.style.borderColor = "oklch(0.72 0.12 220 / 0.25)")}
    />
  );
}

export function FormCheckbox({
  storageKey, fieldKey, label,
}: {
  storageKey: string; fieldKey: string; label: string;
}) {
  const key = `${storageKey}_${fieldKey}`;
  const [checked, setChecked] = useState(() => localStorage.getItem(key) === "true");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
    localStorage.setItem(key, String(e.target.checked));
  };

  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "0.85rem", color: "oklch(0.85 0.005 220)" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        style={{ marginTop: "2px", accentColor: "oklch(0.72 0.12 220)", width: "15px", height: "15px", cursor: "pointer" }}
      />
      {label}
    </label>
  );
}

export function FormRow({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "1rem" }}>
      {children}
    </div>
  );
}

export function FormSignature({ storageKey, fieldKey }: { storageKey: string; fieldKey: string }) {
  const key = `${storageKey}_${fieldKey}`;
  const [val, setVal] = useState(() => localStorage.getItem(key) || "");

  return (
    <div>
      <input
        type="text"
        value={val}
        onChange={e => { setVal(e.target.value); localStorage.setItem(key, e.target.value); }}
        placeholder="Type your full legal name as signature"
        style={{
          background: "oklch(0.18 0.06 258)", border: "1px solid oklch(0.72 0.12 220 / 0.4)",
          borderRadius: "6px", padding: "0.7rem 0.75rem",
          color: "oklch(0.97 0.005 220)", fontFamily: "Dancing Script, Brush Script MT, cursive",
          fontSize: "1.2rem", outline: "none", width: "100%", boxSizing: "border-box",
          borderBottom: "2px solid oklch(0.72 0.12 220 / 0.6)",
        }}
      />
      <div style={{ fontSize: "0.7rem", color: "oklch(0.55 0.04 250)", fontFamily: "Inter, sans-serif", marginTop: "0.25rem" }}>
        By typing your name above, you agree this constitutes your legal electronic signature.
      </div>
    </div>
  );
}
