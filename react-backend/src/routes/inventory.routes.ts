import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole, requireSalonAccess } from '../middlewares/rbac.middleware';

const router = Router({ mergeParams: true });

router.use(authenticateToken, requireRole(['owner', 'manager']), requireSalonAccess);

router.get('/', InventoryController.getInventory);
router.post('/', InventoryController.addInventoryItem);
router.put('/:id', InventoryController.updateInventoryItem);
router.delete('/:id', InventoryController.deleteInventoryItem);

export default router;
