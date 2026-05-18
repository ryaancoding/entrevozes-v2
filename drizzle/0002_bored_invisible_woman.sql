ALTER TABLE `articles` ADD `summary` text NOT NULL;--> statement-breakpoint
ALTER TABLE `articles` ADD `articleLink` varchar(500);--> statement-breakpoint
ALTER TABLE `articles` DROP COLUMN `content`;--> statement-breakpoint
ALTER TABLE `articles` DROP COLUMN `excerpt`;