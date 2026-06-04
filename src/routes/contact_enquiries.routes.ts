import { Router } from 'express';
import { ContactEnquiriesController } from '../controllers/contact-enquiries.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.post('/', ContactEnquiriesController.submitEnquiry); // Public

// Admin only
router.use(authenticateToken, requireRole(['super_admin', 'admin']));
router.get('/', ContactEnquiriesController.getEnquiries);
router.put('/:id/status', ContactEnquiriesController.updateStatus);

export default router;
