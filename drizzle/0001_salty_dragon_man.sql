CREATE TABLE `daily_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingDate` date NOT NULL,
	`restaurantId` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nickname` varchar(100) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`),
	CONSTRAINT `employees_nickname_unique` UNIQUE(`nickname`)
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`name` varchar(300) NOT NULL,
	`itemType` enum('main','side','drink','option') NOT NULL DEFAULT 'main',
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `menu_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderDate` date NOT NULL,
	`employeeId` int NOT NULL,
	`restaurantId` int NOT NULL,
	`mainMenuId` int,
	`mainMenuName` varchar(300),
	`sideMenuId` int,
	`sideMenuName` varchar(300),
	`drinkOption` varchar(100),
	`extraOption` varchar(300),
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurant_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `restaurant_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `restaurants_id` PRIMARY KEY(`id`)
);
