/**
 * CompanyWebsitesTab — Company Websites & Logins
 *
 * For new hires: shows all platforms grouped by category.
 * If Ethan has entered credentials for this hire in the DB, they appear
 * as "Your Credentials" (username/password/notes) inside each card.
 * Platforms marked required by Ethan are highlighted.
 */

import { useState, useMemo } from "react";
import { Copy, Check, ExternalLink, Search, ChevronDown, ChevronUp, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { COMPANY_WEBSITES, WEBSITE_CATEGORIES, type CompanyWebsite } from "@/lib/websitesData";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// ─── Platform ID mapping: websitesData id → ALL_PLATFORMS schema id ───────────
// Keys are websitesData.ts IDs, values are the DB platform strings from schema
const PLATFORM_ID_MAP: Record<string, string> = {
  propertymax:     "PropertyMAX.ai",
  yardi:           "Yardi",
  paychex:         "Paychex",
  "employee-portal": "",            // no credentials needed
  zoom:            "",              // SSO, no separate creds
  connectuc:       "ConnectUC",
  samepage:        "SamePage",
  myloneworkers:   "MyLoneWorkers.com",
  "vendor-portal": "",
  "apartments-com": "",
  vmware:          "VMware Horizon",
  "finance-portal": "",
  appworks:        "AppWorks",
  connecteam:      "Connecteam",
  onesite:         "OneSite",
  "phone-portal":  "Phone Portal",
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; header: string }> = {
  navy:       { bg: "oklch(0.22 0.06 250)", text: "white", border: "oklch(0.30 0.07 250)", header: "oklch(0.22 0.06 250)" },
  terracotta: { bg: "oklch(0.55 0.14 40)",  text: "white", border: "oklch(0.60 0.15 40)",  header: "oklch(0.55 0.14 40)"  },
  green:      { bg: "oklch(0.40 0.12 160)", text: "white", border: "oklch(0.45 0.13 160)", header: "oklch(0.40 0.12 160)" },
  purple:     { bg: "oklch(0.38 0.12 290)", text: "white", border: "oklch(0.43 0.13 290)", header: "oklch(0.38 0.12 290)" },
  amber:      { bg: "oklch(0.55 0.14 70)",  text: "white", border: "oklch(0.60 0.15 70)",  header: "oklch(0.55 0.14 70)"  },
};

const ACCESS_COLORS: Record<string, { bg: string; text: string }> = {
  "All Staff":   { bg: "oklch(0.22 0.06 250 / 0.10)", text: "oklch(0.22 0.06 250)" },
  "Leasing":     { bg: "oklch(0.55 0.14 40 / 0.12)",  text: "oklch(0.45 0.12 40)"  },
  "Maintenance": { bg: "oklch(0.55 0.14 70 / 0.12)",  text: "oklch(0.45 0.12 70)"  },
  "Management":  { bg: "oklch(0.38 0.12 290 / 0.12)", text: "oklch(0.30 0.10 290)" },
  "Accounting":  { bg: "oklch(0.40 0.12 160 / 0.12)", text: "oklch(0.30 0.10 160)" },
};

type DbCredential = {
  platform: string;
  required: boolean;
  username: string | null;
  password: string | null;
  notes: string | null;
};

export function CompanyWebsitesTab() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Fetch credentials Ethan entered for this new hire
  const { data: myCredentials, isLoading: loadingCreds } = trpc.credentials.getMyCredentials.useQuery();

  // Build a lookup map: platform_id → credential row
  const credMap = useMemo(() => {
    const map: Record<string, DbCredential> = {};
    if (myCredentials) {
      for (const c of myCredentials) {
        map[c.platform] = c as DbCredential;
      }
    }
    return map;
  }, [myCredentials]);

  const filteredSites = useMemo(() => {
    return COMPANY_WEBSITES.filter((site) => {
      const matchesCategory = activeCategory === "all" || site.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        site.name.toLowerCase().includes(q) ||
        site.description.toLowerCase().includes(q) ||
        site.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const groupedSites = useMemo(() => {
    const groups: Record<string, CompanyWebsite[]> = {};
    filteredSites.forEach((site) => {
      if (!groups[site.category]) groups[site.category] = [];
      groups[site.category].push(site);
    });
    return groups;
  }, [filteredSites]);

  const toggleCard = (id: string) =>
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));

  // Count how many platforms have credentials provisioned
  const provisionedCount = myCredentials?.filter(c => c.username).length ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h2
          className="text-lg font-bold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "oklch(0.22 0.06 250)" }}
        >
          Company Websites &amp; Logins
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "oklch(0.50 0.03 250)" }}>
          All platforms, tools, and login credentials you'll need as a new team member
        </p>
      </div>

      {/* Provisioning status banner */}
      {loadingCreds ? (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-5"
          style={{ backgroundColor: "oklch(0.96 0.01 250)", border: "1px solid oklch(0.88 0.02 250)" }}>
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: "oklch(0.55 0.10 250)" }} />
          <span className="text-sm" style={{ color: "oklch(0.45 0.06 250)" }}>Loading your credentials…</span>
        </div>
      ) : provisionedCount > 0 ? (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg mb-5"
          style={{ backgroundColor: "oklch(0.96 0.04 160)", border: "1px solid oklch(0.80 0.08 160)" }}>
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "oklch(0.50 0.16 160)" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "oklch(0.35 0.12 160)" }}>
              IT has provisioned {provisionedCount} platform{provisionedCount !== 1 ? "s" : ""} for you
            </p>
            <p className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.10 160)" }}>
              Expand each card below to view your assigned username, password, and access notes.
              Platforms with a green border have your credentials ready.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg mb-5"
          style={{ backgroundColor: "oklch(0.97 0.02 55)", border: "1px solid oklch(0.85 0.06 55)" }}>
          <Lock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "oklch(0.55 0.14 55)" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "oklch(0.40 0.12 55)" }}>
              Credentials pending IT provisioning
            </p>
            <p className="text-xs mt-0.5" style={{ color: "oklch(0.50 0.10 55)" }}>
              IT will set up your platform accounts within your first 24 hours.
              Check back here once Ethan has provisioned your access.
            </p>
          </div>
        </div>
      )}

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div
          className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border"
          style={{ borderColor: "oklch(0.88 0.02 80)", backgroundColor: "oklch(0.99 0 0)" }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.60 0.02 250)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search platforms..."
            className="flex-1 text-sm bg-transparent focus:outline-none"
            style={{ color: "oklch(0.22 0.06 250)" }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} style={{ color: "oklch(0.60 0.02 250)" }}>×</button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: activeCategory === "all" ? "oklch(0.22 0.06 250)" : "oklch(0.94 0.01 80)",
              color: activeCategory === "all" ? "white" : "oklch(0.40 0.03 250)",
            }}
          >
            All ({COMPANY_WEBSITES.length})
          </button>
          {WEBSITE_CATEGORIES.map((cat) => {
            const count = COMPANY_WEBSITES.filter((s) => s.category === cat.id).length;
            const colors = CATEGORY_COLORS[cat.color];
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: isActive ? colors.bg : "oklch(0.94 0.01 80)",
                  color: isActive ? "white" : "oklch(0.40 0.03 250)",
                }}
              >
                {cat.icon} {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filteredSites.length === 0 && (
        <div className="text-center py-12 rounded-xl border"
          style={{ borderColor: "oklch(0.88 0.02 80)", color: "oklch(0.55 0.03 250)" }}>
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-sm">No platforms found matching "{searchQuery}"</p>
        </div>
      )}

      {/* Category Groups */}
      <div className="space-y-8">
        {WEBSITE_CATEGORIES.filter((cat) => groupedSites[cat.id]?.length > 0).map((cat) => {
          const sites = groupedSites[cat.id] || [];
          const colors = CATEGORY_COLORS[cat.color];

          return (
            <div key={cat.id}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg mb-4"
                style={{ backgroundColor: colors.bg }}>
                <span className="text-xl">{cat.icon}</span>
                <div>
                  <div className="font-semibold text-white text-sm"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {cat.label}
                  </div>
                  <div className="text-xs" style={{ color: "oklch(0.88 0.01 80)" }}>
                    {sites.length} platform{sites.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sites.map((site) => {
                  const dbPlatformId = PLATFORM_ID_MAP[site.id];
                  const dbCred = dbPlatformId ? credMap[dbPlatformId] : undefined;
                  return (
                    <WebsiteCard
                      key={site.id}
                      site={site}
                      expanded={!!expandedCards[site.id]}
                      onToggle={() => toggleCard(site.id)}
                      categoryColor={colors}
                      dbCred={dbCred}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 px-4 py-3 rounded-lg text-sm border-l-4"
        style={{
          backgroundColor: "oklch(0.97 0.01 80)",
          borderLeftColor: "oklch(0.55 0.14 40)",
          color: "oklch(0.40 0.03 250)",
        }}>
        <strong>Need help with access?</strong> Contact IT at{" "}
        <a href="mailto:it@apartmentcorp.com" className="underline" style={{ color: "oklch(0.22 0.06 250)" }}>
          it@apartmentcorp.com
        </a>{" "}
        or reach out to HR at{" "}
        <a href="mailto:hr@apartmentcorp.com" className="underline" style={{ color: "oklch(0.22 0.06 250)" }}>
          hr@apartmentcorp.com
        </a>
        . All credentials are provisioned within your first 24 hours.
      </div>
    </div>
  );
}

// ── Individual Website Card ───────────────────────────────────────────────────

function WebsiteCard({
  site,
  expanded,
  onToggle,
  categoryColor,
  dbCred,
}: {
  site: CompanyWebsite;
  expanded: boolean;
  onToggle: () => void;
  categoryColor: { bg: string; text: string; border: string };
  dbCred?: DbCredential;
}) {
  const accessStyle = ACCESS_COLORS[site.accessLevel || "All Staff"] || ACCESS_COLORS["All Staff"];
  const hasProvisionedCreds = dbCred && (dbCred.username || dbCred.password);

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all"
      style={{
        borderColor: hasProvisionedCreds ? "oklch(0.60 0.16 160)" : "oklch(0.88 0.02 80)",
        backgroundColor: "oklch(1 0 0)",
        boxShadow: hasProvisionedCreds ? "0 0 0 1px oklch(0.60 0.16 160 / 0.3)" : "none",
      }}
    >
      {/* Card Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-[oklch(0.98_0.01_80)]"
        style={{ borderBottom: expanded ? "1px solid oklch(0.92 0.01 80)" : "none" }}
      >
        <span className="text-2xl flex-shrink-0 mt-0.5">{site.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold text-sm leading-tight"
              style={{ color: "oklch(0.22 0.06 250)", fontFamily: "'Playfair Display', Georgia, serif" }}>
              {site.name}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {hasProvisionedCreds && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: "oklch(0.55 0.16 160 / 0.12)", color: "oklch(0.40 0.14 160)" }}>
                  ✓ Ready
                </span>
              )}
              {site.accessLevel && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: accessStyle.bg, color: accessStyle.text }}>
                  {site.accessLevel}
                </span>
              )}
              {expanded ? (
                <ChevronUp className="w-4 h-4" style={{ color: "oklch(0.60 0.02 250)" }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: "oklch(0.60 0.02 250)" }} />
              )}
            </div>
          </div>
          <p className="text-xs mt-1 leading-snug" style={{ color: "oklch(0.50 0.03 250)" }}>
            {site.description}
          </p>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 py-3 space-y-4">

          {/* ── YOUR CREDENTIALS (from Ethan) ── */}
          {hasProvisionedCreds && (
            <div className="rounded-lg p-3 border"
              style={{ backgroundColor: "oklch(0.97 0.03 160)", borderColor: "oklch(0.80 0.10 160)" }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "oklch(0.40 0.14 160)" }}>
                🔑 Your Credentials (provisioned by IT)
              </div>
              <div className="space-y-2">
                {dbCred.username && (
                  <LoginFieldRow field={{ label: "Username / Login", value: dbCred.username, sensitive: false }} />
                )}
                {dbCred.password && (
                  <LoginFieldRow field={{ label: "Password", value: dbCred.password, sensitive: true }} />
                )}
                {dbCred.notes && (
                  <div className="text-xs px-3 py-2 rounded"
                    style={{ backgroundColor: "oklch(0.93 0.02 160)", color: "oklch(0.35 0.10 160)" }}>
                    <strong>IT Notes:</strong> {dbCred.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Login Instructions */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "oklch(0.55 0.03 250)" }}>
              Login Instructions
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "oklch(0.30 0.04 250)" }}>
              {site.loginInstructions}
            </p>
          </div>

          {/* Default Fields (only show if no DB creds) */}
          {!hasProvisionedCreds && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "oklch(0.55 0.03 250)" }}>
                Credentials &amp; Access Details
              </div>
              <div className="space-y-2">
                {site.fields.map((field, i) => (
                  <LoginFieldRow key={i} field={field} />
                ))}
              </div>
            </div>
          )}

          {/* External Link */}
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all active:scale-95"
            style={{ backgroundColor: categoryColor.bg, color: "white" }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open {site.name}
          </a>

          {/* Notes */}
          {site.notes && (
            <div className="px-3 py-2 rounded-lg text-xs leading-relaxed border-l-2"
              style={{
                backgroundColor: "oklch(0.97 0.01 80)",
                borderLeftColor: "oklch(0.55 0.14 40)",
                color: "oklch(0.40 0.03 250)",
              }}>
              <strong>Note:</strong> {site.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Login Field Row with Copy Button ─────────────────────────────────────────

function LoginFieldRow({ field }: { field: { label: string; value: string; sensitive?: boolean } }) {
  const [copied, setCopied] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(field.value).then(() => {
      setCopied(true);
      toast.success(`"${field.label}" copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const displayValue = field.sensitive && !showSensitive
    ? "••••••••••"
    : field.value;

  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-lg"
      style={{ backgroundColor: "oklch(0.97 0.01 80)" }}>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold" style={{ color: "oklch(0.45 0.04 250)" }}>
          {field.label}
        </div>
        <div className="text-xs mt-0.5 break-words font-mono"
          style={{ color: field.sensitive ? "oklch(0.50 0.03 250)" : "oklch(0.25 0.04 250)" }}>
          {displayValue}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
        {field.sensitive && (
          <button
            onClick={() => setShowSensitive(!showSensitive)}
            className="p-1 rounded transition-all hover:bg-black/5"
            title={showSensitive ? "Hide" : "Show"}
            style={{ color: "oklch(0.55 0.03 250)" }}
          >
            {showSensitive ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
        <button
          onClick={handleCopy}
          className="p-1 rounded transition-all hover:bg-black/5"
          title="Copy to clipboard"
          style={{ color: copied ? "oklch(0.50 0.16 160)" : "oklch(0.55 0.03 250)" }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
