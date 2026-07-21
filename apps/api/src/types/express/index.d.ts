import { User, UserRole, Role } from '@prisma/client';

declare global {
  namespace Express {
    export interface Request {
      user?: User & {
        roles: (UserRole & { role: Role })[];
      };
    }
  }
}
