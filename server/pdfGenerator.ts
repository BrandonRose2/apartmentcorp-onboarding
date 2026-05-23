/**
 * pdfGenerator.ts — Server-side PDF generation for completed onboarding forms
 * Uses pdf-lib to produce a clean, branded PDF from form submission data.
 * The generated PDF is uploaded to S3 and the URL is stored in the DB.
 */

import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from "pdf-lib";
import { storagePut } from "./storage";

// ─── Form label maps ──────────────────────────────────────────────────────────

export const FORM_DISPLAY_NAMES: Record<string, string> = {
  employment_application: "Employment Application",
  confidentiality_agreement: "Confidentiality Agreement",
  tracking_agreement: "Electronic Monitoring & Tracking Agreement",
  policies_acknowledgment: "Company Policies Acknowledgment",
  direct_deposit: "Direct Deposit Authorization",
  w4: "W-4 — Federal Withholding Certificate",
  it2104: "IT-2104 — NY State Withholding Certificate",
  i9: "I-9 — Employment Eligibility Verification",
  maintenance_test: "Maintenance Skills Assessment",
  personality_test: "Personality Assessment",
};

// Field labels that should be masked in the PDF (shown as *** for privacy)
const SENSITIVE_FIELD_IDS = new Set([
  "w4_ssn",
  "i9_ssn",
  "direct_deposit_account_number",
  "direct_deposit_routing_number",
]);

// Field IDs that contain signatures — rendered differently
const SIGNATURE_FIELD_IDS = new Set([
  "w4_signature",
  "it2104_signature",
  "i9_signature",
  "i9_preparer_signature",
  "employment_signature",
  "confidentiality_signature",
  "tracking_signature",
  "policies_signature",
  "direct_deposit_signature",
]);

// ─── Colors ───────────────────────────────────────────────────────────────────
const NAVY = rgb(0.1, 0.22, 0.36);
const TEAL = rgb(0.18, 0.42, 0.62);
const GOLD = rgb(0.85, 0.65, 0.13);
const LIGHT_GRAY = rgb(0.96, 0.96, 0.97);
const MID_GRAY = rgb(0.6, 0.6, 0.65);
const DARK_TEXT = rgb(0.12, 0.12, 0.18);
const GREEN = rgb(0.13, 0.55, 0.32);
const WHITE = rgb(1, 1, 1);

// ─── Layout constants ─────────────────────────────────────────────────────────
const PAGE_WIDTH = 612;  // US Letter
const PAGE_HEIGHT = 792;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// ─── Helper: draw text with wrapping ─────────────────────────────────────────
function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  font: PDFFont,
  size: number,
  color = DARK_TEXT,
  lineHeight = size * 1.4
): number {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, size);
    if (testWidth > maxWidth && line) {
      page.drawText(line, { x, y: currentY, size, font, color });
      currentY -= lineHeight;
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) {
    page.drawText(line, { x, y: currentY, size, font, color });
    currentY -= lineHeight;
  }
  return currentY;
}

// ─── Main PDF generator ───────────────────────────────────────────────────────

export interface FormPdfInput {
  submissionId: number;
  newHireEmail: string;
  newHireName?: string;
  formType: string;
  formData: Record<string, unknown>;
  approvedAt: Date;
  approverName?: string;
}

export async function generateFormPdf(input: FormPdfInput): Promise<string | null> {
  try {
    const pdfDoc = await PDFDocument.create();
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN;

    const addPage = () => {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
      // Repeat header bar on new pages
      page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 36, width: PAGE_WIDTH, height: 36, color: NAVY });
      page.drawText("ApartmentCorp — Onboarding Document", {
        x: MARGIN, y: PAGE_HEIGHT - 24, size: 10, font: boldFont, color: WHITE,
      });
      y = PAGE_HEIGHT - 52;
    };

    const checkY = (needed: number) => {
      if (y - needed < MARGIN + 40) addPage();
    };

    // ── Header bar ──────────────────────────────────────────────────────────
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 80, width: PAGE_WIDTH, height: 80, color: NAVY });
    page.drawText("ApartmentCorp", { x: MARGIN, y: PAGE_HEIGHT - 32, size: 18, font: boldFont, color: WHITE });
    page.drawText("New Hire Onboarding — Official Record", { x: MARGIN, y: PAGE_HEIGHT - 50, size: 10, font: regularFont, color: rgb(0.7, 0.82, 0.92) });

    // Approved badge
    const badgeText = "APPROVED";
    const badgeWidth = boldFont.widthOfTextAtSize(badgeText, 9) + 16;
    page.drawRectangle({ x: PAGE_WIDTH - MARGIN - badgeWidth, y: PAGE_HEIGHT - 58, width: badgeWidth, height: 20, color: GREEN });
    page.drawText(badgeText, { x: PAGE_WIDTH - MARGIN - badgeWidth + 8, y: PAGE_HEIGHT - 48, size: 9, font: boldFont, color: WHITE });

    y = PAGE_HEIGHT - 100;

    // ── Form title ──────────────────────────────────────────────────────────
    const formTitle = FORM_DISPLAY_NAMES[input.formType] ?? input.formType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    page.drawText(formTitle, { x: MARGIN, y, size: 16, font: boldFont, color: NAVY });
    y -= 8;
    page.drawRectangle({ x: MARGIN, y, width: CONTENT_WIDTH, height: 2, color: GOLD });
    y -= 20;

    // ── Meta info block ─────────────────────────────────────────────────────
    const metaItems = [
      ["Employee", input.newHireName ?? input.newHireEmail],
      ["Email", input.newHireEmail],
      ["Approved By", input.approverName ?? "Brandon Rose (HR Admin)"],
      ["Approval Date", input.approvedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
      ["Document ID", `SUB-${String(input.submissionId).padStart(5, "0")}`],
    ];

    page.drawRectangle({ x: MARGIN, y: y - metaItems.length * 20 - 8, width: CONTENT_WIDTH, height: metaItems.length * 20 + 16, color: LIGHT_GRAY });
    y -= 4;
    for (const [label, value] of metaItems) {
      page.drawText(`${label}:`, { x: MARGIN + 12, y, size: 9, font: boldFont, color: MID_GRAY });
      page.drawText(value, { x: MARGIN + 120, y, size: 9, font: regularFont, color: DARK_TEXT });
      y -= 20;
    }
    y -= 16;

    // ── Section title ───────────────────────────────────────────────────────
    page.drawText("Submitted Information", { x: MARGIN, y, size: 12, font: boldFont, color: TEAL });
    y -= 6;
    page.drawRectangle({ x: MARGIN, y, width: CONTENT_WIDTH, height: 1, color: TEAL });
    y -= 18;

    // ── Form fields ─────────────────────────────────────────────────────────
    const entries = Object.entries(input.formData as Record<string, unknown>);
    let rowIndex = 0;

    for (const [fieldId, rawValue] of entries) {
      if (rawValue === null || rawValue === undefined || rawValue === "") continue;

      // Convert field ID to label
      const label = fieldId
        .replace(/^[a-z0-9]+_/, "")  // strip form prefix (e.g. "w4_")
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());

      const isSensitive = SENSITIVE_FIELD_IDS.has(fieldId);
      const isSignature = SIGNATURE_FIELD_IDS.has(fieldId);

      let displayValue: string;
      if (isSensitive) {
        displayValue = "***-**-****";
      } else if (isSignature) {
        displayValue = `✎ ${String(rawValue)}`;
      } else if (typeof rawValue === "boolean") {
        displayValue = rawValue ? "Yes" : "No";
      } else {
        displayValue = String(rawValue);
      }

      // Estimate row height
      const labelWidth = 160;
      const valueWidth = CONTENT_WIDTH - labelWidth - 24;
      const estimatedLines = Math.ceil(displayValue.length / 55) + 1;
      const rowHeight = Math.max(24, estimatedLines * 14 + 10);

      checkY(rowHeight + 4);

      // Alternating row background
      if (rowIndex % 2 === 0) {
        page.drawRectangle({ x: MARGIN, y: y - rowHeight + 8, width: CONTENT_WIDTH, height: rowHeight, color: LIGHT_GRAY });
      }

      // Label
      page.drawText(label, { x: MARGIN + 8, y: y - 4, size: 8.5, font: boldFont, color: MID_GRAY });

      // Value
      if (isSignature) {
        page.drawText(displayValue, { x: MARGIN + labelWidth, y: y - 4, size: 9.5, font: italicFont, color: TEAL });
      } else {
        y = drawWrappedText(page, displayValue, MARGIN + labelWidth, y - 4, valueWidth, regularFont, 9, DARK_TEXT, 13);
        y += 13; // compensate since drawWrappedText already moves y
      }

      y -= rowHeight;
      rowIndex++;
    }

    // ── Footer ───────────────────────────────────────────────────────────────
    const totalPages = pdfDoc.getPageCount();
    for (let i = 0; i < totalPages; i++) {
      const p = pdfDoc.getPage(i);
      p.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: 32, color: NAVY });
      p.drawText("ApartmentCorp — Confidential Onboarding Record", {
        x: MARGIN, y: 10, size: 8, font: regularFont, color: rgb(0.7, 0.82, 0.92),
      });
      p.drawText(`Page ${i + 1} of ${totalPages}`, {
        x: PAGE_WIDTH - MARGIN - 60, y: 10, size: 8, font: regularFont, color: rgb(0.7, 0.82, 0.92),
      });
    }

    // ── Serialize and upload ─────────────────────────────────────────────────
    const pdfBytes = await pdfDoc.save();
    const key = `onboarding-forms/${input.newHireEmail.replace("@", "_at_")}/sub-${input.submissionId}-${input.formType}.pdf`;
    const { url } = await storagePut(key, Buffer.from(pdfBytes), "application/pdf");
    return url;
  } catch (err) {
    console.error("[PDF] Generation failed:", err);
    return null;
  }
}
