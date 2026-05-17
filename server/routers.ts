import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { newHires } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const NEW_HIRE_COOKIE = "nh_session";

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

  newHire: router({
    /**
     * Register a new hire with their company email + chosen 4-digit passcode.
     * Returns error if email already registered.
     */
    register: publicProcedure
      .input(z.object({
        email: z.string().email().toLowerCase(),
        passcode: z.string().length(4).regex(/^\d{4}$/),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        // Check if email already registered
        const existing = await db.select().from(newHires).where(eq(newHires.email, input.email)).limit(1);
        if (existing.length > 0) {
          return { success: false, error: "email_taken" } as const;
        }

        await db.insert(newHires).values({
          email: input.email,
          passcode: input.passcode,
        });

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(NEW_HIRE_COOKIE, input.email, {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        return { success: true, email: input.email } as const;
      }),

    /**
     * Login with passcode only (for returning new hires who already registered).
     * The email is read from the session cookie set during registration.
     */
    loginWithPasscode: publicProcedure
      .input(z.object({
        passcode: z.string().length(4).regex(/^\d{4}$/),
      }))
      .mutation(async ({ input, ctx }) => {
        // Read stored email from cookie
        const cookieHeader = ctx.req.headers.cookie ?? "";
        const emailFromCookie = cookieHeader
          .split(";")
          .map((c: string) => c.trim().split("="))
          .find(([k]: string[]) => k === NEW_HIRE_COOKIE)?.[1];

        if (!emailFromCookie) {
          return { success: false, error: "no_session" } as const;
        }

        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        const result = await db.select().from(newHires).where(eq(newHires.email, decodeURIComponent(emailFromCookie))).limit(1);
        if (result.length === 0) {
          return { success: false, error: "not_found" } as const;
        }

        const hire = result[0];
        if (hire.passcode !== input.passcode) {
          return { success: false, error: "wrong_passcode" } as const;
        }

        // Update lastLogin
        await db.update(newHires).set({ lastLogin: new Date() }).where(eq(newHires.id, hire.id));

        // Refresh cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(NEW_HIRE_COOKIE, hire.email, {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return { success: true, email: hire.email } as const;
      }),

    /**
     * Check if the current browser has a registered new hire session.
     * Returns email if found, null if not.
     */
    checkSession: publicProcedure.query(async ({ ctx }) => {
      const cookieHeader = ctx.req.headers.cookie ?? "";
      const emailFromCookie = cookieHeader
        .split(";")
        .map((c: string) => c.trim().split("="))
        .find(([k]: string[]) => k === NEW_HIRE_COOKIE)?.[1];

      if (!emailFromCookie) return { registered: false, email: null };

      const db = await getDb();
      if (!db) return { registered: false, email: null };

      const result = await db.select().from(newHires).where(eq(newHires.email, decodeURIComponent(emailFromCookie))).limit(1);
      if (result.length === 0) return { registered: false, email: null };

      return { registered: true, email: result[0].email };
    }),

    /**
     * Log out the new hire (clear the session cookie).
     */
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(NEW_HIRE_COOKIE, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
