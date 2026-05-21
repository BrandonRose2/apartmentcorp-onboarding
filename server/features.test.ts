/**
 * Feature tests: positions list, credentials, training checklist, form submission
 */
import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      headers: { cookie: "" },
      protocol: "https",
      get: (h: string) => (h === "host" ? "localhost:3000" : null),
    } as unknown as TrpcContext["req"],
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ─── Positions ────────────────────────────────────────────────────────────────
describe("positions.list", () => {
  it("returns a non-empty list of position titles", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const positions = await caller.positions.list();
    expect(Array.isArray(positions)).toBe(true);
    expect(positions.length).toBeGreaterThan(0);
    expect(positions).toContain("Property Manager");
    expect(positions).toContain("Maintenance Technician");
    expect(positions).toContain("Leasing Agent / Leasing Consultant");
  });

  it("includes Other as the last option", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const positions = await caller.positions.list();
    expect(positions[positions.length - 1]).toBe("Other");
  });
});

// ─── Credentials ─────────────────────────────────────────────────────────────
describe("admin.getCredentials", () => {
  it("returns empty array for non-existent new hire", async () => {
    const caller = appRouter.createCaller({
      ...createPublicContext(),
      user: {
        id: 1,
        openId: "admin-user",
        email: "admin@test.com",
        name: "Admin",
        loginMethod: "manus",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    });
    const result = await caller.admin.getCredentials({ newHireId: 99999 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});

// ─── Training Checklist ───────────────────────────────────────────────────────
describe("training.getMyProgress", () => {
  it("returns empty array when no session cookie is present", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.training.getMyProgress();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});

describe("training.getProgressForNewHire (admin)", () => {
  it("returns empty array for non-existent new hire", async () => {
    const caller = appRouter.createCaller({
      ...createPublicContext(),
      user: {
        id: 1,
        openId: "admin-user",
        email: "admin@test.com",
        name: "Admin",
        loginMethod: "manus",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    });
    const result = await caller.training.getProgressForNewHire({ newHireId: 99999 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});

// ─── Form Submission Auth Fallback ────────────────────────────────────────────────────────────────────────────────
describe("forms.saveDraft", () => {
  it("throws Not authenticated when email does not exist in DB", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.forms.saveDraft({
        formType: "employment_application",
        formData: { test: "value" },
        email: "nonexistent@test.com",
      })
    ).rejects.toThrow("Not authenticated");
  });
});