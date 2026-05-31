ALTER TABLE `Subscription` ADD COLUMN `propertyServiceId` VARCHAR(191) NULL;
ALTER TABLE `ServiceVisit` ADD COLUMN `lastUpdatedById` VARCHAR(191) NULL,
    ADD COLUMN `statusNote` TEXT NULL,
    MODIFY `status` ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'SKIPPED', 'FAILED', 'MISSED', 'CANCELED') NOT NULL DEFAULT 'PLANNED';

CREATE TABLE `ServicePackage` (
    `id` VARCHAR(191) NOT NULL,
    `code` ENUM('REGULAR_RUN', 'REGULAR_RUN_PLUS_WASH', 'ONE_OFF_CLEAN', 'CUSTOM') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `billingMode` ENUM('SUBSCRIPTION', 'ONE_OFF', 'CUSTOM') NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ServicePackage_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PropertyService` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'PAUSED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `serviceDay` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NULL,
    `frequency` ENUM('WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'ON_DEMAND') NOT NULL DEFAULT 'WEEKLY',
    `customNotes` TEXT NULL,
    `startedAt` DATETIME(3) NULL,
    `canceledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PropertyService_propertyId_idx`(`propertyId`),
    INDEX `PropertyService_packageId_idx`(`packageId`),
    INDEX `PropertyService_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PropertyServiceItem` (
    `id` VARCHAR(191) NOT NULL,
    `propertyServiceId` VARCHAR(191) NOT NULL,
    `type` ENUM('BIN_SET_OUT_RETURN', 'BIN_CLEANING') NOT NULL,
    `binType` ENUM('RECYCLING_BINS', 'RUBBISH_BAGS', 'RUBBISH_WHEELIE', 'GREEN_WASTE_WHEELIE') NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PropertyServiceItem_propertyServiceId_idx`(`propertyServiceId`),
    INDEX `PropertyServiceItem_binType_idx`(`binType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `Subscription_propertyServiceId_idx` ON `Subscription`(`propertyServiceId`);
CREATE INDEX `ServiceVisit_lastUpdatedById_idx` ON `ServiceVisit`(`lastUpdatedById`);

ALTER TABLE `PropertyService` ADD CONSTRAINT `PropertyService_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `PropertyService` ADD CONSTRAINT `PropertyService_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `ServicePackage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `PropertyServiceItem` ADD CONSTRAINT `PropertyServiceItem_propertyServiceId_fkey` FOREIGN KEY (`propertyServiceId`) REFERENCES `PropertyService`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_propertyServiceId_fkey` FOREIGN KEY (`propertyServiceId`) REFERENCES `PropertyService`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
