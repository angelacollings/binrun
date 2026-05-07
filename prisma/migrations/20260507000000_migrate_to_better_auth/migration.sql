-- Move Auth.js credential data into Better Auth's account/session schema.

ALTER TABLE `Account` DROP FOREIGN KEY `Account_userId_fkey`;
ALTER TABLE `Session` DROP FOREIGN KEY `Session_userId_fkey`;
ALTER TABLE `PasswordCredential` DROP FOREIGN KEY `PasswordCredential_userId_fkey`;

DROP TABLE `Account`;
DROP TABLE `Session`;
DROP TABLE `VerificationToken`;

UPDATE `User` SET `name` = COALESCE(`name`, 'BinRun Customer');
UPDATE `User` SET `email` = CONCAT(`id`, '@placeholder.binrun.local') WHERE `email` IS NULL;

ALTER TABLE `User` ADD COLUMN `emailVerifiedNew` BOOLEAN NOT NULL DEFAULT false;
UPDATE `User` SET `emailVerifiedNew` = `emailVerified` IS NOT NULL;
ALTER TABLE `User` DROP COLUMN `emailVerified`;
ALTER TABLE `User` CHANGE `emailVerifiedNew` `emailVerified` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `User` MODIFY `name` VARCHAR(191) NOT NULL;
ALTER TABLE `User` MODIFY `email` VARCHAR(191) NOT NULL;

CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accessToken` TEXT NULL,
    `refreshToken` TEXT NULL,
    `idToken` TEXT NULL,
    `accessTokenExpiresAt` DATETIME(3) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `scope` VARCHAR(191) NULL,
    `password` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Account_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `Account` (
    `id`,
    `accountId`,
    `providerId`,
    `userId`,
    `password`,
    `createdAt`,
    `updatedAt`
)
SELECT
    UUID(),
    `User`.`email`,
    'credential',
    `PasswordCredential`.`userId`,
    `PasswordCredential`.`passwordHash`,
    `PasswordCredential`.`createdAt`,
    `PasswordCredential`.`updatedAt`
FROM `PasswordCredential`
INNER JOIN `User` ON `User`.`id` = `PasswordCredential`.`userId`;

CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Session_token_key`(`token`),
    INDEX `Session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Verification` (
    `id` VARCHAR(191) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `Verification_identifier_idx`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

DROP TABLE `PasswordCredential`;

ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
