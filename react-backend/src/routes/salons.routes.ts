import { Router } from 'express';
import { SalonsController } from '../controllers/salons.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole, requireSalonAccess } from '../middlewares/rbac.middleware';

const router = Router();

// Protected routes (Specific routes first)
router.get('/my', authenticateToken, requireRole(['owner', 'manager']), SalonsController.getMySalons);

// Public routes (Param routes after specific routes)
router.get('/', SalonsController.getAllSalons);
router.get('/:id/analytics', authenticateToken, SalonsController.getAnalytics);
router.get('/:id', SalonsController.getSalonById);

// Protected routes
router.post('/', authenticateToken, SalonsController.createSalon);
router.put('/:id', authenticateToken, requireRole(['owner', 'super_admin']), requireSalonAccess, SalonsController.updateSalon);

export default router;
