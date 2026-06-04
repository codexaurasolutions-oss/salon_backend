import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/roles', UsersController.getRoles);
router.get('/me', UsersController.getMe);
router.put('/me', UsersController.updateMe);
router.put('/:id', requireRole(['super_admin', 'admin']), UsersController.updateUser);

export default router;
