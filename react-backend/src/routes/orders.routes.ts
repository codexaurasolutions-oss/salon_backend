import { Router } from 'express';
import { OrdersController } from '../controllers/orders.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/my', authenticateToken, OrdersController.getMyOrders);
router.post('/', authenticateToken, OrdersController.createOrder);
router.put('/:id/status', authenticateToken, requireRole(['super_admin', 'admin']), OrdersController.updateOrderStatus);

export default router;
