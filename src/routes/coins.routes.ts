import { Router } from 'express';
import { CoinsController } from '../controllers/coins.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticateToken);
router.get('/', CoinsController.handleLegacyAction);
router.post('/', CoinsController.handleLegacyAction);
router.get('/my', CoinsController.getMyCoins);
router.post('/award', requireRole(['super_admin', 'admin']), CoinsController.awardCoins);

export default router;
