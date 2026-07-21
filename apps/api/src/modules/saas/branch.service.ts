import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/errors';
import { CreateBranchDTO, UpdateBranchDTO } from '@decorflow/shared';

export class BranchService {
  async getBranches(companyId: string) {
    return prisma.branch.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBranch(companyId: string, data: CreateBranchDTO) {
    return prisma.branch.create({
      data: {
        companyId,
        ...data,
      },
    });
  }

  async updateBranch(branchId: string, companyId: string, data: UpdateBranchDTO) {
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, companyId },
    });

    if (!branch) {
      throw new ApiError(404, 'Branch not found');
    }

    return prisma.branch.update({
      where: { id: branchId },
      data,
    });
  }

  async getBranch(branchId: string, companyId: string) {
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, companyId },
    });

    if (!branch) {
      throw new ApiError(404, 'Branch not found');
    }

    return branch;
  }
}
