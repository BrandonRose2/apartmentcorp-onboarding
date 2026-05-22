/**
 * TechOnboardingTab — Ethan Cowles's IT Provisioning Panel
 *
 * Flow:
 *   1. Shows a card for every registered new hire (from DB via admin.listNewHires)
 *   2. Ethan clicks a hire → sees a credential form for every platform
 *   3. On Save, credentials are persisted to DB via admin.saveCredentials
 *   4. New hire's Company Websites & Logins tab auto-shows those credentials
 */

import { useState } from "react";
import {
  Monitor, User, ChevronLeft, Save, CheckCircle2,
  Eye, EyeOff, Copy, Wrench, Users, Phone,
  BarChart3, DollarSign, Laptop, Building2, Cpu,
  AlertCircle, Loader2, Plus, Lock
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Platform definitions ─────────────────────────────────────────────────────
// Each entry maps to a row in new_hire_credentials (platform = id)

interface PlatformDef {
  id: string;          // matches ALL_PLATFORMS in schema
  label: string;
  icon: React.ReactNode;
  color: string;
  url: string;
  usernameLabel: string;
  passwordLabel: string;
  notesPlaceholder: string;
}

const PLATFORMS: PlatformDef[] = [
  {
    id: "PropertyMAX.ai",
    label: "PropertyMAX.ai",
    icon: <Building2 className="w-4 h-4" />,
    color: "oklch(0.62 0.16 165)",
    url: "https://propertymax.ai/app/",
    usernameLabel: "Username / Email",
    passwordLabel: "Temp Password",
    notesPlaceholder: "Role, properties assigned, notes…",
  },
  {
    id: "AppWorks",
    label: "AppWorks",
    icon: <Wrench className="w-4 h-4" />,
    color: "oklch(0.60 0.16 55)",
    url: "https://admin.appworkco.com/",
    usernameLabel: "Login Email",
    passwordLabel: "Temp Password",
    notesPlaceholder: "Role, properties assigned…",
  },
  {
    id: "Connecteam",
    label: "Connecteam",
    icon: <Users className="w-4 h-4" />,
    color: "oklch(0.62 0.18 280)",
    url: "https://app.connecteam.com/",
    usernameLabel: "Invite Email",
    passwordLabel: "Temp Password",
    notesPlaceholder: "Role, smart groups…",
  },
  {
    id: "OneSite",
    label: "OneSite (RealPage)",
    icon: <BarChart3 className="w-4 h-4" />,
    color: "oklch(0.58 0.16 240)",
    url: "https://onesite.realpage.com/",
    usernameLabel: "Username",
    passwordLabel: "Temp Password",
    notesPlaceholder: "Role, properties, modules…",
  },
  {
    id: "Paychex",
    label: "Paychex",
    icon: <DollarSign className="w-4 h-4" />,
    color: "oklch(0.60 0.16 40)",
    url: "https://myapps.paychex.com",
    usernameLabel: "Paychex Flex Username",
    passwordLabel: "Temp Password",
    notesPlaceholder: "Employee ID, pay frequency, benefits status…",
  },
  {
    id: "Phone Portal",
    label: "Phone Portal",
    icon: <Phone className="w-4 h-4" />,
    color: "oklch(0.62 0.14 195)",
    url: "https://app.ringcentral.com/",
    usernameLabel: "Login Email",
    passwordLabel: "Temp Password",
    notesPlaceholder: "Extension, DID number, call queues…",
  },
  {
    id: "Yardi",
    label: "Yardi Voyager",
    icon: <BarChart3 className="w-4 h-4" />,
    color: "oklch(0.58 0.18 30)",
    url: "https://www.yardiasp.com/",
    usernameLabel: "Username",
    passwordLabel: "Temp Password",
    notesPlaceholder: "Database, security role, properties…",
  },
  {
    id: "MyLoneWorkers.com",
    label: "MyLoneWorkers",
    icon: <Wrench className="w-4 h-4" />,
    color: "oklch(0.60 0.15 160)",
    url: "https://app.myloneworkers.com",
    usernameLabel: "Login Email",
    passwordLabel: "Temp Password",
    notesPlaceholder: "Supervisor, shift check-in notes…",
  },
  {
    id: "ConnectUC",
    label: "ConnectUC",
    icon: <Phone className="w-4 h-4" />,
    color: "oklch(0.62 0.14 220)",
    url: "https://app.connectuc.com",
    usernameLabel: "Login Email",
    passwordLabel: "Temp Password",
    notesPlaceholder: "Extension, team groups…",
  },
  {
    id: "SamePage",
    label: "SamePage",
    icon: <Users className="w-4 h-4" />,
    color: "oklch(0.60 0.14 300)",
    url: "https://samepage.io/login",
    usernameLabel: "Login Email",
    passwordLabel: "Temp Password",
    notesPlaceholder: "Workspace, team access…",
  },
  {
    id: "VMware Horizon",
    label: "VMware Horizon",
    icon: <Laptop className="w-4 h-4" />,
    color: "oklch(0.55 0.12 130)",
    url: "https://horizon.apartmentcorp.com",
    usernameLabel: "Username",
    passwordLabel: "Temp Password",
    notesPlaceholder: "Workstation serial #, connection server…",
  },
  {
    id: "Additional Systems",
    label: "Additional Systems / Notes",
    icon: <Cpu className="w-4 h-4" />,
    color: "oklch(0.58 0.14 260)",
    url: "",
    usernameLabel: "System Name & Username",
    passwordLabel: "Password / Access Code",
    notesPlaceholder: "Any other platforms, special instructions, IT ticket #…",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusColor(status: string) {
  switch (status) {
    case "all_approved": return "oklch(0.55 0.18 160)";
    case "partially_approved": return "oklch(0.60 0.18 55)";
    case "rejected": return "oklch(0.55 0.22 25)";
    case "pending": return "oklch(0.58 0.14 260)";
    default: return "oklch(0.45 0.08 258)";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "all_approved": return "✅ All Forms Approved";
    case "partially_approved": return "⏳ Partially Approved";
    case "rejected": return "❌ Has Rejections";
    case "pending": return "🕐 Pending Review";
    default: return "📋 No Submissions";
  }
}

// ─── Password field ───────────────────────────────────────────────────────────

function PasswordField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pr-16 pl-3 py-2 rounded-md text-sm border transition-all focus:outline-none"
        style={{
          backgroundColor: "oklch(0.18 0.05 258)",
          borderColor: "oklch(0.30 0.07 258)",
          color: "oklch(0.92 0.01 220)",
        }}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
        <button type="button" onClick={() => setShow(!show)}
          className="p-1 rounded opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: "oklch(0.72 0.12 220)" }} title={show ? "Hide" : "Show"}>
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button type="button" onClick={() => { navigator.clipboard.writeText(value); toast.success("Copied"); }}
          className="p-1 rounded opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: "oklch(0.72 0.12 220)" }} title="Copy">
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Platform credential row ──────────────────────────────────────────────────

function PlatformRow({
  platform,
  username,
  password,
  notes,
  required,
  onChange,
}: {
  platform: PlatformDef;
  username: string;
  password: string;
  notes: string;
  required: boolean;
  onChange: (field: "username" | "password" | "notes" | "required", val: string | boolean) => void;
}) {
  const hasData = username.trim() || password.trim();

  return (
    <div
      className="rounded-xl border p-4 transition-all"
      style={{
        backgroundColor: hasData ? "oklch(0.20 0.06 258)" : "oklch(0.17 0.04 258)",
        borderColor: hasData ? platform.color : "oklch(0.28 0.06 258)",
        borderLeftWidth: "3px",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{ color: platform.color }}>{platform.icon}</span>
          <span className="font-semibold text-sm" style={{ color: "oklch(0.92 0.01 220)" }}>
            {platform.label}
          </span>
          {platform.url && (
            <a href={platform.url} target="_blank" rel="noopener noreferrer"
              className="text-xs opacity-50 hover:opacity-80 transition-opacity"
              style={{ color: "oklch(0.72 0.12 220)" }}>
              ↗
            </a>
          )}
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={required}
            onChange={(e) => onChange("required", e.target.checked)}
            className="w-3.5 h-3.5 accent-teal-400"
          />
          <span className="text-xs" style={{ color: "oklch(0.65 0.08 220)" }}>Required for this hire</span>
        </label>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1" style={{ color: "oklch(0.65 0.08 220)" }}>
            {platform.usernameLabel}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => onChange("username", e.target.value)}
            placeholder={`e.g. jsmith@apartmentcorp.com`}
            className="w-full px-3 py-2 rounded-md text-sm border transition-all focus:outline-none"
            style={{
              backgroundColor: "oklch(0.18 0.05 258)",
              borderColor: "oklch(0.30 0.07 258)",
              color: "oklch(0.92 0.01 220)",
            }}
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: "oklch(0.65 0.08 220)" }}>
            {platform.passwordLabel}
          </label>
          <PasswordField
            value={password}
            onChange={(v) => onChange("password", v)}
            placeholder="Temp password…"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs mb-1" style={{ color: "oklch(0.65 0.08 220)" }}>
            Notes / Role / Access Level
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => onChange("notes", e.target.value)}
            placeholder={platform.notesPlaceholder}
            className="w-full px-3 py-2 rounded-md text-sm border transition-all focus:outline-none"
            style={{
              backgroundColor: "oklch(0.18 0.05 258)",
              borderColor: "oklch(0.30 0.07 258)",
              color: "oklch(0.92 0.01 220)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TechOnboardingTab() {
  const [selectedHireId, setSelectedHireId] = useState<number | null>(null);

  // Credential state: Record<platform_id, { username, password, notes, required }>
  const [creds, setCreds] = useState<Record<string, { username: string; password: string; notes: string; required: boolean }>>({});
  const [dirty, setDirty] = useState(false);

  const utils = trpc.useUtils();

  // Fetch all new hires
  const { data: hires, isLoading: loadingHires } = trpc.admin.listNewHires.useQuery();

  // Fetch existing credentials for selected hire
  const { data: existingCreds, isLoading: loadingCreds } = trpc.admin.getCredentials.useQuery(
    { newHireId: selectedHireId! },
    {
      enabled: selectedHireId !== null,
      onSuccess: (data) => {
        // Pre-populate form with saved credentials
        const map: Record<string, { username: string; password: string; notes: string; required: boolean }> = {};
        for (const c of data) {
          map[c.platform] = {
            username: c.username ?? "",
            password: c.password ?? "",
            notes: c.notes ?? "",
            required: c.required,
          };
        }
        setCreds(map);
        setDirty(false);
      },
    }
  );

  // Save credentials mutation
  const saveMutation = trpc.admin.saveCredentials.useMutation({
    onSuccess: () => {
      toast.success("✅ Credentials saved — new hire's portal updated!");
      setDirty(false);
      utils.admin.getCredentials.invalidate({ newHireId: selectedHireId! });
    },
    onError: () => toast.error("Failed to save credentials. Please try again."),
  });

  const selectedHire = hires?.find((h) => h.id === selectedHireId);

  const handleCredChange = (
    platformId: string,
    field: "username" | "password" | "notes" | "required",
    val: string | boolean
  ) => {
    setCreds((prev) => ({
      ...prev,
      [platformId]: {
        username: prev[platformId]?.username ?? "",
        password: prev[platformId]?.password ?? "",
        notes: prev[platformId]?.notes ?? "",
        required: prev[platformId]?.required ?? false,
        [field]: val,
      },
    }));
    setDirty(true);
  };

  const handleSave = () => {
    if (!selectedHireId) return;
    const credentials = PLATFORMS.map((p) => ({
      platform: p.id,
      required: creds[p.id]?.required ?? false,
      username: creds[p.id]?.username || null,
      password: creds[p.id]?.password || null,
      notes: creds[p.id]?.notes || null,
    }));
    saveMutation.mutate({ newHireId: selectedHireId, credentials });
  };

  const filledCount = PLATFORMS.filter((p) => creds[p.id]?.username?.trim()).length;
  const requiredCount = PLATFORMS.filter((p) => creds[p.id]?.required).length;

  // ── Hire list view ──────────────────────────────────────────────────────────
  if (!selectedHireId) {
    return (
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ backgroundColor: "oklch(0.22 0.08 258)" }}>
            <Monitor className="w-5 h-5" style={{ color: "oklch(0.72 0.12 220)" }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "oklch(0.92 0.01 220)" }}>
              IT Credential Provisioning
            </h2>
            <p className="text-sm" style={{ color: "oklch(0.65 0.08 220)" }}>
              Ethan Cowles — Select a new hire to enter their platform credentials
            </p>
          </div>
        </div>

        {/* New hire cards */}
        {loadingHires ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "oklch(0.72 0.12 220)" }} />
            <span className="ml-2 text-sm" style={{ color: "oklch(0.65 0.08 220)" }}>Loading new hires…</span>
          </div>
        ) : !hires || hires.length === 0 ? (
          <div className="text-center py-16 rounded-xl border"
            style={{ borderColor: "oklch(0.28 0.06 258)", backgroundColor: "oklch(0.17 0.04 258)" }}>
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" style={{ color: "oklch(0.72 0.12 220)" }} />
            <p className="text-sm" style={{ color: "oklch(0.65 0.08 220)" }}>No new hires registered yet.</p>
            <p className="text-xs mt-1 opacity-60" style={{ color: "oklch(0.65 0.08 220)" }}>
              New hires will appear here once they register on the onboarding portal.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hires.map((hire) => {
              const name = [hire.firstName, hire.lastName].filter(Boolean).join(" ") || hire.email;
              return (
                <button
                  key={hire.id}
                  onClick={() => { setSelectedHireId(hire.id); setCreds({}); setDirty(false); }}
                  className="text-left rounded-xl border p-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: "oklch(0.18 0.05 258)",
                    borderColor: "oklch(0.30 0.07 258)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold"
                      style={{ backgroundColor: "oklch(0.25 0.08 258)", color: "oklch(0.72 0.12 220)" }}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: statusColor(hire.formStatus) + "33",
                        color: statusColor(hire.formStatus),
                        border: `1px solid ${statusColor(hire.formStatus)}55`,
                      }}
                    >
                      {statusLabel(hire.formStatus)}
                    </span>
                  </div>
                  <div className="font-semibold text-sm mb-0.5" style={{ color: "oklch(0.92 0.01 220)" }}>
                    {name}
                  </div>
                  <div className="text-xs opacity-60 mb-2" style={{ color: "oklch(0.72 0.12 220)" }}>
                    {hire.email}
                  </div>
                  {hire.building && (
                    <div className="text-xs opacity-70" style={{ color: "oklch(0.65 0.08 220)" }}>
                      📍 {hire.building.name}
                    </div>
                  )}
                  {/* Credential provisioning progress bar */}
                  {(() => {
                    const required = (hire as any).credentialsRequired as number ?? 0;
                    const provisioned = (hire as any).credentialsProvisioned as number ?? 0;
                    const pct = required > 0 ? Math.round((provisioned / required) * 100) : 0;
                    const barColor = pct === 100
                      ? "oklch(0.55 0.18 160)"
                      : pct > 0
                      ? "oklch(0.60 0.18 55)"
                      : "oklch(0.45 0.10 258)";
                    return (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs" style={{ color: "oklch(0.65 0.08 220)" }}>
                            {pct === 100 ? "✅ " : ""}
                            Credentials: {provisioned}/{required > 0 ? required : "—"}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: barColor }}>
                            {required > 0 ? `${pct}%` : "Not set"}
                          </span>
                        </div>
                        {required > 0 && (
                          <div className="h-1.5 rounded-full overflow-hidden"
                            style={{ backgroundColor: "oklch(0.28 0.06 258)" }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: barColor }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <div className="mt-3 pt-3 border-t flex items-center justify-between"
                    style={{ borderColor: "oklch(0.28 0.06 258)" }}>
                    <span className="text-xs" style={{ color: "oklch(0.65 0.08 220)" }}>
                      {hire.formsApprovedCount}/{hire.formsSubmittedCount} forms approved
                    </span>
                    <span className="text-xs font-medium" style={{ color: "oklch(0.72 0.12 220)" }}>
                      Enter Credentials →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Credential entry view ───────────────────────────────────────────────────
  const hireName = [selectedHire?.firstName, selectedHire?.lastName].filter(Boolean).join(" ") || selectedHire?.email || "";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedHireId(null)}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5"
            style={{ borderColor: "oklch(0.30 0.07 258)", color: "oklch(0.72 0.12 220)" }}
          >
            <ChevronLeft className="w-4 h-4" /> All Hires
          </button>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "oklch(0.92 0.01 220)" }}>
              {hireName}
            </h2>
            <p className="text-sm" style={{ color: "oklch(0.65 0.08 220)" }}>
              {filledCount} of {PLATFORMS.length} platforms filled · {requiredCount} marked required
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending || !dirty}
          className="flex items-center gap-2"
          style={{
            backgroundColor: dirty ? "oklch(0.55 0.18 160)" : "oklch(0.30 0.07 258)",
            color: "oklch(0.97 0.01 220)",
          }}
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : dirty ? (
            <Save className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {saveMutation.isPending ? "Saving…" : dirty ? "Save Credentials" : "Saved"}
        </Button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-3 rounded-lg mb-6"
        style={{ backgroundColor: "oklch(0.22 0.08 220)", border: "1px solid oklch(0.35 0.10 220)" }}>
        <Lock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "oklch(0.72 0.12 220)" }} />
        <p className="text-xs" style={{ color: "oklch(0.80 0.06 220)" }}>
          Credentials entered here are encrypted in the database and will automatically appear in{" "}
          <strong>{hireName}'s</strong> Company Websites &amp; Logins tab once saved.
          Check <em>"Required for this hire"</em> for each platform they need access to.
        </p>
      </div>

      {/* Loading state */}
      {loadingCreds ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "oklch(0.72 0.12 220)" }} />
          <span className="ml-2 text-sm" style={{ color: "oklch(0.65 0.08 220)" }}>Loading saved credentials…</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {PLATFORMS.map((platform) => (
            <PlatformRow
              key={platform.id}
              platform={platform}
              username={creds[platform.id]?.username ?? ""}
              password={creds[platform.id]?.password ?? ""}
              notes={creds[platform.id]?.notes ?? ""}
              required={creds[platform.id]?.required ?? false}
              onChange={(field, val) => handleCredChange(platform.id, field, val)}
            />
          ))}

          {/* Bottom save */}
          <div className="flex justify-end pt-2 pb-6">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || !dirty}
              size="lg"
              className="flex items-center gap-2"
              style={{
                backgroundColor: dirty ? "oklch(0.55 0.18 160)" : "oklch(0.30 0.07 258)",
                color: "oklch(0.97 0.01 220)",
              }}
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saveMutation.isPending ? "Saving…" : dirty ? "Save All Credentials" : "All Saved ✓"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
