-- Blue Crew MySQL schema
-- Database: finviz_db
-- Table prefix: sail_

USE `finviz_db`;

CREATE TABLE IF NOT EXISTS `sail_users` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `role` VARCHAR(32) NOT NULL,
  `email` VARCHAR(255) NULL,
  `phone` VARCHAR(32) NULL,
  `boat_id` VARCHAR(64) NULL,
  `position` VARCHAR(128) NULL,
  `membership` VARCHAR(128) NULL,
  `category` VARCHAR(128) NULL,
  `source_note` VARCHAR(255) NULL,
  `created_at` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sail_users_role` (`role`),
  KEY `idx_sail_users_boat_id` (`boat_id`),
  KEY `idx_sail_users_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sail_boats` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` VARCHAR(32) NOT NULL,
  `registration` VARCHAR(64) NOT NULL,
  `capacity` INT NOT NULL,
  `home_port` VARCHAR(128) NOT NULL,
  `status` VARCHAR(32) NOT NULL,
  `captain_id` VARCHAR(64) NULL,
  `length_ft` INT NULL,
  `created_at` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sail_boats_type` (`type`),
  KEY `idx_sail_boats_status` (`status`),
  KEY `idx_sail_boats_captain_id` (`captain_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sail_waitlist` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `requested_boat_id` VARCHAR(64) NULL,
  `assigned_boat_id` VARCHAR(64) NULL,
  `party_size` INT NOT NULL DEFAULT 1,
  `note` VARCHAR(255) NULL,
  `status` VARCHAR(32) NOT NULL,
  `requested_at` BIGINT NOT NULL,
  `decided_by` VARCHAR(64) NULL,
  `decided_at` BIGINT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sail_waitlist_user_id` (`user_id`),
  KEY `idx_sail_waitlist_status` (`status`),
  KEY `idx_sail_waitlist_requested_boat_id` (`requested_boat_id`),
  KEY `idx_sail_waitlist_assigned_boat_id` (`assigned_boat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional foreign keys (uncomment if desired and data integrity is enforced)
-- ALTER TABLE `sail_users`
--   ADD CONSTRAINT `fk_sail_users_boat`
--   FOREIGN KEY (`boat_id`) REFERENCES `sail_boats`(`id`)
--   ON DELETE SET NULL ON UPDATE CASCADE;
--
-- ALTER TABLE `sail_boats`
--   ADD CONSTRAINT `fk_sail_boats_captain`
--   FOREIGN KEY (`captain_id`) REFERENCES `sail_users`(`id`)
--   ON DELETE SET NULL ON UPDATE CASCADE;
--
-- ALTER TABLE `sail_waitlist`
--   ADD CONSTRAINT `fk_sail_waitlist_user`
--   FOREIGN KEY (`user_id`) REFERENCES `sail_users`(`id`)
--   ON DELETE CASCADE ON UPDATE CASCADE,
--   ADD CONSTRAINT `fk_sail_waitlist_requested_boat`
--   FOREIGN KEY (`requested_boat_id`) REFERENCES `sail_boats`(`id`)
--   ON DELETE SET NULL ON UPDATE CASCADE,
--   ADD CONSTRAINT `fk_sail_waitlist_assigned_boat`
--   FOREIGN KEY (`assigned_boat_id`) REFERENCES `sail_boats`(`id`)
--   ON DELETE SET NULL ON UPDATE CASCADE,
--   ADD CONSTRAINT `fk_sail_waitlist_decided_by`
--   FOREIGN KEY (`decided_by`) REFERENCES `sail_users`(`id`)
--   ON DELETE SET NULL ON UPDATE CASCADE;
