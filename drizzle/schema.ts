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
    "submitted",        // all required forms submitted, awaiting Brandon review
    "brandon_approved", // Brandon approved — awaiting Robert
    "robert_approved",  // Robert approved — awaiting Ethan
    "ethan_approved",   // Ethan approved — awaiting Nicole
    "nicole_approved",  // Nicole approved — awaiting Marc
    "marc_approved",    // Marc final approval — fully onboarded
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
    "brandon_approved",
    "brandon_rejected",
    "robert_approved",
    "robert_rejected",
    "ethan_approved",
    "ethan_rejected",
    "nicole_approved",
    "nicole_rejected",
    "marc_approved",
    "marc_rejected",
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
  approverRole: mysqlEnum("approverRole", ["brandon", "robert", "ethan", "nicole", "marc"]).notNull(),
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

// ─── PropertyMAX Training Checklist ──────────────────────────────────────────
// Tracks completion of each PropertyMAX training item per new hire
// with timestamp and employee signature

export const PROPERTYMAX_TRAINING_ITEMS = [
  // Section 1: Getting Started
  { id: "pm-01", section: "Getting Started", title: "Portal Login & Navigation Overview" },
  { id: "pm-02", section: "Getting Started", title: "Dashboard Overview & Quick Stats" },
  { id: "pm-03", section: "Getting Started", title: "My Profile Setup" },
  // Section 2: Requests
  { id: "pm-04", section: "Requests", title: "Submitting a New Request" },
  { id: "pm-05", section: "Requests", title: "Viewing & Tracking Open Requests" },
  { id: "pm-06", section: "Requests", title: "Closing / Resolving a Request" },
  { id: "pm-07", section: "Requests", title: "Request History & Reporting" },
  // Section 3: Narratives
  { id: "pm-08", section: "Narratives", title: "Creating a Narrative Report" },
  { id: "pm-09", section: "Narratives", title: "Editing & Submitting Narratives" },
  { id: "pm-10", section: "Narratives", title: "Reviewing Past Narratives" },
  // Section 4: Manuals
  { id: "pm-11", section: "Manuals", title: "Accessing Company Manuals" },
  { id: "pm-12", section: "Manuals", title: "Navigating Manual Categories" },
  { id: "pm-13", section: "Manuals", title: "Searching & Downloading Manual Content" },
  // Section 5: Reports
  { id: "pm-14", section: "Reports", title: "Running Standard Reports" },
  { id: "pm-15", section: "Reports", title: "Filtering & Customizing Report Views" },
  { id: "pm-16", section: "Reports", title: "Exporting & Sharing Reports" },
  // Section 6: Time Off
  { id: "pm-17", section: "Time Off", title: "Submitting a Time Off Request" },
  { id: "pm-18", section: "Time Off", title: "Viewing Time Off Balances" },
  { id: "pm-19", section: "Time Off", title: "Manager Approval Workflow for Time Off" },
  // Section 7: Admin (Management Only)
  { id: "pm-20", section: "Admin", title: "User Management & Permissions" },
  { id: "pm-21", section: "Admin", title: "System Settings Overview" },
  { id: "pm-22", section: "Admin", title: "Audit Logs & Activity Tracking" },
] as const;

export type PropertyMaxTrainingItemId = (typeof PROPERTYMAX_TRAINING_ITEMS)[number]["id"];

export const propertyMaxTrainingProgress = mysqlTable("propertymax_training_progress", {
  id: int("id").autoincrement().primaryKey(),
  newHireId: int("newHireId").notNull(),
  itemId: varchar("itemId", { length: 16 }).notNull(), // e.g. "pm-01"
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  signature: varchar("signature", { length: 255 }), // typed name as e-signature
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyMaxTrainingProgress = typeof propertyMaxTrainingProgress.$inferSelect;
export type InsertPropertyMaxTrainingProgress = typeof propertyMaxTrainingProgress.$inferInsert;
