import { boolean, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── New Hire Authentication ───────────────────────────────────────────────────
export const newHires = mysqlTable("new_hires", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passcode: varchar("passcode", { length: 4 }).notNull(),
  // Admin-assigned fields
  buildingId: int("buildingId"),
  position: mysqlEnum("position", ["leasing", "maintenance", "management", "admin_staff", "other"]),
  onboardingStatus: mysqlEnum("onboardingStatus", [
    "pending",          // registered, no forms submitted yet
    "in_progress",      // some forms submitted
    "submitted",        // all required forms submitted, awaiting manager review
    "manager_approved", // regional manager approved
    "hr_approved",      // HR/upper management final approval — fully onboarded
    "rejected",         // rejected at some stage
  ]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastLogin: timestamp("lastLogin").defaultNow().notNull(),
});

export type NewHire = typeof newHires.$inferSelect;
export type InsertNewHire = typeof newHires.$inferInsert;

// ─── Buildings & Manager Mapping ──────────────────────────────────────────────
export const buildings = mysqlTable("buildings", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  region: varchar("region", { length: 64 }),
  // Property Manager
  managerName: varchar("managerName", { length: 255 }),
  managerEmail: varchar("managerEmail", { length: 320 }),
  // Regional Manager
  regionalManagerName: varchar("regionalManagerName", { length: 255 }),
  regionalManagerEmail: varchar("regionalManagerEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Building = typeof buildings.$inferSelect;
export type InsertBuilding = typeof buildings.$inferInsert;

// ─── Form Submissions ─────────────────────────────────────────────────────────
export const formSubmissions = mysqlTable("form_submissions", {
  id: int("id").autoincrement().primaryKey(),
  newHireId: int("newHireId").notNull(),
  formType: mysqlEnum("formType", [
    "employment_application",
    "confidentiality_agreement",
    "tracking_agreement",
    "policies_acknowledgment",
    "direct_deposit",
    "w4",
    "it2104",
    "i9",
    "maintenance_test",
  ]).notNull(),
  formData: json("formData").notNull(), // stores all field values as JSON
  status: mysqlEnum("status", [
    "draft",
    "submitted",
    "manager_approved",
    "manager_rejected",
    "hr_approved",
    "hr_rejected",
  ]).default("draft").notNull(),
  submittedAt: timestamp("submittedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type InsertFormSubmission = typeof formSubmissions.$inferInsert;

// ─── Form Approvals / Review Notes ────────────────────────────────────────────
export const formApprovals = mysqlTable("form_approvals", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull(),
  newHireId: int("newHireId").notNull(),
  approverName: varchar("approverName", { length: 255 }),
  approverEmail: varchar("approverEmail", { length: 320 }),
  approverRole: mysqlEnum("approverRole", ["manager", "hr"]).notNull(),
  action: mysqlEnum("action", ["approved", "rejected"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FormApproval = typeof formApprovals.$inferSelect;
export type InsertFormApproval = typeof formApprovals.$inferInsert;

// ─── New Hire Platform Credentials ───────────────────────────────────────────
// Ethan checks which platforms are required and enters credentials per new hire
export const ALL_PLATFORMS = [
  "Paychex",
  "AppWork",
  "Connecteam",
  "Sensor",
  "Phone Portal",
  "Yardi",
  "Inspections",
  "Genesis",
  "Webster",
  "B of A",
  "Purchasing",
  "Vacancy",
  "AI Bot",
  "OneSite",
] as const;

export type Platform = (typeof ALL_PLATFORMS)[number];

export const newHireCredentials = mysqlTable("new_hire_credentials", {
  id: int("id").autoincrement().primaryKey(),
  newHireId: int("newHireId").notNull(),
  platform: varchar("platform", { length: 64 }).notNull(),
  required: boolean("required").default(false).notNull(),
  username: varchar("username", { length: 255 }),
  password: varchar("password", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewHireCredential = typeof newHireCredentials.$inferSelect;
export type InsertNewHireCredential = typeof newHireCredentials.$inferInsert;

// ── PropertyMAX Training Progress ────────────────────────────────────────────
export const propertyMaxTrainingProgress = mysqlTable("propertymax_training_progress", {
  id: int("id").autoincrement().primaryKey(),
  newHireId: int("newHireId").notNull(),
  section: varchar("section", { length: 128 }).notNull(),
  itemId: varchar("itemId", { length: 128 }).notNull(),
  itemLabel: text("itemLabel").notNull(),
  completedAt: timestamp("completedAt").notNull(),
  signature: varchar("signature", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PropertyMaxTrainingProgressRow = typeof propertyMaxTrainingProgress.$inferSelect;
export type InsertPropertyMaxTrainingProgress = typeof propertyMaxTrainingProgress.$inferInsert;
