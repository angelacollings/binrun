-- Expand enum values so existing rows can be mapped safely.
ALTER TABLE `Bin` MODIFY `type` ENUM('RECYCLING', 'RUBBISH_BAG', 'GREEN_WHEELIE', 'RECYCLING_BINS', 'RUBBISH_WHEELIE', 'GREEN_WASTE_WHEELIE') NOT NULL;

-- Map the earlier MVP bin types onto the service options BinRun actually sells.
UPDATE `Bin` SET `type` = 'RECYCLING_BINS' WHERE `type` = 'RECYCLING';
UPDATE `Bin` SET `type` = 'RUBBISH_WHEELIE' WHERE `type` = 'RUBBISH_BAG';
UPDATE `Bin` SET `type` = 'GREEN_WASTE_WHEELIE' WHERE `type` = 'GREEN_WHEELIE';

-- Remove the superseded enum values.
ALTER TABLE `Bin` MODIFY `type` ENUM('RECYCLING_BINS', 'RUBBISH_WHEELIE', 'GREEN_WASTE_WHEELIE') NOT NULL;
