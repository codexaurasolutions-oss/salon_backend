import { Router } from 'express';
import { NewsletterController } from '../controllers/newsletter.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.post('/subscribe', NewsletterController.subscribe);
router.get('/', authenticateToken, requireRole(['super_admin', 'admin']), NewsletterController.getSubscribers);

export default router;
