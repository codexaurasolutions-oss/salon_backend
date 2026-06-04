import { Router } from 'express';
import { BookingsController } from '../controllers/bookings.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticateToken);

// Core Booking
router.get('/', BookingsController.getBookings);
router.post('/', BookingsController.createBooking);
router.get('/:id', BookingsController.getBooking);
router.put('/:id', BookingsController.updateBookingStatus);
router.post('/:id/payment', BookingsController.addPayment);

// Reviews
router.get('/:id/review', BookingsController.getReview);
router.post('/:id/review', BookingsController.submitReview);
router.put('/:id/review', BookingsController.updateReview);

export default router;
