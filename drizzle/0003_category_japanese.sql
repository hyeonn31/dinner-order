INSERT INTO `restaurant_categories` (`id`, `name`, `sortOrder`) VALUES (5, '일식', 5)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `sortOrder` = VALUES(`sortOrder`);
