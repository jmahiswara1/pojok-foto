import { Router } from 'express';
import {
    createPhotoProject,
    getPhotoProject,
    updatePhotoProject,
    addProjectPhoto,
    addProjectSticker,
    addProjectText,
    getUserPhotoProjects,
    deletePhotoProject,
} from '../controllers/photoProject.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/photo-projects', createPhotoProject);
router.get('/photo-projects', getUserPhotoProjects);
router.get('/photo-projects/:id', getPhotoProject);
router.put('/photo-projects/:id', updatePhotoProject);
router.delete('/photo-projects/:id', deletePhotoProject);

router.post('/photo-projects/:id/photos', addProjectPhoto);
router.post('/photo-projects/:id/stickers', addProjectSticker);
router.post('/photo-projects/:id/texts', addProjectText);

export default router;
