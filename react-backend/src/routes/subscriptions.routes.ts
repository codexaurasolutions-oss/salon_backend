import { Router } from 'express';
import { SubscriptionsController } from '../controllers/subscriptions.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole, requireSalonAccess } from '../middlewares/rbac.middleware';

const router = Router();

// Public
router.get('/plans', SubscriptionsController.getPlans);

// Protected (Salon owner)
router.get('/my', authenticateToken, requireRole(['owner', 'manager']), requireSalonAccess, SubscriptionsController.getMySubscription);
router.post('/subscribe', authenticateToken, requireRole(['owner']), requireSalonAccess, SubscriptionsController.subscribeToPlan);

export default router;
