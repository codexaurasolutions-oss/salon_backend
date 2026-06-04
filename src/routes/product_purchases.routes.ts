import { Router } from 'express';
import { ProductPurchasesController } from '../controllers/product-purchases.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole, requireSalonAccess } from '../middlewares/rbac.middleware';

const router = Router({ mergeParams: true });

router.use(authenticateToken, requireRole(['owner', 'manager']), requireSalonAccess);

router.get('/', ProductPurchasesController.getPurchases);
router.post('/', ProductPurchasesController.recordPurchase);

export default router;
