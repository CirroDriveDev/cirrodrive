import { PrismaClient } from "../dist/index.js";
import { hash } from "@node-rs/argon2";
const prisma = new PrismaClient();

async function createUserWithFolder(
  username: string,
  password: string,
  email: string,
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

async function main() {
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    const { user: adminUser } = await createUserWithFolder(
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASSWORD,
      "adminuser@example.com",
    );

    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        isAdmin: true,
      },
    });
  } else {
    console.error("ADMIN_USERNAME and ADMIN_PASSWORD must be set");
  }

  await createUserWithFolder(
    "testuser1",
    "testTEST1234!",
    "testuser1@example.com",
  );

  await createUserWithFolder(
    "testuser2",
    "testTEST1234!",
    "testuser2@example.com",
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
