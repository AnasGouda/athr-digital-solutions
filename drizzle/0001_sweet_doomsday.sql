CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(80) NOT NULL,
	`entity` varchar(80) NOT NULL,
	`entityId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blogPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`titleAr` varchar(240) NOT NULL,
	`titleEn` varchar(240) NOT NULL,
	`excerptAr` text NOT NULL,
	`excerptEn` text NOT NULL,
	`contentAr` text NOT NULL,
	`contentEn` text NOT NULL,
	`coverImage` text,
	`author` varchar(140) NOT NULL,
	`category` varchar(80) NOT NULL,
	`tags` json NOT NULL,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('DRAFT','PUBLISHED') NOT NULL DEFAULT 'PUBLISHED',
	`seoTitle` varchar(240),
	`seoDescription` text,
	CONSTRAINT `blogPosts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blogPosts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `caseStudies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(140) NOT NULL,
	`titleAr` varchar(220) NOT NULL,
	`titleEn` varchar(220) NOT NULL,
	`client` varchar(180) NOT NULL,
	`category` varchar(100) NOT NULL,
	`descriptionAr` text NOT NULL,
	`descriptionEn` text NOT NULL,
	`challengeAr` text NOT NULL,
	`challengeEn` text NOT NULL,
	`solutionAr` text NOT NULL,
	`solutionEn` text NOT NULL,
	`technologies` json NOT NULL,
	`results` json NOT NULL,
	`images` json NOT NULL,
	`projectUrl` text,
	`published` boolean NOT NULL DEFAULT true,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `caseStudies_id` PRIMARY KEY(`id`),
	CONSTRAINT `caseStudies_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `contactMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(40),
	`company` varchar(160),
	`subject` varchar(220) NOT NULL,
	`message` text NOT NULL,
	`status` enum('NEW','READ','REPLIED','ARCHIVED') NOT NULL DEFAULT 'NEW',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contactMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(220) NOT NULL,
	`category` varchar(100) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`projectId` int,
	`description` text,
	`receipt` text,
	`spentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionAr` varchar(240) NOT NULL,
	`questionEn` varchar(240) NOT NULL,
	`answerAr` text NOT NULL,
	`answerEn` text NOT NULL,
	`category` varchar(80) NOT NULL DEFAULT 'general',
	`published` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int,
	`customerId` int NOT NULL,
	`name` varchar(220) NOT NULL,
	`fileKey` text NOT NULL,
	`url` text NOT NULL,
	`mimeType` varchar(120),
	`size` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceNumber` varchar(60) NOT NULL,
	`customerId` int NOT NULL,
	`projectId` int,
	`items` json NOT NULL,
	`subtotal` decimal(12,2) NOT NULL,
	`discount` decimal(12,2) NOT NULL DEFAULT '0',
	`tax` decimal(12,2) NOT NULL DEFAULT '0',
	`total` decimal(12,2) NOT NULL,
	`paid` decimal(12,2) NOT NULL DEFAULT '0',
	`dueDate` timestamp,
	`status` enum('DRAFT','SENT','PARTIALLY_PAID','PAID','OVERDUE') NOT NULL DEFAULT 'DRAFT',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`title` varchar(220) NOT NULL,
	`description` text,
	`dueDate` timestamp,
	`status` enum('PENDING','IN_PROGRESS','COMPLETED') NOT NULL DEFAULT 'PENDING',
	CONSTRAINT `milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(64) NOT NULL,
	`title` varchar(220) NOT NULL,
	`body` text NOT NULL,
	`read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`invoiceId` int,
	`projectId` int,
	`amount` decimal(12,2) NOT NULL,
	`method` varchar(60) NOT NULL,
	`transactionId` varchar(180),
	`status` enum('PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricingPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameAr` varchar(120) NOT NULL,
	`nameEn` varchar(120) NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`period` varchar(32) NOT NULL DEFAULT 'project',
	`features` json NOT NULL,
	`highlighted` boolean NOT NULL DEFAULT false,
	`ctaAr` varchar(80) NOT NULL,
	`ctaEn` varchar(80) NOT NULL,
	`published` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `pricingPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(140) NOT NULL,
	`nameAr` varchar(180) NOT NULL,
	`nameEn` varchar(180) NOT NULL,
	`descriptionAr` text NOT NULL,
	`descriptionEn` text NOT NULL,
	`category` varchar(80) NOT NULL,
	`price` decimal(12,2) NOT NULL DEFAULT '0',
	`images` json NOT NULL,
	`features` json NOT NULL,
	`status` enum('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
	`demoUrl` text,
	`purchaseUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `projectRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(40),
	`company` varchar(160),
	`service` varchar(160) NOT NULL,
	`projectType` varchar(120) NOT NULL,
	`budget` varchar(80),
	`deadline` varchar(80),
	`description` text NOT NULL,
	`attachments` json NOT NULL,
	`status` enum('NEW','REVIEWING','IN_PROGRESS','COMPLETED','ARCHIVED') NOT NULL DEFAULT 'NEW',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projectRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`assignedUserId` int,
	`title` varchar(220) NOT NULL,
	`description` text,
	`priority` enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
	`status` enum('TODO','IN_PROGRESS','REVIEW','DONE') NOT NULL DEFAULT 'TODO',
	`dueDate` timestamp,
	`progress` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`serviceId` int,
	`name` varchar(220) NOT NULL,
	`description` text NOT NULL,
	`status` enum('PENDING','PLANNING','IN_PROGRESS','REVIEW','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
	`progress` int NOT NULL DEFAULT 0,
	`budget` decimal(12,2) NOT NULL DEFAULT '0',
	`paidAmount` decimal(12,2) NOT NULL DEFAULT '0',
	`startDate` timestamp,
	`deadline` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(140) NOT NULL,
	`nameAr` varchar(180) NOT NULL,
	`nameEn` varchar(180) NOT NULL,
	`descriptionAr` text NOT NULL,
	`descriptionEn` text NOT NULL,
	`icon` varchar(64) NOT NULL,
	`accent` varchar(32) NOT NULL DEFAULT 'gold',
	`features` json NOT NULL,
	`technologies` json NOT NULL,
	`published` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `siteSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteSettings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `supportTickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`subject` varchar(220) NOT NULL,
	`category` varchar(100) NOT NULL,
	`priority` enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
	`message` text NOT NULL,
	`status` enum('OPEN','IN_PROGRESS','WAITING','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supportTickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientName` varchar(140) NOT NULL,
	`company` varchar(160) NOT NULL,
	`position` varchar(140) NOT NULL,
	`avatar` text,
	`rating` int NOT NULL DEFAULT 5,
	`messageAr` text NOT NULL,
	`messageEn` text NOT NULL,
	`published` boolean NOT NULL DEFAULT true,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticketMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`authorId` int NOT NULL,
	`message` text NOT NULL,
	`attachmentUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticketMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `accessRole` varchar(32) DEFAULT 'CUSTOMER' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `company` varchar(160);--> statement-breakpoint
ALTER TABLE `users` ADD `status` enum('ACTIVE','SUSPENDED') DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE `auditLogs` ADD CONSTRAINT `auditLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `files` ADD CONSTRAINT `files_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `files` ADD CONSTRAINT `files_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `milestones` ADD CONSTRAINT `milestones_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_invoiceId_invoices_id_fk` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projectRequests` ADD CONSTRAINT `projectRequests_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projectTasks` ADD CONSTRAINT `projectTasks_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projectTasks` ADD CONSTRAINT `projectTasks_assignedUserId_users_id_fk` FOREIGN KEY (`assignedUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_serviceId_services_id_fk` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supportTickets` ADD CONSTRAINT `supportTickets_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ticketMessages` ADD CONSTRAINT `ticketMessages_ticketId_supportTickets_id_fk` FOREIGN KEY (`ticketId`) REFERENCES `supportTickets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ticketMessages` ADD CONSTRAINT `ticketMessages_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;