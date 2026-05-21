import { describe, expect, it } from "vitest";
import { validateResendApiKey, sendWelcomeEmail } from "./email";

describe("Resend email integration", () => {
  it("validates the Resend API key is working", async () => {
    const valid = await validateResendApiKey();
    expect(valid).toBe(true);
  }, 15000);

  it("sends a welcome email to the test new hire (Robert @ robert@apartmentcorp.com)", async () => {
    const result = await sendWelcomeEmail({
      toEmail: "robert@apartmentcorp.com",
      firstName: "Robert",
      portalUrl: "https://aptonboard-pxsj4nvm.manus.space/onboarding",
    });
    expect(result).toBe(true);
  }, 15000);
});
