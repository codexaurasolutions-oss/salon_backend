-- AlterTable
ALTER TABLE `platform_offers` ADD COLUMN `salon_id` VARCHAR(36) NULL;

-- AlterTable
ALTER TABLE `salons` MODIFY `trial_ends_at` TIMESTAMP(0) NULL DEFAULT (DATE_ADD(NOW(), INTERVAL 14 DAY));
