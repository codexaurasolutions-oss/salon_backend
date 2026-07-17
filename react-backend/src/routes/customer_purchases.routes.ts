import { Router } from 'express';
import { CustomerPurchasesController } from '../controllers/customer_purchases.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole, requireSalonAccess } from '../middlewares/rbac.middleware';

const router = Router({ mergeParams: true });

router.use(authenticateToken, requireRole(['owner', 'manager']), requireSalonAccess);

router.get('/', CustomerPurchasesController.getPurchases);
router.post('/', CustomerPurchasesController.recordPurchase);

export default router;
