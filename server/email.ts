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
      replyTo: REPLY_TO,
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

// ─── Completion Email ────────────────────────────────────────────────────────
// TESTING MODE: all completion emails go only to Brandon.
// When ready to go live, set TESTING_MODE = false and the full recipient list will be used.
const TESTING_MODE = true;
const BRANDON_EMAIL = "brandon@apartmentcorp.com";

// Full recipient list (used when TESTING_MODE = false)
// Operations
// const MARC_EMAIL = "mam@apartmentcorp.com";
// const NICOLE_EMAIL = "nicole@apartmentcorp.com";
const ETHAN_EMAIL = "ethan@apartmentcorp.com";
// const ROBERT_EMAIL = "robert@apartmentcorp.com";
// Accounting / Payroll
// const HELEN_EMAIL = "helenita@apartmentcorp.com"; // Payroll & AP
// const NONEE_EMAIL = "nonee@apartmentcorp.com";    // Accounting

export interface CompletionEmailData {
  newHireName: string;
  newHireEmail: string;
  position: string;
  buildingName: string;
  regionalManagerName: string;
  regionalManagerEmail: string | null;
  adminDashboardUrl: string;
  approvedForms: { formType: string; label: string }[];
}

export async function sendCompletionEmail(data: CompletionEmailData): Promise<boolean> {
  const {
    newHireName,
    newHireEmail,
    position,
    buildingName,
    regionalManagerName,
    regionalManagerEmail,
    adminDashboardUrl,
    approvedForms,
  } = data;

  // Determine recipients
  const recipients: string[] = TESTING_MODE
    ? [BRANDON_EMAIL]
    : [
        BRANDON_EMAIL,
        // "mam@apartmentcorp.com",    // Marc - CEO
        // "nicole@apartmentcorp.com", // Nicole - Operations Mgr
        // "ethan@apartmentcorp.com",  // Ethan - Operations
        // "robert@apartmentcorp.com", // Robert - SaaS Director
        // "helenita@apartmentcorp.com", // Helen - Payroll & AP
        // "nonee@apartmentcorp.com",  // Nonee - Accounting
        // ...(regionalManagerEmail ? [regionalManagerEmail] : []),
      ];

  const formRows = approvedForms.map(f => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#2d3748;font-size:14px;">&#10003; ${f.label}</td>
    </tr>`).join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Onboarding Complete — ${newHireName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a2744 0%,#2d4a8a 100%);padding:36px 48px;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Onboarding Complete</h1>
              <p style="margin:6px 0 0;color:#a8c4f0;font-size:14px;">ApartmentCorp New Hire Report</p>
            </td>
          </tr>

          <!-- New Hire Summary -->
          <tr>
            <td style="padding:36px 48px 24px;">
              <p style="margin:0 0 20px;color:#1a2744;font-size:18px;font-weight:600;">New Hire Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:28px;">
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#718096;font-size:13px;font-weight:600;width:140px;">NAME</td>
                  <td style="padding:10px 16px;color:#2d3748;font-size:14px;">${newHireName}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#718096;font-size:13px;font-weight:600;border-top:1px solid #e2e8f0;">EMAIL</td>
                  <td style="padding:10px 16px;color:#2d3748;font-size:14px;border-top:1px solid #e2e8f0;">${newHireEmail}</td>
                </tr>
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#718096;font-size:13px;font-weight:600;border-top:1px solid #e2e8f0;">POSITION</td>
                  <td style="padding:10px 16px;color:#2d3748;font-size:14px;border-top:1px solid #e2e8f0;">${position}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#718096;font-size:13px;font-weight:600;border-top:1px solid #e2e8f0;">PROPERTY</td>
                  <td style="padding:10px 16px;color:#2d3748;font-size:14px;border-top:1px solid #e2e8f0;">${buildingName}</td>
                </tr>
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#718096;font-size:13px;font-weight:600;border-top:1px solid #e2e8f0;">REG. MANAGER</td>
                  <td style="padding:10px 16px;color:#2d3748;font-size:14px;border-top:1px solid #e2e8f0;">${regionalManagerName || "Not assigned"}</td>
                </tr>
              </table>

              <!-- Approved Forms -->
              <p style="margin:0 0 12px;color:#1a2744;font-size:16px;font-weight:600;">Approved Documents</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:28px;">
                ${formRows}
              </table>

              <!-- Division Actions -->
              <p style="margin:0 0 12px;color:#1a2744;font-size:16px;font-weight:600;">Action Required by Division</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 16px;background:#fff8f0;border-left:4px solid #ed8936;border-radius:0 8px 8px 0;margin-bottom:8px;">
                    <p style="margin:0;color:#c05621;font-weight:700;font-size:13px;">OPERATIONS (Brandon, Ethan, Robert, Nicole)</p>
                    <p style="margin:4px 0 0;color:#4a5568;font-size:13px;">Review Employment Application &amp; Company Agreements in the Admin Dashboard.</p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:14px 16px;background:#f0fff4;border-left:4px solid #38a169;border-radius:0 8px 8px 0;margin-bottom:8px;">
                    <p style="margin:0;color:#276749;font-weight:700;font-size:13px;">ACCOUNTING / PAYROLL (Helen, Nonee)</p>
                    <p style="margin:4px 0 0;color:#4a5568;font-size:13px;">Review Direct Deposit, W-4, and IT-2104 forms in the Admin Dashboard.</p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:14px 16px;background:#ebf8ff;border-left:4px solid #3182ce;border-radius:0 8px 8px 0;margin-bottom:8px;">
                    <p style="margin:0;color:#2c5282;font-weight:700;font-size:13px;">REGIONAL MANAGER (${regionalManagerName || "Not assigned"})</p>
                    <p style="margin:4px 0 0;color:#4a5568;font-size:13px;">Review I-9 and overall onboarding package for ${buildingName}.</p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:14px 16px;background:#faf5ff;border-left:4px solid #805ad5;border-radius:0 8px 8px 0;">
                    <p style="margin:0;color:#553c9a;font-weight:700;font-size:13px;">EXECUTIVE (Marc)</p>
                    <p style="margin:4px 0 0;color:#4a5568;font-size:13px;">New hire onboarding complete — no immediate action required.</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${adminDashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a2744 0%,#2d4a8a 100%);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:600;">Open Admin Dashboard &rarr;</a>
                  </td>
                </tr>
              </table>

              ${TESTING_MODE ? `<p style="margin:0;padding:10px 16px;background:#fffbeb;border:1px solid #f6e05e;border-radius:6px;color:#744210;font-size:12px;"><strong>Testing Mode:</strong> This email was sent only to brandon@apartmentcorp.com. Set TESTING_MODE = false in server/email.ts to enable full distribution.</p>` : ""}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 48px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">&copy; ${new Date().getFullYear()} ApartmentCorp. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipients,
      replyTo: REPLY_TO,
      subject: `[Onboarding Complete] ${newHireName} — ${buildingName}`,
      html,
    });
    if (result.error) {
      console.error("[Email] Failed to send completion email:", result.error);
      return false;
    }
    console.log("[Email] Completion email sent | ID:", result.data?.id, "| Recipients:", recipients);
    return true;
  } catch (err) {
    console.error("[Email] Exception sending completion email:", err);
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

// ─── First Login Notification ─────────────────────────────────────────────────
// Sent to Ethan (CC Brandon) when a new hire logs in for the first time.
// TESTING_MODE = true: only sends to Brandon.
const TESTING_MODE_FIRST_LOGIN = true;

export async function sendFirstLoginNotification({
  newHireName,
  newHireEmail,
  position,
  buildingName,
  loginTime,
  adminDashboardUrl,
}: {
  newHireName: string;
  newHireEmail: string;
  position: string;
  buildingName: string;
  loginTime: Date;
  adminDashboardUrl: string;
}): Promise<boolean> {
  const formattedTime = loginTime.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "full",
    timeStyle: "short",
  });

  const toEmail = TESTING_MODE_FIRST_LOGIN ? BRANDON_EMAIL : ETHAN_EMAIL;
  const ccEmails = TESTING_MODE_FIRST_LOGIN ? [] : [BRANDON_EMAIL];
  const testingBanner = TESTING_MODE_FIRST_LOGIN
    ? `<div style="background:#fff3cd;border:1px solid #ffc107;padding:10px 16px;border-radius:6px;margin-bottom:20px;font-size:13px;color:#856404;">
        <strong>Testing Mode:</strong> This email would normally go to Ethan Cowles (ethan@apartmentcorp.com) with Brandon CC'd. Currently routing to Brandon only.
      </div>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a3a5c 0%,#2d6a9f 100%);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">ApartmentCorp Onboarding</h1>
            <p style="margin:6px 0 0;color:#a8c8e8;font-size:14px;">New Hire First Login Alert</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            ${testingBanner}
            <p style="margin:0 0 20px;font-size:16px;color:#1a3a5c;font-weight:600;">A new hire has logged into the onboarding portal for the first time.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:24px;">
              <tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
                <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">New Hire</span><br>
                <span style="font-size:16px;color:#1e293b;font-weight:600;">${newHireName}</span>
              </td></tr>
              <tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
                <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Email</span><br>
                <span style="font-size:15px;color:#1e293b;">${newHireEmail}</span>
              </td></tr>
              <tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
                <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Position</span><br>
                <span style="font-size:15px;color:#1e293b;">${position}</span>
              </td></tr>
              <tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
                <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Assigned Building</span><br>
                <span style="font-size:15px;color:#1e293b;">${buildingName}</span>
              </td></tr>
              <tr><td style="padding:16px 20px;">
                <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">First Login Time</span><br>
                <span style="font-size:15px;color:#1e293b;">${formattedTime} (Pacific)</span>
              </td></tr>
            </table>
            <div style="text-align:center;">
              <a href="${adminDashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a3a5c,#2d6a9f);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">View in Admin Dashboard</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">ApartmentCorp Onboarding Portal &bull; 737 N Genesee Ave, Los Angeles, CA 90036</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const payload: Record<string, unknown> = {
      from: `Welcome <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: `New Hire First Login: ${newHireName}`,
      html,
      reply_to: REPLY_TO,
    };
    if (ccEmails.length > 0) payload.cc = ccEmails;

    const { data, error } = await resend.emails.send(payload as Parameters<typeof resend.emails.send>[0]);
    if (error) {
      console.error("[FirstLoginEmail] Resend error:", error);
      return false;
    }
    console.log("[FirstLoginEmail] Sent to", toEmail, "id:", data?.id, "for hire:", newHireEmail);
    return true;
  } catch (e) {
    console.error("[FirstLoginEmail] Exception:", e);
    return false;
  }
}

// ─── IT Provisioning Ready Notification ──────────────────────────────────────
// Sent to Ethan when a new hire completes all required chapters (application approved).
// TESTING_MODE = true: only sends to Brandon.
const TESTING_MODE_PROVISIONING = true;

export async function sendProvisioningReadyEmail({
  newHireName,
  newHireEmail,
  position,
  buildingName,
  adminDashboardUrl,
}: {
  newHireName: string;
  newHireEmail: string;
  position: string;
  buildingName: string;
  adminDashboardUrl: string;
}): Promise<boolean> {
  const toEmail = TESTING_MODE_PROVISIONING ? BRANDON_EMAIL : ETHAN_EMAIL;
  const ccEmails = TESTING_MODE_PROVISIONING ? [] : [BRANDON_EMAIL];
  const testingBanner = TESTING_MODE_PROVISIONING
    ? `<div style="background:#fff3cd;border:1px solid #ffc107;padding:10px 16px;border-radius:6px;margin-bottom:20px;font-size:13px;color:#856404;">
        <strong>Testing Mode:</strong> This email would normally go to Ethan Cowles (ethan@apartmentcorp.com) with Brandon CC'd. Currently routing to Brandon only.
      </div>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a3a5c 0%,#2d6a9f 100%);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">ApartmentCorp Onboarding</h1>
            <p style="margin:6px 0 0;color:#a8c8e8;font-size:14px;">IT Credential Provisioning — Action Required</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            ${testingBanner}
            <p style="margin:0 0 20px;font-size:16px;color:#1a3a5c;font-weight:600;">A new hire has completed their onboarding application and is ready for IT credential provisioning.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:24px;">
              <tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
                <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">New Hire</span><br>
                <span style="font-size:16px;color:#1e293b;font-weight:600;">${newHireName}</span>
              </td></tr>
              <tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
                <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Email</span><br>
                <span style="font-size:15px;color:#1e293b;">${newHireEmail}</span>
              </td></tr>
              <tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
                <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Position</span><br>
                <span style="font-size:15px;color:#1e293b;">${position}</span>
              </td></tr>
              <tr><td style="padding:16px 20px;">
                <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Assigned Building</span><br>
                <span style="font-size:15px;color:#1e293b;">${buildingName}</span>
              </td></tr>
            </table>
            <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6;">
              Please log in to the Admin Dashboard, navigate to the <strong>Technology Onboarding</strong> tab, and complete the IT Credential Provisioning form for this employee. Once saved, their credentials will automatically appear in their onboarding portal.
            </p>
            <div style="text-align:center;">
              <a href="${adminDashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a3a5c,#2d6a9f);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">Open Admin Dashboard</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">ApartmentCorp Onboarding Portal &bull; 737 N Genesee Ave, Los Angeles, CA 90036</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const payload: Record<string, unknown> = {
      from: `Welcome <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: `IT Provisioning Ready: ${newHireName}`,
      html,
      reply_to: REPLY_TO,
    };
    if (ccEmails.length > 0) payload.cc = ccEmails;

    const { data, error } = await resend.emails.send(payload as Parameters<typeof resend.emails.send>[0]);
    if (error) {
      console.error("[ProvisioningEmail] Resend error:", error);
      return false;
    }
    console.log("[ProvisioningEmail] Sent to", toEmail, "id:", data?.id, "for hire:", newHireEmail);
    return true;
  } catch (e) {
    console.error("[ProvisioningEmail] Exception:", e);
    return false;
  }
}

// ─── Stale Onboarding Alert ───────────────────────────────────────────────────
// Sent to Brandon when any new hire has been in-progress > 3 hours without completing.
export async function sendStaleOnboardingAlert(hires: Array<{
  name: string;
  email: string;
  position: string;
  buildingName: string;
  hoursElapsed: number;
  formsSubmitted: number;
  formsApproved: number;
}>): Promise<boolean> {
  if (hires.length === 0) return true;

  const rows = hires.map(h => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1e293b;">${h.name}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#475569;">${h.email}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#475569;">${h.position || "—"}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#475569;">${h.buildingName}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#dc2626;font-weight:600;">${h.hoursElapsed.toFixed(1)}h</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#475569;">${h.formsApproved}/${h.formsSubmitted}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#7f1d1d 0%,#dc2626 100%);padding:28px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">&#9888;&#65039; Onboarding Delay Alert</h1>
            <p style="margin:6px 0 0;color:#fca5a5;font-size:13px;">ApartmentCorp New Hire Onboarding Portal</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 8px;font-size:15px;color:#1a3a5c;font-weight:600;">Hi Brandon,</p>
            <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6;">
              The following ${hires.length === 1 ? "new hire has" : `${hires.length} new hires have`} been in the onboarding process for <strong>more than 3 hours</strong> without completing. Please review their status in the admin dashboard.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
              <thead>
                <tr style="background:#f8fafc;">
                  <th style="padding:10px 16px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Name</th>
                  <th style="padding:10px 16px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Email</th>
                  <th style="padding:10px 16px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Position</th>
                  <th style="padding:10px 16px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Building</th>
                  <th style="padding:10px 16px;text-align:left;font-size:11px;color:#dc2626;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Elapsed</th>
                  <th style="padding:10px 16px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Forms</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <div style="margin-top:28px;text-align:center;">
              <a href="https://aptonboard-pxsj4nvm.manus.space/admin" style="display:inline-block;background:#1a3a5c;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Open Admin Dashboard</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">ApartmentCorp Onboarding Portal &middot; Automated Alert</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const result = await resend.emails.send({
      from: `ApartmentCorp Onboarding <${FROM_EMAIL}>`,
      to: [BRANDON_EMAIL],
      subject: `\u26a0\ufe0f ${hires.length} New Hire${hires.length > 1 ? "s" : ""} Delayed \u2014 Onboarding > 3 Hours`,
      html,
    });
    if (result.error) {
      console.error("[StaleAlert] Resend error:", result.error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[StaleAlert] Exception:", e);
    return false;
  }
}

// ─── "Let's Get to Work" — Credential Delivery Email ─────────────────────────
// Sent to the new hire when Ethan completes IT credential provisioning.
// Includes a download link for the browser bookmarks HTML file.
const TESTING_MODE_CREDENTIALS = true;

export interface CredentialDeliveryEmailData {
  newHireName: string;
  newHireEmail: string;
  portalUrl: string;
  bookmarksUrl: string | null;
  credentials: Array<{
    platform: string;
    username: string | null;
    password: string | null;
    notes: string | null;
  }>;
}

export async function sendCredentialDeliveryEmail(data: CredentialDeliveryEmailData): Promise<boolean> {
  const { newHireName, newHireEmail, portalUrl, bookmarksUrl, credentials } = data;
  const toEmail = TESTING_MODE_CREDENTIALS ? BRANDON_EMAIL : newHireEmail;
  const testingBanner = TESTING_MODE_CREDENTIALS
    ? `<div style="background:#fff3cd;border:1px solid #ffc107;padding:10px 16px;border-radius:6px;margin-bottom:20px;font-size:13px;color:#856404;">
        <strong>Testing Mode:</strong> This email would normally go to the new hire (${newHireEmail}). Currently routing to Brandon only.
      </div>`
    : "";

  const credRows = credentials
    .filter(c => c.username || c.password)
    .map(c => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#1e293b;">${c.platform}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#475569;">${c.username ?? "—"}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#475569;font-family:monospace;">${c.password ?? "—"}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;font-style:italic;">${c.notes ?? ""}</td>
      </tr>`)
    .join("");

  const bookmarkSection = bookmarksUrl
    ? `<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:20px 24px;margin:24px 0;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0369a1;">🔖 Browser Bookmarks — Quick Setup</p>
        <p style="margin:0 0 16px;font-size:13px;color:#0c4a6e;line-height:1.6;">
          Download the ApartmentCorp bookmarks file and import it into Chrome or Edge to instantly have all company websites organized in your browser toolbar.
        </p>
        <ol style="margin:0 0 16px;padding-left:20px;font-size:13px;color:#0c4a6e;line-height:1.8;">
          <li>Click the download link below to save the bookmarks file</li>
          <li>In Chrome: open <strong>chrome://bookmarks</strong> → click the three-dot menu → <strong>Import bookmarks</strong></li>
          <li>In Edge: open <strong>edge://favorites</strong> → click the three-dot menu → <strong>Import favorites</strong></li>
          <li>Select the downloaded file — all ApartmentCorp links will appear instantly</li>
        </ol>
        <div style="text-align:center;">
          <a href="${bookmarksUrl}" style="display:inline-block;background:#0369a1;color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;font-weight:600;">
            ⬇ Download Bookmarks File
          </a>
        </div>
      </div>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a3a5c 0%,#2d6a9f 100%);padding:36px 40px;text-align:center;">
            <h1 style="margin:0 0 6px;color:#ffffff;font-size:26px;font-weight:700;">Let's Get to Work! 🚀</h1>
            <p style="margin:0;color:#a8c8e8;font-size:15px;">Your ApartmentCorp system access is ready</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            ${testingBanner}
            <p style="margin:0 0 8px;font-size:16px;color:#1a3a5c;font-weight:600;">Hi ${newHireName},</p>
            <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.7;">
              Your IT credentials have been set up and you're all ready to go. Below are your login details for each platform you'll be using. Keep this email in a safe place — these are your personal credentials.
            </p>

            <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1a3a5c;text-transform:uppercase;letter-spacing:0.5px;">Your Platform Credentials</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:8px;">
              <thead>
                <tr style="background:#f8fafc;">
                  <th style="padding:10px 16px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Platform</th>
                  <th style="padding:10px 16px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Username / Email</th>
                  <th style="padding:10px 16px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Password</th>
                  <th style="padding:10px 16px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Notes</th>
                </tr>
              </thead>
              <tbody>${credRows || '<tr><td colspan="4" style="padding:16px;text-align:center;color:#94a3b8;font-size:13px;">Credentials will be provided by your manager.</td></tr>'}</tbody>
            </table>
            <p style="margin:0 0 24px;font-size:12px;color:#94a3b8;font-style:italic;">
              ⚠ Keep these credentials confidential. Do not share them with anyone.
            </p>

            ${bookmarkSection}

            <div style="background:#f8fafc;border-radius:8px;padding:20px 24px;margin:24px 0;">
              <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#1a3a5c;">🖥 Access Your Onboarding Portal</p>
              <p style="margin:0 0 16px;font-size:13px;color:#475569;line-height:1.6;">
                Your onboarding portal has your full credentials list, training materials, and company resources — all in one place.
              </p>
              <div style="text-align:center;">
                <a href="${portalUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a3a5c,#2d6a9f);color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">
                  Open Onboarding Portal
                </a>
              </div>
            </div>

            <p style="margin:24px 0 0;font-size:14px;color:#475569;line-height:1.7;">
              Welcome to the team — we're excited to have you! If you have any questions about your access or need help getting set up, reach out to your manager or email <a href="mailto:brandon@apartmentcorp.com" style="color:#2d6a9f;">brandon@apartmentcorp.com</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">ApartmentCorp Onboarding Portal &bull; 737 N Genesee Ave, Los Angeles, CA 90036</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: `ApartmentCorp IT <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: `Let's Get to Work! Your ApartmentCorp credentials are ready 🚀`,
      html,
      reply_to: REPLY_TO,
    } as Parameters<typeof resend.emails.send>[0]);
    if (error) {
      console.error("[CredentialEmail] Resend error:", error);
      return false;
    }
    console.log("[CredentialEmail] Sent to", toEmail, "id:", data?.id, "for hire:", newHireEmail);
    return true;
  } catch (e) {
    console.error("[CredentialEmail] Exception:", e);
    return false;
  }
}
