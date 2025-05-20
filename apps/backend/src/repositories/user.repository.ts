import { injectable } from "inversify";
import { Prisma, type User, type Plan } from "@cirrodrive/database/prisma";
import { BaseRepository } from "#repositories/base.repository.js";
import { DBNotFoundError } from "#errors/db-error-classes.js";

@injectable()
export class UserRepository extends BaseRepository {
  // Create
  public async create(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  // Read
  public async getById(id: string): Promise<User> {
    const result = await this.prisma.user.findUnique({ where: { id } });
    if (!result) {
      throw new DBNotFoundError("User", { id });
    }
    return result;
  }

  public async getByUsername(username: string): Promise<User> {
    const result = await this.prisma.user.findUnique({ where: { username } });
    if (!result) {
      throw new DBNotFoundError("User (username)", { username });
    }
    return result;
  }

  public async getByEmail(email: string): Promise<User> {
    const result = await this.prisma.user.findUnique({ where: { email } });
    if (!result) {
      throw new DBNotFoundError("User (email)", { email });
    }
    return result;
  }

  public async getCurrentPlanByUserId(userId: string): Promise<Plan> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { currentPlan: true },
    });
    if (!user?.currentPlan) {
      throw new DBNotFoundError("User's current plan", { userId });
    }
    return user.currentPlan;
  }

  // Update
  public async updateById(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  // Delete
  public async deleteById(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
