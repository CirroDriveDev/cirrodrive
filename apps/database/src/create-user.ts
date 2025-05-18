import { hash } from "@node-rs/argon2";
import { PrismaClient } from "../dist/index.js";
const prisma = new PrismaClient();

export async function createUser(
  username: string,
  password: string,
  email: string,
  planId: string,
) {
  const user = await prisma.user.upsert({
    where: { email: email },
    update: {},
    create: {
      username: username,
      email: email,
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

  console.log("User and folders created/updated successfully");
  console.log("User:", {
    ...user,
    hashedPassword: "<hidden>",
  });
  console.log("Root Folder:", rootFolder);
  console.log("Trash Folder:", trashFolder);
  console.log();

  return { user, rootFolder, trashFolder };
}
