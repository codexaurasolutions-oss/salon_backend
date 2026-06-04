import { Router } from 'express';
import { KnowledgeBaseController } from '../controllers/knowledge-base.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/', KnowledgeBaseController.getArticles); // Public
router.get('/:slug', KnowledgeBaseController.getArticle); // Public

// Admin only
router.use(authenticateToken, requireRole(['super_admin', 'admin']));
router.post('/', KnowledgeBaseController.createArticle);
router.put('/:id', KnowledgeBaseController.updateArticle);

export default router;
