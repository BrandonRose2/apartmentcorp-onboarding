import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const CC_EMAIL = "brandon@apartmentcorp.com";
const FROM_EMAIL = "Welcome@onboarding.apartmentcorp.com";
const REPLY_TO = "Brandon@ApartmentCorp.com";

export interface WelcomeEmailData {
  toEmail: string;
  firstName: string;
  portalUrl: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  const { toEmail, firstName, portalUrl } = data;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ApartmentCorp</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a2744 0%,#2d4a8a 100%);padding:40px 48px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                Welcome to ApartmentCorp
              </h1>
              <p style="margin:8px 0 0;color:#a8c4f0;font-size:15px;">New Employee Onboarding Portal</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 48px 32px;">
              <p style="margin:0 0 20px;color:#1a2744;font-size:22px;font-weight:600;">
                Hi ${firstName}, welcome aboard! 🎉
              </p>
              <p style="margin:0 0 16px;color:#4a5568;font-size:15px;line-height:1.7;">
                We're thrilled to have you join the ApartmentCorp team. Your onboarding account has been successfully created and you're all set to begin the onboarding process.
              </p>
              <p style="margin:0 0 28px;color:#4a5568;font-size:15px;line-height:1.7;">
                Please log in to your onboarding portal to complete the following steps:
              </p>

              <!-- Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:12px 16px;background:#f0f4ff;border-left:4px solid #2d4a8a;border-radius:0 8px 8px 0;margin-bottom:8px;">
                    <span style="color:#2d4a8a;font-weight:700;font-size:14px;">Step 1</span>
                    <span style="color:#4a5568;font-size:14px;margin-left:8px;">Complete your Employment Application</span>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background:#f0f4ff;border-left:4px solid #2d4a8a;border-radius:0 8px 8px 0;">
                    <span style="color:#2d4a8a;font-weight:700;font-size:14px;">Step 2</span>
                    <span style="color:#4a5568;font-size:14px;margin-left:8px;">Review and sign company agreements</span>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background:#f0f4ff;border-left:4px solid #2d4a8a;border-radius:0 8px 8px 0;">
                    <span style="color:#2d4a8a;font-weight:700;font-size:14px;">Step 3</span>
                    <span style="color:#4a5568;font-size:14px;margin-left:8px;">Submit your payroll and tax forms (W-4, Direct Deposit)</span>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background:#f0f4ff;border-left:4px solid #2d4a8a;border-radius:0 8px 8px 0;">
                    <span style="color:#2d4a8a;font-weight:700;font-size:14px;">Step 4</span>
                    <span style="color:#4a5568;font-size:14px;margin-left:8px;">Complete your I-9 Employment Eligibility Verification</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a2744 0%,#2d4a8a 100%);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:8px;font-size:16px;font-weight:600;letter-spacing:0.3px;">
                      Access Your Onboarding Portal →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#4a5568;font-size:14px;line-height:1.7;">
                If you have any questions or need assistance, please reach out to HR at
                <a href="mailto:brandon@apartmentcorp.com" style="color:#2d4a8a;text-decoration:none;font-weight:600;">brandon@apartmentcorp.com</a>.
              </p>
              <p style="margin:0;color:#4a5568;font-size:14px;line-height:1.7;">
                We look forward to working with you!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 48px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
                © ${new Date().getFullYear()} ApartmentCorp. All rights reserved.<br />
                This email was sent to ${toEmail} because you registered for the ApartmentCorp Onboarding Portal.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      cc: toEmail !== CC_EMAIL ? [CC_EMAIL] : [],
      reply_to: REPLY_TO,
      subject: `Welcome to ApartmentCorp, ${firstName}! Your Onboarding Portal is Ready`,
      html,
    });

    if (result.error) {
      console.error("[Email] Failed to send welcome email:", result.error);
      return false;
    }

    console.log("[Email] Welcome email sent to:", toEmail, "| ID:", result.data?.id);
    return true;
  } catch (err) {
    console.error("[Email] Exception sending welcome email:", err);
    return false;
  }
}

export async function validateResendApiKey(): Promise<boolean> {
  try {
    const domains = await resend.domains.list();
    return !domains.error;
  } catch {
    return false;
  }
}
