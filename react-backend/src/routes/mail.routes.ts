import { Router } from 'express';
import { MailController } from '../controllers/mail.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// Lightweight compatibility endpoint used by the local migration test page.
router.post('/test', MailController.sendMail);

// Internal API used by system components or admins to dispatch emails
router.post('/send', authenticateToken, requireRole(['super_admin', 'admin']), MailController.sendMail);

export default router;
