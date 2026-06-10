import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', SearchController.searchSalons); // Public search
router.get('/dashboard', authenticateToken, SearchController.dashboardSearch); // Dashboard specific search

export default router;
