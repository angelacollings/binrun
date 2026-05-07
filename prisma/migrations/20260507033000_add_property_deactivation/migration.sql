ALTER TABLE `Property`
  ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `deactivatedAt` DATETIME(3) NULL;

CREATE INDEX `Property_userId_active_idx` ON `Property`(`userId`, `active`);
