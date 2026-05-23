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
  { id: "it-equipment",  label: "IT & Equipment",                icon: "💻", color: "green" },
];

export const COMPANY_WEBSITES: CompanyWebsite[] = [
  // ── Property Management ──────────────────────────────────────────────────
  {
    id: "propertymax",
    name: "PropertyMAX.ai",
    url: "https://propertymax.ai/app/",
    icon: "🤖",
    category: "property-mgmt",
    description: "ApartmentCorp's AI-powered property management platform. Your primary tool for leasing, operations, and resident management.",
    loginInstructions: "Navigate to the PropertyMAX.ai app and sign in with your ApartmentCorp credentials. Your account will be provisioned by IT on Day 1.",
    fields: [
      { label: "App URL", value: "https://propertymax.ai/app/" },
      { label: "Username", value: "Your company email (firstname.lastname@apartmentcorp.com)" },
      { label: "Password", value: "Provided by IT on Day 1", sensitive: true },
    ],
    notes: "PropertyMAX.ai is ApartmentCorp's own platform — built in-house to streamline property operations with AI. Complete the onboarding walkthrough on first login.",
    accessLevel: "All Staff",
  },
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

  // ── HR & Payroll ─────────────────────────────────────────────────────────
  {
    id: "paychex",
    name: "Paychex (HR & Payroll)",
    url: "https://www.paychex.com",
    icon: "💵",
    category: "hr-payroll",
    description: "Payroll, time tracking, PTO requests, benefits enrollment, and employee self-service portal.",
    loginInstructions: "HR will send you a Paychex welcome email within 24 hours of your start date. Use the 'New User' link in that email to set your password.",
    fields: [
      { label: "Login URL", value: "https://myapps.paychex.com" },
      { label: "Company ID", value: "APTCORP" },
      { label: "Username", value: "Your company email" },
      { label: "Password", value: "Set via welcome email from HR", sensitive: true },
    ],
    notes: "Use Paychex to submit PTO requests, view pay stubs, and manage your direct deposit. Time clock punches are also recorded here.",
    accessLevel: "All Staff",
  },
  {
    id: "employee-portal",
    name: "ApartmentCorp Employee Portal",
    url: "https://aptonboard-pxsj4nvm.manus.space/onboarding",
    icon: "🏢",
    category: "hr-payroll",
    description: "New hire onboarding portal — complete your forms, training, and access company resources.",
    loginInstructions: "Use your company email and the 4-digit PIN provided during registration to log in.",
    fields: [
      { label: "URL", value: "https://aptonboard-pxsj4nvm.manus.space/onboarding" },
      { label: "Username", value: "Your company email" },
      { label: "PIN", value: "4-digit PIN provided during registration", sensitive: true },
    ],
    accessLevel: "All Staff",
  },

  // ── Communication & Collaboration ────────────────────────────────────────
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
  {
    id: "connectuc",
    name: "ConnectUC",
    url: "https://www.connectuc.com",
    icon: "📞",
    category: "communication",
    description: "Unified communications platform for internal calling, messaging, and team collaboration across all ApartmentCorp properties.",
    loginInstructions: "Your ConnectUC account will be provisioned by IT on Day 1. Sign in with your company email and the temporary password provided.",
    fields: [
      { label: "Login URL", value: "https://app.connectuc.com" },
      { label: "Username", value: "Your company email" },
      { label: "Password", value: "Provided by IT on Day 1", sensitive: true },
    ],
    notes: "ConnectUC is used for all internal phone calls and team messaging. Download the mobile app to stay connected in the field.",
    accessLevel: "All Staff",
  },
  {
    id: "samepage",
    name: "SamePage",
    url: "https://www.samepage.io",
    icon: "📄",
    category: "communication",
    description: "Team collaboration and project management platform for sharing files, tasks, and updates across departments.",
    loginInstructions: "You will receive a SamePage invitation email from your manager. Accept the invite and set your password to join your team workspace.",
    fields: [
      { label: "Login URL", value: "https://samepage.io/login" },
      { label: "Invitation", value: "Sent by your manager via email" },
    ],
    notes: "SamePage is used for project tracking, document sharing, and cross-team coordination. Check your workspace daily for updates.",
    accessLevel: "All Staff",
  },

  // ── Maintenance & Operations ─────────────────────────────────────────────
  {
    id: "myloneworkers",
    name: "MyLoneWorkers.com",
    url: "https://www.myloneworkers.com",
    icon: "🦺",
    category: "maintenance",
    description: "Property inspections management platform for creating, scheduling, and completing inspection reports across all ApartmentCorp properties.",
    loginInstructions: "Your maintenance supervisor will create your MyLoneWorkers account. You will receive an invitation email. Use this platform to manage all property inspection reports.",
    fields: [
      { label: "Web URL", value: "https://app.myloneworkers.com" },
      { label: "Invitation", value: "Sent by your maintenance supervisor" },
      { label: "Mobile App", value: "MyLoneWorkers — available on iOS and Android" },
    ],
    notes: "Use MyLoneWorkers to create, schedule, and complete property inspection reports. All inspection records are stored here for compliance and maintenance tracking.",
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

  // ── IT & Equipment ────────────────────────────────────────────────────────
  {
    id: "vmware",
    name: "VMware Horizon (Virtual Desktop)",
    url: "https://vmware.com",
    icon: "💻",
    category: "it-equipment",
    description: "Virtual desktop infrastructure used on property computers. Allows secure access to all company applications from shared workstations.",
    loginInstructions: "VMware Horizon Client is pre-installed on your property workstation. Launch it and connect to the server below using your assigned credentials. Your username and password will be provided by IT on Day 1.",
    fields: [
      { label: "Connection Server", value: "horizon.apartmentcorp.com" },
      { label: "Username", value: "Provided by IT on Day 1" },
      { label: "Password", value: "Provided by IT on Day 1", sensitive: true },
      { label: "Workstation Serial #", value: "Located on a sticker on the back or bottom of your workstation" },
    ],
    notes: "Each property workstation has a unique serial number — record it and report it to IT if you experience any issues. All company applications run inside the VMware virtual desktop; do not install software on the host machine.",
    accessLevel: "All Staff",
  },

  // ── Finance & Accounting ─────────────────────────────────────────────────
  {
    id: "finance-portal",
    name: "ApartmentCorp Finance Portal",
    url: "https://finance.apartmentcorp.com",
    icon: "📊",
    category: "finance",
    description: "Internal finance and accounting portal for AP/AR, expense tracking, and financial reporting. Used by Accounting team and Property Managers.",
    loginInstructions: "Access is restricted to Accounting staff and Property Managers. Your controller will provision your account if your role requires access.",
    fields: [
      { label: "URL", value: "https://finance.apartmentcorp.com" },
      { label: "Username", value: "Your company email" },
      { label: "Access Request", value: "Contact your controller or IT if access is required" },
    ],
    notes: "Do not process any transactions without approval from your supervisor. All expense reports must be submitted through Paychex first.",
    accessLevel: "Accounting",
  },
];
