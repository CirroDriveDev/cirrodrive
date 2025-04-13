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

  console.log({
    user,
    rootFolder,
    trashFolder,
  });
  return { user, rootFolder, trashFolder };
}

async function main() {
  const {
    user: testuser1,
    rootFolder: testuser1RootFolder,
    trashFolder: testuser1TrashFolder,
  } = await createUserWithFolder(
    "testuser1",
    "testTEST1234!",
    "testuser1@example.com",
  );

  const {
    user: testuser2,
    rootFolder: testuser2RootFolder,
    trashFolder: testuser2TrashFolder,
  } = await createUserWithFolder(
    "testuser2",
    "testTEST1234!",
    "testuser2@example.com",
  );

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

  console.log({
    testuser1,
    testuser1RootFolder,
    testuser1TrashFolder,
    testuser2,
    testuser2RootFolder,
    testuser2TrashFolder,
  });
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
