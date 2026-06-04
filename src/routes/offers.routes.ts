import { Router } from 'express';
import { OffersController } from '../controllers/offers.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// Public
router.get('/', OffersController.getActiveOffers);

// Protected Admin & Salon Owner routes
router.use(authenticateToken, requireRole(['super_admin', 'admin', 'owner', 'manager']));
router.post('/', OffersController.createOffer);
router.put('/:id', OffersController.updateOffer);
router.delete('/:id', OffersController.deleteOffer);
router.get('/:id/redemptions', OffersController.getRedemptions);

export default router;
