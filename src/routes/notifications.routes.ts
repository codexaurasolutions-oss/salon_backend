import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.get('/', NotificationsController.getMyNotifications);
router.put('/read-all', NotificationsController.markAllAsRead);
router.put('/:id/read', NotificationsController.markAsRead);

export default router;
