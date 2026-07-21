import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthRepository } from './auth.repository';
import { ApiError, ValidationError } from '../../utils/errors';
import { signAccessToken, signRefreshToken } from '../../utils/jwt';
import { LoginDTO } from '@decorflow/shared';
import { PermissionService } from './permission.service';

export class AuthService {
  private repo = new AuthRepository();
  private permissionService = new PermissionService();

  async login(data: LoginDTO, ipAddress?: string, userAgent?: string) {
    const user = await this.repo.findUserByEmail(data.email);

    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (user.isLocked) {
      throw new ApiError(403, 'Account is locked');
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const session = await this.repo.createSession(user.id, ipAddress, userAgent);

    // Generate tokens
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(session.id);

    // Hash refresh token for DB storage
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.repo.saveRefreshToken(tokenHash, user.id, session.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        isSuperAdmin: user.isSuperAdmin,
      },
    };
  }

  async refresh(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const storedToken = await this.repo.findRefreshToken(tokenHash);

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const user = await this.repo.findUserById(storedToken.userId);
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const accessToken = signAccessToken(user.id);
    return { accessToken };
  }

  async logout(sessionId: string) {
    await this.repo.revokeSession(sessionId);
  }

  async getProfile(userId: string) {
    const user = await this.repo.findUserById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  }

  async updateProfile(userId: string, data: any) {
    // Stub for future implementation
    return { id: userId, ...data };
  }

  async getUserPermissions(userId: string) {
    return this.permissionService.getUserPermissions(userId);
  }

  async forgotPassword(email: string) {
    // Stub for future implementation
  }

  async resetPassword(token: string, password: string) {
    // Stub for future implementation
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Stub for future implementation
  }
}
