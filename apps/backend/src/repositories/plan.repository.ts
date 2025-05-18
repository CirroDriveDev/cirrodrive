import { injectable } from "inversify";
import { Prisma, Plan } from "@cirrodrive/database";
import { BaseRepository } from "@/repositories/base.repository.ts";

@injectable()
export class PlanRepository extends BaseRepository {
  // Create
  async create(data: Prisma.PlanUncheckedCreateInput): Promise<Plan> {
    return this.prisma.plan.create({ data });
  }

  // Read
  async findById(id: string): Promise<Plan | null> {
    return this.prisma.plan.findUnique({ where: { id } });
  }

  async getById(id: string): Promise<Plan> {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) {
      throw new Error(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  public async getByName(name: string): Promise<Plan> {
    const plan = await this.prisma.plan.findUnique({ where: { name } });
    if (!plan) {
      throw new Error(`Plan with name ${name} not found`);
    }
    return plan;
  }

  async listAll(): Promise<Plan[]> {
    return this.prisma.plan.findMany();
  }

  // Update
  async updateById(id: string, data: Prisma.PlanUpdateInput): Promise<Plan> {
    return this.prisma.plan.update({ where: { id }, data });
  }

  // Delete
  async deleteById(id: string): Promise<Plan> {
    return this.prisma.plan.delete({ where: { id } });
  }
}
