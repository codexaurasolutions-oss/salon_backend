-- AlterTable
ALTER TABLE `salons` MODIFY `trial_ends_at` TIMESTAMP(0) NULL DEFAULT (DATE_ADD(NOW(), INTERVAL 14 DAY));

-- AddForeignKey
ALTER TABLE `platform_payments` ADD CONSTRAINT `platform_payments_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
