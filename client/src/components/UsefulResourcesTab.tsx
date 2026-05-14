/**
 * ApartmentCorp — Useful Resources Tab
 * Quick-access links, guides, forms, and tools for new hires
 * Brand: Dark navy bg, teal accent, Cormorant Garamond headings
 */

import { useState } from "react";
import { ExternalLink, Search } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  url?: string;
  icon: string;
  tag?: string;
}

interface ResourceCategory {
  id: string;
  label: string;
  icon: string;
  resources: Resource[];
}

const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    id: "company",
    label: "Company",
    icon: "🏢",
    resources: [
      {
        id: "main-website",
        title: "ApartmentCorp Website",
        description: "Our main company website — properties, team, investment strategy, and news.",
        url: "https://apartmentcorp.com",
        icon: "🌐",
        tag: "Company",
      },
      {
        id: "propertymax",
        title: "PropertyMAX.ai",
        description: "ApartmentCorp's AI-powered property management platform. Your primary day-to-day tool.",
        url: "https://propertymax.ai/app/",
        icon: "🤖",
        tag: "Platform",
      },
      {
        id: "granite-park",
        title: "Granite Park Capital",
        description: "ApartmentCorp's investment and capital arm — learn about our fund strategy.",
        url: "https://apartmentcorp.com",
        icon: "📈",
        tag: "Investment",
      },
    ],
  },
  {
    id: "hr",
    label: "HR & Benefits",
    icon: "👥",
    resources: [
      {
        id: "employee-handbook",
        title: "Employee Handbook",
        description: "Company policies, code of conduct, PTO, and everything you need to know as an ApartmentCorp team member.",
        icon: "📖",
        tag: "Policy",
      },
      {
        id: "benefits-guide",
        title: "Benefits Summary Guide",
        description: "Overview of health, dental, vision, 401(k), and other benefits available to full-time employees.",
        icon: "🏥",
        tag: "Benefits",
      },
      {
        id: "pto-policy",
        title: "PTO & Time-Off Policy",
        description: "How to request PTO, sick leave, holidays, and other time-off policies.",
        icon: "🌴",
        tag: "Policy",
      },
      {
        id: "org-chart",
        title: "Company Org Chart",
        description: "See how the team is structured — departments, reporting lines, and key contacts.",
        icon: "🗂️",
        tag: "Team",
      },
    ],
  },
  {
    id: "training",
    label: "Training & Learning",
    icon: "🎓",
    resources: [
      {
        id: "fair-housing",
        title: "Fair Housing Training",
        description: "Required Fair Housing Act training for all leasing and property management staff. Must be completed within 30 days.",
        icon: "⚖️",
        tag: "Required",
      },
      {
        id: "yardi-training",
        title: "Yardi Voyager Training",
        description: "Step-by-step training modules for using Yardi — leasing, maintenance, and reporting.",
        icon: "🏠",
        tag: "Training",
      },
      {
        id: "safety-training",
        title: "OSHA Safety Training",
        description: "Required safety training covering workplace hazards, emergency procedures, and OSHA compliance.",
        icon: "🦺",
        tag: "Required",
      },
      {
        id: "mentorship",
        title: "ApartmentCorp Mentorship Program",
        description: "Connect with a senior team member for guidance during your first 90 days.",
        url: "https://apartmentcorp.com",
        icon: "🤝",
        tag: "Program",
      },
    ],
  },
  {
    id: "tools",
    label: "Quick Tools",
    icon: "🛠️",
    resources: [
      {
        id: "it-helpdesk",
        title: "IT Help Desk",
        description: "Submit IT support tickets for equipment issues, software access, or account problems.",
        icon: "💻",
        tag: "Support",
      },
      {
        id: "expense-guide",
        title: "Expense Reimbursement Guide",
        description: "How to submit expenses, what's reimbursable, and approval thresholds.",
        icon: "🧾",
        tag: "Finance",
      },
      {
        id: "emergency-contacts",
        title: "Emergency Contacts & Procedures",
        description: "Property emergency contacts, after-hours maintenance line, and emergency escalation procedures.",
        icon: "🆘",
        tag: "Safety",
      },
      {
        id: "articles",
        title: "ApartmentCorp Articles & Insights",
        description: "Industry articles, company news, and thought leadership from the ApartmentCorp team.",
        url: "https://apartmentcorp.com",
        icon: "📰",
        tag: "News",
      },
    ],
  },
];

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  Required:   { bg: "oklch(0.65 0.22 25 / 0.18)",  color: "oklch(0.75 0.18 30)" },
  Platform:   { bg: "oklch(0.72 0.12 220 / 0.18)", color: "oklch(0.72 0.12 220)" },
  Company:    { bg: "oklch(0.72 0.12 220 / 0.18)", color: "oklch(0.72 0.12 220)" },
  Training:   { bg: "oklch(0.75 0.14 180 / 0.18)", color: "oklch(0.75 0.14 180)" },
  Benefits:   { bg: "oklch(0.72 0.12 280 / 0.18)", color: "oklch(0.72 0.12 280)" },
  Policy:     { bg: "oklch(0.75 0.12 80 / 0.18)",  color: "oklch(0.75 0.12 80)" },
  Team:       { bg: "oklch(0.72 0.12 220 / 0.12)", color: "oklch(0.65 0.02 230)" },
  Support:    { bg: "oklch(0.72 0.12 220 / 0.12)", color: "oklch(0.65 0.02 230)" },
  Finance:    { bg: "oklch(0.75 0.12 80 / 0.18)",  color: "oklch(0.75 0.12 80)" },
  Safety:     { bg: "oklch(0.65 0.22 25 / 0.18)",  color: "oklch(0.75 0.18 30)" },
  Program:    { bg: "oklch(0.72 0.12 280 / 0.18)", color: "oklch(0.72 0.12 280)" },
  Investment: { bg: "oklch(0.75 0.12 80 / 0.18)",  color: "oklch(0.75 0.12 80)" },
  News:       { bg: "oklch(0.72 0.12 220 / 0.12)", color: "oklch(0.65 0.02 230)" },
};

const AC = {
  bg:       "oklch(0.13 0.06 258)",
  bgCard:   "oklch(0.18 0.065 258)",
  bgRaised: "oklch(0.22 0.07 258)",
  teal:     "oklch(0.72 0.12 220)",
  fg:       "oklch(0.97 0.005 220)",
  fgMuted:  "oklch(0.65 0.02 230)",
  fgSubtle: "oklch(0.45 0.02 230)",
  border:   "oklch(1 0 0 / 0.09)",
  heading:  "'Cormorant Garamond', Georgia, serif",
  body:     "'Inter', 'Helvetica Neue', Arial, sans-serif",
};

export function UsefulResourcesTab() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredCategories = RESOURCE_CATEGORIES.map(cat => ({
    ...cat,
    resources: cat.resources.filter(r =>
      (activeCategory === "all" || cat.id === activeCategory) &&
      (search === "" ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()))
    ),
  })).filter(cat => cat.resources.length > 0);

  const totalResources = RESOURCE_CATEGORIES.reduce((sum, c) => sum + c.resources.length, 0);

  return (
    <div style={{ fontFamily: AC.body }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="w-8 h-0.5 rounded-full mb-3" style={{ backgroundColor: AC.teal }} />
            <h2 className="text-2xl font-semibold mb-1" style={{ fontFamily: AC.heading, color: AC.fg }}>
              Useful Resources
            </h2>
            <p className="text-sm" style={{ color: AC.fgMuted }}>
              Quick access to guides, tools, policies, and links you'll use every day.
            </p>
          </div>
          <div className="text-xs px-3 py-1.5 rounded-full"
            style={{ backgroundColor: AC.bgRaised, color: AC.fgMuted, border: `1px solid ${AC.border}` }}>
            {totalResources} resources
          </div>
        </div>

        {/* Search + Filter */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: AC.fgSubtle }} />
            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none"
              style={{ backgroundColor: AC.bgCard, border: `1px solid ${AC.border}`, color: AC.fg }}
              onFocus={e => (e.target.style.borderColor = AC.teal)}
              onBlur={e => (e.target.style.borderColor = AC.border)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[{ id: "all", label: "All", icon: "✦" }, ...RESOURCE_CATEGORIES.map(c => ({ id: c.id, label: c.label, icon: c.icon }))].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  backgroundColor: activeCategory === cat.id ? AC.teal : AC.bgCard,
                  color: activeCategory === cat.id ? AC.bg : AC.fgMuted,
                  border: `1px solid ${activeCategory === cat.id ? AC.teal : AC.border}`,
                }}
              >
                <span>{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Grid */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: AC.bgCard, border: `1px solid ${AC.border}` }}>
          <div className="text-3xl mb-3">🔍</div>
          <p className="text-sm" style={{ color: AC.fgMuted }}>No resources found for "{search}"</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredCategories.map(cat => (
            <div key={cat.id}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{cat.icon}</span>
                <h3 className="text-base font-semibold" style={{ fontFamily: AC.heading, color: AC.fg }}>
                  {cat.label}
                </h3>
                <div className="flex-1 h-px ml-2" style={{ backgroundColor: AC.border }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.resources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  const tagStyle = resource.tag ? TAG_COLORS[resource.tag] ?? { bg: AC.bgRaised, color: AC.fgMuted } : null;
  const isLink = !!resource.url;

  const content = (
    <div
      className="group rounded-xl p-4 h-full flex flex-col transition-all"
      style={{
        backgroundColor: AC.bgCard,
        border: `1px solid ${AC.border}`,
        cursor: isLink ? "pointer" : "default",
      }}
      onMouseEnter={e => isLink && ((e.currentTarget as HTMLElement).style.borderColor = AC.teal + "55")}
      onMouseLeave={e => isLink && ((e.currentTarget as HTMLElement).style.borderColor = AC.border)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-xl flex-shrink-0">{resource.icon}</span>
          <span className="font-semibold text-sm leading-tight" style={{ fontFamily: AC.heading, color: AC.fg }}>
            {resource.title}
          </span>
        </div>
        {isLink && (
          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: AC.teal }} />
        )}
      </div>
      <p className="text-xs leading-relaxed flex-1" style={{ color: AC.fgMuted }}>
        {resource.description}
      </p>
      {resource.tag && tagStyle && (
        <div className="mt-3">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: tagStyle.bg, color: tagStyle.color }}>
            {resource.tag}
          </span>
        </div>
      )}
    </div>
  );

  if (isLink) {
    return (
      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block h-full no-underline">
        {content}
      </a>
    );
  }
  return <div className="h-full">{content}</div>;
}
