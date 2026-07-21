import { Router } from 'express';
import { BookingsController } from '../controllers/bookings.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

// Public Invoice endpoint for guest invoice views
router.get('/:id/invoice', BookingsController.getBookingInvoice);

router.use(authenticateToken);

// Core Booking
router.get('/', BookingsController.getBookings);
router.post('/', BookingsController.createBooking);
router.get('/:id', BookingsController.getBooking);
router.put('/:id', BookingsController.updateBookingStatus);
router.put('/:id/settle-deposit', BookingsController.settleDeposit);
router.post('/:id/settle', BookingsController.settleManualInvoice);
router.post('/:id/payment', BookingsController.addPayment);

// Reviews
router.get('/:id/review', BookingsController.getReview);
router.post('/:id/review', BookingsController.submitReview);
router.put('/:id/review', BookingsController.updateReview);

export default router;
