import { Router } from 'express';
import { LoyaltyController } from '../controllers/loyalty.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole, requireSalonAccess } from '../middlewares/rbac.middleware';

const router = Router({ mergeParams: true });

router.get('/settings', authenticateToken, requireRole(['owner', 'manager']), LoyaltyController.getLoyaltySettings);
router.post('/settings', authenticateToken, requireRole(['owner']), LoyaltyController.updateLoyaltySettings);

router.get('/rewards', LoyaltyController.getRewards);
router.post('/rewards', authenticateToken, requireRole(['owner', 'manager']), LoyaltyController.createReward);
router.delete('/rewards/:id', authenticateToken, requireRole(['owner', 'manager']), LoyaltyController.deleteReward);

router.get('/my-points', authenticateToken, LoyaltyController.getMyPoints);
router.get('/all-points', authenticateToken, requireRole(['super_admin', 'admin', 'owner', 'manager']), LoyaltyController.getAllPoints);
router.post('/redeem', authenticateToken, LoyaltyController.redeemReward);
router.get('/fix-my-points', authenticateToken, LoyaltyController.fixMyPoints);

export default router;
