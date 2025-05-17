import { AsyncLocalStorage } from "node:async_hooks";
import { PrismaClient } from "@cirrodrive/database";
import type { PrismaTx } from "@/loaders/prisma.loader.ts";

const txStorage = new AsyncLocalStorage<{ tx: PrismaTx }>();

export class TxContext {
  // 트랜잭션 컨텍스트 내에서 콜백을 실행
  static run<T>(tx: PrismaTx, fn: () => Promise<T>): Promise<T> {
    return txStorage.run({ tx }, fn);
  }

  // 현재 비동기 컨텍스트의 트랜잭션 반환
  static get(): PrismaTx | undefined {
    return txStorage.getStore()?.tx;
  }
}

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
        // 이미 트랜잭션 컨텍스트가 있으면 그대로 실행
        return await originalMethod.apply(this, args);
      }

      const { container } = await import("@/loaders/inversify.loader.ts");
      const prisma = container.get<PrismaClient>(PrismaClient);
      // 새로운 트랜잭션 컨텍스트에서 실행
      return await prisma.$transaction(async (tx) => {
        return await TxContext.run(tx, async () => {
          return await originalMethod.apply(this, args);
        });
      });
    };

    return descriptor;
  };
}
