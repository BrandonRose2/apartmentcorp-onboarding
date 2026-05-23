/**
 * bookmarksGenerator.ts — Generates a Netscape Bookmark Format HTML file
 * for all ApartmentCorp platforms so new hires can import them into any browser.
 *
 * URLs are kept in sync with:
 *   - client/src/components/TechOnboardingTab.tsx (PLATFORMS)
 *   - client/src/lib/websitesData.ts (WEBSITES)
 *
 * The file is uploaded to S3 and the download URL is returned.
 */

import { storagePut } from "./storage";

// ─── Platform bookmark data ───────────────────────────────────────────────────
// Sourced from TechOnboardingTab.tsx PLATFORMS + websitesData.ts WEBSITES

interface BookmarkEntry {
  title: string;
  url: string;
  category: string;
}

const BOOKMARKS: BookmarkEntry[] = [
  // Property Management
  { title: "PropertyMAX.ai — Dashboard",           url: "https://propertymax.ai/app/",              category: "Property Management" },
  { title: "AppWorks — Maintenance & Work Orders",  url: "https://admin.appworkco.com/",             category: "Property Management" },
  { title: "OneSite — Resident Management",         url: "https://onesite.realpage.com/",            category: "Property Management" },
  { title: "Yardi Voyager",                         url: "https://www.yardiasp.com/",                category: "Property Management" },

  // HR & Payroll
  { title: "Paychex — HR & Payroll",                url: "https://myapps.paychex.com",               category: "HR & Payroll" },
  { title: "Connecteam — Team Management",          url: "https://app.connecteam.com/",              category: "HR & Payroll" },
  { title: "ApartmentCorp Employee Portal",         url: "https://aptonboard-pxsj4nvm.manus.space/onboarding", category: "HR & Payroll" },

  // Communication & Collaboration
  { title: "SamePage — Team Collaboration",         url: "https://samepage.io/login",                category: "Communication & Collaboration" },
  { title: "ConnectUC — Phone Portal",              url: "https://app.connectuc.com",                category: "Communication & Collaboration" },
  { title: "Phone Portal (RingCentral)",            url: "https://app.ringcentral.com/",             category: "Communication & Collaboration" },
  { title: "Zoom",                                  url: "https://zoom.us",                          category: "Communication & Collaboration" },

  // Maintenance & Operations
  { title: "MyLoneWorkers.com — Safety Monitoring", url: "https://app.myloneworkers.com",            category: "Maintenance & Operations" },
  { title: "Vendor & Contractor Portal",            url: "https://vendors.apartmentcorp.com",        category: "Maintenance & Operations" },

  // Marketing & Leasing
  { title: "Apartments.com — Listing Management",   url: "https://www.apartments.com",               category: "Marketing & Leasing" },

  // Finance & Accounting
  { title: "ApartmentCorp Finance Portal",          url: "https://finance.apartmentcorp.com",        category: "Finance & Accounting" },

  // IT & Equipment
  { title: "VMware Horizon — Virtual Desktop",      url: "https://horizon.apartmentcorp.com",        category: "IT & Equipment" },
];

// ─── HTML generator ───────────────────────────────────────────────────────────

function generateBookmarksHtml(newHireName: string): string {
  // Group bookmarks by category
  const categories = new Map<string, BookmarkEntry[]>();
  for (const bm of BOOKMARKS) {
    if (!categories.has(bm.category)) categories.set(bm.category, []);
    categories.get(bm.category)!.push(bm);
  }

  const now = Math.floor(Date.now() / 1000);

  let folderContent = "";
  for (const [category, entries] of categories) {
    folderContent += `        <DT><H3 ADD_DATE="${now}" LAST_MODIFIED="${now}">${escapeHtml(category)}</H3>\n`;
    folderContent += `        <DL><p>\n`;
    for (const entry of entries) {
      folderContent += `            <DT><A HREF="${escapeHtml(entry.url)}" ADD_DATE="${now}">${escapeHtml(entry.title)}</A>\n`;
    }
    folderContent += `        </DL><p>\n`;
  }

  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="${now}" LAST_MODIFIED="${now}" PERSONAL_TOOLBAR_FOLDER="true">ApartmentCorp — ${escapeHtml(newHireName)}</H3>
    <DL><p>
${folderContent}
    </DL><p>
</DL>
`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Upload and return URL ────────────────────────────────────────────────────

export async function generateAndUploadBookmarks(
  newHireEmail: string,
  newHireName: string
): Promise<string | null> {
  try {
    const html = generateBookmarksHtml(newHireName);
    const key = `onboarding-bookmarks/${newHireEmail.replace("@", "_at_")}/apartmentcorp-bookmarks.html`;
    const { url } = await storagePut(key, Buffer.from(html, "utf-8"), "text/html");
    return url;
  } catch (err) {
    console.error("[Bookmarks] Generation failed:", err);
    return null;
  }
}
