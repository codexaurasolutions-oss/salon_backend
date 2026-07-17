-- Manual fallback for older MySQL databases before Vercel go-live.
ALTER TABLE `contact_enquiries`
    ADD COLUMN IF NOT EXISTS `phone` VARCHAR(50) NULL AFTER `email`,
    ADD COLUMN IF NOT EXISTS `inquiry_type` VARCHAR(50) NULL AFTER `message`;

ALTER TABLE `platform_offers`
    ADD COLUMN IF NOT EXISTS `salon_id` VARCHAR(36) NULL AFTER `discount_value`;
