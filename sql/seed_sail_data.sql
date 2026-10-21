-- Blue Crew seed data for sail_ tables
-- Safe to re-run: uses UPSERT logic (ON DUPLICATE KEY UPDATE)

USE `finviz_db`;

SET @now_ms := FLOOR(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000);

INSERT INTO `sail_users`
(`id`,`name`,`role`,`email`,`phone`,`boat_id`,`position`,`membership`,`category`,`source_note`,`created_at`)
VALUES
('u-admin','Alicia Morgan','admin','admin@bluecrew.app','+13055550100',NULL,'Operations',NULL,NULL,NULL,@now_ms - 1000000),
('u-cap-1','Captain Rivera','captain','capt.rivera@bluecrew.app','+13055550101','b-1','Captain',NULL,NULL,NULL,@now_ms - 900000),
('u-cap-2','Captain Kim','captain','capt.kim@bluecrew.app','+13055550102','b-2','Captain',NULL,NULL,NULL,@now_ms - 800000),
('u-crew-1','Noah Stone','crew','noah@bluecrew.app','+13055550103','b-1','Deckhand',NULL,NULL,NULL,@now_ms - 700000),
('u-crew-2','Maya Lee','crew','maya@bluecrew.app','+13055550104',NULL,'Steward',NULL,NULL,NULL,@now_ms - 600000),

('u-cap-import-1','Boba, Lukasz','captain','lboba@outlook.com',NULL,NULL,'Captain',NULL,'Sympatycy BZ','MEMBERS 2026',@now_ms - 590000),
('u-cap-import-2','Boba, Mieczyslaw','captain','mikeboba@hotmail.com','+19059651228',NULL,'Captain','MEMBERS 2024','Sympatycy BZ',NULL,@now_ms - 580000),
('u-cap-import-3','Boguslawski, Michael','captain','boguslawski1952@hotmail.c...','+14168289015',NULL,'Captain','MEMBERS 2024','Sympatycy BZ',NULL,@now_ms - 570000),
('u-cap-import-4','Dziewierz, Grzegorz','captain','przepraszam@hotmail.com',NULL,NULL,'Captain',NULL,'Sympatycy BZ','Wagner Sailing Rall',@now_ms - 560000),
('u-cap-import-5','Jankowski, Janusz','captain','.jankowskizj@gmail.com','+14167460164',NULL,'Captain','MEMBERS 2024','Sympatycy BZ',NULL,@now_ms - 550000),
('u-cap-import-6','Korzeniewski, Adam','captain','adakor65@gmail.com','+14164271527',NULL,'Captain','MEMBERS 2024','Sympatycy BZ',NULL,@now_ms - 540000),
('u-cap-import-7','Krolicki, Grzegorz','captain','krolicki@rogers.com',NULL,NULL,'Captain',NULL,'Sympatycy BŻ','MEMBERS 2025',@now_ms - 530000),
('u-cap-import-8','Polak, Janusz','captain','janmap@yahoo.com','+16475045505',NULL,'Captain','MEMBERS 2024','Sympatycy BŻ',NULL,@now_ms - 520000),
('u-cap-import-9','Reschke, Jacek','captain','jreschke1@gmail.com',NULL,NULL,'Captain',NULL,'Sympatycy BZ','Kapitanowie WSR2:',@now_ms - 510000),
('u-cap-import-10','Samborski, Wojciech','captain','wojciech.samborski@gmail.c...',NULL,NULL,'Captain','MEMBERS 2024','Sympatycy BZ',NULL,@now_ms - 500000),
('u-cap-import-11','Staniszewski, Andrzej','captain','a.staniszewski@gmail.com','+14163997887',NULL,'Captain','MEMBERS 2024','Sympatycy BŻ',NULL,@now_ms - 490000),
('u-cap-import-12','Wliz?o, Arek','captain','wlizlo@rogers.com',NULL,NULL,'Captain',NULL,'Sympatycy BZ','Kapitanowie WSR2:',@now_ms - 480000)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `role` = VALUES(`role`),
  `email` = VALUES(`email`),
  `phone` = VALUES(`phone`),
  `boat_id` = VALUES(`boat_id`),
  `position` = VALUES(`position`),
  `membership` = VALUES(`membership`),
  `category` = VALUES(`category`),
  `source_note` = VALUES(`source_note`);

INSERT INTO `sail_boats`
(`id`,`name`,`type`,`registration`,`capacity`,`home_port`,`status`,`captain_id`,`length_ft`,`created_at`)
VALUES
('b-1','Sea Breeze','catamaran','BVI-1034',8,'Road Town','active','u-cap-1',44,@now_ms - 1000000),
('b-2','Island Star','boat','BVI-2048',6,'Spanish Town','active','u-cap-2',36,@now_ms - 900000)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `type` = VALUES(`type`),
  `registration` = VALUES(`registration`),
  `capacity` = VALUES(`capacity`),
  `home_port` = VALUES(`home_port`),
  `status` = VALUES(`status`),
  `captain_id` = VALUES(`captain_id`),
  `length_ft` = VALUES(`length_ft`);

INSERT INTO `sail_waitlist`
(`id`,`user_id`,`requested_boat_id`,`assigned_boat_id`,`party_size`,`note`,`status`,`requested_at`,`decided_by`,`decided_at`)
VALUES
('w-1','u-crew-2','b-2',NULL,1,'Available weekends','pending',@now_ms - 500000,NULL,NULL)
ON DUPLICATE KEY UPDATE
  `user_id` = VALUES(`user_id`),
  `requested_boat_id` = VALUES(`requested_boat_id`),
  `assigned_boat_id` = VALUES(`assigned_boat_id`),
  `party_size` = VALUES(`party_size`),
  `note` = VALUES(`note`),
  `status` = VALUES(`status`),
  `requested_at` = VALUES(`requested_at`),
  `decided_by` = VALUES(`decided_by`),
  `decided_at` = VALUES(`decided_at`);
