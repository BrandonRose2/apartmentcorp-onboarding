/**
 * ApartmentCorp — I-9 Employment Eligibility Verification
 */
import { FormShell, FormSection, FormField, FormInput, FormSelect, FormRow, FormCheckbox, FormSignature } from "@/components/FormShell";

const STORAGE_KEY = "ac_form_i9";
const FOLDER_PATH = "03 - Human Resources > 01 - New Hire Onboarding > Onboarding Forms & Templates > Federal Forms";

export default function FormI9({ onBack }: { onBack?: () => void }) {
  return (
    <FormShell
      formId="i9"
      formTitle="I-9 — Employment Eligibility Verification"
      formSubtitle="Federal form required by USCIS. Must be completed within 3 business days of your start date."
      folderPath={FOLDER_PATH}
      onBack={onBack}
    >
      <div style={{ background: "oklch(0.72 0.12 220 / 0.07)", border: "1px solid oklch(0.72 0.12 220 / 0.2)", borderRadius: "8px", padding: "0.85rem 1rem", marginBottom: "1.5rem", fontFamily: "Inter, sans-serif", fontSize: "0.8rem", color: "oklch(0.72 0.12 220)" }}>
        <strong>Required:</strong> You must present original, unexpired documents to your employer. Acceptable documents are listed in the Lists of Acceptable Documents (List A, B, or C). HR will verify your documents in person.
      </div>

      <FormSection title="Section 1 — Employee Information (Complete on or before first day)">
        <FormRow cols={3}>
          <FormField label="Last Name (Family Name)" required>
            <FormInput storageKey={STORAGE_KEY} fieldKey="last_name" placeholder="Last name" />
          </FormField>
          <FormField label="First Name (Given Name)" required>
            <FormInput storageKey={STORAGE_KEY} fieldKey="first_name" placeholder="First name" />
          </FormField>
          <FormField label="Middle Initial">
            <FormInput storageKey={STORAGE_KEY} fieldKey="middle_initial" placeholder="M.I." />
          </FormField>
        </FormRow>
        <FormField label="Other Last Names Used (if any)">
          <FormInput storageKey={STORAGE_KEY} fieldKey="other_names" placeholder="N/A if none" />
        </FormField>
        <FormField label="Address (Street Number and Name)" required>
          <FormInput storageKey={STORAGE_KEY} fieldKey="address" placeholder="123 Main Street" />
        </FormField>
        <FormRow cols={3}>
          <FormField label="Apt. Number">
            <FormInput storageKey={STORAGE_KEY} fieldKey="apt" placeholder="Apt #" />
          </FormField>
          <FormField label="City or Town" required>
            <FormInput storageKey={STORAGE_KEY} fieldKey="city" placeholder="City" />
          </FormField>
          <FormField label="State" required>
            <FormSelect storageKey={STORAGE_KEY} fieldKey="state" placeholder="State" options={["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"]} />
          </FormField>
        </FormRow>
        <FormRow cols={2}>
          <FormField label="ZIP Code" required>
            <FormInput storageKey={STORAGE_KEY} fieldKey="zip" placeholder="00000" />
          </FormField>
          <FormField label="Date of Birth" required>
            <FormInput storageKey={STORAGE_KEY} fieldKey="dob" type="date" />
          </FormField>
        </FormRow>
        <FormRow cols={2}>
          <FormField label="U.S. Social Security Number" hint="Required if your employer participates in E-Verify">
            <FormInput storageKey={STORAGE_KEY} fieldKey="ssn" placeholder="XXX-XX-XXXX" type="password" />
          </FormField>
          <FormField label="Employee's Email Address">
            <FormInput storageKey={STORAGE_KEY} fieldKey="email" placeholder="you@example.com" type="email" />
          </FormField>
        </FormRow>
        <FormField label="Employee's Telephone Number">
          <FormInput storageKey={STORAGE_KEY} fieldKey="phone" placeholder="(000) 000-0000" type="tel" />
        </FormField>
      </FormSection>

      <FormSection title="Citizenship / Immigration Status">
        <FormField label="I attest, under penalty of perjury, that I am:" required>
          <FormSelect storageKey={STORAGE_KEY} fieldKey="citizenship_status" placeholder="Select status" options={[
            "A citizen of the United States",
            "A noncitizen national of the United States",
            "A lawful permanent resident",
            "An alien authorized to work until (date below)"
          ]} />
        </FormField>
        <FormField label="If lawful permanent resident — Alien Registration Number (A-Number)" hint="Leave blank if not applicable">
          <FormInput storageKey={STORAGE_KEY} fieldKey="alien_reg_number" placeholder="A-000000000" />
        </FormField>
        <FormField label="If authorized alien — Expiration Date of Work Authorization" hint="Leave blank if not applicable">
          <FormInput storageKey={STORAGE_KEY} fieldKey="work_auth_expiry" type="date" />
        </FormField>
      </FormSection>

      <FormSection title="Section 1 Signature">
        <div style={{ background: "oklch(0.55 0.14 40 / 0.08)", border: "1px solid oklch(0.55 0.14 40 / 0.3)", borderRadius: "6px", padding: "0.75rem 1rem", marginBottom: "0.75rem", fontFamily: "Inter, sans-serif", fontSize: "0.78rem", color: "oklch(0.75 0.08 40)" }}>
          I attest, under penalty of perjury, that I am aware that federal law provides for imprisonment and/or fines for false statements or use of false documents in connection with the completion of this form.
        </div>
        <FormCheckbox storageKey={STORAGE_KEY} fieldKey="attest" label="I confirm the above attestation is true and correct to the best of my knowledge." />
        <FormField label="Employee Signature" required>
          <FormSignature storageKey={STORAGE_KEY} fieldKey="signature" />
        </FormField>
        <FormField label="Today's Date" required>
          <FormInput storageKey={STORAGE_KEY} fieldKey="date_signed" type="date" />
        </FormField>
      </FormSection>

      <FormSection title="Section 2 — Employer Review (HR Completes)">
        <div style={{ background: "oklch(0.18 0.06 258)", border: "1px dashed oklch(0.72 0.12 220 / 0.3)", borderRadius: "8px", padding: "1rem", fontFamily: "Inter, sans-serif", fontSize: "0.82rem", color: "oklch(0.65 0.04 250)" }}>
          <strong style={{ color: "oklch(0.72 0.12 220)" }}>HR/Employer Section</strong> — To be completed by ApartmentCorp HR within 3 business days of the employee's first day of employment. HR will examine original documents and record the document information below.
        </div>
        <FormRow cols={2}>
          <FormField label="Document Title (List A, B, or C)">
            <FormInput storageKey={STORAGE_KEY} fieldKey="doc_title" placeholder="e.g., U.S. Passport" />
          </FormField>
          <FormField label="Issuing Authority">
            <FormInput storageKey={STORAGE_KEY} fieldKey="issuing_authority" placeholder="e.g., U.S. Department of State" />
          </FormField>
        </FormRow>
        <FormRow cols={3}>
          <FormField label="Document Number">
            <FormInput storageKey={STORAGE_KEY} fieldKey="doc_number" placeholder="Document #" />
          </FormField>
          <FormField label="Expiration Date">
            <FormInput storageKey={STORAGE_KEY} fieldKey="doc_expiry" type="date" />
          </FormField>
          <FormField label="Employee's First Day of Employment">
            <FormInput storageKey={STORAGE_KEY} fieldKey="start_date" type="date" />
          </FormField>
        </FormRow>
        <FormField label="HR Representative Signature">
          <FormSignature storageKey={STORAGE_KEY} fieldKey="hr_signature" />
        </FormField>
        <FormRow cols={2}>
          <FormField label="HR Representative Name">
            <FormInput storageKey={STORAGE_KEY} fieldKey="hr_name" placeholder="Full name" />
          </FormField>
          <FormField label="HR Representative Title">
            <FormInput storageKey={STORAGE_KEY} fieldKey="hr_title" placeholder="e.g., HR Manager" />
          </FormField>
        </FormRow>
      </FormSection>
    </FormShell>
  );
}
