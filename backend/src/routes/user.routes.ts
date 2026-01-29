import { Router } from 'express';
import { updateProfile, updatePassword, updateAvatar } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { upload } from '../config/upload';

const router = Router();

router.put('/profile', authenticateToken, updateProfile);
router.put('/password', authenticateToken, updatePassword);
router.post('/avatar', authenticateToken, upload.single('avatar'), updateAvatar);

export default router;
