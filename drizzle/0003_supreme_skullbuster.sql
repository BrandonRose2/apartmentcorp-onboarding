CREATE TABLE `new_hire_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`newHireId` int NOT NULL,
	`platform` varchar(64) NOT NULL,
	`required` boolean NOT NULL DEFAULT false,
	`username` varchar(255),
	`password` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `new_hire_credentials_id` PRIMARY KEY(`id`)
);
