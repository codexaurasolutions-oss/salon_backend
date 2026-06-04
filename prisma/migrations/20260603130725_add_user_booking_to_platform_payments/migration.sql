-- AlterTable
ALTER TABLE `platform_payments` ADD COLUMN `booking_id` VARCHAR(36) NULL,
    ADD COLUMN `user_id` VARCHAR(36) NULL,
    MODIFY `currency` VARCHAR(3) NULL DEFAULT 'MYR';

-- AlterTable
ALTER TABLE `salons` MODIFY `trial_ends_at` TIMESTAMP(0) NULL DEFAULT (DATE_ADD(NOW(), INTERVAL 14 DAY));
