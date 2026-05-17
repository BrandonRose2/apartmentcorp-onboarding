CREATE TABLE `new_hires` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`passcode` varchar(4) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastLogin` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `new_hires_id` PRIMARY KEY(`id`),
	CONSTRAINT `new_hires_email_unique` UNIQUE(`email`)
);
