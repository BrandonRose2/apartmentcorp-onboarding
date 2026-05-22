import { COOKIE_NAME } from "@shared/const";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { buildings, formApprovals, formSubmissions, newHires, propertyMaxTrainingProgress } from "../drizzle/schema";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createFormApproval,
  deleteCredentialsByNewHire,
  getAllBuildings,
  getAllNewHires,
  getAllSubmittedForms,
  getApprovalsByNewHire,
  getBuildingById,
  getCredentialsByNewHire,
  getDb,
  getFormSubmissionsByNewHire,
  getNewHireByEmail,
  getNewHireById,
  seedBuildings,
  submitFormSubmission,
  updateFormSubmissionStatus,
  updateNewHireAssignment,
  upsertCredential,
  upsertFormSubmission,
} from "./db";
import { notifyOwner } from "./_core/notification";
import { sendCompletionEmail, sendFirstLoginNotification, sendWelcomeEmail } from "./email";

const NEW_HIRE_COOKIE = "nh_session";

// Helper to get new hire from request cookie
async function getNewHireFromCookie(cookieHeader: string) {
  const emailFromCookie = cookieHeader
    .split(";")
    .map((c: string) => c.trim().split("="))
    .find(([k]: string[]) => k === NEW_HIRE_COOKIE)?.[1];
  if (!emailFromCookie) return null;
  // Decode safely — handle both plain and URL-encoded values
  let email = emailFromCookie;
  try { email = decodeURIComponent(emailFromCookie); } catch { /* use raw value */ }
  // If still encoded (double-encoded), decode again
  if (email.includes("%40") || email.includes("%2540")) {
    try { email = decodeURIComponent(email); } catch { /* use as-is */ }
  }
  return getNewHireByEmail(email.toLowerCase());
}

// Buildings seed data
const BUILDINGS_SEED = [
  // Region 1 — Leslie Rolon / JR Rolon
  { name: "Arbor Crest Apts", region: "Region 1", managerName: "Erica Finch", managerEmail: "arborcrest@apartmentcorp.com", regionalManagerName: "Leslie Rolon", regionalManagerEmail: "leslie@apartmentcorp.com" },
  { name: "Boca Ciega Townhomes Apts", region: "Region 1", managerName: "Katrina Weekly", managerEmail: "katrina@apartmentcorp.com", regionalManagerName: "Leslie Rolon", regionalManagerEmail: "leslie@apartmentcorp.com" },
  { name: "Coral Village", region: "Region 1", managerName: null, managerEmail: "coralvillage@apartmentcorp.com", regionalManagerName: "Leslie Rolon", regionalManagerEmail: "leslie@apartmentcorp.com" },
  { name: "Cumberland Apts", region: "Region 1", managerName: "Kiara Brown", managerEmail: "cumberland@apartmentcorp.com", regionalManagerName: "Leslie Rolon", regionalManagerEmail: "leslie@apartmentcorp.com" },
  { name: "Holiday Apts", region: "Region 1", managerName: "Arlene Vinson", managerEmail: "holiday@apartmentcorp.com", regionalManagerName: "Leslie Rolon", regionalManagerEmail: "leslie@apartmentcorp.com" },
  { name: "Jefferson Arms Apts", region: "Region 1", managerName: "Brandy Amador", managerEmail: "jefferson@apartmentcorp.com", regionalManagerName: "Leslie Rolon", regionalManagerEmail: "leslie@apartmentcorp.com" },
  { name: "Macedonia Garden Apts", region: "Region 1", managerName: "Erika Scales", managerEmail: "macedonia@apartmentcorp.com", regionalManagerName: "Leslie Rolon", regionalManagerEmail: "leslie@apartmentcorp.com" },
  { name: "Opa Locka - 135th St Apts", region: "Region 1", managerName: "Rosa Villarroel", managerEmail: "opa@apartmentcorp.com", regionalManagerName: "Leslie Rolon", regionalManagerEmail: "leslie@apartmentcorp.com" },
  { name: "Walnut Hill Apartments", region: "Region 1", managerName: "Johann Armstead", managerEmail: "walnut@apartmentcorp.com", regionalManagerName: "Leslie Rolon", regionalManagerEmail: "leslie@apartmentcorp.com" },
  // Region 2 — (Regional Manager TBD)
  { name: "Crossroads of Lees Summit", region: "Region 2", managerName: "Jennifer Parks", managerEmail: "crossroads@apartmentcorp.com", regionalManagerName: null, regionalManagerEmail: null },
  { name: "La Promesa", region: "Region 2", managerName: "Ashley Clay", managerEmail: "lapromesa@apartmentcorp.com", regionalManagerName: null, regionalManagerEmail: null },
  { name: "Grove Park Terrace", region: "Region 2", managerName: "Nikki Moreno", managerEmail: "grovepark@apartmentcorp.com", regionalManagerName: null, regionalManagerEmail: null },
  { name: "Breckenridge Village", region: "Region 2", managerName: null, managerEmail: "lexingtonasst@apartmentcorp.com", regionalManagerName: null, regionalManagerEmail: null },
  { name: "Grace Townhomes", region: "Region 2", managerName: "Susan Lopez", managerEmail: "susan@apartmentcorp.com", regionalManagerName: null, regionalManagerEmail: null },
  // Region 3 — Ginger Positerry
  { name: "Pirates Bend", region: "Region 3", managerName: "Sandra Crump", managerEmail: "pirates@apartmentcorp.com", regionalManagerName: "Ginger Positerry", regionalManagerEmail: "ginger@apartmentcorp.com" },
  { name: "Howell Place", region: "Region 3", managerName: "Sandra Crump", managerEmail: "howell@apartmentcorp.com", regionalManagerName: "Ginger Positerry", regionalManagerEmail: "ginger@apartmentcorp.com" },
  { name: "Pelican Bay", region: "Region 3", managerName: "Dequanta Sutherland", managerEmail: "pelican@apartmentcorp.com", regionalManagerName: "Ginger Positerry", regionalManagerEmail: "ginger@apartmentcorp.com" },
  { name: "St. Charles Place", region: "Region 3", managerName: "Deon Tolliver", managerEmail: "stcharles@apartmentcorp.com", regionalManagerName: "Ginger Positerry", regionalManagerEmail: "ginger@apartmentcorp.com" },
  { name: "Bayou Pointe", region: "Region 3", managerName: null, managerEmail: "bayou@apartmentcorp.com", regionalManagerName: "Ginger Positerry", regionalManagerEmail: "ginger@apartmentcorp.com" },
  { name: "North Pointe", region: "Region 3", managerName: null, managerEmail: "northpointe@apartmentcorp.com", regionalManagerName: "Ginger Positerry", regionalManagerEmail: "ginger@apartmentcorp.com" },
  { name: "Yorkshire / Windsor Village", region: "Region 3", managerName: "Kimberly Powell", managerEmail: "windsor@apartmentcorp.com", regionalManagerName: "Ginger Positerry", regionalManagerEmail: "ginger@apartmentcorp.com" },
  { name: "Thibodaux - Colonial Estates Apts", region: "Region 3", managerName: "Susie Rogers", managerEmail: "colonialleasing@apartmentcorp.com", regionalManagerName: "Ginger Positerry", regionalManagerEmail: "ginger@apartmentcorp.com" },
  { name: "Marrero 3", region: "Region 3", managerName: "Ketorah Parks", managerEmail: "rubystarmanager@apartmentcorp.com", regionalManagerName: "Ginger Positerry", regionalManagerEmail: "ginger@apartmentcorp.com" },
  { name: "Ruby Diamond / Star Homes", region: "Region 3", managerName: null, managerEmail: "rubystarmanager@apartmentcorp.com", regionalManagerName: "Ginger Positerry", regionalManagerEmail: "ginger@apartmentcorp.com" },
  { name: "The Gates on Manhattan", region: "Region 3", managerName: "Lindgret Celestine", managerEmail: "lindgret@apartmentcorp.com", regionalManagerName: "Ginger Positerry", regionalManagerEmail: "ginger@apartmentcorp.com" },
  // Region 4 — Blake Weddington
  { name: "Anaheim Gardens Apts", region: "Region 4", managerName: "Priscilla Walters", managerEmail: "priscilla@apartmentcorp.com", regionalManagerName: "Blake Weddington", regionalManagerEmail: "blake@apartmentcorp.com" },
  { name: "Columbia Village", region: "Region 4", managerName: "Tammy Davis", managerEmail: "tammy@apartmentcorp.com", regionalManagerName: "Blake Weddington", regionalManagerEmail: "blake@apartmentcorp.com" },
  { name: "New Wilmington Arms", region: "Region 4", managerName: "Alberto Spence", managerEmail: "alberto@apartmentcorp.com", regionalManagerName: "Blake Weddington", regionalManagerEmail: "blake@apartmentcorp.com" },
  { name: "Granite Ridge Apts", region: "Region 4", managerName: "James Abeyta", managerEmail: "james@apartmentcorp.com", regionalManagerName: "Blake Weddington", regionalManagerEmail: "blake@apartmentcorp.com" },
  { name: "Oak Hills Apts", region: "Region 4", managerName: "Heather Hein", managerEmail: "heatherh@apartmentcorp.com", regionalManagerName: "Blake Weddington", regionalManagerEmail: "blake@apartmentcorp.com" },
  { name: "Pacific Pointe Apts", region: "Region 4", managerName: "Hailey Huber", managerEmail: "pacificpointe@apartmentcorp.com", regionalManagerName: "Blake Weddington", regionalManagerEmail: "blake@apartmentcorp.com" },
  { name: "River Garden", region: "Region 4", managerName: "Heather Snyder", managerEmail: "rivergarden@apartmentcorp.com", regionalManagerName: "Blake Weddington", regionalManagerEmail: "blake@apartmentcorp.com" },
  { name: "River Pointe Apts", region: "Region 4", managerName: "Stephanie Delong", managerEmail: "stephanie@apartmentcorp.com", regionalManagerName: "Blake Weddington", regionalManagerEmail: "blake@apartmentcorp.com" },
  { name: "Fairfax Senior Apts", region: "Region 4", managerName: "Shraga Kurs", managerEmail: null, regionalManagerName: "Blake Weddington", regionalManagerEmail: "blake@apartmentcorp.com" },
  { name: "Midtown Manor", region: "Region 4", managerName: "Steve Rand", managerEmail: null, regionalManagerName: "Blake Weddington", regionalManagerEmail: "blake@apartmentcorp.com" },
  { name: "Urban Rehab 1", region: "Region 4", managerName: "Amunique Cannon", managerEmail: null, regionalManagerName: "Blake Weddington", regionalManagerEmail: "blake@apartmentcorp.com" },
  { name: "Urban Rehab 2", region: "Region 4", managerName: "Lyndon Jernigan", managerEmail: null, regionalManagerName: "Blake Weddington", regionalManagerEmail: "blake@apartmentcorp.com" },
  // Region 5 — Leslie Rolon
  { name: "Thomasville Church Homes", region: "Region 5", managerName: null, managerEmail: "thomasville@apartmentcorp.com", regionalManagerName: "Leslie Rolon", regionalManagerEmail: "leslie@apartmentcorp.com" },
  { name: "Silver Springs Terrace Apts", region: "Region 5", managerName: "Tarshia Pierce", managerEmail: "silversprings@apartmentcorp.com", regionalManagerName: "Leslie Rolon", regionalManagerEmail: "leslie@apartmentcorp.com" },
];

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── New Hire Auth ──────────────────────────────────────────────────────────
  newHire: router({
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        passcode: z.string().length(4).regex(/^\d{4}$/),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const existing = await db.select().from(newHires).where(eq(newHires.email, input.email.toLowerCase())).limit(1);
        if (existing.length > 0) return { success: false, error: "email_taken" } as const;
        await db.insert(newHires).values({ email: input.email.toLowerCase(), passcode: input.passcode });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(NEW_HIRE_COOKIE, input.email.toLowerCase(), { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
        // Notify admin of new registration
        await notifyOwner({ title: "New Hire Registered", content: `${input.email} has registered on the onboarding portal.` });
        // Send welcome email to new hire
        const firstName = input.email.split("@")[0]?.split(".")[0] ?? "there";
        const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        const portalUrl = `${ctx.req.protocol}://${ctx.req.get ? ctx.req.get("host") : "aptonboard-pxsj4nvm.manus.space"}/onboarding`;
        await sendWelcomeEmail({ toEmail: input.email.toLowerCase(), firstName: capitalizedName, portalUrl });
        return { success: true, email: input.email.toLowerCase() } as const;
      }),

    loginWithPasscode: publicProcedure
      .input(z.object({
        passcode: z.string().length(4).regex(/^\d{4}$/),
        email: z.string().email().optional(), // optional: for device-independent login
      }))
      .mutation(async ({ input, ctx }) => {
        let hire = await getNewHireFromCookie(ctx.req.headers.cookie ?? "");
        // Fallback: if no cookie session, look up by email
        if (!hire && input.email) {
          const db = await getDb();
          const rows = await db.select().from(newHires).where(eq(newHires.email, input.email.toLowerCase())).limit(1);
          hire = rows[0] ?? null;
        }
        if (!hire) return { success: false, error: "no_session" } as const;
        if (hire.passcode !== input.passcode) return { success: false, error: "wrong_passcode" } as const;
        // First-login detection: fire notification if this is the first time they log in
        const isFirstLogin = !hire.firstLoginAt;
        if (isFirstLogin) {
          const db2 = await getDb();
          await db2.update(newHires).set({ firstLoginAt: new Date() }).where(eq(newHires.id, hire.id));
          const building = hire.buildingId ? await getBuildingById(hire.buildingId) : null;
          const hireName = hire.email.split("@")[0]?.replace(/\./g, " ") ?? hire.email;
          const capitalizedName = hireName.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          sendFirstLoginNotification({
            newHireName: capitalizedName,
            newHireEmail: hire.email,
            position: hire.position ?? "Not specified",
            buildingName: building?.name ?? "Not assigned",
            loginTime: new Date(),
            adminDashboardUrl: "https://aptonboard-pxsj4nvm.manus.space",
          }).catch((e: unknown) => console.error("[FirstLogin] Notification failed:", e));
        }
        await updateNewHireLastLogin(hire.id);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(NEW_HIRE_COOKIE, hire.email, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
        return { success: true, email: hire.email, id: hire.id, isFirstLogin } as const;
      }),

    checkEmailExists: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        const rows = await db.select({ id: newHires.id }).from(newHires).where(eq(newHires.email, input.email.toLowerCase())).limit(1);
        return { exists: rows.length > 0 };
      }),

    checkSession: publicProcedure.query(async ({ ctx }) => {
      const hire = await getNewHireFromCookie(ctx.req.headers.cookie ?? "");
      if (!hire) return { registered: false, email: null, hire: null };
      return { registered: true, email: hire.email, hire };
    }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(NEW_HIRE_COOKIE, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    getMySubmissions: publicProcedure.query(async ({ ctx }) => {
      const hire = await getNewHireFromCookie(ctx.req.headers.cookie ?? "");
      if (!hire) return [];
      return getFormSubmissionsByNewHire(hire.id);
    }),
  }),

  // ─── Buildings ──────────────────────────────────────────────────────────────
  buildings: router({
    list: publicProcedure.query(async () => {
      await seedBuildings(BUILDINGS_SEED);
      return getAllBuildings();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getBuildingById(input.id)),
  }),

  // ─── Forms ──────────────────────────────────────────────────────────────────
  forms: router({
    saveDraft: publicProcedure
      .input(z.object({
        formType: z.enum(["employment_application", "confidentiality_agreement", "tracking_agreement", "policies_acknowledgment", "direct_deposit", "w4", "it2104", "i9", "maintenance_test"]),
        formData: z.record(z.string(), z.unknown()),
      }))
      .mutation(async ({ input, ctx }) => {
        const hire = await getNewHireFromCookie(ctx.req.headers.cookie ?? "");
        if (!hire) throw new Error("Not authenticated");
        const id = await upsertFormSubmission({ newHireId: hire.id, formType: input.formType, formData: input.formData, status: "draft" });
        return { success: true, id };
      }),

    submit: publicProcedure
      .input(z.object({
        formType: z.enum(["employment_application", "confidentiality_agreement", "tracking_agreement", "policies_acknowledgment", "direct_deposit", "w4", "it2104", "i9", "maintenance_test"]),
        formData: z.record(z.string(), z.unknown()),
      }))
      .mutation(async ({ input, ctx }) => {
        const hire = await getNewHireFromCookie(ctx.req.headers.cookie ?? "");
        if (!hire) throw new Error("Not authenticated");
        const id = await upsertFormSubmission({ newHireId: hire.id, formType: input.formType, formData: input.formData, status: "submitted" });
        await submitFormSubmission(id);
        // Update new hire status to in_progress if still pending
        if (hire.onboardingStatus === "pending") {
          await updateNewHireAssignment(hire.id, { onboardingStatus: "in_progress" });
        }
        // Notify admin only (testing mode — single approver)
        await notifyOwner({
          title: `Form Submitted: ${input.formType.replace(/_/g, " ")}`,
          content: `${hire.email} submitted the ${input.formType.replace(/_/g, " ")} form and is awaiting your review in the Admin Dashboard.`,
        });
        return { success: true, id };
      }),

    getMyForms: publicProcedure.query(async ({ ctx }) => {
      const hire = await getNewHireFromCookie(ctx.req.headers.cookie ?? "");
      if (!hire) return [];
      return getFormSubmissionsByNewHire(hire.id);
    }),

    // Returns the set of formTypes that have been approved — used to gate chapter unlocks
    getMyApprovedForms: publicProcedure.query(async ({ ctx }) => {
      const hire = await getNewHireFromCookie(ctx.req.headers.cookie ?? "");
      if (!hire) return [];
      const db = await getDb();
      if (!db) return [];
      const subs = await db
        .select({ formType: formSubmissions.formType })
        .from(formSubmissions)
        .where(
          and(
            eq(formSubmissions.newHireId, hire.id),
            eq(formSubmissions.status, "hr_approved")
          )
        );
      return subs.map(s => s.formType);
    }),
  }),

  // ─── Admin ──────────────────────────────────────────────────────────────────
  admin: router({
    // List all new hires with their building info and name from employment application
    listNewHires: publicProcedure.query(async () => {
      const hires = await getAllNewHires();
      const allBuildings = await getAllBuildings();
      const buildingMap = new Map(allBuildings.map(b => [b.id, b]));

      const REQUIRED_FORM_TYPES = [
        "employment_application",
        "confidentiality_agreement",
        "tracking_agreement",
        "policies_acknowledgment",
        "direct_deposit",
        "w4",
        "i9",
      ];

      // Pull firstName/lastName and form approval status from submissions
      const hiresWithNames = await Promise.all(hires.map(async (h) => {
        const subs = await getFormSubmissionsByNewHire(h.id);
        const appSub = subs.find(s => s.formType === "employment_application");
        let firstName = "";
        let lastName = "";
        if (appSub?.formData) {
          const fd = appSub.formData as Record<string, unknown>;
          firstName = (fd.firstName as string) ?? "";
          lastName = (fd.lastName as string) ?? "";
        }
        // Fall back to email prefix if no name found
        if (!firstName && !lastName) {
          firstName = h.email.split("@")[0];
        }

        // Compute form approval status
        const submittedForms = subs.filter(s => s.status !== "draft");
        const approvedForms = subs.filter(s => s.status === "hr_approved" || s.status === "brandon_approved");
        const rejectedForms = subs.filter(s => s.status === "hr_rejected" || s.status === "brandon_rejected");
        const requiredApproved = REQUIRED_FORM_TYPES.filter(ft =>
          approvedForms.some(s => s.formType === ft)
        );
        const allFormsApproved = requiredApproved.length === REQUIRED_FORM_TYPES.length;
        const hasRejected = rejectedForms.length > 0;
        const totalSubmitted = submittedForms.length;
        const totalApproved = approvedForms.length;

        // formStatus: 'all_approved' | 'partially_approved' | 'pending' | 'rejected' | 'no_submissions'
        let formStatus: "all_approved" | "partially_approved" | "pending" | "rejected" | "no_submissions";
        if (totalSubmitted === 0) {
          formStatus = "no_submissions";
        } else if (allFormsApproved) {
          formStatus = "all_approved";
        } else if (hasRejected) {
          formStatus = "rejected";
        } else if (totalApproved > 0) {
          formStatus = "partially_approved";
        } else {
          formStatus = "pending";
        }

        // Credential provisioning stats
        const creds = await getCredentialsByNewHire(h.id);
        const requiredCreds = creds.filter(c => c.required);
        const provisionedCreds = requiredCreds.filter(c => c.username && c.username.trim().length > 0);

        return {
          ...h,
          firstName,
          lastName,
          building: h.buildingId ? buildingMap.get(h.buildingId) ?? null : null,
          formStatus,
          formsApprovedCount: totalApproved,
          formsSubmittedCount: totalSubmitted,
          formsRequiredApprovedCount: requiredApproved.length,
          formsRequiredTotal: REQUIRED_FORM_TYPES.length,
          credentialsRequired: requiredCreds.length,
          credentialsProvisioned: provisionedCreds.length,
        };
      }));

      return hiresWithNames;
    }),

    // Assign building and position to a new hire
    assignNewHire: publicProcedure
      .input(z.object({
        newHireId: z.number(),
        buildingId: z.number().optional(),
        position: z.enum(["leasing", "maintenance", "management", "admin_staff", "other"]).optional(),
      }))
      .mutation(async ({ input }) => {
        await updateNewHireAssignment(input.newHireId, {
          buildingId: input.buildingId,
          position: input.position,
        });
        return { success: true };
      }),

    // Get all submitted forms pending review
    getPendingSubmissions: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const subs = await db.select().from(formSubmissions).where(eq(formSubmissions.status, "submitted"));
      const hires = await getAllNewHires();
      const hireMap = new Map(hires.map(h => [h.id, h]));
      return subs.map(s => ({ ...s, newHire: hireMap.get(s.newHireId) ?? null }));
    }),

    // Get all submissions for a specific new hire
    getNewHireSubmissions: publicProcedure
      .input(z.object({ newHireId: z.number() }))
      .query(async ({ input }) => {
        const [subs, approvals, hire] = await Promise.all([
          getFormSubmissionsByNewHire(input.newHireId),
          getApprovalsByNewHire(input.newHireId),
          getNewHireById(input.newHireId),
        ]);
        let building = null;
        if (hire?.buildingId) building = await getBuildingById(hire.buildingId);
        return { hire, building, submissions: subs, approvals };
      }),

      // Approve or reject a form submission (single approver: Brandon)
    reviewSubmission: publicProcedure
      .input(z.object({
        submissionId: z.number(),
        newHireId: z.number(),
        action: z.enum(["approved", "rejected"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Single approval step — approved = hr_approved (unlocks next chapter for new hire)
        const newStatus = input.action === "approved" ? "hr_approved" : "hr_rejected";
        await updateFormSubmissionStatus(input.submissionId, newStatus as any);
        await createFormApproval({
          submissionId: input.submissionId,
          newHireId: input.newHireId,
          approverName: "Brandon",
          approverEmail: "brandon@apartmentcorp.com",
          approverRole: "hr",
          action: input.action,
          notes: input.notes ?? null,
        });
        if (input.action === "approved") {
          await updateNewHireAssignment(input.newHireId, { onboardingStatus: "hr_approved" });

          // Check if ALL required chapters are now approved — if so, send completion email
          const REQUIRED_FORM_TYPES = [
            "employment_application",
            "confidentiality_agreement",
            "tracking_agreement",
            "policies_acknowledgment",
            "direct_deposit",
            "w4",
            "i9",
          ];
          const FORM_LABELS: Record<string, string> = {
            employment_application: "Employment Application",
            confidentiality_agreement: "Confidentiality Agreement",
            tracking_agreement: "GPS / Tracking Agreement",
            policies_acknowledgment: "Policies Acknowledgment",
            direct_deposit: "Direct Deposit Authorization",
            w4: "Federal W-4",
            it2104: "NY IT-2104 Withholding Certificate",
            i9: "I-9 Employment Eligibility Verification",
            maintenance_test: "Maintenance Skills Test",
          };

          const allSubs = await getFormSubmissionsByNewHire(input.newHireId);
          const approvedTypes = new Set(
            allSubs
              .filter(s => s.status === "hr_approved" || s.status === "brandon_approved")
              .map(s => s.formType)
          );
          const allRequiredApproved = REQUIRED_FORM_TYPES.every(t => approvedTypes.has(t));

          if (allRequiredApproved) {
            const hire = await getNewHireById(input.newHireId);
            if (hire?.completionEmailSentAt) {
              // Idempotency: only send once
              console.log("[Completion] Email already sent for hire", input.newHireId, "- skipping");
            } else {
              const building = hire?.buildingId ? await getBuildingById(hire.buildingId) : null;
              const approvedForms = [...approvedTypes].map(ft => ({ formType: ft, label: FORM_LABELS[ft] ?? ft }));
              const sent = await sendCompletionEmail({
                newHireName: hire?.email?.split("@")[0] ?? "New Hire",
                newHireEmail: hire?.email ?? "",
                position: hire?.position ?? "Not specified",
                buildingName: building?.name ?? "Not assigned",
                regionalManagerName: building?.regionalManagerName ?? "Not assigned",
                regionalManagerEmail: building?.regionalManagerEmail ?? null,
                adminDashboardUrl: "https://aptonboard-pxsj4nvm.manus.space",
                approvedForms,
              });
              if (sent) {
                const db = getDb();
                await db.update(newHires).set({ completionEmailSentAt: new Date() }).where(eq(newHires.id, input.newHireId));
                console.log("[Completion] Email sent and recorded for hire", input.newHireId);
              }
            }
          }
        }
        return { success: true };
      }),

    // Bulk approve or reject all submitted forms for a new hire
    bulkReview: publicProcedure
      .input(z.object({
        newHireId: z.number(),
        action: z.enum(["approved", "rejected"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const allSubs = await getFormSubmissionsByNewHire(input.newHireId);
        const pending = allSubs.filter(s => s.status === "submitted" || s.status === "pending");
        if (pending.length === 0) return { updated: 0 };

        const newStatus = input.action === "approved" ? "hr_approved" : "hr_rejected";
        for (const sub of pending) {
          await updateFormSubmissionStatus(sub.id, newStatus as any);
          await createFormApproval({
            submissionId: sub.id,
            newHireId: input.newHireId,
            approverName: "Brandon",
            approverEmail: "brandon@apartmentcorp.com",
            approverRole: "hr",
            action: input.action,
            notes: input.notes ?? null,
          });
        }

        if (input.action === "approved") {
          await updateNewHireAssignment(input.newHireId, { onboardingStatus: "hr_approved" });

          const REQUIRED_FORM_TYPES = [
            "employment_application",
            "confidentiality_agreement",
            "tracking_agreement",
            "policies_acknowledgment",
            "direct_deposit",
            "w4",
            "i9",
          ];
          const FORM_LABELS: Record<string, string> = {
            employment_application: "Employment Application",
            confidentiality_agreement: "Confidentiality Agreement",
            tracking_agreement: "GPS / Tracking Agreement",
            policies_acknowledgment: "Policies Acknowledgment",
            direct_deposit: "Direct Deposit Authorization",
            w4: "Federal W-4",
            it2104: "NY IT-2104 Withholding Certificate",
            i9: "I-9 Employment Eligibility Verification",
            maintenance_test: "Maintenance Skills Test",
          };

          const updatedSubs = await getFormSubmissionsByNewHire(input.newHireId);
          const approvedTypes = new Set(
            updatedSubs
              .filter(s => s.status === "hr_approved" || s.status === "brandon_approved")
              .map(s => s.formType)
          );
          const allRequiredApproved = REQUIRED_FORM_TYPES.every(t => approvedTypes.has(t));

          if (allRequiredApproved) {
            const hire = await getNewHireById(input.newHireId);
            if (!hire?.completionEmailSentAt) {
              const building = hire?.buildingId ? await getBuildingById(hire.buildingId) : null;
              const approvedForms = [...approvedTypes].map(ft => ({ formType: ft, label: FORM_LABELS[ft] ?? ft }));
              const sent = await sendCompletionEmail({
                newHireName: hire?.email?.split("@")[0] ?? "New Hire",
                newHireEmail: hire?.email ?? "",
                position: hire?.position ?? "Not specified",
                buildingName: building?.name ?? "Not assigned",
                regionalManagerName: building?.regionalManagerName ?? "Not assigned",
                regionalManagerEmail: building?.regionalManagerEmail ?? null,
                adminDashboardUrl: "https://aptonboard-pxsj4nvm.manus.space",
                approvedForms,
              });
              if (sent) {
                const db = getDb();
                await db.update(newHires).set({ completionEmailSentAt: new Date() }).where(eq(newHires.id, input.newHireId));
              }
            }
          }
        }

        return { updated: pending.length };
      }),

    // Update new hire onboarding status directly
    updateStatus: publicProcedure
      .input(z.object({
        newHireId: z.number(),
        status: z.enum(["pending", "in_progress", "submitted", "manager_approved", "hr_approved", "rejected"]),
      }))
      .mutation(async ({ input }) => {
        await updateNewHireAssignment(input.newHireId, { onboardingStatus: input.status });
        return { success: true };
      }),

    // Get credentials for a specific new hire (admin view)
    getCredentials: publicProcedure
      .input(z.object({ newHireId: z.number() }))
      .query(async ({ input }) => getCredentialsByNewHire(input.newHireId)),

    // Save credentials for a new hire (admin sets required platforms + login info)
    saveCredentials: publicProcedure
      .input(z.object({
        newHireId: z.number(),
        credentials: z.array(z.object({
          platform: z.string(),
          required: z.boolean(),
          username: z.string().optional().nullable(),
          password: z.string().optional().nullable(),
          notes: z.string().optional().nullable(),
        })),
      }))
      .mutation(async ({ input }) => {
        for (const cred of input.credentials) {
          await upsertCredential({
            newHireId: input.newHireId,
            platform: cred.platform,
            required: cred.required,
            username: cred.username ?? null,
            password: cred.password ?? null,
            notes: cred.notes ?? null,
          });
        }
        return { success: true };
      }),
  }),

  // ─── New Hire Credentials (portal-side) ─────────────────────────────────────
  credentials: router({
    // New hire fetches their own assigned credentials
    getMyCredentials: publicProcedure.query(async ({ ctx }) => {
      const hire = await getNewHireFromCookie(ctx.req.headers.cookie ?? "");
      if (!hire) return [];
      const all = await getCredentialsByNewHire(hire.id);
      // Only return required credentials that have at least a username set
      return all.filter(c => c.required);
    }),
  }),

  // ─── PropertyMAX Training Checklist ──────────────────────────────────────────
  training: router({
    // Get all completed items for the current new hire
    getMyProgress: publicProcedure.query(async ({ ctx }) => {
      const hire = await getNewHireFromCookie(ctx.req.headers.cookie ?? "");
      if (!hire) return [];
      const db = await getDb();
      if (!db) return [];
      return db.select().from(propertyMaxTrainingProgress)
        .where(eq(propertyMaxTrainingProgress.newHireId, hire.id));
    }),

    // Mark an entire section as complete with a single signature
    // One row per section per new hire (itemId = sectionId)
    markSectionComplete: publicProcedure
      .input(z.object({
        sectionId: z.string(),
        sectionTitle: z.string(),
        signature: z.string().min(2, "Signature required"),
      }))
      .mutation(async ({ input, ctx }) => {
        const hire = await getNewHireFromCookie(ctx.req.headers.cookie ?? "");
        if (!hire) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // Upsert: one row per section per new hire
        await db.delete(propertyMaxTrainingProgress)
          .where(and(
            eq(propertyMaxTrainingProgress.newHireId, hire.id),
            eq(propertyMaxTrainingProgress.itemId, input.sectionId),
          ));
        await db.insert(propertyMaxTrainingProgress).values({
          newHireId: hire.id,
          section: input.sectionId,
          itemId: input.sectionId,
          itemLabel: input.sectionTitle,
          completedAt: new Date(),
          signature: input.signature,
        });
        return { success: true };
      }),

    // Admin: get all training progress for a specific new hire
    getProgressForNewHire: publicProcedure
      .input(z.object({ newHireId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(propertyMaxTrainingProgress)
          .where(eq(propertyMaxTrainingProgress.newHireId, input.newHireId))
          .orderBy(propertyMaxTrainingProgress.completedAt);
      }),
  }),
});

// Helper used in loginWithPasscode
async function updateNewHireLastLogin(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(newHires).set({ lastLogin: new Date() }).where(eq(newHires.id, id));
}

export type AppRouter = typeof appRouter;
