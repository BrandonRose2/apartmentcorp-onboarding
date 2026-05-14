/**
 * ApartmentCorp — W-4 Federal Employee's Withholding Certificate
 * Fillable form with auto-save, PDF export, and ecosystem folder filing.
 */

import { FormShell, FormSection, FormField, FormInput, FormSelect, FormRow, FormCheckbox, FormSignature } from "@/components/FormShell";

const STORAGE_KEY = "ac_form_w4";
const FOLDER_PATH = "03 - Human Resources > 01 - New Hire Onboarding > Onboarding Forms & Templates > Federal Forms";

export default function FormW4({ onBack }: { onBack?: () => void }) {
  return (
    <FormShell
      formId="w4"
      formTitle="W-4 — Employee's Withholding Certificate"
      formSubtitle="Federal form required for payroll tax withholding. Complete before your first paycheck."
      folderPath={FOLDER_PATH}
      onBack={onBack}
    >
      <div style={{ background: "oklch(0.72 0.12 220 / 0.07)", border: "1px solid oklch(0.72 0.12 220 / 0.2)", borderRadius: "8px", padding: "0.85rem 1rem", marginBottom: "1.5rem", fontFamily: "Inter, sans-serif", fontSize: "0.8rem", color: "oklch(0.72 0.12 220)" }}>
        <strong>Important:</strong> This form tells ApartmentCorp how much federal income tax to withhold from your paycheck. Complete Steps 1 and 5 at minimum. Steps 2–4 are optional but may improve accuracy.
      </div>

      <FormSection title="Step 1 — Personal Information">
        <FormRow cols={3}>
          <FormField label="First Name" required>
            <FormInput storageKey={STORAGE_KEY} fieldKey="first_name" placeholder="First name" />
          </FormField>
          <FormField label="Middle Initial">
            <FormInput storageKey={STORAGE_KEY} fieldKey="middle_initial" placeholder="M.I." />
          </FormField>
          <FormField label="Last Name" required>
            <FormInput storageKey={STORAGE_KEY} fieldKey="last_name" placeholder="Last name" />
          </FormField>
        </FormRow>
        <FormField label="Home Address (Street)" required>
          <FormInput storageKey={STORAGE_KEY} fieldKey="address" placeholder="123 Main Street, Apt 4B" />
        </FormField>
        <FormRow cols={3}>
          <FormField label="City" required>
            <FormInput storageKey={STORAGE_KEY} fieldKey="city" placeholder="City" />
          </FormField>
          <FormField label="State" required>
            <FormSelect storageKey={STORAGE_KEY} fieldKey="state" placeholder="State" options={["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"]} />
          </FormField>
          <FormField label="ZIP Code" required>
            <FormInput storageKey={STORAGE_KEY} fieldKey="zip" placeholder="00000" />
          </FormField>
        </FormRow>
        <FormField label="Social Security Number" required hint="Your SSN is required for tax withholding purposes and is kept confidential.">
          <FormInput storageKey={STORAGE_KEY} fieldKey="ssn" placeholder="XXX-XX-XXXX" type="password" />
        </FormField>
        <FormField label="Filing Status" required>
          <FormSelect storageKey={STORAGE_KEY} fieldKey="filing_status" placeholder="Select filing status" options={["Single or Married filing separately","Married filing jointly or Qualifying surviving spouse","Head of household"]} />
        </FormField>
      </FormSection>

      <FormSection title="Step 2 — Multiple Jobs or Spouse Works (Optional)">
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem", color: "oklch(0.65 0.04 250)", margin: "0 0 0.75rem" }}>
          Complete this step if you (1) hold more than one job at a time, or (2) are married filing jointly and your spouse also works.
        </p>
        <FormCheckbox storageKey={STORAGE_KEY} fieldKey="multiple_jobs" label="Check here if there are only two jobs total. (You may also check this box if you are married filing jointly and have only two jobs.)" />
      </FormSection>

      <FormSection title="Step 3 — Claim Dependents (Optional)">
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem", color: "oklch(0.65 0.04 250)", margin: "0 0 0.75rem" }}>
          If your total income will be $200,000 or less ($400,000 or less if married filing jointly), complete the following.
        </p>
        <FormRow cols={2}>
          <FormField label="Qualifying Children under 17 × $2,000">
            <FormInput storageKey={STORAGE_KEY} fieldKey="children_credit" placeholder="$0.00" type="number" />
          </FormField>
          <FormField label="Other Dependents × $500">
            <FormInput storageKey={STORAGE_KEY} fieldKey="other_dependents" placeholder="$0.00" type="number" />
          </FormField>
        </FormRow>
        <FormField label="Total Credits (add amounts above)">
          <FormInput storageKey={STORAGE_KEY} fieldKey="total_credits" placeholder="$0.00" type="number" />
        </FormField>
      </FormSection>

      <FormSection title="Step 4 — Other Adjustments (Optional)">
        <FormRow cols={2}>
          <FormField label="Other Income (not from jobs)" hint="e.g., interest, dividends, retirement income">
            <FormInput storageKey={STORAGE_KEY} fieldKey="other_income" placeholder="$0.00" type="number" />
          </FormField>
          <FormField label="Deductions" hint="If you expect to claim deductions other than the standard deduction">
            <FormInput storageKey={STORAGE_KEY} fieldKey="deductions" placeholder="$0.00" type="number" />
          </FormField>
        </FormRow>
        <FormField label="Extra Withholding per Pay Period" hint="Any additional tax you want withheld each pay period">
          <FormInput storageKey={STORAGE_KEY} fieldKey="extra_withholding" placeholder="$0.00" type="number" />
        </FormField>
      </FormSection>

      <FormSection title="Step 5 — Signature & Date">
        <div style={{ background: "oklch(0.55 0.14 40 / 0.08)", border: "1px solid oklch(0.55 0.14 40 / 0.3)", borderRadius: "6px", padding: "0.75rem 1rem", marginBottom: "0.75rem", fontFamily: "Inter, sans-serif", fontSize: "0.78rem", color: "oklch(0.75 0.08 40)" }}>
          Under penalties of perjury, I declare that this certificate, to the best of my knowledge and belief, is true, correct, and complete.
        </div>
        <FormField label="Electronic Signature" required>
          <FormSignature storageKey={STORAGE_KEY} fieldKey="signature" />
        </FormField>
        <FormField label="Date Signed" required>
          <FormInput storageKey={STORAGE_KEY} fieldKey="date_signed" type="date" />
        </FormField>
      </FormSection>
    </FormShell>
  );
}
