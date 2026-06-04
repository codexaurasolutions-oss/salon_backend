import { Router } from 'express';
import { UploadsController } from '../controllers/uploads.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, UploadsController.uploadFile);

export default router;
