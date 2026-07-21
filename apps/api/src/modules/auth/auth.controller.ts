import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../utils/response';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '@decorflow/shared';
import { appConfig } from '../../config';

const authService = new AuthService();

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: appConfig.isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return sendSuccess(res, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const result = await authService.refresh(refreshToken);

      return sendSuccess(res, { accessToken: result.accessToken });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie('refreshToken');
      return sendSuccess(res, null);
    } catch (error) {
      next(error);
    }
  },

  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getProfile((req as any).user.id);
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateProfileSchema.parse(req.body);
      const user = await authService.updateProfile((req as any).user.id, data);
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  },

  getPermissions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permissions = await authService.getUserPermissions((req as any).user.id);
      return sendSuccess(res, permissions);
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = forgotPasswordSchema.parse(req.body);
      await authService.forgotPassword(data.email);
      return sendSuccess(res, null);
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(data.token, data.password);
      return sendSuccess(res, null);
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = changePasswordSchema.parse(req.body);
      await authService.changePassword(
        (req as any).user.id,
        data.currentPassword,
        data.newPassword
      );
      return sendSuccess(res, null);
    } catch (error) {
      next(error);
    }
  },
};
