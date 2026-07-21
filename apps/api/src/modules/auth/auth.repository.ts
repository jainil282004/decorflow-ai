import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        isActive: true,
        isEmailVerified: true,
        isLocked: true,
        isSuperAdmin: true,
      },
    });
  }

  async findUserAuthById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        isActive: true,
      },
    });
  }

  async updateUser(
    id: string,
    data: { name?: string; email?: string; passwordHash?: string; avatarUrl?: string | null }
  ) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        isActive: true,
        isEmailVerified: true,
        isLocked: true,
        isSuperAdmin: true,
      },
    });
  }

  async createSession(userId: string, ipAddress?: string, userAgent?: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    return prisma.session.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });
  }

  async saveRefreshToken(tokenHash: string, userId: string, sessionId: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        sessionId,
        expiresAt,
      },
    });
  }

  async findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { session: true },
    });
  }

  async revokeSession(sessionId: string) {
    await prisma.refreshToken.updateMany({
      where: { sessionId },
      data: { isRevoked: true },
    });
    return prisma.session.delete({ where: { id: sessionId } });
  }
}
