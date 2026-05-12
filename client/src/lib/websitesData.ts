// ApartmentCorp — Company Websites & Logins Data
// All platforms, tools, and login instructions for new hires

export interface LoginField {
  label: string;
  value: string;
  sensitive?: boolean; // if true, show a masked/copy field
}

export interface CompanyWebsite {
  id: string;
  name: string;
  url: string;
  icon: string;
  category: string;
  description: string;
  loginInstructions: string;
  fields: LoginField[];
  notes?: string;
  accessLevel?: "All Staff" | "Leasing" | "Maintenance" | "Management" | "Accounting";
}

export interface WebsiteCategory {
  id: string;
  label: string;
  icon: string;
  color: "navy" | "terracotta" | "green" | "purple" | "amber";
}

export const WEBSITE_CATEGORIES: WebsiteCategory[] = [
  { id: "property-mgmt", label: "Property Management", icon: "🏢", color: "navy" },
  { id: "hr-payroll",    label: "HR & Payroll",         icon: "👥", color: "terracotta" },
  { id: "communication", label: "Communication & Collaboration", icon: "💬", color: "green" },
  { id: "maintenance",   label: "Maintenance & Operations",      icon: "🔧", color: "amber" },
  { id: "marketing",     label: "Marketing & Leasing",           icon: "📣", color: "purple" },
  { id: "finance",       label: "Finance & Accounting",          icon: "💰", color: "navy" },
];

export const COMPANY_WEBSITES: CompanyWebsite[] = [
  // ── Property Management ──────────────────────────────────────────────────
  {
    id: "yardi",
    name: "Yardi Voyager",
    url: "https://www.yardi.com",
    icon: "🏠",
    category: "property-mgmt",
    description: "Primary property management platform for leasing, rent collection, maintenance, and resident records.",
    loginInstructions: "Use your company email address. Your temporary password will be emailed to you by IT on Day 1. You will be prompted to change it on first login.",
    fields: [
      { label: "Login URL", value: "https://voyager.yardi.com/apartmentcorp" },
      { label: "Username", value: "Your company email (firstname.lastname@apartmentcorp.com)" },
      { label: "Temp Password", value: "Provided by IT via email on Day 1", sensitive: true },
    ],
    notes: "Complete the Yardi Level 1 training module before your first login. Contact your manager if you need a role-specific permission set.",
    accessLevel: "All Staff",
  },
  {
    id: "resident-portal",
    name: "Resident Portal (AppFolio)",
    url: "https://www.appfolio.com",
    icon: "🚪",
    category: "property-mgmt",
    description: "Resident-facing portal for online rent payments, maintenance requests, and lease documents. Staff access for managing submissions.",
    loginInstructions: "Staff access is granted through your Yardi credentials. Use the Admin login link, not the resident login.",
    fields: [
      { label: "Staff Admin URL", value: "https://apartmentcorp.appfolio.com/admin" },
      { label: "Username", value: "Your company email" },
      { label: "Password", value: "Same as Yardi (SSO enabled)", sensitive: true },
    ],
    accessLevel: "Leasing",
  },

  // ── HR & Payroll ─────────────────────────────────────────────────────────
  {
    id: "paylocity",
    name: "Paylocity (HR & Payroll)",
    url: "https://www.paylocity.com",
    icon: "💵",
    category: "hr-payroll",
    description: "Payroll, time tracking, PTO requests, benefits enrollment, and employee self-service portal.",
    loginInstructions: "HR will send you a Paylocity welcome email within 24 hours of your start date. Use the 'New User' link in that email to set your password.",
    fields: [
      { label: "Login URL", value: "https://access.paylocity.com" },
      { label: "Company ID", value: "APTCORP" },
      { label: "Username", value: "Your company email" },
      { label: "Password", value: "Set via welcome email from HR", sensitive: true },
    ],
    notes: "Use Paylocity to submit PTO requests, view pay stubs, and manage your direct deposit. Time clock punches are also recorded here.",
    accessLevel: "All Staff",
  },
  {
    id: "employee-portal",
    name: "ApartmentCorp Employee Portal",
    url: "https://employees.apartmentcorp.com",
    icon: "🏢",
    category: "hr-payroll",
    description: "Internal intranet for company news, policies, org chart, training resources, and HR forms.",
    loginInstructions: "Log in with your Microsoft 365 credentials (same as your company email and Outlook password).",
    fields: [
      { label: "URL", value: "https://employees.apartmentcorp.com" },
      { label: "Username", value: "Your company email" },
      { label: "Password", value: "Your Microsoft 365 password", sensitive: true },
    ],
    accessLevel: "All Staff",
  },

  // ── Communication & Collaboration ────────────────────────────────────────
  {
    id: "microsoft365",
    name: "Microsoft 365 (Outlook, Teams, SharePoint)",
    url: "https://office.com",
    icon: "📧",
    category: "communication",
    description: "Company email (Outlook), team messaging and video calls (Teams), and file storage (SharePoint/OneDrive).",
    loginInstructions: "IT will provision your Microsoft 365 account on Day 1. Your username is your company email. Your temporary password will be texted to your personal phone.",
    fields: [
      { label: "Login URL", value: "https://office.com" },
      { label: "Username", value: "firstname.lastname@apartmentcorp.com" },
      { label: "Temp Password", value: "Texted to your personal phone by IT on Day 1", sensitive: true },
    ],
    notes: "Enable Multi-Factor Authentication (MFA) immediately after your first login. Download the Microsoft Authenticator app on your phone.",
    accessLevel: "All Staff",
  },
  {
    id: "slack",
    name: "Slack",
    url: "https://slack.com",
    icon: "💬",
    category: "communication",
    description: "Real-time messaging for team communication. Key channels: #general, #maintenance-requests, #leasing-team, #announcements.",
    loginInstructions: "You will receive a Slack invitation to your company email. Click the link to join the ApartmentCorp workspace.",
    fields: [
      { label: "Workspace URL", value: "apartmentcorp.slack.com" },
      { label: "Invitation", value: "Sent to your company email by IT" },
    ],
    notes: "Download the Slack desktop and mobile apps. Set your notification preferences to avoid after-hours alerts unless you are on-call.",
    accessLevel: "All Staff",
  },
  {
    id: "zoom",
    name: "Zoom",
    url: "https://zoom.us",
    icon: "📹",
    category: "communication",
    description: "Video conferencing for team meetings, resident virtual tours, and training sessions.",
    loginInstructions: "Sign in with your company email using the 'Sign in with SSO' option. Company domain is: apartmentcorp",
    fields: [
      { label: "Login URL", value: "https://zoom.us/signin" },
      { label: "SSO Domain", value: "apartmentcorp" },
      { label: "Username", value: "Your company email (via SSO)" },
    ],
    accessLevel: "All Staff",
  },

  // ── Maintenance & Operations ─────────────────────────────────────────────
  {
    id: "maintenance-portal",
    name: "MaintainX (Work Orders)",
    url: "https://www.getmaintainx.com",
    icon: "🔧",
    category: "maintenance",
    description: "Work order management system for submitting, tracking, and closing maintenance requests across all properties.",
    loginInstructions: "Your maintenance supervisor will add you to MaintainX. You will receive an email invitation. Download the mobile app for field use.",
    fields: [
      { label: "Web URL", value: "https://app.getmaintainx.com" },
      { label: "Invitation", value: "Sent by your maintenance supervisor" },
      { label: "Mobile App", value: "MaintainX — available on iOS and Android" },
    ],
    notes: "All work orders must be logged and closed in MaintainX. Do not close a work order without a completion note and photo.",
    accessLevel: "Maintenance",
  },
  {
    id: "vendor-portal",
    name: "Vendor & Contractor Portal",
    url: "https://vendors.apartmentcorp.com",
    icon: "🤝",
    category: "maintenance",
    description: "Internal portal for managing approved vendor lists, submitting purchase orders, and tracking vendor insurance certificates.",
    loginInstructions: "Access is granted to Property Managers and Maintenance Supervisors only. Log in with your company email.",
    fields: [
      { label: "URL", value: "https://vendors.apartmentcorp.com" },
      { label: "Username", value: "Your company email" },
      { label: "Access Level", value: "Property Manager / Maintenance Supervisor only" },
    ],
    accessLevel: "Management",
  },

  // ── Marketing & Leasing ──────────────────────────────────────────────────
  {
    id: "showmojo",
    name: "ShowMojo (Showing Scheduler)",
    url: "https://showmojo.com",
    icon: "🗓️",
    category: "marketing",
    description: "Automated showing scheduler for prospective residents. Syncs with Yardi availability.",
    loginInstructions: "Your leasing manager will create your ShowMojo account. You will receive an invitation email.",
    fields: [
      { label: "URL", value: "https://app.showmojo.com" },
      { label: "Invitation", value: "Sent by your leasing manager" },
    ],
    accessLevel: "Leasing",
  },
  {
    id: "apartments-com",
    name: "Apartments.com (Listing Management)",
    url: "https://www.apartments.com",
    icon: "🏘️",
    category: "marketing",
    description: "Listing management portal for updating unit availability, photos, and pricing on Apartments.com.",
    loginInstructions: "Access is managed by the Marketing team. Submit a request to marketing@apartmentcorp.com to be added as a property user.",
    fields: [
      { label: "URL", value: "https://partner.apartments.com" },
      { label: "Access Request", value: "Email marketing@apartmentcorp.com" },
    ],
    accessLevel: "Leasing",
  },

  // ── Finance & Accounting ─────────────────────────────────────────────────
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    url: "https://quickbooks.intuit.com",
    icon: "📊",
    category: "finance",
    description: "Accounting and financial reporting platform. Used by Accounting team for AP/AR, expense tracking, and financial statements.",
    loginInstructions: "Access is restricted to Accounting staff and Property Managers. Your controller will invite you if your role requires access.",
    fields: [
      { label: "URL", value: "https://app.qbo.intuit.com" },
      { label: "Invitation", value: "Sent by the Controller if your role requires access" },
    ],
    notes: "Do not process any transactions without approval from your supervisor. All expense reports must be submitted through Paylocity first.",
    accessLevel: "Accounting",
  },
  {
    id: "expense-portal",
    name: "Concur (Expense Reports)",
    url: "https://www.concur.com",
    icon: "🧾",
    category: "finance",
    description: "Submit and track expense reimbursements for business-related purchases.",
    loginInstructions: "Log in with your company email via SSO. Your account is auto-provisioned when your Paylocity profile is active.",
    fields: [
      { label: "URL", value: "https://us.concursolutions.com" },
      { label: "Username", value: "Your company email (SSO)" },
    ],
    notes: "Receipts must be submitted within 30 days of the expense. Expenses over $500 require manager pre-approval.",
    accessLevel: "All Staff",
  },
];
