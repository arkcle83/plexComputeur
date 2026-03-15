CREATE TABLE IF NOT EXISTS `spaces` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`emoji` text DEFAULT '📁',
	`description` text DEFAULT '',
	`createdAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `folders` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`spaceId` text,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `chats` ADD COLUMN `spaceId` text;
--> statement-breakpoint
ALTER TABLE `chats` ADD COLUMN `folderId` text;
--> statement-breakpoint
ALTER TABLE `chats` ADD COLUMN `pinned` integer DEFAULT 0;
