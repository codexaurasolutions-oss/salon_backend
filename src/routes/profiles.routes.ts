import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';

const router = Router();

router.get('/:id', UsersController.getProfile);

export default router;
