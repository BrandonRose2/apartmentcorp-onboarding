/**
 * Stale Onboarding Heartbeat Handler
 *
 * Triggered every 30 minutes via a project-level Heartbeat cron.
 * Checks for new hires who have been in-progress > 3 hours without completing
 * onboarding, and sends a summary alert email to Brandon.
 *
 * Endpoint: POST /api/scheduled/stale-onboarding
 */
import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { getDb } from "./db";
import { newHires, formSubmissions, buildings } from "../drizzle/schema";
import { isNull, inArray } from "drizzle-orm";
import { sendStaleOnboardingAlert } from "./email";

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

export async function staleOnboardingHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) {
      return res.status(403).json({ error: "cron-only" });
    }

    const db = await getDb();

    // Find new hires who:
    // 1. Have a firstLoginAt (started onboarding)
    // 2. Have NOT completed (completedAt is null)
    // 3. Started more than 3 hours ago
    const cutoffTime = new Date(Date.now() - THREE_HOURS_MS);

    const staleHires = await db
      .select()
      .from(newHires)
      .where(inArray(newHires.onboardingStatus, ["pending", "in_progress", "submitted"]));

    // Filter to those who started > 3 hours ago
    const overdue = staleHires.filter((h) => {
      if (!h.firstLoginAt) return false;
      const loginTime = h.firstLoginAt instanceof Date ? h.firstLoginAt : new Date(h.firstLoginAt as number);
      return loginTime < cutoffTime;
    });

    if (overdue.length === 0) {
      return res.json({ ok: true, checked: staleHires.length, overdue: 0 });
    }

    // Enrich with building names and form stats
    const hireIds = overdue.map((h) => h.id);

    // Get all form submissions for these hires
    const submissions = hireIds.length > 0
      ? await db.select().from(formSubmissions).where(inArray(formSubmissions.newHireId, hireIds))
      : [];

    // Get buildings
    const buildingIds = overdue.map((h) => h.buildingId).filter(Boolean) as number[];
    const buildingRows = buildingIds.length > 0
      ? await db.select().from(buildings).where(inArray(buildings.id, buildingIds))
      : [];
    const buildingMap = Object.fromEntries(buildingRows.map((b) => [b.id, b.name]));

    // Build alert payload
    const alertHires = overdue.map((h) => {
      const hireSubs = submissions.filter((s) => s.newHireId === h.id);
      const submitted = hireSubs.length;
      const approved = hireSubs.filter((s) => s.status === "approved").length;

      const loginTime = h.firstLoginAt instanceof Date ? h.firstLoginAt : new Date(h.firstLoginAt as number);
      const hoursElapsed = (Date.now() - loginTime.getTime()) / (1000 * 60 * 60);

      // Try to get name from employment application formData
      const appForm = hireSubs.find((s) => s.formType === "employment_application");
      let name = h.email;
      if (appForm?.formData) {
        try {
          const fd = typeof appForm.formData === "string" ? JSON.parse(appForm.formData) : appForm.formData;
          const first = fd.firstName || fd.first_name || "";
          const last = fd.lastName || fd.last_name || "";
          if (first || last) name = `${first} ${last}`.trim();
        } catch {
          // fallback to email
        }
      }

      return {
        name,
        email: h.email,
        position: h.position ?? "Not specified",
        buildingName: h.buildingId ? (buildingMap[h.buildingId] ?? "Not assigned") : "Not assigned",
        hoursElapsed,
        formsSubmitted: submitted,
        formsApproved: approved,
      };
    });

    await sendStaleOnboardingAlert(alertHires);

    return res.json({
      ok: true,
      checked: staleHires.length,
      overdue: overdue.length,
      alerted: alertHires.map((h) => h.email),
    });
  } catch (err) {
    console.error("[StaleOnboarding] Handler error:", err);
    return res.status(500).json({
      error: String(err),
      timestamp: new Date().toISOString(),
    });
  }
}
