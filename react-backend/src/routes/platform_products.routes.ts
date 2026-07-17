import { Router } from 'express';
import { PlatformProductsController } from '../controllers/platform-products.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/', PlatformProductsController.getProducts); // Public
router.get('/:id', PlatformProductsController.getProductById); // Public

// Admin only
router.use(authenticateToken, requireRole(['super_admin', 'admin']));
router.post('/', PlatformProductsController.createProduct);
router.put('/:id', PlatformProductsController.updateProduct);
router.delete('/:id', PlatformProductsController.deleteProduct);

export default router;
