import { prisma } from '../../lib/prisma';

export class PermissionService {
  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return [];

    // Super admins can access every route/UI gate
    if (user.isSuperAdmin) {
      const all = await prisma.permission.findMany({ select: { name: true } });
      return all.map((p) => p.name);
    }

    const permissions = new Set<string>();

    for (const userRole of user.roles) {
      for (const rolePerm of userRole.role.permissions) {
        permissions.add(rolePerm.permission.name);
      }
    }

    return Array.from(permissions);
  }
}
