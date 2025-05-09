import { PrismaClient } from "@cirrodrive/database";
import { TxContext } from "@/contexts/tx-context.ts";

/**
 * Transactional 데코레이터
 *
 * 자동으로 트랜잭션을 관리하는 데코레이터입니다.
 *
 * 트랜잭션이 있는 경우, 새로운 트랜잭션을 생성하지 않고 기존 트랜잭션을 사용합니다.
 *
 * 트랜잭션이 없는 경우, 새로운 트랜잭션을 생성하고 메서드를 실행합니다.
 */
export function Transactional(): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    const originalMethod = descriptor.value as (
      ...args: unknown[]
    ) => Promise<unknown>;

    // @ts-expect-error -- 타입스크립트는 메서드를 래핑할 때 타입을 추론하지 못함
    descriptor.value = async function transactionalWrapper(
      this: unknown,
      ...args: unknown[]
    ): Promise<unknown> {
      const existingTx = TxContext.get();

      if (existingTx) {
        return await originalMethod.apply(this, args);
      }

      const { container } = await import("@/loaders/inversify.loader.ts");
      const prisma = container.get<PrismaClient>(PrismaClient);
      return await prisma.$transaction(async (tx) => {
        TxContext.set(tx);
        try {
          return await originalMethod.apply(this, args);
        } finally {
          TxContext.clear();
        }
      });
    };

    return descriptor;
  };
}
