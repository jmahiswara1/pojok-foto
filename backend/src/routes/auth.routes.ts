import { Router } from 'express';
import passport from 'passport';
import { login, register, googleCallback, getMe, forgotPassword, resetPassword, setPassword, requestChangePassword } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    googleCallback
);

router.get('/me', authenticateToken, getMe);

// Email Password Reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Password Management (Authenticated)
router.post('/set-password', authenticateToken, setPassword);
router.post('/request-change-password', authenticateToken, requestChangePassword);

export default router;
