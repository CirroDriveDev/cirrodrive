import { PrismaClient } from "../dist/index.js";
import { hash } from "@node-rs/argon2";
const prisma = new PrismaClient();

async function createUserWithRootDir(
  username: string,
  password: string,
  email: string,
) {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { username: username },
      update: {},
      create: {
        username: username,
        email: email,
        hashedPassword: await hash(password),
        rootDir: {
          create: {
            name: "root",
            isDir: true,
            fullPath: "/root",
          },
        },
      },
    });

    await tx.file.update({
      where: {
        id: user.rootDirId,
      },
      data: {
        ownerId: user.id,
      },
    });

    console.log("User and folders created/updated successfully");
    console.log("User:", {
      ...user,
      hashedPassword: "<hidden>",
    });
    return { user };
  });
}

async function main() {
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    const { user: adminUser } = await createUserWithRootDir(
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

  await createUserWithRootDir(
    "testuser1",
    "testTEST1234!",
    "testuser1@example.com",
  );

  await createUserWithRootDir(
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
