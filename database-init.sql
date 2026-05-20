-- 데이터베이스 초기화 SQL
-- 모든 테이블 생성 및 초기 데이터 삽입

-- 1. 식당 카테고리 테이블
CREATE TABLE IF NOT EXISTS `restaurant_categories` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(50) NOT NULL,
  `sortOrder` int NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 식당 테이블
CREATE TABLE IF NOT EXISTS `restaurants` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `categoryId` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `isActive` boolean NOT NULL DEFAULT true,
  `sortOrder` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 메뉴 항목 테이블
CREATE TABLE IF NOT EXISTS `menu_items` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `restaurantId` int NOT NULL,
  `name` varchar(300) NOT NULL,
  `itemType` enum('main','side','drink','option') NOT NULL DEFAULT 'main',
  `sortOrder` int NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 직원 테이블
CREATE TABLE IF NOT EXISTS `employees` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nickname` varchar(100) NOT NULL UNIQUE,
  `sortOrder` int NOT NULL DEFAULT 0,
  `isActive` boolean NOT NULL DEFAULT true
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 일일 식당 설정 테이블
CREATE TABLE IF NOT EXISTS `daily_settings` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `settingDate` date NOT NULL,
  `restaurantId` int NOT NULL,
  `isActive` boolean NOT NULL DEFAULT true,
  `isClosed` boolean NOT NULL DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. 주문 테이블
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
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
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. 사용자 테이블
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `openId` varchar(64) NOT NULL UNIQUE,
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 초기 데이터 삽입

-- 카테고리 삽입
INSERT INTO `restaurant_categories` (`name`, `sortOrder`) VALUES
('한식', 1),
('양식', 2),
('샐러드', 3),
('햄버거', 4),
('일식', 5)
ON DUPLICATE KEY UPDATE `sortOrder` = VALUES(`sortOrder`);

-- 식당 삽입 (예시)
INSERT INTO `restaurants` (`categoryId`, `name`, `isActive`, `sortOrder`) VALUES
(3, '샐러디', true, 1),
(1, '단백하루', true, 2),
(5, '포케올데이', true, 3),
(1, '본도시락', true, 4),
(1, '오미마리', true, 5)
ON DUPLICATE KEY UPDATE `isActive` = VALUES(`isActive`), `sortOrder` = VALUES(`sortOrder`);

-- 오미마리 메뉴 삽입
INSERT INTO `menu_items` (`restaurantId`, `name`, `itemType`, `sortOrder`) VALUES
(5, '우동', 'main', 1),
(5, '돈까스', 'main', 2),
(5, '카레', 'main', 3),
(5, '오니기리', 'main', 4),
(5, '제로콜라', 'drink', 1)
ON DUPLICATE KEY UPDATE `sortOrder` = VALUES(`sortOrder`);
