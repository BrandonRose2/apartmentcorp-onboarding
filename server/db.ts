import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Building,
  FormApproval,
  FormSubmission,
  InsertBuilding,
  InsertFormApproval,
  InsertFormSubmission,
  InsertNewHire,
  InsertUser,
  NewHire,
  NewHireCredential,
  buildings,
  formApprovals,
  formSubmissions,
  newHireCredentials,
  newHires,
  propertyMaxTrainingProgress,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── New Hires ────────────────────────────────────────────────────────────────
export async function createNewHire(data: InsertNewHire): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(newHires).values(data);
}

export async function getNewHireByEmail(email: string): Promise<NewHire | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(newHires).where(eq(newHires.email, email.toLowerCase())).limit(1);
  return result[0];
}

export async function getNewHireById(id: number): Promise<NewHire | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(newHires).where(eq(newHires.id, id)).limit(1);
  return result[0];
}

export async function getAllNewHires(): Promise<NewHire[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newHires).orderBy(newHires.createdAt);
}

export async function updateNewHireLastLogin(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(newHires).set({ lastLogin: new Date() }).where(eq(newHires.id, id));
}

export async function updateNewHireAssignment(
  id: number,
  data: { buildingId?: number; position?: NewHire["position"]; onboardingStatus?: NewHire["onboardingStatus"] }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(newHires).set(data).where(eq(newHires.id, id));
}

// ─── Buildings ────────────────────────────────────────────────────────────────
export async function getAllBuildings(): Promise<Building[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(buildings).orderBy(buildings.region, buildings.name);
}

export async function getBuildingById(id: number): Promise<Building | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(buildings).where(eq(buildings.id, id)).limit(1);
  return result[0];
}

export async function seedBuildings(data: InsertBuilding[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Only seed if table is empty
  const existing = await db.select().from(buildings).limit(1);
  if (existing.length > 0) return;
  await db.insert(buildings).values(data);
}

// ─── Form Submissions ─────────────────────────────────────────────────────────
export async function upsertFormSubmission(data: {
  newHireId: number;
  formType: FormSubmission["formType"];
  formData: unknown;
  status?: FormSubmission["status"];
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check if a draft already exists for this form type
  const existing = await db
    .select()
    .from(formSubmissions)
    .where(and(eq(formSubmissions.newHireId, data.newHireId), eq(formSubmissions.formType, data.formType)))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(formSubmissions)
      .set({ formData: data.formData as Record<string, unknown>, status: data.status ?? existing[0].status, updatedAt: new Date() })
      .where(eq(formSubmissions.id, existing[0].id));
    return existing[0].id;
  }
  const result = await db.insert(formSubmissions).values({
    newHireId: data.newHireId,
    formType: data.formType,
    formData: data.formData as Record<string, unknown>,
    status: data.status ?? "draft",
  });
  return (result as unknown as { insertId: number }).insertId;
}

export async function submitFormSubmission(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(formSubmissions).set({ status: "submitted", submittedAt: new Date() }).where(eq(formSubmissions.id, id));
}

export async function getFormSubmissionsByNewHire(newHireId: number): Promise<FormSubmission[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(formSubmissions).where(eq(formSubmissions.newHireId, newHireId));
}

export async function getAllSubmittedForms(): Promise<FormSubmission[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(formSubmissions).where(eq(formSubmissions.status, "submitted"));
}

export async function updateFormSubmissionStatus(
  id: number,
  status: FormSubmission["status"]
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(formSubmissions).set({ status }).where(eq(formSubmissions.id, id));
}

// ─── Form Approvals ───────────────────────────────────────────────────────────
export async function createFormApproval(data: InsertFormApproval): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(formApprovals).values(data);
}

export async function getApprovalsByNewHire(newHireId: number): Promise<FormApproval[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(formApprovals).where(eq(formApprovals.newHireId, newHireId));
}

// ─── New Hire Credentials ───────────────────────────────────────────────────
export async function getCredentialsByNewHire(newHireId: number): Promise<NewHireCredential[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newHireCredentials).where(eq(newHireCredentials.newHireId, newHireId));
}

export async function upsertCredential(data: {
  newHireId: number;
  platform: string;
  required: boolean;
  username?: string | null;
  password?: string | null;
  notes?: string | null;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db
    .select()
    .from(newHireCredentials)
    .where(and(eq(newHireCredentials.newHireId, data.newHireId), eq(newHireCredentials.platform, data.platform)))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(newHireCredentials)
      .set({
        required: data.required,
        username: data.username ?? null,
        password: data.password ?? null,
        notes: data.notes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(newHireCredentials.id, existing[0].id));
  } else {
    await db.insert(newHireCredentials).values({
      newHireId: data.newHireId,
      platform: data.platform,
      required: data.required,
      username: data.username ?? null,
      password: data.password ?? null,
      notes: data.notes ?? null,
    });
  }
}

export async function deleteCredentialsByNewHire(newHireId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(newHireCredentials).where(eq(newHireCredentials.newHireId, newHireId));
}

// ─── PropertyMAX Training Checklist ──────────────────────────────────────────
export async function getTrainingProgressByNewHire(newHireId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(propertyMaxTrainingProgress)
    .where(eq(propertyMaxTrainingProgress.newHireId, newHireId));
}

export async function upsertTrainingProgress(data: {
  newHireId: number;
  itemId: string;
  completed: boolean;
  completedAt?: Date | null;
  signature?: string | null;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db
    .select()
    .from(propertyMaxTrainingProgress)
    .where(
      and(
        eq(propertyMaxTrainingProgress.newHireId, data.newHireId),
        eq(propertyMaxTrainingProgress.itemId, data.itemId)
      )
    )
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(propertyMaxTrainingProgress)
      .set({
        completed: data.completed,
        completedAt: data.completedAt ?? null,
        signature: data.signature ?? null,
        updatedAt: new Date(),
      })
      .where(eq(propertyMaxTrainingProgress.id, existing[0].id));
  } else {
    await db.insert(propertyMaxTrainingProgress).values({
      newHireId: data.newHireId,
      itemId: data.itemId,
      completed: data.completed,
      completedAt: data.completedAt ?? null,
      signature: data.signature ?? null,
    });
  }
}

export async function getAllTrainingProgressForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(propertyMaxTrainingProgress);
}
