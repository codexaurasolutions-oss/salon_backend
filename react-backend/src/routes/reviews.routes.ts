import { Router } from 'express';
import { ReviewsController } from '../controllers/reviews.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', ReviewsController.getReviews); // Public compatibility route
router.get('/salon/:salon_id', ReviewsController.getSalonReviews); // Public
router.post('/', authenticateToken, ReviewsController.submitReview);

export default router;
