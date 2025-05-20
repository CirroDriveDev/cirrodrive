import { hash } from "@node-rs/argon2";
import { prisma } from "#client";

export async function createUser(
  username: string,
  password: string,
  email: string,
  planId: string,
) {
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      username,
      email,
      hashedPassword: await hash(password),
      rootFolder: {
        create: {
          name: "root",
        },
      },
      trashFolder: {
        create: {
          name: "trash",
        },
      },
      currentPlan: {
        connect: {
          id: planId,
        },
      },
    },
    include: {
      rootFolder: true,
    },
  });

  const rootFolder = await prisma.folder.update({
    where: { id: user.rootFolderId },
    data: {
      ownerId: user.id,
    },
  });

  const trashFolder = await prisma.folder.update({
    where: { id: user.trashFolderId },
    data: {
      ownerId: user.id,
    },
  });

  return { user, rootFolder, trashFolder };
}
