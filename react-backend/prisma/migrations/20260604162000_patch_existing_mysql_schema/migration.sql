-- Patch older MySQL databases so production stays compatible with the current Prisma schema.
SET @contact_phone_sql = IF (
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'contact_enquiries'
          AND COLUMN_NAME = 'phone'
    ),
    'SELECT 1',
    'ALTER TABLE `contact_enquiries` ADD COLUMN `phone` VARCHAR(50) NULL AFTER `email`'
);
PREPARE contact_phone_stmt FROM @contact_phone_sql;
EXECUTE contact_phone_stmt;
DEALLOCATE PREPARE contact_phone_stmt;

SET @contact_inquiry_type_sql = IF (
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'contact_enquiries'
          AND COLUMN_NAME = 'inquiry_type'
    ),
    'SELECT 1',
    'ALTER TABLE `contact_enquiries` ADD COLUMN `inquiry_type` VARCHAR(50) NULL AFTER `message`'
);
PREPARE contact_inquiry_type_stmt FROM @contact_inquiry_type_sql;
EXECUTE contact_inquiry_type_stmt;
DEALLOCATE PREPARE contact_inquiry_type_stmt;

SET @platform_offer_salon_sql = IF (
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'platform_offers'
          AND COLUMN_NAME = 'salon_id'
    ),
    'SELECT 1',
    'ALTER TABLE `platform_offers` ADD COLUMN `salon_id` VARCHAR(36) NULL AFTER `discount_value`'
);
PREPARE platform_offer_salon_stmt FROM @platform_offer_salon_sql;
EXECUTE platform_offer_salon_stmt;
DEALLOCATE PREPARE platform_offer_salon_stmt;
