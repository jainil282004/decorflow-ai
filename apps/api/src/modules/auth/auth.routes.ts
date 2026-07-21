import { Router } from 'express';
import { authController } from './auth.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

// Protected Routes
router.get('/profile', requireAuth, authController.getProfile);
router.get('/permissions', requireAuth, authController.getPermissions);

export const authRoutes = router;
