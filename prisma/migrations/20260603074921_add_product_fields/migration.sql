-- AlterTable
ALTER TABLE `platform_products` ADD COLUMN `brand` VARCHAR(255) NULL,
    ADD COLUMN `category` VARCHAR(100) NULL,
    ADD COLUMN `discount` DECIMAL(10, 2) NULL DEFAULT 0,
    ADD COLUMN `features` TEXT NULL,
    ADD COLUMN `image_url_2` TEXT NULL,
    ADD COLUMN `image_url_3` TEXT NULL,
    ADD COLUMN `image_url_4` TEXT NULL,
    ADD COLUMN `stock_quantity` INTEGER NULL DEFAULT 0,
    ADD COLUMN `target_audience` VARCHAR(50) NULL DEFAULT 'both';

-- AlterTable
ALTER TABLE `salons` MODIFY `trial_ends_at` TIMESTAMP(0) NULL DEFAULT (DATE_ADD(NOW(), INTERVAL 14 DAY));
