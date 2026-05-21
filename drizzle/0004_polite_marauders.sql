CREATE TABLE `propertymax_training_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`newHireId` int NOT NULL,
	`itemId` varchar(16) NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`signature` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `propertymax_training_progress_id` PRIMARY KEY(`id`)
);
