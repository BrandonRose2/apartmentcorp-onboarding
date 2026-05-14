import { FormShell, FormSection, FormField, FormInput, FormSelect, FormRow, FormCheckbox, FormSignature } from "@/components/FormShell";
const STORAGE_KEY = "ac_form_dd";
const FOLDER_PATH = "03 - Human Resources > 01 - New Hire Onboarding > Onboarding Forms & Templates > Payroll Forms";
export default function FormDirectDeposit({ onBack }: { onBack?: () => void }) {
  return (
    <FormShell formId="direct-deposit" formTitle="Direct Deposit Authorization" formSubtitle="Authorize ApartmentCorp to deposit your paycheck directly into your bank account via Paychex." folderPath={FOLDER_PATH} onBack={onBack}>
      <div style={{ background: "oklch(0.72 0.12 220 / 0.07)", border: "1px solid oklch(0.72 0.12 220 / 0.2)", borderRadius: "8px", padding: "0.85rem 1rem", marginBottom: "1.5rem", fontFamily: "Inter, sans-serif", fontSize: "0.8rem", color: "oklch(0.72 0.12 220)" }}>
        <strong>Tip:</strong> Attach a voided check or bank letter to verify your routing and account numbers. You may add up to 2 accounts.
      </div>
      <FormSection title="Employee Information">
        <FormRow cols={2}>
          <FormField label="Full Legal Name" required><FormInput storageKey={STORAGE_KEY} fieldKey="full_name" placeholder="First Last" /></FormField>
          <FormField label="Employee ID / Last 4 SSN" required><FormInput storageKey={STORAGE_KEY} fieldKey="emp_id" placeholder="XXXX" /></FormField>
        </FormRow>
        <FormRow cols={2}>
          <FormField label="Department / Property" required><FormInput storageKey={STORAGE_KEY} fieldKey="department" placeholder="e.g., Leasing — Pirates Bend" /></FormField>
          <FormField label="Start Date" required><FormInput storageKey={STORAGE_KEY} fieldKey="start_date" type="date" /></FormField>
        </FormRow>
      </FormSection>
      <FormSection title="Primary Bank Account">
        <FormRow cols={2}>
          <FormField label="Bank Name" required><FormInput storageKey={STORAGE_KEY} fieldKey="bank1_name" placeholder="Bank of America" /></FormField>
          <FormField label="Account Type" required><FormSelect storageKey={STORAGE_KEY} fieldKey="bank1_type" placeholder="Account type" options={["Checking","Savings"]} /></FormField>
        </FormRow>
        <FormRow cols={2}>
          <FormField label="Routing Number (9 digits)" required hint="Found at the bottom-left of your check"><FormInput storageKey={STORAGE_KEY} fieldKey="bank1_routing" placeholder="000000000" /></FormField>
          <FormField label="Account Number" required><FormInput storageKey={STORAGE_KEY} fieldKey="bank1_account" placeholder="Account number" type="password" /></FormField>
        </FormRow>
        <FormField label="Deposit Amount / Percentage" required hint="Enter a dollar amount or 'Remainder' for the full paycheck">
          <FormInput storageKey={STORAGE_KEY} fieldKey="bank1_amount" placeholder="Remainder (100%) or $0.00" />
        </FormField>
      </FormSection>
      <FormSection title="Secondary Bank Account (Optional)">
        <FormRow cols={2}>
          <FormField label="Bank Name"><FormInput storageKey={STORAGE_KEY} fieldKey="bank2_name" placeholder="Bank name" /></FormField>
          <FormField label="Account Type"><FormSelect storageKey={STORAGE_KEY} fieldKey="bank2_type" placeholder="Account type" options={["Checking","Savings"]} /></FormField>
        </FormRow>
        <FormRow cols={2}>
          <FormField label="Routing Number"><FormInput storageKey={STORAGE_KEY} fieldKey="bank2_routing" placeholder="000000000" /></FormField>
          <FormField label="Account Number"><FormInput storageKey={STORAGE_KEY} fieldKey="bank2_account" placeholder="Account number" type="password" /></FormField>
        </FormRow>
        <FormField label="Deposit Amount"><FormInput storageKey={STORAGE_KEY} fieldKey="bank2_amount" placeholder="$0.00" /></FormField>
      </FormSection>
      <FormSection title="Authorization & Signature">
        <div style={{ background: "oklch(0.55 0.14 40 / 0.08)", border: "1px solid oklch(0.55 0.14 40 / 0.3)", borderRadius: "6px", padding: "0.75rem 1rem", marginBottom: "0.75rem", fontFamily: "Inter, sans-serif", fontSize: "0.78rem", color: "oklch(0.75 0.08 40)" }}>
          I authorize ApartmentCorp and its payroll provider (Paychex) to initiate credit entries to my account(s) listed above. I understand this authorization will remain in effect until I provide written notice of cancellation.
        </div>
        <FormCheckbox storageKey={STORAGE_KEY} fieldKey="authorize" label="I authorize the above direct deposit arrangement." />
        <FormField label="Employee Signature" required><FormSignature storageKey={STORAGE_KEY} fieldKey="signature" /></FormField>
        <FormField label="Date" required><FormInput storageKey={STORAGE_KEY} fieldKey="date_signed" type="date" /></FormField>
      </FormSection>
    </FormShell>
  );
}
