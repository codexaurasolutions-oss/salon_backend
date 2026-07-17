import { Router } from 'express';
import { ServicesController } from '../controllers/services.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole, requireSalonAccess } from '../middlewares/rbac.middleware';

const router = Router({ mergeParams: true });

// Public routes
router.get('/', ServicesController.getServicesBySalon);
router.get('/categories', ServicesController.getCategories);
router.get('/:id', ServicesController.getServiceById);

// Protected routes
router.post('/', authenticateToken, requireRole(['owner', 'manager']), requireSalonAccess, ServicesController.addService);
router.put('/:id', authenticateToken, requireRole(['owner', 'manager']), requireSalonAccess, ServicesController.updateService);
router.delete('/:id', authenticateToken, requireRole(['owner', 'manager']), requireSalonAccess, ServicesController.deleteService);

export default router;
