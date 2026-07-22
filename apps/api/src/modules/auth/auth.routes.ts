import { Router } from 'express';
import { authController } from './auth.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected Routes
router.get('/profile', requireAuth, authController.getProfile);
router.patch('/profile', requireAuth, authController.updateProfile);
router.post('/change-password', requireAuth, authController.changePassword);
router.get('/permissions', requireAuth, authController.getPermissions);

export const authRoutes = router;
