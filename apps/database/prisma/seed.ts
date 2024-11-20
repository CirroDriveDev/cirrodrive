import { PrismaClient } from "../dist/index.js";
import { hash } from "@node-rs/argon2";
const prisma = new PrismaClient();

async function main() {
  const testuser1 = await prisma.user.upsert({
    where: { email: "testuser1@example.com" },
    update: {},
    create: {
      username: "testuser1",
      email: "testuser1@example.com",
      hashedPassword: await hash("testTEST1234!"),
      rootFolder: {
        create: {
          name: "root",
        },
      },
    },
    include: {
      rootFolder: true,
    },
  });

  const testuser1RootFolder = await prisma.folder.update({
    where: { id: testuser1.rootFolderId },
    data: {
      ownerId: testuser1.id,
    },
  });

  const testuser2 = await prisma.user.upsert({
    where: { email: "testuser2@example.com" },
    update: {},
    create: {
      username: "testuser2",
      email: "testuser2@example.com",
      hashedPassword: await hash("testTEST1234!"),
      rootFolder: {
        create: {
          name: "root",
        },
      },
    },
    include: {
      rootFolder: true,
    },
  });

  const testuser2RootFolder = await prisma.folder.update({
    where: { id: testuser2.rootFolderId },
    data: {
      ownerId: testuser2.id,
    },
  });

  console.log({
    testuser1,
    testuser1RootFolder,
    testuser2,
    testuser2RootFolder,
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
