import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthRepository } from './auth.repository';
import { ApiError, ValidationError } from '../../utils/errors';
import { signAccessToken, signRefreshToken } from '../../utils/jwt';
import { LoginDTO } from '@decorflow/shared';
import { PermissionService } from './permission.service';
import { sendMail } from '../../lib/mail';
import { env } from '../../config/env';
import { logger } from '@decorflow/logger';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashResetToken(rawToken: string) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

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

  async updateProfile(userId: string, data: { name: string; email: string; avatarUrl?: string }) {
    const existing = await this.repo.findUserById(userId);
    if (!existing) throw new ApiError(404, 'User not found');

    const nextEmail = data.email.trim().toLowerCase();
    if (nextEmail !== existing.email.toLowerCase()) {
      const taken = await this.repo.findUserByEmail(nextEmail);
      if (taken && taken.id !== userId) {
        throw new ValidationError('Email is already in use');
      }
    }

    const avatarUrl =
      data.avatarUrl === undefined || data.avatarUrl === '' ? undefined : data.avatarUrl;

    return this.repo.updateUser(userId, {
      name: data.name.trim(),
      email: nextEmail,
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    });
  }

  async getUserPermissions(userId: string) {
    return this.permissionService.getUserPermissions(userId);
  }

  /**
   * Request a password reset. Always resolves successfully to avoid email enumeration.
   * Creates a time-limited opaque token (stored hashed), emails a reset link.
   */
  async forgotPassword(email: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.repo.findUserByEmail(normalized);

    if (!user || !user.isActive) {
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.repo.deletePasswordResetTokensForUser(user.id);
    await this.repo.createPasswordResetToken(user.id, tokenHash, expiresAt);

    const resetUrl = `${env.APP_URL.replace(/\/$/, '')}/reset-password?token=${rawToken}`;

    try {
      await sendMail({
        to: user.email,
        subject: 'Reset your DecorFlow password',
        text: [
          `Hi ${user.name || 'there'},`,
          '',
          'We received a request to reset your DecorFlow password.',
          `Open this link within 1 hour to choose a new password:`,
          resetUrl,
          '',
          'If you did not request this, you can ignore this email.',
        ].join('\n'),
        html: `
          <p>Hi ${user.name || 'there'},</p>
          <p>We received a request to reset your DecorFlow password.</p>
          <p><a href="${resetUrl}">Reset your password</a> (link expires in 1 hour).</p>
          <p>If you did not request this, you can ignore this email.</p>
        `,
      });
    } catch (error) {
      logger.error('Password reset email failed', { userId: user.id, error });
      // Do not leak mail failures to the client (same generic response).
    }
  }

  /**
   * Confirm password reset with the raw token from the email link.
   * Validates hash + expiry, updates password, invalidates token and sessions.
   */
  async resetPassword(token: string, password: string) {
    const tokenHash = hashResetToken(token);
    const stored = await this.repo.findPasswordResetToken(tokenHash);

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await this.repo.deletePasswordResetTokenById(stored.id);
      }
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    if (!stored.user.isActive) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await this.repo.updateUser(stored.userId, { passwordHash });
    await this.repo.deletePasswordResetTokensForUser(stored.userId);
    await this.repo.revokeAllSessionsForUser(stored.userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.repo.findUserAuthById(userId);
    if (!user || !user.isActive) {
      throw new ApiError(404, 'User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new ApiError(400, 'Current password is incorrect');
    }

    if (currentPassword === newPassword) {
      throw new ValidationError('New password must be different from the current password');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.repo.updateUser(userId, { passwordHash });
  }
}
