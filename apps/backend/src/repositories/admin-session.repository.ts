import { injectable } from "inversify";
import type { Prisma, AdminSession } from "@cirrodrive/database/prisma";
import { BaseRepository } from "#repositories/base.repository";

@injectable()
export class AdminSessionRepository extends BaseRepository {
  async findById(id: string): Promise<AdminSession | null> {
    return this.prisma.adminSession.findUnique({ where: { id } });
  }

  async findByToken(id: string): Promise<AdminSession | null> {
    return this.prisma.adminSession.findUnique({ where: { id } });
  }

  async create(
    data: Prisma.AdminSessionUncheckedCreateInput,
  ): Promise<AdminSession> {
    return this.prisma.adminSession.create({ data });
  }

  async delete(id: string): Promise<AdminSession> {
    return this.prisma.adminSession.delete({ where: { id } });
  }

  async deleteByAdminId(adminId: string): Promise<Prisma.BatchPayload> {
    return this.prisma.adminSession.deleteMany({ where: { adminId } });
  }
}
