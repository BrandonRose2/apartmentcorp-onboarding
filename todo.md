# ApartmentCorp Onboarding Portal — TODO

## Completed
- [x] Landing page with ApartmentCorp branding and passcode-protected Admin Dashboard button (3060)
- [x] New hire portal with email + passcode registration/login
- [x] Admin Dashboard with Brandon button (passcode 3698)
- [x] Useful Resources tab with Company, HR, Training, Tools sections
- [x] Company Org Chart link to Operations/Acctg/New York sheet
- [x] Apartment Corp Properties link
- [x] Company Contacts Notion link
- [x] Manager's & Assistants Contact List SharePoint link
- [x] PropertyMAX GIF in top right of landing page (clickable)
- [x] ApartmentCorp logo clickable to apartmentcorp.com
- [x] Keyboard input support for all PIN/passcode screens
- [x] Property Files tab hidden (preserved in codebase)
- [x] Ethan Fowler renamed to Ethan Cowles everywhere
- [x] Database schema: new_hires table (building, position, assigned_manager_email, status)
- [x] Database schema: form_submissions table (new_hire_id, form_type, form_data JSON, status, submitted_at)
- [x] Database schema: form_approvals table (submission_id, approver_email, approver_role, action, notes, approved_at)
- [x] Database schema: buildings table (name, region, manager_name, manager_email, regional_manager_name, regional_manager_email)
- [x] Backend: tRPC procedures for form submission (saveDraft, submit, getMyForms, getMySubmissions)
- [x] Backend: tRPC procedures for admin (assign building/position, listNewHires, getNewHireSubmissions, reviewSubmission)
- [x] Backend: tRPC procedures for approval workflow (manager approve/reject → HR approve/reject)
- [x] Backend: owner notifications on submission and approval events
- [x] Backend: buildings seeded with all ApartmentCorp properties and regional managers
- [x] New hire portal: Employment Application form (personal data, work history, skills, references, emergency contact)
- [x] New hire portal: Agreements forms (Confidentiality, Tracking/GPS, Policies Acknowledgment)
- [x] New hire portal: Payroll & Tax forms (Direct Deposit, W-4, NY IT-2104)
- [x] New hire portal: I-9 Employment Eligibility Verification form
- [x] New hire portal: Maintenance Test (unlocked only when position = maintenance role)
- [x] New hire portal: Progress tracker showing completed/pending form sections
- [x] Admin Dashboard: New Hire Review tab (list, assign building/position, review/approve/reject forms)
- [x] Unit tests for new hire auth and forms API (7 tests passing)

## Future / Backlog
- [ ] Management Test forms (PDF not yet uploaded)
- [ ] New hire credentials page (platform logins after full approval)
- [ ] Re-enable Property Files tab
- [ ] Company Websites Information button next to Document Hub
- [ ] Email delivery to regional managers / HR via Resend or SendGrid
- [ ] Useful Resources: Full packet available as downloadable PDF
