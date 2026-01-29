import { Router } from 'express';
import {
    getAllFrameLayouts,
    getFrameLayoutById,
    createFrameLayout,
    getAssets,
    getCategories,
} from '../controllers/frameLayout.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/frame-layouts', getAllFrameLayouts);
router.get('/frame-layouts/:id', getFrameLayoutById);
router.get('/assets', getAssets);
router.get('/categories', getCategories);

// Protected routes (admin only - add admin middleware later)
router.post('/frame-layouts', authenticateToken, createFrameLayout);

export default router;
