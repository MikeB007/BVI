-- Migration for existing databases:
-- Adds party_size to support guest requests for 1 to 5 people.

USE `finviz_db`;

ALTER TABLE `sail_waitlist`
  ADD COLUMN IF NOT EXISTS `party_size` INT NOT NULL DEFAULT 1
  AFTER `assigned_boat_id`;
