import { Router } from 'express';
import { MessagesController } from '../controllers/messages.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.get('/', MessagesController.getMyMessages);
router.post('/', MessagesController.sendMessage);
router.put('/:id/read', MessagesController.markAsRead);

export default router;
