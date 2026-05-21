/**
 * Unit tests for new hire auth and forms router procedures
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module so tests don't need a real database
vi.mock("./db", () => {
  // Create mock db inline to avoid hoisting issues
  const mockDb = {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
  };
  return {
  getDb: vi.fn().mockResolvedValue(mockDb),
  getNewHireByEmail: vi.fn(),
  getNewHireById: vi.fn(),
  getFormSubmissionsByNewHire: vi.fn().mockResolvedValue([]),
  getAllBuildings: vi.fn().mockResolvedValue([]),
  getAllNewHires: vi.fn().mockResolvedValue([]),
  getBuildingById: vi.fn().mockResolvedValue(null),
  seedBuildings: vi.fn().mockResolvedValue(undefined),
  upsertFormSubmission: vi.fn().mockResolvedValue(1),
  submitFormSubmission: vi.fn().mockResolvedValue(undefined),
  updateNewHireAssignment: vi.fn().mockResolvedValue(undefined),
  updateFormSubmissionStatus: vi.fn().mockResolvedValue(undefined),
  createFormApproval: vi.fn().mockResolvedValue(undefined),
  getApprovalsByNewHire: vi.fn().mockResolvedValue([]),
  };
});

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createCtx(cookieHeader = ""): TrpcContext {
  const cookies: Record<string, string> = {};
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { cookie: cookieHeader },
    } as TrpcContext["req"],
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("newHire.checkSession", () => {
  it("returns registered: false when no cookie is present", async () => {
    const caller = appRouter.createCaller(createCtx(""));
    const result = await caller.newHire.checkSession();
    expect(result.registered).toBe(false);
    expect(result.email).toBeNull();
  });
});

describe("newHire.logout", () => {
  it("clears the new hire session cookie and returns success", async () => {
    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.newHire.logout();
    expect(result.success).toBe(true);
    expect((ctx.res.clearCookie as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
  });
});

describe("forms.getMyForms", () => {
  it("returns empty array when no session cookie is present", async () => {
    const caller = appRouter.createCaller(createCtx(""));
    const result = await caller.forms.getMyForms();
    expect(result).toEqual([]);
  });
});

describe("buildings.list", () => {
  it("returns an array (seeded or empty)", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.buildings.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("admin.listNewHires", () => {
  it("returns an array of new hires", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.admin.listNewHires();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("newHire.loginWithPasscode (device-independent)", () => {
  it("returns no_session when no cookie and no email provided", async () => {
    const caller = appRouter.createCaller(createCtx(""));
    const result = await caller.newHire.loginWithPasscode({ passcode: "1234" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("no_session");
  });

  it("returns no_session when email provided but not found in DB", async () => {
    // The procedure looks up by email via getDb(); mock returns empty array so hire is null
    const caller = appRouter.createCaller(createCtx(""));
    const result = await caller.newHire.loginWithPasscode({
      passcode: "1234",
      email: "unknown@example.com",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("no_session");
  });
});

describe("newHire.checkEmailExists", () => {
  it("returns exists: false for an unknown email", async () => {
    const caller = appRouter.createCaller(createCtx(""));
    const result = await caller.newHire.checkEmailExists({ email: "nobody@example.com" });
    expect(result.exists).toBe(false);
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and returns success", async () => {
    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
