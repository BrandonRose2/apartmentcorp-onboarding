CREATE TABLE `propertymax_training_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`newHireId` int NOT NULL,
	`section` varchar(128) NOT NULL,
	`itemId` varchar(128) NOT NULL,
	`itemLabel` text NOT NULL,
	`completedAt` timestamp NOT NULL,
	`signature` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `propertymax_training_progress_id` PRIMARY KEY(`id`)
);
