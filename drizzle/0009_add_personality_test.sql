-- Add personality_test to formType enum in form_submissions table
ALTER TABLE `form_submissions` MODIFY COLUMN `formType` enum('employment_application','confidentiality_agreement','tracking_agreement','policies_acknowledgment','direct_deposit','w4','it2104','i9','maintenance_test','personality_test') NOT NULL;
