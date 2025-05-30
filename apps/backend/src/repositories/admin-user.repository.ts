import { injectable } from "inversify";
import type { Prisma, AdminUser } from "@cirrodrive/database/prisma";
import { BaseRepository } from "#repositories/base.repository";

@injectable()
export class AdminUserRepository extends BaseRepository {
  async findByEmail(email: string): Promise<AdminUser | null> {
    return this.prisma.adminUser.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<AdminUser | null> {
    return this.prisma.adminUser.findUnique({ where: { id } });
  }

  async create(data: Prisma.AdminUserCreateInput): Promise<AdminUser> {
    return this.prisma.adminUser.create({ data });
  }

  async update(
    id: number,
    data: Prisma.AdminUserUpdateInput,
  ): Promise<AdminUser> {
    return this.prisma.adminUser.update({ where: { id }, data });
  }

  async delete(id: number): Promise<AdminUser> {
    return this.prisma.adminUser.delete({ where: { id } });
  }
}
