// ApartmentCorp Onboarding Data
// All phases, tasks, and document categories for the onboarding ecosystem

export interface Task {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  critical?: boolean;
  subTasks?: Task[];
  note?: string;
}

export interface Section {
  id: string;
  label: string;
  tasks: Task[];
}

export interface Phase {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  timeline: string;
  color: string;
  sections: Section[];
}

export interface DocCategory {
  id: string;
  icon: string;
  title: string;
  description: string;
  phaseId: string;
  files: UploadedFile[];
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export const PHASES: Phase[] = [
  {
    id: "phase-1",
    number: 1,
    title: "Pre-Arrival & Day One",
    subtitle: "Getting you set up before you walk through the door",
    timeline: "Days -7 to 1",
    color: "terracotta",
    sections: [
      {
        id: "s1-1",
        label: "Welcome & Access",
        tasks: [
          {
            id: "1.1",
            label: "Accept your offer letter and confirm your start date with HR",
            required: true,
          },
          {
            id: "1.2",
            label: "Receive and log in to the ApartmentCorp Employee Portal",
            description: "Check your welcome email for login credentials. Contact IT at it@apartmentcorp.com if you have trouble.",
            required: true,
          },
          {
            id: "1.3",
            label: "Confirm your office location, parking, and first-day arrival instructions",
          },
        ],
      },
      {
        id: "s1-2",
        label: "HR Paperwork (Complete Before Day 1)",
        tasks: [
          {
            id: "1.4",
            label: "Complete Form I-9 (Employment Eligibility Verification)",
            required: true,
            critical: true,
            note: "You must bring original identity documents on Day 1. See the Document Hub tab for accepted documents.",
          },
          {
            id: "1.5",
            label: "Submit Form W-4 (Federal Tax Withholding)",
            required: true,
          },
          {
            id: "1.6",
            label: "Set up Direct Deposit via the payroll portal",
            required: true,
          },
          {
            id: "1.7",
            label: "Review and sign the Employee Handbook Acknowledgment",
            required: true,
          },
          {
            id: "1.8",
            label: "Complete the Emergency Contact form",
            required: true,
          },
        ],
      },
      {
        id: "s1-3",
        label: "IT & Equipment",
        tasks: [
          {
            id: "1.9",
            label: "Confirm receipt of company laptop, phone, and/or access badge",
            required: true,
          },
          {
            id: "1.10",
            label: "Set up company email, Microsoft 365, and Slack accounts",
          },
          {
            id: "1.11",
            label: "Complete IT Security Onboarding (password policies, VPN setup, MFA enrollment)",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "phase-2",
    number: 2,
    title: "Core Training & Compliance",
    subtitle: "Essential company knowledge and mandatory compliance modules",
    timeline: "Week 1",
    color: "navy",
    sections: [
      {
        id: "s2-1",
        label: "Company Orientation",
        tasks: [
          {
            id: "2.1",
            label: "Watch the 'Welcome to ApartmentCorp' video module (30 min)",
            required: true,
          },
          {
            id: "2.2",
            label: "Review the ApartmentCorp Organizational Chart and meet your direct team",
          },
          {
            id: "2.3",
            label: "Complete the Company Culture & Values quiz",
            required: true,
          },
        ],
      },
      {
        id: "s2-2",
        label: "Mandatory Compliance Training",
        tasks: [
          {
            id: "2.4",
            label: "Complete Fair Housing Act Training (2 hours)",
            required: true,
            critical: true,
            note: "All ApartmentCorp employees must complete this training before interacting with residents or applicants.",
          },
          {
            id: "2.5",
            label: "Complete Anti-Harassment & Discrimination Training (1.5 hours)",
            required: true,
            critical: true,
          },
          {
            id: "2.6",
            label: "Complete OSHA Workplace Safety Orientation (1 hour)",
            required: true,
          },
          {
            id: "2.7",
            label: "Review and acknowledge the ApartmentCorp Code of Conduct",
            required: true,
          },
        ],
      },
      {
        id: "s2-3",
        label: "Benefits & Payroll",
        tasks: [
          {
            id: "2.8",
            label: "Attend Benefits Orientation session with HR",
          },
          {
            id: "2.9",
            label: "Enroll in health, dental, and vision insurance (30-day enrollment window)",
            required: true,
            note: "Enrollment must be completed within 30 days of your start date. Missing this window requires a qualifying life event to re-enroll.",
          },
          {
            id: "2.10",
            label: "Review 401(k) plan options and submit contribution election",
          },
          {
            id: "2.11",
            label: "Confirm first paycheck date and pay period schedule with HR",
          },
        ],
      },
    ],
  },
  {
    id: "phase-3",
    number: 3,
    title: "Role-Specific Training",
    subtitle: "Deep dive into your department's tools, SOPs, and responsibilities",
    timeline: "Weeks 2–4",
    color: "terracotta",
    sections: [
      {
        id: "s3-1",
        label: "Systems & Software",
        tasks: [
          {
            id: "3.1",
            label: "Complete Yardi/RealPage Property Management Software training (Level 1)",
            required: true,
          },
          {
            id: "3.2",
            label: "Complete role-specific software training (e.g., ShowMojo, AppFolio, or Maintenance portal)",
            required: true,
          },
          {
            id: "3.3",
            label: "Review the Resident Communication Guidelines and email templates",
          },
        ],
      },
      {
        id: "s3-2",
        label: "Standard Operating Procedures",
        tasks: [
          {
            id: "3.4",
            label: "Review and acknowledge the Leasing & Move-In SOP",
            required: true,
          },
          {
            id: "3.5",
            label: "Review and acknowledge the Maintenance Request & Work Order SOP",
            required: true,
          },
          {
            id: "3.6",
            label: "Review the Rent Collection & Delinquency Policy",
            required: true,
          },
          {
            id: "3.7",
            label: "Review the Eviction Process Guidelines (for informational awareness)",
          },
        ],
      },
      {
        id: "s3-3",
        label: "Shadowing & Hands-On Learning",
        tasks: [
          {
            id: "3.8",
            label: "Shadow a senior team member for a minimum of 3 full working days",
            required: true,
          },
          {
            id: "3.9",
            label: "Observe at least one resident move-in or lease signing",
          },
          {
            id: "3.10",
            label: "Accompany a maintenance technician on a service call",
          },
          {
            id: "3.11",
            label: "Complete your 30-Day Check-in meeting with your direct manager",
            required: true,
            critical: true,
          },
        ],
      },
    ],
  },
  {
    id: "phase-4",
    number: 4,
    title: "Integration & 90-Day Review",
    subtitle: "Full team integration and formal performance evaluation",
    timeline: "Days 30–90",
    color: "navy",
    sections: [
      {
        id: "s4-1",
        label: "Cross-Departmental Integration",
        tasks: [
          {
            id: "4.1",
            label: "Schedule and complete introductory meetings with Marketing, Maintenance, and Accounting teams",
          },
          {
            id: "4.2",
            label: "Attend at least one full team or all-hands meeting",
          },
          {
            id: "4.3",
            label: "Complete the ApartmentCorp Property Portfolio overview (know your properties)",
          },
        ],
      },
      {
        id: "s4-2",
        label: "Independent Performance",
        tasks: [
          {
            id: "4.4",
            label: "Successfully complete your first independent assignment (leasing cycle, work order batch, or equivalent)",
            required: true,
          },
          {
            id: "4.5",
            label: "Receive and review your first resident satisfaction score or feedback",
          },
          {
            id: "4.6",
            label: "Complete the 60-Day Progress Check-in with your manager",
            required: true,
          },
        ],
      },
      {
        id: "s4-3",
        label: "Formal Review",
        tasks: [
          {
            id: "4.7",
            label: "Complete the 90-Day Self-Assessment form",
            required: true,
          },
          {
            id: "4.8",
            label: "Attend the 90-Day Performance Review with your manager and HR",
            required: true,
            critical: true,
            note: "This review determines the conclusion of your probationary period. Come prepared with examples of your contributions and any questions about your role.",
          },
          {
            id: "4.9",
            label: "Set your 6-month and 1-year goals with your manager",
            required: true,
          },
        ],
      },
    ],
  },
];

export const DOC_CATEGORIES: Omit<DocCategory, "files">[] = [
  // Phase 1
  {
    id: "doc-i9",
    icon: "🪪",
    title: "I-9 Identity Documents",
    description: "Passport, Driver's License + Social Security Card, or other List A/B/C documents",
    phaseId: "phase-1",
  },
  {
    id: "doc-w4",
    icon: "📄",
    title: "Signed W-4 Form",
    description: "Federal tax withholding election form",
    phaseId: "phase-1",
  },
  {
    id: "doc-direct-deposit",
    icon: "🏦",
    title: "Direct Deposit Authorization",
    description: "Voided check or bank letter for payroll setup",
    phaseId: "phase-1",
  },
  {
    id: "doc-handbook",
    icon: "📋",
    title: "Employee Handbook Acknowledgment",
    description: "Signed acknowledgment that you have read and understood the Employee Handbook",
    phaseId: "phase-1",
  },
  // Phase 2
  {
    id: "doc-fair-housing",
    icon: "🏠",
    title: "Fair Housing Training Certificate",
    description: "Certificate of completion for the Fair Housing Act training module",
    phaseId: "phase-2",
  },
  {
    id: "doc-harassment",
    icon: "🛡️",
    title: "Anti-Harassment Training Certificate",
    description: "Certificate of completion for Anti-Harassment & Discrimination training",
    phaseId: "phase-2",
  },
  {
    id: "doc-benefits",
    icon: "💊",
    title: "Benefits Enrollment Confirmation",
    description: "Confirmation of health, dental, vision, and 401(k) elections",
    phaseId: "phase-2",
  },
  // Phase 3
  {
    id: "doc-sop",
    icon: "📂",
    title: "Signed SOP Acknowledgments",
    description: "Signed acknowledgments for Leasing, Maintenance, and Rent Collection SOPs",
    phaseId: "phase-3",
  },
  {
    id: "doc-software-cert",
    icon: "💻",
    title: "Software Training Completion",
    description: "Completion records for Yardi/RealPage and role-specific software training",
    phaseId: "phase-3",
  },
  // Phase 4
  {
    id: "doc-self-assessment",
    icon: "📝",
    title: "90-Day Self-Assessment",
    description: "Completed self-assessment form for the 90-day performance review",
    phaseId: "phase-4",
  },
  {
    id: "doc-goals",
    icon: "🎯",
    title: "6-Month & 1-Year Goals",
    description: "Documented goals agreed upon with your manager at the 90-day review",
    phaseId: "phase-4",
  },
];

export function countTasks(phase: Phase): number {
  return phase.sections.reduce((total, section) => {
    return total + section.tasks.reduce((t, task) => {
      return t + 1 + (task.subTasks?.length || 0);
    }, 0);
  }, 0);
}

export function getTotalTasks(): number {
  return PHASES.reduce((total, phase) => total + countTasks(phase), 0);
}
