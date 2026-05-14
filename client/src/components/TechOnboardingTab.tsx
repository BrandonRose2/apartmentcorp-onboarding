/**
 * TechOnboardingTab — Ethan Fowler's Technology Onboarding fillable form
 * Design: ApartmentCorp dark navy brand, teal accents
 * Purpose: Ethan fills in all credentials/logins for a new hire; data saves to localStorage
 *          and will eventually auto-populate the Company Websites & Logins tab per employee.
 */

import { useState, useEffect } from "react";
import {
  Monitor, User, Mail, Smartphone, Laptop, CreditCard,
  Building2, ChevronDown, ChevronUp, Save, CheckCircle2,
  Copy, Eye, EyeOff, Printer, Cpu, Wrench, Users, ClipboardList,
  Phone, BarChart3, DollarSign, RefreshCw, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CredentialField {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "email" | "password" | "tel" | "select";
  options?: string[];
  required?: boolean;
  hint?: string;
}

interface TechSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  fields: CredentialField[];
}

interface EmployeeRecord {
  id: string;
  name: string;
  role: string;
  startDate: string;
  department: string;
  createdAt: number;
  completedAt?: number;
  credentials: Record<string, string>;
}

// ─── Section Definitions ──────────────────────────────────────────────────────

const TECH_SECTIONS: TechSection[] = [
  // ── 1. Employee Info ────────────────────────────────────────────────────────
  {
    id: "employee_info",
    title: "New Employee Information",
    subtitle: "Basic details about the new hire",
    icon: <User className="w-5 h-5" />,
    color: "oklch(0.55 0.14 220)",
    fields: [
      { key: "full_name", label: "Full Name", placeholder: "Jane Smith", type: "text", required: true },
      { key: "role_title", label: "Job Title / Role", placeholder: "Leasing Agent", type: "text", required: true },
      { key: "department", label: "Department", placeholder: "Leasing", type: "select", options: ["Leasing", "Maintenance", "Property Management", "Accounting", "Marketing", "Executive", "Administrative"], required: true },
      { key: "start_date", label: "Start Date", placeholder: "MM/DD/YYYY", type: "text", required: true },
      { key: "office_location", label: "Office / Property Location", placeholder: "Main Office — Dallas, TX", type: "text" },
      { key: "direct_supervisor", label: "Direct Supervisor", placeholder: "Manager Name", type: "text" },
    ],
  },
  // ── 2. Company Email & M365 ─────────────────────────────────────────────────
  {
    id: "company_email",
    title: "Company Email & Microsoft 365",
    subtitle: "Email account and Microsoft suite access",
    icon: <Mail className="w-5 h-5" />,
    color: "oklch(0.60 0.18 250)",
    fields: [
      { key: "company_email", label: "Company Email Address", placeholder: "jsmith@apartmentcorp.com", type: "email", required: true },
      { key: "m365_temp_password", label: "Microsoft 365 Temp Password", placeholder: "TempPass2024!", type: "password", required: true, hint: "Employee must change on first login" },
      { key: "m365_license", label: "M365 License Assigned", placeholder: "Business Standard", type: "select", options: ["Business Basic", "Business Standard", "Business Premium", "Apps for Business"] },
      { key: "sharepoint_access", label: "SharePoint Access Level", placeholder: "Member", type: "select", options: ["View Only", "Member", "Owner", "No Access"] },
      { key: "onedrive_storage", label: "OneDrive Storage Quota", placeholder: "1 TB (default)", type: "text" },
    ],
  },
  // ── 3. PropertyMAX.ai ───────────────────────────────────────────────────────
  {
    id: "propertymax",
    title: "PropertyMAX.ai — Hub",
    subtitle: "Main AI-powered property management platform (propertymax.ai/app/)",
    icon: <Building2 className="w-5 h-5" />,
    color: "oklch(0.62 0.16 165)",
    fields: [
      { key: "pmax_username", label: "PropertyMAX Username / Email", placeholder: "jsmith@apartmentcorp.com", type: "email", required: true },
      { key: "pmax_temp_password", label: "Temp Password", placeholder: "TempPass2024!", type: "password", required: true, hint: "Employee will be prompted to change on first login" },
      { key: "pmax_role", label: "User Role", placeholder: "Leasing Agent", type: "select", options: ["Leasing Agent", "Maintenance Tech", "Property Manager", "Regional Manager", "Admin", "Read Only"] },
      { key: "pmax_properties", label: "Properties / Buildings Assigned", placeholder: "Parkview Apts, Oakwood Commons", type: "text", hint: "Comma-separated list of property names" },
      { key: "pmax_building_override", label: "Default Building View", placeholder: "All Buildings", type: "text", hint: "Leave blank for All Buildings access" },
      { key: "pmax_login_url", label: "Login URL", placeholder: "https://propertymax.ai/app/", type: "text" },
    ],
  },
  // ── 4. AppWork ──────────────────────────────────────────────────────────────
  {
    id: "appwork",
    title: "AppWork",
    subtitle: "Maintenance work order & make-ready management (admin.appworkco.com)",
    icon: <Wrench className="w-5 h-5" />,
    color: "oklch(0.60 0.16 55)",
    fields: [
      { key: "appwork_email", label: "AppWork Login Email", placeholder: "jsmith@apartmentcorp.com", type: "email", required: true },
      { key: "appwork_temp_password", label: "Temp Password", placeholder: "TempPass2024!", type: "password", required: true },
      { key: "appwork_role", label: "User Role", placeholder: "Technician", type: "select", options: ["Technician", "Lead Technician", "Property Manager", "Admin", "Read Only"], required: true, hint: "Technician role for maintenance staff; Admin for managers" },
      { key: "appwork_properties", label: "Properties Assigned", placeholder: "Parkview Apts, Oakwood Commons", type: "text", hint: "Users can only see work orders for assigned properties" },
      { key: "appwork_mobile_app", label: "Mobile App Invited?", placeholder: "Yes — invite sent to email", type: "select", options: ["Yes — invite sent to email", "No — desktop only", "Pending"], hint: "Technicians use the AppWork Technician mobile app" },
      { key: "appwork_login_url", label: "Admin Portal URL", placeholder: "https://admin.appworkco.com/", type: "text" },
    ],
  },
  // ── 5. Connecteam ───────────────────────────────────────────────────────────
  {
    id: "connecteam",
    title: "Connecteam",
    subtitle: "Employee scheduling, time tracking & team communication (app.connecteam.com)",
    icon: <Users className="w-5 h-5" />,
    color: "oklch(0.62 0.18 280)",
    fields: [
      { key: "connecteam_invite_email", label: "Invite Email Sent To", placeholder: "jsmith@apartmentcorp.com", type: "email", required: true, hint: "Connecteam sends an invite link to this email" },
      { key: "connecteam_role", label: "User Role", placeholder: "Employee", type: "select", options: ["Employee", "Manager", "Admin", "Owner"], required: true },
      { key: "connecteam_job_title", label: "Job Title in Connecteam", placeholder: "Leasing Agent", type: "text" },
      { key: "connecteam_smart_groups", label: "Smart Groups / Teams Added To", placeholder: "Leasing Team, All Staff", type: "text", hint: "Comma-separated group names" },
      { key: "connecteam_time_clock", label: "Time Clock Enabled?", placeholder: "Yes", type: "select", options: ["Yes", "No"] },
      { key: "connecteam_scheduling", label: "Scheduling Access?", placeholder: "View Only", type: "select", options: ["View Own Schedule", "View & Edit Team", "No Access"] },
      { key: "connecteam_login_url", label: "Login URL", placeholder: "https://app.connecteam.com/", type: "text" },
    ],
  },
  // ── 6. Inspections ──────────────────────────────────────────────────────────
  {
    id: "inspections",
    title: "Inspections",
    subtitle: "Property inspection & unit condition reporting platform",
    icon: <ClipboardList className="w-5 h-5" />,
    color: "oklch(0.60 0.15 160)",
    fields: [
      { key: "inspect_email", label: "Login Email", placeholder: "jsmith@apartmentcorp.com", type: "email", required: true },
      { key: "inspect_temp_password", label: "Temp Password", placeholder: "TempPass2024!", type: "password" },
      { key: "inspect_role", label: "User Role", placeholder: "Inspector", type: "select", options: ["Inspector", "Property Manager", "Regional Manager", "Admin", "Read Only"], required: true, hint: "Property Manager role can complete inspections for assigned properties" },
      { key: "inspect_properties", label: "Properties Assigned", placeholder: "Parkview Apts, Oakwood Commons", type: "text", hint: "Users can only inspect their assigned properties" },
      { key: "inspect_templates", label: "Inspection Templates Assigned", placeholder: "Move-In, Move-Out, Annual", type: "text", hint: "Comma-separated template names" },
      { key: "inspect_mobile_app", label: "Mobile App Access?", placeholder: "Yes", type: "select", options: ["Yes — invite sent", "No — web only", "Pending"] },
      { key: "inspect_login_url", label: "Login URL", placeholder: "https://app.propertyinspect.com/", type: "text" },
    ],
  },
  // ── 7. OneSite (RealPage) ───────────────────────────────────────────────────
  {
    id: "onesite",
    title: "OneSite (RealPage)",
    subtitle: "RealPage OneSite leasing, rents & resident management platform",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "oklch(0.58 0.16 240)",
    fields: [
      { key: "onesite_username", label: "OneSite Username", placeholder: "jsmith", type: "text", required: true },
      { key: "onesite_temp_password", label: "Temp Password", placeholder: "TempPass2024!", type: "password", required: true, hint: "User must change password on first login" },
      { key: "onesite_role", label: "User Role / Security Profile", placeholder: "Leasing Agent", type: "select", options: ["Leasing Agent", "Leasing Manager", "Property Manager", "Regional Manager", "Accounting", "Superuser", "Read Only"], required: true, hint: "Superuser role required to grant New OneSite Experience access" },
      { key: "onesite_properties", label: "Properties / Sites Assigned", placeholder: "Parkview Apts, Oakwood Commons", type: "text", hint: "Users only see data for assigned properties" },
      { key: "onesite_modules", label: "Modules Enabled", placeholder: "Leasing & Rents, Facilities", type: "text", hint: "e.g. Leasing & Rents, Facilities, Accounting, Screening" },
      { key: "onesite_new_experience", label: "New OneSite Experience Enabled?", placeholder: "Yes", type: "select", options: ["Yes — custom role created", "No — classic view", "Pending"] },
      { key: "onesite_login_url", label: "Login URL", placeholder: "https://onesite.realpage.com/", type: "text" },
    ],
  },
  // ── 8. Paychex ──────────────────────────────────────────────────────────────
  {
    id: "paychex",
    title: "Paychex",
    subtitle: "Payroll, HR & benefits administration platform (paychexflex.com)",
    icon: <DollarSign className="w-5 h-5" />,
    color: "oklch(0.60 0.16 40)",
    fields: [
      { key: "paychex_employee_id", label: "Paychex Employee ID", placeholder: "EMP-00123", type: "text", required: true },
      { key: "paychex_username", label: "Paychex Flex Username", placeholder: "jsmith@apartmentcorp.com", type: "email", required: true },
      { key: "paychex_temp_password", label: "Temp Password", placeholder: "TempPass2024!", type: "password", hint: "Employee will be prompted to reset on first login at paychexflex.com" },
      { key: "paychex_role", label: "User Role", placeholder: "Employee", type: "select", options: ["Employee", "Manager — View Team", "Manager — Approve Time", "HR Admin", "Payroll Admin", "Super Admin"] },
      { key: "paychex_pay_frequency", label: "Pay Frequency", placeholder: "Bi-Weekly", type: "select", options: ["Weekly", "Bi-Weekly", "Semi-Monthly", "Monthly"] },
      { key: "paychex_direct_deposit", label: "Direct Deposit Set Up?", placeholder: "Pending", type: "select", options: ["Yes — confirmed", "Pending — form submitted", "No — paper check"] },
      { key: "paychex_benefits_enrolled", label: "Benefits Enrollment Status", placeholder: "Pending", type: "select", options: ["Enrolled", "Pending enrollment", "Waived", "Not eligible yet"] },
      { key: "paychex_login_url", label: "Login URL", placeholder: "https://www.paychexflex.com/", type: "text" },
    ],
  },
  // ── 9. Phone Portal ─────────────────────────────────────────────────────────
  {
    id: "phone_portal",
    title: "Phone Portal",
    subtitle: "Business VoIP phone system — call management, voicemail & extensions",
    icon: <Phone className="w-5 h-5" />,
    color: "oklch(0.62 0.14 195)",
    fields: [
      { key: "phone_login_email", label: "Phone Portal Login Email", placeholder: "jsmith@apartmentcorp.com", type: "email", required: true },
      { key: "phone_temp_password", label: "Temp Password", placeholder: "TempPass2024!", type: "password" },
      { key: "phone_extension", label: "Direct Extension Number", placeholder: "Ext. 209", type: "text", required: true },
      { key: "phone_did", label: "Direct Inward Dial (DID) Number", placeholder: "(555) 123-4567", type: "tel", hint: "The direct phone number assigned to this employee, if applicable" },
      { key: "phone_role", label: "User Role", placeholder: "User", type: "select", options: ["User", "Manager", "Admin", "Super Admin"] },
      { key: "phone_call_queues", label: "Call Queues / Ring Groups Assigned", placeholder: "Main Office, Leasing Line", type: "text", hint: "Comma-separated queue names" },
      { key: "phone_voicemail_setup", label: "Voicemail Set Up?", placeholder: "Yes", type: "select", options: ["Yes — greeting recorded", "Yes — default greeting", "Pending", "No"] },
      { key: "phone_mobile_app", label: "Mobile App Installed?", placeholder: "Yes", type: "select", options: ["Yes — installed & logged in", "Pending", "No — desk phone only"] },
      { key: "phone_login_url", label: "Portal Login URL", placeholder: "https://app.ringcentral.com/", type: "text" },
    ],
  },
  // ── 10. Yardi ───────────────────────────────────────────────────────────────
  {
    id: "yardi",
    title: "Yardi",
    subtitle: "Yardi Voyager property management & accounting platform",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "oklch(0.58 0.18 30)",
    fields: [
      { key: "yardi_username", label: "Yardi Username", placeholder: "jsmith", type: "text", required: true, hint: "Typically first initial + last name, e.g. jsmith" },
      { key: "yardi_temp_password", label: "Temp Password", placeholder: "TempPass2024!", type: "password", required: true, hint: "Employee must change on first login" },
      { key: "yardi_database", label: "Yardi Database / Environment", placeholder: "PROD", type: "select", options: ["PROD (Production)", "TEST (Training)", "STAGE (Staging)", "Both PROD & TEST"] },
      { key: "yardi_security_role", label: "Security Role Assigned", placeholder: "Leasing Agent", type: "select", options: ["Leasing Agent", "Leasing Manager", "Property Manager", "Regional Manager", "Accounting Staff", "Accounting Manager", "Maintenance", "Executive", "Read Only", "Custom Role"] },
      { key: "yardi_properties", label: "Properties / Property Groups Assigned", placeholder: "Parkview Apts, Oakwood Commons", type: "text", hint: "Yardi supports explicit property lists or property group assignments" },
      { key: "yardi_modules", label: "Modules / Menu Access Granted", placeholder: "Leasing, Residents, Reports", type: "text", hint: "e.g. Leasing, Residents, Maintenance, Accounting, Reports" },
      { key: "yardi_login_url", label: "Yardi Login URL", placeholder: "https://www.yardiasp.com/", type: "text", hint: "Client-specific URL — confirm with IT" },
    ],
  },
  // ── 11. IT Equipment & Access ────────────────────────────────────────────────
  {
    id: "it_equipment",
    title: "IT Equipment & Physical Access",
    subtitle: "Hardware assigned, badge access, VPN, and MFA enrollment",
    icon: <Laptop className="w-5 h-5" />,
    color: "oklch(0.55 0.12 130)",
    fields: [
      { key: "laptop_serial", label: "Laptop Serial Number", placeholder: "C02XK1JDJGH7", type: "text" },
      { key: "laptop_model", label: "Laptop Model", placeholder: "MacBook Pro 14\" / Dell Latitude 5540", type: "text" },
      { key: "phone_number", label: "Company Phone Number (if issued)", placeholder: "(555) 000-0000", type: "tel" },
      { key: "phone_model", label: "Phone Model (if issued)", placeholder: "iPhone 15 / Samsung S24", type: "text" },
      { key: "badge_number", label: "Access Badge Number", placeholder: "BADGE-0042", type: "text" },
      { key: "badge_access_level", label: "Badge Access Level", placeholder: "Standard", type: "select", options: ["Standard", "Manager", "Executive", "IT/Maintenance", "Full Access"] },
      { key: "vpn_account", label: "VPN Account / Username", placeholder: "jsmith", type: "text" },
      { key: "mfa_method", label: "MFA Method Enrolled", placeholder: "Authenticator App", type: "select", options: ["Authenticator App", "SMS", "Email", "Hardware Key", "Not Yet Set Up"] },
    ],
  },
  // ── 12. Additional Notes ─────────────────────────────────────────────────────
  {
    id: "additional_systems",
    title: "Additional Systems & Notes",
    subtitle: "Any other platforms, logins, or special instructions for this employee",
    icon: <Cpu className="w-5 h-5" />,
    color: "oklch(0.58 0.14 260)",
    fields: [
      { key: "other_system_1", label: "Other System 1 — Name & Login", placeholder: "System Name: username / password", type: "text" },
      { key: "other_system_2", label: "Other System 2 — Name & Login", placeholder: "System Name: username / password", type: "text" },
      { key: "other_system_3", label: "Other System 3 — Name & Login", placeholder: "System Name: username / password", type: "text" },
      { key: "special_instructions", label: "Special Instructions / Notes for New Hire", placeholder: "Any additional setup steps, access notes, or reminders...", type: "text" },
      { key: "it_ticket_number", label: "IT Ticket / Reference Number", placeholder: "INC-20240001", type: "text" },
      { key: "completed_by", label: "Completed By (Ethan's confirmation)", placeholder: "Ethan Fowler", type: "text" },
    ],
  },
];

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = "ac_tech_onboarding_v1";

function loadRecords(): EmployeeRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecords(records: EmployeeRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PasswordField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pr-16 pl-3 py-2 rounded-md text-sm border transition-all focus:outline-none"
        style={{
          backgroundColor: "oklch(0.18 0.05 258)",
          borderColor: "oklch(0.30 0.07 258)",
          color: "oklch(0.92 0.01 220)",
        }}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="p-1 rounded opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: "oklch(0.72 0.12 220)" }}
          title={show ? "Hide" : "Show"}
        >
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(value);
            toast.success("Copied to clipboard");
          }}
          className="p-1 rounded opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: "oklch(0.72 0.12 220)" }}
          title="Copy"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TechOnboardingTab() {
  const [records, setRecords] = useState<EmployeeRecord[]>(loadRecords);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["employee_info"]));
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  // Derive active record
  const activeRecord = records.find((r) => r.id === activeRecordId) || null;

  // Load record into form when switching
  useEffect(() => {
    if (activeRecord) {
      setFormData(activeRecord.credentials);
      setShowNewForm(false);
    }
  }, [activeRecordId]);

  const handleField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    if (activeRecordId) {
      // Update existing
      const updated = records.map((r) =>
        r.id === activeRecordId
          ? { ...r, credentials: formData, name: formData.full_name || r.name, role: formData.role_title || r.role, startDate: formData.start_date || r.startDate, department: formData.department || r.department }
          : r
      );
      setRecords(updated);
      saveRecords(updated);
    } else {
      // Create new
      const newRecord: EmployeeRecord = {
        id: "emp_" + Math.random().toString(36).slice(2),
        name: formData.full_name || "New Employee",
        role: formData.role_title || "",
        startDate: formData.start_date || "",
        department: formData.department || "",
        createdAt: Date.now(),
        credentials: formData,
      };
      const updated = [newRecord, ...records];
      setRecords(updated);
      saveRecords(updated);
      setActiveRecordId(newRecord.id);
      setShowNewForm(false);
    }
    setSaved(true);
    toast.success("Technology onboarding record saved!");
    setTimeout(() => setSaved(false), 3000);
  };

  const handleMarkComplete = () => {
    if (!activeRecordId) return;
    const updated = records.map((r) =>
      r.id === activeRecordId ? { ...r, completedAt: Date.now(), credentials: formData } : r
    );
    setRecords(updated);
    saveRecords(updated);
    toast.success("Marked as complete! New hire credentials are ready.");
  };

  const handleNewEmployee = () => {
    setActiveRecordId(null);
    setFormData({});
    setShowNewForm(true);
    setExpandedSections(new Set(["employee_info"]));
    setSaved(false);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    saveRecords(updated);
    if (activeRecordId === id) {
      setActiveRecordId(null);
      setFormData({});
      setShowNewForm(false);
    }
    toast.success("Record deleted");
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const completionCount = TECH_SECTIONS.reduce((acc, sec) => {
    return acc + sec.fields.filter((f) => formData[f.key]?.trim()).length;
  }, 0);
  const totalFields = TECH_SECTIONS.reduce((acc, sec) => acc + sec.fields.length, 0);
  const completionPct = Math.round((completionCount / totalFields) * 100);

  const isEditing = showNewForm || activeRecordId !== null;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ backgroundColor: "oklch(0.22 0.08 258)" }}
            >
              <Monitor className="w-5 h-5" style={{ color: "oklch(0.72 0.12 220)" }} />
            </div>
            <div>
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "oklch(0.92 0.01 220)" }}
              >
                Technology Onboarding
              </h2>
              <p className="text-xs flex items-center gap-1.5" style={{ color: "oklch(0.60 0.05 258)" }}>
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: "oklch(0.22 0.08 258)", color: "oklch(0.72 0.12 220)" }}
                >
                  <User className="w-3 h-3" />
                  Ethan Fowler
                </span>
                <span>· IT Credential Provisioning Form</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewEmployee}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: "oklch(0.72 0.12 220)", color: "oklch(0.12 0.05 258)" }}
          >
            <RefreshCw className="w-4 h-4" />
            New Employee
          </button>
        </div>
      </div>

      <div className="flex gap-5 items-start">
        {/* Left: Employee List */}
        <aside className="hidden lg:flex flex-col gap-2 w-56 flex-shrink-0">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-1 px-1"
            style={{ color: "oklch(0.55 0.05 258)" }}
          >
            Employees ({records.length})
          </div>

          {records.length === 0 && (
            <div
              className="text-xs text-center py-6 rounded-lg border border-dashed"
              style={{ borderColor: "oklch(0.28 0.06 258)", color: "oklch(0.50 0.05 258)" }}
            >
              No records yet.<br />Click "New Employee" to start.
            </div>
          )}

          {records.map((rec) => (
            <button
              key={rec.id}
              onClick={() => setActiveRecordId(rec.id)}
              className="w-full text-left px-3 py-2.5 rounded-lg border transition-all group"
              style={{
                backgroundColor: activeRecordId === rec.id ? "oklch(0.22 0.08 258)" : "oklch(0.16 0.05 258)",
                borderColor: activeRecordId === rec.id ? "oklch(0.72 0.12 220)" : "oklch(0.25 0.06 258)",
              }}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className="text-sm font-semibold truncate"
                  style={{ color: activeRecordId === rec.id ? "oklch(0.92 0.01 220)" : "oklch(0.75 0.04 258)" }}
                >
                  {rec.name || "Unnamed"}
                </span>
                {rec.completedAt && (
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.72 0.16 165)" }} />
                )}
              </div>
              <div className="text-xs mt-0.5 truncate" style={{ color: "oklch(0.50 0.05 258)" }}>
                {rec.role || "No role set"}
              </div>
              {rec.startDate && (
                <div className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.05 258)" }}>
                  Start: {rec.startDate}
                </div>
              )}
            </button>
          ))}
        </aside>

        {/* Right: Form */}
        <main className="flex-1 min-w-0">
          {!isEditing ? (
            <div
              className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed text-center"
              style={{ borderColor: "oklch(0.28 0.06 258)", backgroundColor: "oklch(0.14 0.04 258)" }}
            >
              <Monitor className="w-12 h-12 mb-4" style={{ color: "oklch(0.35 0.07 258)" }} />
              <p className="text-base font-semibold mb-2" style={{ color: "oklch(0.65 0.05 258)" }}>
                Select an employee or start a new record
              </p>
              <p className="text-sm mb-5" style={{ color: "oklch(0.45 0.04 258)" }}>
                Fill in all technology credentials for each new hire
              </p>
              <button
                onClick={handleNewEmployee}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{ backgroundColor: "oklch(0.72 0.12 220)", color: "oklch(0.12 0.05 258)" }}
              >
                + Start New Employee Record
              </button>
            </div>
          ) : (
            <div>
              {/* Progress Bar */}
              <div
                className="rounded-xl p-4 mb-5 border"
                style={{ backgroundColor: "oklch(0.16 0.05 258)", borderColor: "oklch(0.25 0.06 258)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ color: "oklch(0.85 0.03 220)" }}>
                    Form Completion
                  </span>
                  <span className="text-sm font-bold" style={{ color: "oklch(0.72 0.12 220)" }}>
                    {completionPct}% ({completionCount}/{totalFields} fields)
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "oklch(0.22 0.06 258)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionPct}%`, backgroundColor: "oklch(0.72 0.12 220)" }}
                  />
                </div>
                {completionPct < 100 && (
                  <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: "oklch(0.55 0.05 258)" }}>
                    <AlertCircle className="w-3.5 h-3.5" />
                    Fill in all fields before marking complete and sharing with the new hire
                  </p>
                )}
              </div>

              {/* Sections */}
              {TECH_SECTIONS.map((section) => {
                const isOpen = expandedSections.has(section.id);
                const filledInSection = section.fields.filter((f) => formData[f.key]?.trim()).length;
                return (
                  <div
                    key={section.id}
                    className="rounded-xl border mb-3 overflow-hidden"
                    style={{ backgroundColor: "oklch(0.16 0.05 258)", borderColor: "oklch(0.25 0.06 258)" }}
                  >
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left transition-all hover:opacity-90"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: `${section.color}22`, color: section.color }}
                        >
                          {section.icon}
                        </div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: "oklch(0.90 0.02 220)" }}>
                            {section.title}
                          </div>
                          <div className="text-xs" style={{ color: "oklch(0.55 0.05 258)" }}>
                            {section.subtitle}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: filledInSection === section.fields.length ? "oklch(0.62 0.16 165 / 0.2)" : "oklch(0.22 0.06 258)",
                            color: filledInSection === section.fields.length ? "oklch(0.72 0.16 165)" : "oklch(0.55 0.05 258)",
                          }}
                        >
                          {filledInSection}/{section.fields.length}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4" style={{ color: "oklch(0.55 0.05 258)" }} />
                        ) : (
                          <ChevronDown className="w-4 h-4" style={{ color: "oklch(0.55 0.05 258)" }} />
                        )}
                      </div>
                    </button>

                    {/* Section Fields */}
                    {isOpen && (
                      <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t" style={{ borderColor: "oklch(0.22 0.06 258)" }}>
                        {section.fields.map((field) => (
                          <div key={field.key} className={field.key === "special_instructions" ? "sm:col-span-2" : ""}>
                            <label
                              className="block text-xs font-semibold mb-1.5"
                              style={{ color: "oklch(0.70 0.05 258)" }}
                            >
                              {field.label}
                              {field.required && (
                                <span className="ml-1" style={{ color: "oklch(0.72 0.12 220)" }}>*</span>
                              )}
                            </label>

                            {field.type === "password" ? (
                              <PasswordField
                                value={formData[field.key] || ""}
                                onChange={(v) => handleField(field.key, v)}
                                placeholder={field.placeholder}
                              />
                            ) : field.type === "select" ? (
                              <select
                                value={formData[field.key] || ""}
                                onChange={(e) => handleField(field.key, e.target.value)}
                                className="w-full px-3 py-2 rounded-md text-sm border transition-all focus:outline-none"
                                style={{
                                  backgroundColor: "oklch(0.18 0.05 258)",
                                  borderColor: "oklch(0.30 0.07 258)",
                                  color: formData[field.key] ? "oklch(0.92 0.01 220)" : "oklch(0.50 0.05 258)",
                                }}
                              >
                                <option value="">Select...</option>
                                {field.options?.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.type}
                                value={formData[field.key] || ""}
                                onChange={(e) => handleField(field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full px-3 py-2 rounded-md text-sm border transition-all focus:outline-none"
                                style={{
                                  backgroundColor: "oklch(0.18 0.05 258)",
                                  borderColor: "oklch(0.30 0.07 258)",
                                  color: "oklch(0.92 0.01 220)",
                                }}
                              />
                            )}

                            {field.hint && (
                              <p className="text-xs mt-1" style={{ color: "oklch(0.50 0.05 258)" }}>
                                {field.hint}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Action Buttons */}
              <div
                className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t"
                style={{ borderColor: "oklch(0.22 0.06 258)" }}
              >
                <button
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all flex-1"
                  style={{
                    backgroundColor: saved ? "oklch(0.62 0.16 165)" : "oklch(0.72 0.12 220)",
                    color: "oklch(0.12 0.05 258)",
                  }}
                >
                  {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? "Saved!" : "Save Record"}
                </button>

                <button
                  onClick={handleMarkComplete}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border transition-all flex-1"
                  style={{
                    backgroundColor: "oklch(0.62 0.16 165 / 0.15)",
                    borderColor: "oklch(0.62 0.16 165)",
                    color: "oklch(0.72 0.16 165)",
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Complete & Ready for New Hire
                </button>

                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold border transition-all"
                  style={{
                    backgroundColor: "transparent",
                    borderColor: "oklch(0.30 0.07 258)",
                    color: "oklch(0.60 0.05 258)",
                  }}
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>

                {activeRecordId && (
                  <button
                    onClick={() => handleDeleteRecord(activeRecordId)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold border transition-all"
                    style={{
                      backgroundColor: "transparent",
                      borderColor: "oklch(0.577 0.245 27.325 / 0.4)",
                      color: "oklch(0.65 0.20 27)",
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
