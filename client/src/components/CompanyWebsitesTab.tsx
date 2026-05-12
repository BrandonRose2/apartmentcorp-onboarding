/**
 * CompanyWebsitesTab — Company Websites & Logins reference panel
 * Design: Warm Professional — grouped by category, file-card aesthetic, copy-to-clipboard
 * Features: Category filter, search, copy fields, external link, access level badges
 */

import { useState, useMemo } from "react";
import { Copy, Check, ExternalLink, Search, ChevronDown, ChevronUp } from "lucide-react";
import { COMPANY_WEBSITES, WEBSITE_CATEGORIES, type CompanyWebsite } from "@/lib/websitesData";
import { toast } from "sonner";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; header: string }> = {
  navy:      { bg: "oklch(0.22 0.06 250)", text: "white", border: "oklch(0.30 0.07 250)", header: "oklch(0.22 0.06 250)" },
  terracotta:{ bg: "oklch(0.55 0.14 40)",  text: "white", border: "oklch(0.60 0.15 40)",  header: "oklch(0.55 0.14 40)"  },
  green:     { bg: "oklch(0.40 0.12 160)", text: "white", border: "oklch(0.45 0.13 160)", header: "oklch(0.40 0.12 160)" },
  purple:    { bg: "oklch(0.38 0.12 290)", text: "white", border: "oklch(0.43 0.13 290)", header: "oklch(0.38 0.12 290)" },
  amber:     { bg: "oklch(0.55 0.14 70)",  text: "white", border: "oklch(0.60 0.15 70)",  header: "oklch(0.55 0.14 70)"  },
};

const ACCESS_COLORS: Record<string, { bg: string; text: string }> = {
  "All Staff":   { bg: "oklch(0.22 0.06 250 / 0.10)", text: "oklch(0.22 0.06 250)" },
  "Leasing":     { bg: "oklch(0.55 0.14 40 / 0.12)",  text: "oklch(0.45 0.12 40)"  },
  "Maintenance": { bg: "oklch(0.55 0.14 70 / 0.12)",  text: "oklch(0.45 0.12 70)"  },
  "Management":  { bg: "oklch(0.38 0.12 290 / 0.12)", text: "oklch(0.30 0.10 290)" },
  "Accounting":  { bg: "oklch(0.40 0.12 160 / 0.12)", text: "oklch(0.30 0.10 160)" },
};

export function CompanyWebsitesTab() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

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

  // Group by category for display
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
          All platforms, tools, and login instructions you'll need as a new team member
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
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
            <button onClick={() => setSearchQuery("")} style={{ color: "oklch(0.60 0.02 250)" }}>
              ×
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
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

      {/* No results */}
      {filteredSites.length === 0 && (
        <div
          className="text-center py-12 rounded-xl border"
          style={{ borderColor: "oklch(0.88 0.02 80)", color: "oklch(0.55 0.03 250)" }}
        >
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
              {/* Category Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg mb-4"
                style={{ backgroundColor: colors.bg }}
              >
                <span className="text-xl">{cat.icon}</span>
                <div>
                  <div
                    className="font-semibold text-white text-sm"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {cat.label}
                  </div>
                  <div className="text-xs" style={{ color: "oklch(0.88 0.01 80)" }}>
                    {sites.length} platform{sites.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Website Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sites.map((site) => (
                  <WebsiteCard
                    key={site.id}
                    site={site}
                    expanded={!!expandedCards[site.id]}
                    onToggle={() => toggleCard(site.id)}
                    categoryColor={colors}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div
        className="mt-8 px-4 py-3 rounded-lg text-sm border-l-4"
        style={{
          backgroundColor: "oklch(0.97 0.01 80)",
          borderLeftColor: "oklch(0.55 0.14 40)",
          color: "oklch(0.40 0.03 250)",
        }}
      >
        <strong>Need help with access?</strong> Contact IT at{" "}
        <a
          href="mailto:it@apartmentcorp.com"
          className="underline"
          style={{ color: "oklch(0.22 0.06 250)" }}
        >
          it@apartmentcorp.com
        </a>{" "}
        or reach out to HR at{" "}
        <a
          href="mailto:hr@apartmentcorp.com"
          className="underline"
          style={{ color: "oklch(0.22 0.06 250)" }}
        >
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
}: {
  site: CompanyWebsite;
  expanded: boolean;
  onToggle: () => void;
  categoryColor: { bg: string; text: string; border: string };
}) {
  const accessStyle = ACCESS_COLORS[site.accessLevel || "All Staff"] || ACCESS_COLORS["All Staff"];

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "oklch(0.88 0.02 80)", backgroundColor: "oklch(1 0 0)" }}
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
            <div
              className="font-semibold text-sm leading-tight"
              style={{ color: "oklch(0.22 0.06 250)", fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {site.name}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {site.accessLevel && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: accessStyle.bg, color: accessStyle.text }}
                >
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
          {/* Login Instructions */}
          <div>
            <div
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "oklch(0.55 0.03 250)" }}
            >
              Login Instructions
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "oklch(0.30 0.04 250)" }}>
              {site.loginInstructions}
            </p>
          </div>

          {/* Login Fields */}
          <div>
            <div
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "oklch(0.55 0.03 250)" }}
            >
              Credentials &amp; Access Details
            </div>
            <div className="space-y-2">
              {site.fields.map((field, i) => (
                <LoginFieldRow key={i} field={field} />
              ))}
            </div>
          </div>

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
            <div
              className="px-3 py-2 rounded-lg text-xs leading-relaxed border-l-2"
              style={{
                backgroundColor: "oklch(0.97 0.01 80)",
                borderLeftColor: "oklch(0.55 0.14 40)",
                color: "oklch(0.40 0.03 250)",
              }}
            >
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

  const handleCopy = () => {
    navigator.clipboard.writeText(field.value).then(() => {
      setCopied(true);
      toast.success(`"${field.label}" copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="flex items-start gap-2 px-3 py-2 rounded-lg"
      style={{ backgroundColor: "oklch(0.97 0.01 80)" }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold" style={{ color: "oklch(0.45 0.04 250)" }}>
          {field.label}
        </div>
        <div
          className="text-xs mt-0.5 break-words"
          style={{ color: field.sensitive ? "oklch(0.50 0.03 250)" : "oklch(0.25 0.04 250)" }}
        >
          {field.value}
        </div>
      </div>
      <button
        onClick={handleCopy}
        className="flex-shrink-0 p-1 rounded transition-all hover:opacity-80"
        title={`Copy ${field.label}`}
        style={{ color: copied ? "oklch(0.55 0.14 40)" : "oklch(0.60 0.02 250)" }}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
