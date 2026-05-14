import { FormShell, FormSection, FormField, FormInput, FormSelect, FormRow, FormSignature } from "@/components/FormShell";
const SK = "ac_form_ec";
const FP = "03 - Human Resources > 01 - New Hire Onboarding > Onboarding Forms & Templates > Employee Information";
export default function FormEmergencyContact({ onBack }: { onBack?: () => void }) {
  return (
    <FormShell formId="emergency-contact" formTitle="Emergency Contact & Personal Information" formSubtitle="Required for HR records. Used only in the event of a workplace emergency." folderPath={FP} onBack={onBack}>
      <FormSection title="Employee Information">
        <FormRow cols={2}><FormField label="Full Legal Name" required><FormInput storageKey={SK} fieldKey="name" placeholder="First Last" /></FormField><FormField label="Employee ID / Position" required><FormInput storageKey={SK} fieldKey="position" placeholder="e.g., Leasing Agent" /></FormField></FormRow>
        <FormRow cols={2}><FormField label="Property / Department" required><FormInput storageKey={SK} fieldKey="property" placeholder="e.g., Pirates Bend" /></FormField><FormField label="Start Date" required><FormInput storageKey={SK} fieldKey="start_date" type="date" /></FormField></FormRow>
        <FormRow cols={2}><FormField label="Personal Cell Phone" required><FormInput storageKey={SK} fieldKey="cell" placeholder="(000) 000-0000" type="tel" /></FormField><FormField label="Personal Email" required><FormInput storageKey={SK} fieldKey="email" placeholder="you@email.com" type="email" /></FormField></FormRow>
        <FormField label="Home Address" required><FormInput storageKey={SK} fieldKey="address" placeholder="123 Main St, City, State ZIP" /></FormField>
      </FormSection>
      <FormSection title="Primary Emergency Contact">
        <FormRow cols={2}><FormField label="Full Name" required><FormInput storageKey={SK} fieldKey="ec1_name" placeholder="Full name" /></FormField><FormField label="Relationship" required><FormSelect storageKey={SK} fieldKey="ec1_relationship" placeholder="Relationship" options={["Spouse","Parent","Sibling","Child","Partner","Friend","Other"]} /></FormField></FormRow>
        <FormRow cols={2}><FormField label="Primary Phone" required><FormInput storageKey={SK} fieldKey="ec1_phone" placeholder="(000) 000-0000" type="tel" /></FormField><FormField label="Alternate Phone"><FormInput storageKey={SK} fieldKey="ec1_alt_phone" placeholder="(000) 000-0000" type="tel" /></FormField></FormRow>
        <FormField label="Email Address"><FormInput storageKey={SK} fieldKey="ec1_email" placeholder="contact@email.com" type="email" /></FormField>
      </FormSection>
      <FormSection title="Secondary Emergency Contact">
        <FormRow cols={2}><FormField label="Full Name"><FormInput storageKey={SK} fieldKey="ec2_name" placeholder="Full name" /></FormField><FormField label="Relationship"><FormSelect storageKey={SK} fieldKey="ec2_relationship" placeholder="Relationship" options={["Spouse","Parent","Sibling","Child","Partner","Friend","Other"]} /></FormField></FormRow>
        <FormRow cols={2}><FormField label="Primary Phone"><FormInput storageKey={SK} fieldKey="ec2_phone" placeholder="(000) 000-0000" type="tel" /></FormField><FormField label="Alternate Phone"><FormInput storageKey={SK} fieldKey="ec2_alt_phone" placeholder="(000) 000-0000" type="tel" /></FormField></FormRow>
      </FormSection>
      <FormSection title="Medical Information (Optional)">
        <FormField label="Known Allergies or Medical Conditions" hint="This information is kept strictly confidential and used only in emergencies"><FormInput storageKey={SK} fieldKey="medical" placeholder="e.g., Penicillin allergy, diabetic" /></FormField>
        <FormField label="Blood Type"><FormSelect storageKey={SK} fieldKey="blood_type" placeholder="Select if known" options={["A+","A-","B+","B-","AB+","AB-","O+","O-","Unknown"]} /></FormField>
      </FormSection>
      <FormSection title="Signature">
        <FormField label="Employee Signature" required><FormSignature storageKey={SK} fieldKey="signature" /></FormField>
        <FormField label="Date" required><FormInput storageKey={SK} fieldKey="date_signed" type="date" /></FormField>
      </FormSection>
    </FormShell>
  );
}
