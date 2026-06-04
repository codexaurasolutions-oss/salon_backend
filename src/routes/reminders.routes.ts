import { Router } from 'express';
import { RemindersController } from '../controllers/reminders.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole, requireSalonAccess } from '../middlewares/rbac.middleware';

const router = Router({ mergeParams: true });

router.use(authenticateToken, requireRole(['owner', 'manager', 'staff']), requireSalonAccess);

router.get('/', RemindersController.getUpcomingReminders);
router.post('/', RemindersController.createReminder); // Needed since frontend calls POST /reminders
router.post('/send', RemindersController.sendManualReminder);
router.delete('/:id', RemindersController.deleteReminder);

export default router;
