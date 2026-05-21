/**
 * ApartmentCorp — New Employee Onboarding Portal
 * Brand: Dark navy oklch(0.13 0.06 258), teal accent oklch(0.72 0.12 220)
 * Typography: Cormorant Garamond (headings) + Inter (body/forms)
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, Clock, HelpCircle, Save, Sparkles, Send, KeyRound, Eye, EyeOff, Copy } from "lucide-react";
import { toast } from "sonner";
import { NewHireAuth } from "@/components/NewHireAuth";
import { trpc } from "@/lib/trpc";
import PropertyMaxTraining from "./PropertyMaxTraining";

// ── Brand constants ───────────────────────────────────────────────────────────
const AC = {
  bg:       "oklch(0.13 0.06 258)",
  bgCard:   "oklch(0.18 0.065 258)",
  bgRaised: "oklch(0.22 0.07 258)",
  nav:      "oklch(0.10 0.06 258 / 0.95)",
  teal:     "oklch(0.72 0.12 220)",
  tealDim:  "oklch(0.58 0.14 240)",
  fg:       "oklch(0.97 0.005 220)",
  fgMuted:  "oklch(0.65 0.02 230)",
  fgSubtle: "oklch(0.45 0.02 230)",
  border:   "oklch(1 0 0 / 0.09)",
  borderStrong: "oklch(1 0 0 / 0.16)",
  heading: "'Cormorant Garamond', Georgia, serif",
  body:    "'Inter', 'Helvetica Neue', Arial, sans-serif",
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  estimatedMinutes: number;
  description: string;
  status: "locked" | "available" | "in-progress" | "complete" | "submitted";
  formType: "employment_application" | "confidentiality_agreement" | "tracking_agreement" | "policies_acknowledgment" | "direct_deposit" | "w4" | "it2104" | "i9" | "maintenance_test" | null;
  forms: FormGroup[];
}

export interface FormGroup {
  id: string;
  title: string;
  fields: FormFieldDef[];
}

export interface FormFieldDef {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "select" | "radio" | "checkbox" | "textarea" | "ssn" | "signature" | "number";
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
  sensitive?: boolean;
  fullWidth?: boolean;
}

const US_STATES = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];

// ── Chapter data ──────────────────────────────────────────────────────────────
const CHAPTERS: Chapter[] = [
  {
    id: "employment_application",
    number: 1,
    title: "Employment Application",
    subtitle: "Personal info, work history & references",
    icon: "📝",
    accentColor: AC.teal,
    estimatedMinutes: 15,
    description: "Complete your employment application — personal information, work history, skills, references, and emergency contacts.",
    status: "available",
    formType: "employment_application",
    forms: [
      {
        id: "personal-data",
        title: "Personal Information",
        fields: [
          { id: "first_name", label: "First Name", type: "text", placeholder: "First name", required: true },
          { id: "last_name", label: "Last Name", type: "text", placeholder: "Last name", required: true },
          { id: "middle_name", label: "Middle Name", type: "text", placeholder: "Middle name" },
          { id: "preferred_name", label: "Preferred Name / Nickname", type: "text", placeholder: "What should we call you?" },
          { id: "dob", label: "Date of Birth", type: "date", required: true, sensitive: true },
          { id: "ssn", label: "Social Security Number", type: "ssn", placeholder: "XXX-XX-XXXX", required: true, sensitive: true, helpText: "Your SSN is encrypted and used only for payroll and tax purposes." },
          { id: "phone_home", label: "Home Phone", type: "tel", placeholder: "(555) 000-0000" },
          { id: "phone_cell", label: "Cell Phone", type: "tel", placeholder: "(555) 000-0000", required: true },
          { id: "email_personal", label: "Personal Email", type: "email", placeholder: "your@email.com", required: true },
          { id: "address1", label: "Street Address", type: "text", placeholder: "123 Main Street", required: true, fullWidth: true },
          { id: "address2", label: "Apt / Suite", type: "text", placeholder: "Optional" },
          { id: "city", label: "City", type: "text", placeholder: "City", required: true },
          { id: "state", label: "State", type: "select", required: true, options: US_STATES },
          { id: "zip", label: "ZIP Code", type: "text", placeholder: "00000", required: true },
          { id: "us_citizen", label: "Are you a U.S. Citizen?", type: "radio", required: true, options: ["Yes", "No"] },
          { id: "authorized_to_work", label: "Are you authorized to work in the U.S.?", type: "radio", required: true, options: ["Yes", "No"] },
          { id: "felony_conviction", label: "Have you ever been convicted of a felony?", type: "radio", required: true, options: ["Yes", "No"] },
          { id: "felony_explanation", label: "If yes, please explain", type: "textarea", placeholder: "Explain circumstances...", helpText: "A conviction does not automatically disqualify you from employment." },
        ],
      },
      {
        id: "position-info",
        title: "Position Applied For",
        fields: [
          { id: "position_applied", label: "Position Applied For", type: "select", options: ["__DYNAMIC_POSITIONS__"], required: true },
          { id: "property_applied", label: "Property / Location", type: "select", options: ["__DYNAMIC_PROPERTIES__"], required: true },
          { id: "desired_salary", label: "Desired Salary / Pay Rate", type: "text", placeholder: "e.g., $18/hr or $45,000/yr" },
          { id: "available_start_date", label: "Available Start Date", type: "date", required: true },
          { id: "employment_type", label: "Employment Type Desired", type: "radio", options: ["Full-Time", "Part-Time", "Temporary", "Any"] },
          { id: "currently_employed", label: "Are you currently employed?", type: "radio", options: ["Yes", "No"] },
          { id: "contact_current_employer", label: "May we contact your current employer?", type: "radio", options: ["Yes", "No", "N/A"] },
          { id: "how_heard", label: "How did you hear about this position?", type: "select", options: ["Indeed", "ZipRecruiter", "Employee Referral", "Company Website", "LinkedIn", "Craigslist", "Other"] },
          { id: "referral_name", label: "If referred, by whom?", type: "text", placeholder: "Name of referral" },
        ],
      },
      {
        id: "work-history",
        title: "Work History — Most Recent Employer",
        fields: [
          { id: "emp1_company", label: "Company Name", type: "text", placeholder: "Employer name" },
          { id: "emp1_address", label: "Company Address", type: "text", placeholder: "Address", fullWidth: true },
          { id: "emp1_phone", label: "Company Phone", type: "tel", placeholder: "(555) 000-0000" },
          { id: "emp1_supervisor", label: "Supervisor Name", type: "text", placeholder: "Supervisor's name" },
          { id: "emp1_title", label: "Your Job Title", type: "text", placeholder: "Job title" },
          { id: "emp1_start", label: "Start Date", type: "date" },
          { id: "emp1_end", label: "End Date", type: "date" },
          { id: "emp1_salary", label: "Starting / Ending Pay", type: "text", placeholder: "e.g., $15/hr → $18/hr" },
          { id: "emp1_duties", label: "Duties & Responsibilities", type: "textarea", placeholder: "Describe your main duties...", fullWidth: true },
          { id: "emp1_reason_leaving", label: "Reason for Leaving", type: "text", placeholder: "Reason for leaving", fullWidth: true },
          { id: "emp1_may_contact", label: "May we contact this employer?", type: "radio", options: ["Yes", "No"] },
        ],
      },
      {
        id: "work-history-2",
        title: "Work History — Previous Employer",
        fields: [
          { id: "emp2_company", label: "Company Name", type: "text", placeholder: "Employer name" },
          { id: "emp2_address", label: "Company Address", type: "text", placeholder: "Address", fullWidth: true },
          { id: "emp2_phone", label: "Company Phone", type: "tel", placeholder: "(555) 000-0000" },
          { id: "emp2_supervisor", label: "Supervisor Name", type: "text", placeholder: "Supervisor's name" },
          { id: "emp2_title", label: "Your Job Title", type: "text", placeholder: "Job title" },
          { id: "emp2_start", label: "Start Date", type: "date" },
          { id: "emp2_end", label: "End Date", type: "date" },
          { id: "emp2_salary", label: "Starting / Ending Pay", type: "text", placeholder: "e.g., $15/hr → $18/hr" },
          { id: "emp2_duties", label: "Duties & Responsibilities", type: "textarea", placeholder: "Describe your main duties...", fullWidth: true },
          { id: "emp2_reason_leaving", label: "Reason for Leaving", type: "text", placeholder: "Reason for leaving", fullWidth: true },
          { id: "emp2_may_contact", label: "May we contact this employer?", type: "radio", options: ["Yes", "No"] },
        ],
      },
      {
        id: "education",
        title: "Education",
        fields: [
          { id: "edu_high_school", label: "High School Name", type: "text", placeholder: "School name" },
          { id: "edu_hs_location", label: "High School City, State", type: "text", placeholder: "City, State" },
          { id: "edu_hs_graduated", label: "Graduated?", type: "radio", options: ["Yes", "No", "GED"] },
          { id: "edu_college", label: "College / University", type: "text", placeholder: "Institution name" },
          { id: "edu_college_location", label: "College City, State", type: "text", placeholder: "City, State" },
          { id: "edu_college_degree", label: "Degree / Major", type: "text", placeholder: "e.g., B.S. Business Administration" },
          { id: "edu_college_graduated", label: "Graduated?", type: "radio", options: ["Yes", "No", "In Progress"] },
          { id: "edu_other", label: "Other Training / Certifications", type: "textarea", placeholder: "List any relevant certifications, licenses, or training...", fullWidth: true },
        ],
      },
      {
        id: "references",
        title: "Professional References",
        fields: [
          { id: "ref1_name", label: "Reference 1 — Full Name", type: "text", placeholder: "Full name" },
          { id: "ref1_company", label: "Company / Organization", type: "text", placeholder: "Where they work" },
          { id: "ref1_title", label: "Their Title", type: "text", placeholder: "Job title" },
          { id: "ref1_phone", label: "Phone", type: "tel", placeholder: "(555) 000-0000" },
          { id: "ref1_relationship", label: "Relationship to You", type: "text", placeholder: "e.g., Former Supervisor" },
          { id: "ref2_name", label: "Reference 2 — Full Name", type: "text", placeholder: "Full name" },
          { id: "ref2_company", label: "Company / Organization", type: "text", placeholder: "Where they work" },
          { id: "ref2_title", label: "Their Title", type: "text", placeholder: "Job title" },
          { id: "ref2_phone", label: "Phone", type: "tel", placeholder: "(555) 000-0000" },
          { id: "ref2_relationship", label: "Relationship to You", type: "text", placeholder: "e.g., Former Colleague" },
        ],
      },
      {
        id: "emergency-contact",
        title: "Emergency Contact",
        fields: [
          { id: "ec_name", label: "Emergency Contact Name", type: "text", placeholder: "Full name", required: true },
          { id: "ec_relationship", label: "Relationship", type: "text", placeholder: "e.g., Spouse, Parent, Sibling", required: true },
          { id: "ec_phone_home", label: "Home Phone", type: "tel", placeholder: "(555) 000-0000" },
          { id: "ec_phone_cell", label: "Cell Phone", type: "tel", placeholder: "(555) 000-0000", required: true },
          { id: "ec_address", label: "Address", type: "text", placeholder: "Street address", fullWidth: true },
          { id: "ec_city", label: "City", type: "text", placeholder: "City" },
          { id: "ec_state", label: "State", type: "select", options: US_STATES },
        ],
      },
      {
        id: "applicant-statement",
        title: "Applicant Statement & Signature",
        fields: [
          { id: "app_statement_agree", label: "I certify that all information provided is true and complete to the best of my knowledge. I understand that false information may result in termination. I authorize ApartmentCorp to verify all information and contact references.", type: "checkbox", placeholder: "I agree to the above statement", required: true, fullWidth: true },
          { id: "app_signature", label: "Applicant Signature", type: "signature", required: true, helpText: "Type your full legal name as your electronic signature.", fullWidth: true },
          { id: "app_signature_date", label: "Date", type: "date", required: true },
        ],
      },
    ],
  },
  {
    id: "agreements",
    number: 2,
    title: "Company Agreements",
    subtitle: "Confidentiality, GPS tracking & policies",
    icon: "📜",
    accentColor: "oklch(0.72 0.18 220)",
    estimatedMinutes: 10,
    description: "Review and sign the ApartmentCorp Confidentiality Agreement, GPS/Tracking Agreement, and Company Policies Acknowledgment.",
    status: "locked",
    formType: "confidentiality_agreement",
    forms: [
      {
        id: "confidentiality",
        title: "Confidentiality Agreement",
        fields: [
          { id: "conf_understand", label: "I understand that during my employment I will have access to confidential and proprietary information belonging to ApartmentCorp, including but not limited to: tenant information, financial records, business strategies, and personnel data.", type: "checkbox", placeholder: "I understand and agree", required: true, fullWidth: true },
          { id: "conf_not_disclose", label: "I agree not to disclose, use, or copy any confidential information for personal benefit or for the benefit of any third party, during or after my employment.", type: "checkbox", placeholder: "I agree not to disclose confidential information", required: true, fullWidth: true },
          { id: "conf_return", label: "I agree to return all company property and confidential materials upon termination of employment.", type: "checkbox", placeholder: "I agree to return all materials upon termination", required: true, fullWidth: true },
          { id: "conf_signature", label: "Employee Signature", type: "signature", required: true, helpText: "Type your full legal name as your electronic signature.", fullWidth: true },
          { id: "conf_print_name", label: "Print Name", type: "text", placeholder: "Your full legal name", required: true },
          { id: "conf_date", label: "Date Signed", type: "date", required: true },
        ],
      },
      {
        id: "gps-tracking",
        title: "GPS / Tracking Agreement (allGeo)",
        fields: [
          { id: "gps_understand", label: "I understand that ApartmentCorp uses GPS and location tracking technology (allGeo) on company-provided devices and vehicles during work hours for operational and safety purposes.", type: "checkbox", placeholder: "I understand the GPS tracking policy", required: true, fullWidth: true },
          { id: "gps_consent", label: "I consent to the use of GPS tracking on company devices and vehicles assigned to me during my working hours.", type: "checkbox", placeholder: "I consent to GPS tracking during work hours", required: true, fullWidth: true },
          { id: "gps_personal_device", label: "If a personal device is used for work purposes, I understand I may be asked to install the allGeo app during work hours only.", type: "checkbox", placeholder: "I understand the personal device policy", required: true, fullWidth: true },
          { id: "gps_employee_signature", label: "Employee Signature", type: "signature", required: true, helpText: "Type your full legal name as your electronic signature.", fullWidth: true },
          { id: "gps_print_name", label: "Print Name", type: "text", placeholder: "Your full legal name", required: true },
          { id: "gps_date", label: "Date Signed", type: "date", required: true },
        ],
      },
      {
        id: "policies-acknowledgment",
        title: "ApartmentCorp Policies Acknowledgment",
        fields: [
          { id: "pol_handbook", label: "I acknowledge that I have received, read, and understand the ApartmentCorp Employee Handbook and agree to comply with all policies and procedures contained therein.", type: "checkbox", placeholder: "I acknowledge receipt and understanding of the Employee Handbook", required: true, fullWidth: true },
          { id: "pol_at_will", label: "I understand that my employment is at-will, meaning either I or ApartmentCorp may terminate the employment relationship at any time, with or without cause or notice.", type: "checkbox", placeholder: "I understand at-will employment", required: true, fullWidth: true },
          { id: "pol_conduct", label: "I agree to adhere to ApartmentCorp's Code of Conduct, including standards for professional behavior, dress code, and respectful workplace practices.", type: "checkbox", placeholder: "I agree to the Code of Conduct", required: true, fullWidth: true },
          { id: "pol_drug_free", label: "I understand that ApartmentCorp maintains a drug-free workplace policy and I agree to comply with all related requirements.", type: "checkbox", placeholder: "I agree to the drug-free workplace policy", required: true, fullWidth: true },
          { id: "pol_social_media", label: "I understand and agree to comply with ApartmentCorp's social media policy regarding the representation of the company online.", type: "checkbox", placeholder: "I agree to the social media policy", required: true, fullWidth: true },
          { id: "pol_signature", label: "Employee Signature", type: "signature", required: true, helpText: "Type your full legal name as your electronic signature.", fullWidth: true },
          { id: "pol_print_name", label: "Print Name", type: "text", placeholder: "Your full legal name", required: true },
          { id: "pol_date", label: "Date Signed", type: "date", required: true },
        ],
      },
    ],
  },
  {
    id: "payroll",
    number: 3,
    title: "Payroll Setup",
    subtitle: "Direct deposit, W-4 & NY state tax",
    icon: "💵",
    accentColor: "oklch(0.75 0.14 180)",
    estimatedMinutes: 12,
    description: "Set up your direct deposit and complete your federal and state tax withholding forms so your first paycheck arrives on time.",
    status: "locked",
    formType: "direct_deposit",
    forms: [
      {
        id: "direct-deposit",
        title: "Direct Deposit Enrollment (Paychex)",
        fields: [
          { id: "dd_employee_name", label: "Employee Full Name", type: "text", placeholder: "As it appears on your bank account", required: true },
          { id: "dd_employee_id", label: "Employee ID (if known)", type: "text", placeholder: "Leave blank if not yet assigned" },
          { id: "dd_action", label: "Action", type: "radio", required: true, options: ["New Enrollment", "Change Existing", "Cancel"] },
          { id: "dd_bank_name", label: "Bank / Financial Institution Name", type: "text", placeholder: "e.g., Chase, Bank of America", required: true },
          { id: "dd_routing", label: "Routing Number (ABA)", type: "text", placeholder: "9-digit routing number", required: true, sensitive: true, helpText: "Found at the bottom-left of your check. Must be 9 digits." },
          { id: "dd_account_number", label: "Account Number", type: "text", placeholder: "Your checking/savings account number", required: true, sensitive: true },
          { id: "dd_account_type", label: "Account Type", type: "radio", required: true, options: ["Checking", "Savings"] },
          { id: "dd_amount_type", label: "Deposit Amount", type: "radio", required: true, options: ["100% of Net Pay", "Fixed Dollar Amount", "Remaining Balance"] },
          { id: "dd_fixed_amount", label: "Fixed Amount (if applicable)", type: "text", placeholder: "$0.00" },
          { id: "dd_signature", label: "Employee Signature", type: "signature", required: true, helpText: "Type your full legal name as your electronic signature.", fullWidth: true },
          { id: "dd_date", label: "Date", type: "date", required: true },
        ],
      },
      {
        id: "w4",
        title: "W-4 — Federal Employee's Withholding Certificate",
        fields: [
          { id: "w4_first_name", label: "First Name & Middle Initial", type: "text", placeholder: "First M.", required: true },
          { id: "w4_last_name", label: "Last Name", type: "text", placeholder: "Last name", required: true },
          { id: "w4_ssn", label: "Social Security Number", type: "ssn", placeholder: "XXX-XX-XXXX", required: true, sensitive: true },
          { id: "w4_address", label: "Address", type: "text", placeholder: "Street address", required: true, fullWidth: true },
          { id: "w4_city_state_zip", label: "City, State, ZIP", type: "text", placeholder: "City, ST 00000", required: true, fullWidth: true },
          { id: "w4_filing_status", label: "Filing Status", type: "radio", required: true, options: ["Single or Married filing separately", "Married filing jointly or Qualifying surviving spouse", "Head of household"] },
          { id: "w4_multiple_jobs", label: "Step 2 — Multiple Jobs or Spouse Works: Check if this applies to you", type: "checkbox", placeholder: "I have multiple jobs or my spouse also works", fullWidth: true },
          { id: "w4_dependents_under17", label: "Step 3 — Dependents under age 17 (multiply by $2,000)", type: "text", placeholder: "e.g., 2 children = $4,000" },
          { id: "w4_other_dependents", label: "Other dependents (multiply by $500)", type: "text", placeholder: "e.g., 1 other = $500" },
          { id: "w4_total_credits", label: "Total Dependent Credits", type: "text", placeholder: "Sum of above" },
          { id: "w4_other_income", label: "Step 4a — Other Income (not from jobs)", type: "text", placeholder: "e.g., $5,000" },
          { id: "w4_deductions", label: "Step 4b — Deductions (if itemizing)", type: "text", placeholder: "e.g., $12,950" },
          { id: "w4_extra_withholding", label: "Step 4c — Extra Withholding per Pay Period", type: "text", placeholder: "e.g., $50" },
          { id: "w4_signature", label: "Employee Signature", type: "signature", required: true, helpText: "Type your full legal name as your electronic signature.", fullWidth: true },
          { id: "w4_date", label: "Date", type: "date", required: true },
        ],
      },
      {
        id: "it2104",
        title: "IT-2104 — NY State Employee's Withholding Allowance Certificate",
        fields: [
          { id: "it_first_name", label: "First Name & Middle Initial", type: "text", placeholder: "First M.", required: true },
          { id: "it_last_name", label: "Last Name", type: "text", placeholder: "Last name", required: true },
          { id: "it_ssn", label: "Social Security Number", type: "ssn", placeholder: "XXX-XX-XXXX", required: true, sensitive: true },
          { id: "it_address", label: "Permanent Home Address", type: "text", placeholder: "Street address", required: true, fullWidth: true },
          { id: "it_city", label: "City", type: "text", placeholder: "City", required: true },
          { id: "it_state", label: "State", type: "select", required: true, options: US_STATES },
          { id: "it_zip", label: "ZIP Code", type: "text", placeholder: "00000", required: true },
          { id: "it_ny_resident", label: "Are you a New York State resident?", type: "radio", required: true, options: ["Yes", "No"] },
          { id: "it_nyc_resident", label: "Are you a New York City resident?", type: "radio", required: true, options: ["Yes", "No"] },
          { id: "it_yonkers_resident", label: "Are you a Yonkers resident?", type: "radio", required: true, options: ["Yes", "No"] },
          { id: "it_allowances_ny", label: "Number of NY State Withholding Allowances", type: "number", placeholder: "e.g., 1", required: true },
          { id: "it_allowances_nyc", label: "Number of NYC Withholding Allowances (if NYC resident)", type: "number", placeholder: "e.g., 1" },
          { id: "it_allowances_yonkers", label: "Number of Yonkers Withholding Allowances (if Yonkers resident)", type: "number", placeholder: "e.g., 1" },
          { id: "it_additional_ny", label: "Additional NY State Withholding per Pay Period", type: "text", placeholder: "$0.00" },
          { id: "it_additional_nyc", label: "Additional NYC Withholding per Pay Period", type: "text", placeholder: "$0.00" },
          { id: "it_signature", label: "Employee Signature", type: "signature", required: true, helpText: "Type your full legal name as your electronic signature.", fullWidth: true },
          { id: "it_date", label: "Date", type: "date", required: true },
        ],
      },
    ],
  },
  {
    id: "i9",
    number: 4,
    title: "Work Authorization (I-9)",
    subtitle: "Employment Eligibility Verification",
    icon: "🪪",
    accentColor: "oklch(0.72 0.12 280)",
    estimatedMinutes: 8,
    description: "Federal law requires us to verify your eligibility to work in the United States. Complete Section 1 — your employer will complete Section 2 on or before your first day.",
    status: "locked",
    formType: "i9",
    forms: [
      {
        id: "i9-section1",
        title: "I-9 Section 1 — Employee Information & Attestation",
        fields: [
          { id: "i9_last_name", label: "Last Name (Family Name)", type: "text", placeholder: "Last name", required: true },
          { id: "i9_first_name", label: "First Name (Given Name)", type: "text", placeholder: "First name", required: true },
          { id: "i9_middle_initial", label: "Middle Initial", type: "text", placeholder: "M" },
          { id: "i9_other_last_names", label: "Other Last Names Used (if any)", type: "text", placeholder: "Maiden name, etc.", fullWidth: true },
          { id: "i9_address", label: "Address (Street Number and Name)", type: "text", placeholder: "123 Main Street", required: true, fullWidth: true },
          { id: "i9_apt", label: "Apt. Number", type: "text", placeholder: "Optional" },
          { id: "i9_city", label: "City or Town", type: "text", placeholder: "City", required: true },
          { id: "i9_state", label: "State", type: "select", required: true, options: US_STATES },
          { id: "i9_zip", label: "ZIP Code", type: "text", placeholder: "00000", required: true },
          { id: "i9_dob", label: "Date of Birth", type: "date", required: true, sensitive: true },
          { id: "i9_ssn", label: "U.S. Social Security Number", type: "ssn", placeholder: "XXX-XX-XXXX", sensitive: true, helpText: "Providing your SSN is voluntary unless your employer participates in E-Verify." },
          { id: "i9_email", label: "Employee's Email Address", type: "email", placeholder: "your@email.com" },
          { id: "i9_phone", label: "Employee's Telephone Number", type: "tel", placeholder: "(555) 000-0000" },
          { id: "i9_citizenship_status", label: "Citizenship/Immigration Status", type: "radio", required: true, options: [
            "A citizen of the United States",
            "A noncitizen national of the United States",
            "A lawful permanent resident",
            "An alien authorized to work"
          ], fullWidth: true },
          { id: "i9_alien_number", label: "Alien Registration Number / USCIS Number (if applicable)", type: "text", placeholder: "A-Number", helpText: "Required if you selected 'lawful permanent resident' or 'alien authorized to work'." },
          { id: "i9_i94_number", label: "Form I-94 Admission Number (if applicable)", type: "text", placeholder: "I-94 number" },
          { id: "i9_foreign_passport", label: "Foreign Passport Number (if applicable)", type: "text", placeholder: "Passport number" },
          { id: "i9_country_of_issuance", label: "Country of Issuance (if applicable)", type: "text", placeholder: "Country" },
          { id: "i9_expiration_date", label: "Expiration Date of Work Authorization (if applicable)", type: "date" },
          { id: "i9_signature", label: "Employee Signature", type: "signature", required: true, helpText: "Type your full legal name as your electronic signature. By signing, you attest that the information is true and correct.", fullWidth: true },
          { id: "i9_signature_date", label: "Date of Signature", type: "date", required: true },
        ],
      },
      {
        id: "i9-documents",
        title: "I-9 Documents — List of Acceptable Documents",
        fields: [
          { id: "i9_list_choice", label: "Which documents will you present?", type: "radio", required: true, options: [
            "List A — One document that establishes both identity and employment authorization",
            "List B + C — One document from List B (identity) AND one from List C (employment authorization)"
          ], fullWidth: true },
          { id: "i9_list_a_doc", label: "List A Document Type (if applicable)", type: "select", options: [
            "U.S. Passport or U.S. Passport Card",
            "Permanent Resident Card (Form I-551)",
            "Foreign Passport with I-551 stamp",
            "Employment Authorization Document (Form I-766)",
            "Foreign Passport with Form I-94",
            "Passport from Federated States of Micronesia or Marshall Islands",
            "Other"
          ], fullWidth: true },
          { id: "i9_list_b_doc", label: "List B Document Type (if applicable)", type: "select", options: [
            "Driver's License or State ID",
            "ID Card issued by federal, state, or local government",
            "School ID with photograph",
            "Voter's registration card",
            "U.S. Military card or draft record",
            "Military dependent's ID card",
            "U.S. Coast Guard Merchant Mariner Card",
            "Native American tribal document",
            "Driver's license issued by a Canadian government authority",
            "Other"
          ], fullWidth: true },
          { id: "i9_list_c_doc", label: "List C Document Type (if applicable)", type: "select", options: [
            "U.S. Social Security card",
            "Certification of Birth Abroad (Form FS-545)",
            "Certification of Report of Birth (Form DS-1350)",
            "Original or certified copy of birth certificate",
            "Native American tribal document",
            "U.S. Citizen ID Card (Form I-197)",
            "Identification Card for Use of Resident Citizen (Form I-179)",
            "Employment authorization document issued by DHS",
            "Other"
          ], fullWidth: true },
          { id: "i9_doc_note", label: "Note", type: "checkbox", placeholder: "I understand that I must present original documents (not photocopies) to my employer on or before my first day of employment.", required: true, fullWidth: true },
        ],
      },
    ],
  },
  {
    id: "benefits",
    number: 5,
    title: "Benefits Enrollment",
    subtitle: "Health, dental, vision & more",
    icon: "🏥",
    accentColor: "oklch(0.72 0.12 280)",
    estimatedMinutes: 15,
    description: "Explore and enroll in your ApartmentCorp benefits package. You have 30 days from your start date to make your selections.",
    status: "locked",
    formType: null,
    forms: [],
  },
  {
    id: "maintenance_test",
    number: 6,
    title: "Maintenance Skills Test",
    subtitle: "Plumbing, electrical, HVAC & more",
    icon: "🔧",
    accentColor: "oklch(0.75 0.12 80)",
    estimatedMinutes: 30,
    description: "Complete the maintenance skills assessment. This test covers plumbing, electrical, general carpentry, appliances, HVAC, and pool maintenance.",
    status: "locked",
    formType: "maintenance_test",
    forms: [],
  },
];

// ── Main Component ────────────────────────────────────────────────name──────────────
function EmployeePortalContent() {
  const [employeeName, setEmployeeName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "chapters" | "form" | "logins" | "training">("welcome");
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>(CHAPTERS);
  const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  // Get the current new hire session — used as fallback auth for form submissions
  const { data: nhSession } = trpc.newHire.checkSession.useQuery();

  // Dynamic dropdown data for employment application
  const { data: positionsList } = trpc.positions.list.useQuery();
  const { data: buildingsList } = trpc.buildings.list.useQuery();

  const saveDraft = trpc.forms.saveDraft.useMutation();
  const submitForm = trpc.forms.submit.useMutation();

  useEffect(() => {
    const saved = localStorage.getItem("ac_employee_portal_v3");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.employeeName) { setEmployeeName(data.employeeName); setNameInput(data.employeeName); }
        if (data.startDate) { setStartDate(data.startDate); setDateInput(data.startDate); }
        if (data.formValues) setFormValues(data.formValues);
        if (data.chapters) setChapters(data.chapters);
        if (data.employeeName) setCurrentScreen("chapters");
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (employeeName) {
      const t = setTimeout(() => {
        localStorage.setItem("ac_employee_portal_v3", JSON.stringify({ employeeName, startDate, formValues, chapters }));
        setLastSaved(new Date());
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [employeeName, startDate, formValues, chapters]);

  const completedChapters = chapters.filter(c => c.status === "complete" || c.status === "submitted").length;
  const totalChapters = chapters.filter(c => c.formType !== null).length;
  const overallProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  const handleWelcomeSubmit = () => {
    if (!nameInput.trim()) return;
    setEmployeeName(nameInput.trim());
    setStartDate(dateInput);
    setChapters(prev => prev.map((c, i) => i === 0 ? { ...c, status: "available" as const } : c));
    setCurrentScreen("chapters");
  };

  const handleStartChapter = (chapterId: string) => {
    setActiveChapterId(chapterId);
    setChapters(prev => prev.map(c => c.id === chapterId && c.status === "available" ? { ...c, status: "in-progress" as const } : c));
    setCurrentScreen("form");
  };

  const handleSaveDraft = useCallback(async (chapterId: string, values: Record<string, string>) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter?.formType) return;
    try {
      await saveDraft.mutateAsync({
        formType: chapter.formType as any,
        formData: values,
        // Pass email as fallback auth in case cookie is not available (e.g. cross-domain)
        email: nhSession?.email ?? undefined,
      });
      toast.success("Draft saved", { duration: 2000 });
    } catch {
      // Silently fail — local storage still saves
    }
  }, [chapters, saveDraft, nhSession]);

  const handleCompleteChapter = useCallback(async (chapterId: string, values: Record<string, string>) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter?.formType) {
      // No form type (benefits) — just mark complete
      setChapters(prev => {
        return prev.map((c, i) => {
          if (c.id === chapterId) return { ...c, status: "complete" as const };
          const prevChapter = prev[i - 1];
          if (prevChapter?.id === chapterId && c.status === "locked") return { ...c, status: "available" as const };
          return c;
        });
      });
      setActiveChapterId(null);
      setCurrentScreen("chapters");
      return;
    }

    try {
      await submitForm.mutateAsync({
        formType: chapter.formType as any,
        formData: values,
        // Pass email as fallback auth in case cookie is not available (e.g. cross-domain)
        email: nhSession?.email ?? undefined,
      });
      setChapters(prev => {
        return prev.map((c, i) => {
          if (c.id === chapterId) return { ...c, status: "submitted" as const };
          const prevChapter = prev[i - 1];
          if (prevChapter?.id === chapterId && c.status === "locked") return { ...c, status: "available" as const };
          return c;
        });
      });
      setActiveChapterId(null);
      setCurrentScreen("chapters");
      toast.success(`"${chapter.title}" submitted for review!`, { duration: 3500 });
    } catch (err) {
      toast.error("Failed to submit. Your draft has been saved locally — please try again.");
    }
  }, [chapters, submitForm]);

  const activeChapter = chapters.find(c => c.id === activeChapterId);

  return (
    <div className="min-h-screen" style={{ backgroundColor: AC.bg, fontFamily: AC.body, color: AC.fg }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: AC.nav, borderColor: AC.border, backdropFilter: "blur(12px)" }}>
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between h-16">
          <img
            src="/manus-storage/AptCorpShimmer_nobg_db1667d2.gif"
            alt="ApartmentCorp"
            className="h-8 w-auto object-contain"
            style={{ maxWidth: "160px" }}
          />
          {currentScreen !== "welcome" && (
            <div className="flex items-center gap-4">
              {lastSaved && (
                <span className="hidden sm:flex items-center gap-1.5 text-xs" style={{ color: AC.fgSubtle }}>
                  <Save className="w-3 h-3" /> Saved
                </span>
              )}
              <div className="flex items-center gap-2.5 text-xs" style={{ color: AC.fgMuted }}>
                <span>{completedChapters}/{totalChapters}</span>
                <div className="w-24 h-1 rounded-full overflow-hidden" style={{ backgroundColor: AC.borderStrong }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${overallProgress}%`, backgroundColor: AC.teal }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {currentScreen === "welcome" && (
          <WelcomeScreen key="welcome" nameInput={nameInput} dateInput={dateInput}
            onNameChange={setNameInput} onDateChange={setDateInput} onSubmit={handleWelcomeSubmit} />
        )}
        {currentScreen === "chapters" && (
          <ChaptersScreen key="chapters" employeeName={employeeName} startDate={startDate}
            chapters={chapters} completedChapters={completedChapters} totalChapters={totalChapters}
            onStartChapter={handleStartChapter}
            onViewLogins={() => setCurrentScreen("logins")}
            onViewTraining={() => setCurrentScreen("training")} />
        )}
        {currentScreen === "logins" && (
          <MyLoginsScreen key="logins" onBack={() => setCurrentScreen("chapters")} />
        )}
        {currentScreen === "training" && (
          <PropertyMaxTrainingScreen key="training" onBack={() => setCurrentScreen("chapters")} />
        )}
        {currentScreen === "form" && activeChapter && (
          <FormScreen key={`form-${activeChapter.id}`} chapter={activeChapter}
            formValues={formValues[activeChapter.id] || {}}
            onFieldChange={(fieldId, value) => setFormValues(prev => ({
              ...prev, [activeChapter.id]: { ...(prev[activeChapter.id] || {}), [fieldId]: value }
            }))}
            onSaveDraft={() => handleSaveDraft(activeChapter.id, formValues[activeChapter.id] || {})}
            onBack={() => { setActiveChapterId(null); setCurrentScreen("chapters"); }}
            onComplete={(values) => handleCompleteChapter(activeChapter.id, values)}
            dynamicOptions={{ positions: positionsList ?? [], properties: (buildingsList ?? []).map(b => b.name) }} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Welcome Screen ────────────────────────────────────────────────────────────
function WelcomeScreen({ nameInput, dateInput, onNameChange, onDateChange, onSubmit }: {
  nameInput: string; dateInput: string;
  onNameChange: (v: string) => void; onDateChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4 }} className="min-h-[calc(100vh-64px)]">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
        <img
          src="/manus-storage/city-skyline_be9337ce.jpg"
          alt="ApartmentCorp community"
          className="w-full h-72 object-cover"
          style={{ filter: "brightness(0.45)" }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <div className="flex justify-center mb-4">
              <div className="w-10 h-0.5 rounded-full" style={{ backgroundColor: AC.teal }} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold text-white mb-3" style={{ fontFamily: AC.heading }}>
              Welcome to <em style={{ color: AC.teal, fontStyle: "italic" }}>ApartmentCorp</em>
            </h1>
            <p className="text-base" style={{ color: "oklch(0.80 0.01 220)" }}>
              We're so glad you're here. Let's get you set up.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-lg mx-auto px-4 -mt-8 pb-16">
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35, duration: 0.5 }}
          className="rounded-2xl shadow-2xl p-8"
          style={{ backgroundColor: AC.bgCard, border: `1px solid ${AC.borderStrong}` }}>
          <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: AC.heading, color: AC.fg }}>
            Before we begin
          </h2>
          <p className="text-sm mb-6" style={{ color: AC.fgMuted }}>
            This portal guides you through onboarding step by step. Save and return anytime.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: AC.fgMuted }}>
                Your Full Name
              </label>
              <input type="text" value={nameInput} onChange={e => onNameChange(e.target.value)}
                placeholder="First and last name"
                className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none"
                style={{ backgroundColor: AC.bgRaised, border: `1px solid ${AC.border}`, color: AC.fg }}
                onFocus={e => (e.target.style.borderColor = AC.teal)}
                onBlur={e => (e.target.style.borderColor = AC.border)}
                onKeyDown={e => e.key === "Enter" && onSubmit()} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: AC.fgMuted }}>
                Your Start Date
              </label>
              <input type="date" value={dateInput} onChange={e => onDateChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none"
                style={{ backgroundColor: AC.bgRaised, border: `1px solid ${AC.border}`, color: AC.fg, colorScheme: "dark" }}
                onFocus={e => (e.target.style.borderColor = AC.teal)}
                onBlur={e => (e.target.style.borderColor = AC.border)} />
            </div>
          </div>

          <button onClick={onSubmit} disabled={!nameInput.trim()}
            className="mt-6 w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ backgroundColor: AC.teal, color: AC.bg }}>
            Begin My Onboarding →
          </button>

          <div className="mt-4 flex items-start gap-2 text-xs" style={{ color: AC.fgSubtle }}>
            <Save className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Progress saves automatically. Close this tab and return anytime.</span>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-5 rounded-xl p-5"
          style={{ backgroundColor: AC.bgCard, border: `1px solid ${AC.border}` }}>
          <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: AC.heading, color: AC.fg }}>What to expect</h3>
          <div className="space-y-2.5">
            {[
              ["📋", "6 chapters — complete them in order"],
              ["⏱️", "About 60–90 minutes total, or do it in pieces"],
              ["💾", "Auto-saves as you go — no lost progress"],
              ["🔒", "Your information is secure and encrypted"],
              ["✅", "Each chapter goes to your manager for approval"],
            ].map(([icon, text], i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm" style={{ color: AC.fgMuted }}>
                <span className="text-base flex-shrink-0">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Chapters Screen ───────────────────────────────────────────────────────────
function ChaptersScreen({ employeeName, startDate, chapters, completedChapters, totalChapters, onStartChapter, onViewLogins, onViewTraining }: {
  employeeName: string; startDate: string; chapters: Chapter[];
  completedChapters: number; totalChapters: number; onStartChapter: (id: string) => void;
  onViewLogins: () => void;
  onViewTraining: () => void;
}) {
  const firstName = employeeName.split(" ")[0];
  const allComplete = completedChapters === totalChapters && totalChapters > 0;

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="max-w-3xl mx-auto px-4 py-10 pb-16">
      {/* Greeting */}
      <div className="mb-8">
        <div className="w-10 h-0.5 rounded-full mb-4" style={{ backgroundColor: AC.teal }} />
        <h1 className="text-3xl sm:text-4xl font-semibold mb-2" style={{ fontFamily: AC.heading, color: AC.fg }}>
          {allComplete ? `You did it, ${firstName}! 🎉` : `Welcome, ${firstName}!`}
        </h1>
        <p className="text-sm" style={{ color: AC.fgMuted }}>
          {allComplete
            ? "Your onboarding paperwork is complete. We can't wait to see you on your first day!"
            : startDate
            ? `Your first day is ${new Date(startDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}. Let's get everything ready.`
            : "Work through each chapter below in order."}
        </p>
      </div>

      {/* Journey path */}
      <div className="flex items-center gap-1 overflow-x-auto pb-3 mb-8 scrollbar-none">
        {chapters.map((chapter, i) => (
          <div key={chapter.id} className="flex items-center gap-1 flex-shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
              style={{
                backgroundColor: chapter.status === "complete" || chapter.status === "submitted" ? AC.teal :
                  chapter.status === "in-progress" ? chapter.accentColor :
                  chapter.status === "available" ? AC.bgRaised : AC.bgCard,
                color: chapter.status === "complete" || chapter.status === "submitted" || chapter.status === "in-progress" ? AC.bg : AC.fgMuted,
                border: chapter.status === "available" ? `1.5px solid ${chapter.accentColor}` : `1px solid ${AC.border}`,
              }}
              title={chapter.title}>
              {chapter.status === "complete" || chapter.status === "submitted" ? "✓" : chapter.number}
            </div>
            {i < chapters.length - 1 && (
              <div className="w-5 h-px flex-shrink-0"
                style={{ backgroundColor: chapters[i + 1].status !== "locked" ? AC.teal : AC.border }} />
            )}
          </div>
        ))}
        <span className="ml-3 text-xs" style={{ color: AC.fgSubtle }}>{completedChapters}/{totalChapters} done</span>
      </div>

      {/* Chapter cards */}
      <div className="space-y-3">
        {chapters.map((chapter, i) => (
          <ChapterCard key={chapter.id} chapter={chapter} index={i} onStart={onStartChapter} />
        ))}
      </div>

      {/* PropertyMAX Training button */}
      <button
        onClick={onViewTraining}
        className="mt-4 w-full flex items-center justify-between gap-3 p-4 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
        style={{ backgroundColor: AC.bgCard, border: `1px solid oklch(0.55 0.14 195 / 0.5)`, color: AC.fg }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "oklch(0.65 0.18 195)"; e.currentTarget.style.backgroundColor = "oklch(0.20 0.07 258)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "oklch(0.55 0.14 195 / 0.5)"; e.currentTarget.style.backgroundColor = AC.bgCard; }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "oklch(0.22 0.10 195)" }}>
            <span className="text-base">🏠</span>
          </div>
          <div className="text-left">
            <div className="font-semibold" style={{ fontFamily: AC.heading }}>PropertyMAX.ai Training</div>
            <div className="text-xs mt-0.5" style={{ color: AC.fgMuted }}>Complete your platform training checklist</div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: AC.fgSubtle }} />
      </button>

      {/* My Logins button */}
      <button
        onClick={onViewLogins}
        className="mt-6 w-full flex items-center justify-between gap-3 p-4 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
        style={{ backgroundColor: AC.bgCard, border: `1px solid oklch(0.55 0.14 40 / 0.5)`, color: AC.fg }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "oklch(0.65 0.18 40)"; e.currentTarget.style.backgroundColor = "oklch(0.20 0.07 258)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "oklch(0.55 0.14 40 / 0.5)"; e.currentTarget.style.backgroundColor = AC.bgCard; }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "oklch(0.22 0.10 40)" }}>
            <KeyRound className="w-4 h-4" style={{ color: "oklch(0.72 0.18 40)" }} />
          </div>
          <div className="text-left">
            <div className="font-semibold" style={{ fontFamily: AC.heading }}>My Platform Logins</div>
            <div className="text-xs mt-0.5" style={{ color: AC.fgMuted }}>View your assigned usernames &amp; passwords</div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: AC.fgSubtle }} />
      </button>

      {/* Help */}
      <div className="mt-4 flex items-start gap-3 p-4 rounded-xl text-sm"
        style={{ backgroundColor: AC.bgCard, border: `1px solid ${AC.border}`, color: AC.fgMuted }}>
        <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: AC.teal }} />
        <span>
          Questions? Contact HR at{" "}
          <a href="mailto:hr@apartmentcorp.com" className="underline font-medium" style={{ color: AC.teal }}>
            hr@apartmentcorp.com
          </a>
        </span>
      </div>
    </motion.div>
  );
}

// ── Chapter Card ──────────────────────────────────────────────────────────────
function ChapterCard({ chapter, index, onStart }: { chapter: Chapter; index: number; onStart: (id: string) => void }) {
  const isLocked = chapter.status === "locked";
  const isComplete = chapter.status === "complete" || chapter.status === "submitted";
  const isSubmitted = chapter.status === "submitted";
  const isAvailable = chapter.status === "available" || chapter.status === "in-progress";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="rounded-xl border overflow-hidden transition-all"
      style={{
        backgroundColor: AC.bgCard,
        borderColor: isComplete ? AC.teal + "44" : isAvailable ? chapter.accentColor + "44" : AC.border,
        opacity: isLocked ? 0.6 : 1,
      }}>
      <div className="flex items-start gap-4 p-5">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: isComplete ? AC.teal + "18" : isLocked ? AC.bgRaised : chapter.accentColor + "18" }}>
          {isComplete ? "✅" : isLocked ? "🔒" : chapter.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-base" style={{ fontFamily: AC.heading, color: isLocked ? AC.fgMuted : AC.fg }}>
                {chapter.title}
              </div>
              <div className="text-xs mt-0.5" style={{ color: AC.fgSubtle }}>{chapter.subtitle}</div>
            </div>
            {isComplete ? (
              <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ backgroundColor: AC.teal + "18", color: AC.teal }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> {isSubmitted ? "Submitted" : "Complete"}
              </span>
            ) : isLocked ? (
              <span className="text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ backgroundColor: AC.bgRaised, color: AC.fgSubtle }}>Locked</span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ backgroundColor: chapter.accentColor + "18", color: chapter.accentColor }}>
                <Clock className="w-3 h-3" /> ~{chapter.estimatedMinutes} min
              </span>
            )}
          </div>

          <p className="text-sm mt-2 leading-relaxed" style={{ color: isLocked ? AC.fgSubtle : AC.fgMuted }}>
            {chapter.description}
          </p>

          {isAvailable && (
            <button onClick={() => onStart(chapter.id)}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium transition-all active:scale-[0.97]"
              style={{ color: chapter.accentColor }}>
              {chapter.status === "in-progress" ? "Continue" : "Start"} this chapter
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {chapter.status === "in-progress" && (
        <div className="h-0.5" style={{ backgroundColor: AC.border }}>
          <div className="h-full w-1/3 rounded-full" style={{ backgroundColor: chapter.accentColor }} />
        </div>
      )}
    </motion.div>
  );
}

// ── Form Screen ───────────────────────────────────────────────────────────────
function FormScreen({ chapter, formValues, onFieldChange, onSaveDraft, onBack, onComplete, dynamicOptions }: {
  chapter: Chapter; formValues: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  onSaveDraft: () => void;
  onBack: () => void;
  onComplete: (values: Record<string, string>) => void;
  dynamicOptions?: { positions: string[]; properties: string[] };
}) {
  const [showCompleteOverlay, setShowCompleteOverlay] = useState(false);
  const [localValues, setLocalValues] = useState<Record<string, string>>(formValues);

  const handleFieldChange = (fieldId: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [fieldId]: value }));
    onFieldChange(fieldId, value);
  };

  const allRequiredFilled = chapter.forms.every(group =>
    group.fields.filter(f => f.required).every(f => (localValues[f.id] || "").trim() !== "")
  );

  const handleComplete = () => {
    if (chapter.forms.length === 0) {
      toast.info("This section will be available once configured by HR.");
      return;
    }
    setShowCompleteOverlay(true);
    setTimeout(() => {
      setShowCompleteOverlay(false);
      onComplete(localValues);
    }, 2200);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="max-w-2xl mx-auto px-4 py-8 pb-20">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-6 transition-all hover:opacity-70"
        style={{ color: AC.fgMuted }}>
        ← Back to all chapters
      </button>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: chapter.accentColor + "18", border: `1px solid ${chapter.accentColor}33` }}>
          {chapter.icon}
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: chapter.accentColor }}>
            Chapter {chapter.number}
          </div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: AC.heading, color: AC.fg }}>
            {chapter.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: AC.fgMuted }}>{chapter.description}</p>
        </div>
      </div>

      {chapter.forms.length === 0 ? (
        <div className="rounded-2xl p-10 text-center border"
          style={{ borderColor: AC.border, backgroundColor: AC.bgCard }}>
          <div className="text-4xl mb-3">📄</div>
          <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: AC.heading, color: AC.fg }}>
            {chapter.id === "maintenance_test" ? "Maintenance Test — Coming Soon" : "Forms Coming Soon"}
          </h3>
          <p className="text-sm" style={{ color: AC.fgMuted }}>
            {chapter.id === "maintenance_test"
              ? "Your maintenance skills assessment will be available once your position is confirmed by HR."
              : "The forms for this chapter are being prepared. HR will notify you when they're ready."}
          </p>
          <button onClick={onBack} className="mt-5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.97]"
            style={{ backgroundColor: AC.teal, color: AC.bg }}>
            ← Back to chapters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {chapter.forms.map((group, gi) => (
            <motion.div key={group.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.08, duration: 0.35 }}
              className="rounded-2xl p-6 border"
              style={{ backgroundColor: AC.bgCard, borderColor: AC.border }}>
              <h2 className="text-base font-semibold mb-5 pb-3 border-b"
                style={{ fontFamily: AC.heading, color: AC.fg, borderColor: AC.border }}>
                {group.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.fields.map(field => {
                  // Resolve dynamic options for position and property dropdowns
                  let resolvedField = field;
                  if (field.id === "position_applied" && dynamicOptions?.positions.length) {
                    resolvedField = { ...field, options: dynamicOptions.positions };
                  } else if (field.id === "property_applied" && dynamicOptions?.properties.length) {
                    resolvedField = { ...field, options: dynamicOptions.properties };
                  }
                  return (
                    <FormField key={field.id} field={resolvedField}
                      value={localValues[field.id] || ""}
                      onChange={v => handleFieldChange(field.id, v)}
                      accentColor={chapter.accentColor} />
                  );
                })}
              </div>
            </motion.div>
          ))}

          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <p className="text-xs" style={{ color: AC.fgSubtle }}>
                {allRequiredFilled ? "✓ All required fields are filled in" : "Fill in all required fields to continue"}
              </p>
              <button onClick={onSaveDraft}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-[0.97]"
                style={{ backgroundColor: AC.bgRaised, color: AC.fgMuted, border: `1px solid ${AC.border}` }}>
                <Save className="w-3 h-3" /> Save Draft
              </button>
            </div>
            <button onClick={handleComplete} disabled={!allRequiredFilled}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-40"
              style={{ backgroundColor: chapter.accentColor, color: AC.bg }}>
              <Send className="w-4 h-4" /> Submit for Review
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showCompleteOverlay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "oklch(0.10 0.06 258 / 0.92)" }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-center px-8">
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.6, delay: 0.2 }}
                className="text-6xl mb-4">📤</motion.div>
              <h2 className="text-2xl font-semibold text-white mb-2" style={{ fontFamily: AC.heading }}>
                Submitted for Review!
              </h2>
              <p className="text-base" style={{ color: AC.fgMuted }}>"{chapter.title}" — sent to your manager</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Form Field ────────────────────────────────────────────────────────────────
function FormField({ field, value, onChange, accentColor }: {
  field: FormFieldDef; value: string; onChange: (v: string) => void; accentColor: string;
}) {
  const [focused, setFocused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const isFullWidth = field.fullWidth || field.type === "textarea" || field.type === "checkbox" || field.type === "radio" || field.type === "signature";

  // Required field state
  const isFilled = value.trim() !== "";
  const isRequiredEmpty = field.required && !isFilled;
  const isRequiredFilled = field.required && isFilled;

  // Neon orange when required+empty, neon green when required+filled, accent when focused
  const NEON_ORANGE = "oklch(0.72 0.22 38)";
  const NEON_GREEN  = "oklch(0.78 0.22 142)";
  const borderColor = focused
    ? (isRequiredFilled ? NEON_GREEN : isRequiredEmpty ? NEON_ORANGE : accentColor)
    : isRequiredFilled ? NEON_GREEN
    : isRequiredEmpty ? NEON_ORANGE
    : AC.border;
  const glowColor = isRequiredFilled ? `${NEON_GREEN}28` : isRequiredEmpty ? `${NEON_ORANGE}28` : `${accentColor}22`;

  const inputStyle = {
    backgroundColor: AC.bgRaised,
    borderColor,
    color: AC.fg,
    outline: "none",
    boxShadow: (focused || isRequiredEmpty || isRequiredFilled) ? `0 0 0 2px ${glowColor}` : "none",
    colorScheme: "dark" as const,
  };

  return (
    <div className={isFullWidth ? "sm:col-span-2" : ""}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest flex items-center gap-1.5" style={{ color: AC.fgMuted }}>
          {field.type !== "checkbox" && field.label}
          {field.required && field.type !== "checkbox" && !isRequiredFilled && <span className="ml-0.5" style={{ color: NEON_ORANGE }}>*</span>}
          {isRequiredFilled && field.type !== "checkbox" && (
            <span className="inline-flex items-center gap-0.5 text-xs normal-case tracking-normal font-semibold" style={{ color: NEON_GREEN }}>
              <CheckCircle2 className="w-3 h-3" />
            </span>
          )}
          {field.sensitive && <span className="ml-1.5 text-xs normal-case tracking-normal font-normal" style={{ color: AC.fgSubtle }}>🔒</span>}
        </label>
        {field.helpText && field.type !== "checkbox" && (
          <button onClick={() => setShowHelp(!showHelp)} className="text-xs flex items-center gap-0.5 transition-all"
            style={{ color: showHelp ? accentColor : AC.fgSubtle }}>
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showHelp && field.helpText && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
          className="mb-2 text-xs px-3 py-2 rounded-lg"
          style={{ backgroundColor: accentColor + "12", color: AC.fgMuted }}>
          {field.helpText}
        </motion.div>
      )}

      {field.type === "select" ? (
        <select value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full px-3 py-2.5 rounded-xl border text-sm transition-all"
          style={{ ...inputStyle, borderColor }}>
          <option value="">Select...</option>
          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : field.type === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={field.placeholder} rows={3}
          className="w-full px-3 py-2.5 rounded-xl border text-sm transition-all resize-none"
          style={inputStyle} />
      ) : field.type === "radio" && field.options ? (
        <div className="flex flex-wrap gap-2 mt-1">
          {field.options.map(opt => (
            <button key={opt} onClick={() => onChange(opt)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all"
              style={{
                backgroundColor: value === opt ? accentColor : AC.bgRaised,
                borderColor: value === opt ? accentColor : (isRequiredEmpty ? NEON_ORANGE : AC.border),
                color: value === opt ? AC.bg : AC.fgMuted,
                boxShadow: isRequiredEmpty && value !== opt ? `0 0 0 2px ${NEON_ORANGE}28` : "none",
              }}>{opt}</button>
          ))}
        </div>
      ) : field.type === "checkbox" ? (
        <div className="flex items-start gap-3 mt-1">
          <button onClick={() => onChange(value === "true" ? "" : "true")}
            className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5"
            style={{
              backgroundColor: value === "true" ? (isRequiredFilled ? NEON_GREEN : accentColor) : "transparent",
              borderColor: value === "true" ? (isRequiredFilled ? NEON_GREEN : accentColor) : (isRequiredEmpty ? NEON_ORANGE : AC.border),
              boxShadow: isRequiredEmpty ? `0 0 0 2px ${NEON_ORANGE}28` : isRequiredFilled ? `0 0 0 2px ${NEON_GREEN}28` : "none",
            }}>
            {value === "true" && <CheckCircle2 className="w-3 h-3" style={{ color: AC.bg }} />}
          </button>
          <span className="text-sm leading-relaxed" style={{ color: AC.fgMuted }}>{field.placeholder}</span>
        </div>
      ) : field.type === "signature" ? (
        <div>
          <input type="text" value={value} onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder="Type your full legal name"
            className="w-full px-3 py-2.5 rounded-xl border text-sm transition-all"
            style={{ ...inputStyle, fontStyle: "italic", fontSize: "1.05rem" }} />
          {value && (
            <p className="text-xs mt-1" style={{ color: AC.fgSubtle }}>
              ✍️ Electronic signature: <em style={{ color: accentColor }}>{value}</em>
            </p>
          )}
        </div>
      ) : (
        <input
          type={field.type === "ssn" ? "password" : field.type === "number" ? "number" : field.type}
          value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={field.placeholder}
          className="w-full px-3 py-2.5 rounded-xl border text-sm transition-all"
          style={inputStyle} />
      )}
    </div>
  );
}

// ── My Logins Screen ────────────────────────────────────────────────────────
function MyLoginsScreen({ onBack }: { onBack: () => void }) {
  const { data: credentials, isLoading } = trpc.credentials.getMyCredentials.useQuery();
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const toggleReveal = (id: string) => setRevealed(prev => ({ ...prev, [id]: !prev[id] }));
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const assignedPlatforms = (credentials ?? []).filter(c => c.username);

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.35 }} className="min-h-[calc(100vh-64px)] px-4 py-8 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
          style={{ backgroundColor: AC.bgCard, border: `1px solid ${AC.border}`, color: AC.fgMuted }}>
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: AC.heading, color: AC.fg }}>My Platform Logins</h1>
          <p className="text-sm mt-0.5" style={{ color: AC.fgMuted }}>Your assigned credentials for company platforms</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: AC.teal, borderTopColor: "transparent" }} />
        </div>
      ) : assignedPlatforms.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: AC.bgCard, border: `1px solid ${AC.border}` }}>
          <KeyRound className="w-12 h-12 mx-auto mb-4" style={{ color: AC.fgSubtle }} />
          <p className="font-semibold text-lg" style={{ color: AC.fg }}>No logins assigned yet</p>
          <p className="text-sm mt-2" style={{ color: AC.fgMuted }}>Your IT administrator will assign your platform credentials once your onboarding is complete.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignedPlatforms.map((cred) => (
            <div key={cred.platform} className="rounded-2xl p-4" style={{ backgroundColor: AC.bgCard, border: `1px solid ${AC.border}` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "oklch(0.22 0.10 40)" }}>
                  <KeyRound className="w-4 h-4" style={{ color: "oklch(0.72 0.18 40)" }} />
                </div>
                <span className="font-semibold text-base" style={{ fontFamily: AC.heading, color: AC.fg }}>{cred.platform}</span>
              </div>

              {/* Username */}
              <div className="mb-2">
                <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: AC.fgSubtle }}>Username</div>
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: AC.bgRaised, color: AC.fg }}>{cred.username}</span>
                  <button onClick={() => copyToClipboard(cred.username ?? "", `${cred.platform}-user`)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95"
                    style={{ backgroundColor: AC.bgRaised, color: copied === `${cred.platform}-user` ? "oklch(0.78 0.22 142)" : AC.fgMuted }}>
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Password */}
              {cred.password && (
                <div className="mb-2">
                  <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: AC.fgSubtle }}>Password</div>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-sm px-3 py-2 rounded-lg font-mono" style={{ backgroundColor: AC.bgRaised, color: AC.fg }}>
                      {revealed[cred.platform] ? cred.password : "••••••••••"}
                    </span>
                    <button onClick={() => toggleReveal(cred.platform)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95"
                      style={{ backgroundColor: AC.bgRaised, color: AC.fgMuted }}>
                      {revealed[cred.platform] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => copyToClipboard(cred.password ?? "", `${cred.platform}-pass`)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95"
                      style={{ backgroundColor: AC.bgRaised, color: copied === `${cred.platform}-pass` ? "oklch(0.78 0.22 142)" : AC.fgMuted }}>
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Notes */}
              {cred.notes && (
                <div className="mt-2 text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "oklch(0.20 0.06 258)", color: AC.fgMuted }}>
                  📝 {cred.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center text-xs" style={{ color: AC.fgSubtle }}>
        🔒 Keep your credentials secure. Do not share them with anyone.
      </div>
    </motion.div>
  );
}

// ── PropertyMAX Training Screen Wrapper ─────────────────────────────────────
function PropertyMaxTrainingScreen({ onBack }: { onBack: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.35 }} className="min-h-[calc(100vh-64px)]">
      <PropertyMaxTraining onBack={onBack} />
    </motion.div>
  );
}

// ── Auth-gated export ─────────────────────────────────────────────────────────
export default function EmployeePortal() {
  return (
    <NewHireAuth>
      <EmployeePortalContent />
    </NewHireAuth>
  );
}
