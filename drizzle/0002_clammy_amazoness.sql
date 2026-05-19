CREATE TABLE `buildings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`region` varchar(64),
	`managerName` varchar(255),
	`managerEmail` varchar(320),
	`regionalManagerName` varchar(255),
	`regionalManagerEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `buildings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `form_approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`newHireId` int NOT NULL,
	`approverName` varchar(255),
	`approverEmail` varchar(320),
	`approverRole` enum('manager','hr') NOT NULL,
	`action` enum('approved','rejected') NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `form_approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `form_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`newHireId` int NOT NULL,
	`formType` enum('employment_application','confidentiality_agreement','tracking_agreement','policies_acknowledgment','direct_deposit','w4','it2104','i9','maintenance_test') NOT NULL,
	`formData` json NOT NULL,
	`status` enum('draft','submitted','manager_approved','manager_rejected','hr_approved','hr_rejected') NOT NULL DEFAULT 'draft',
	`submittedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `form_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `new_hires` ADD `buildingId` int;--> statement-breakpoint
ALTER TABLE `new_hires` ADD `position` enum('leasing','maintenance','management','admin_staff','other');--> statement-breakpoint
ALTER TABLE `new_hires` ADD `onboardingStatus` enum('pending','in_progress','submitted','manager_approved','hr_approved','rejected') DEFAULT 'pending' NOT NULL;