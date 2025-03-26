import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  const data = await prisma.credentialType.findMany();
  console.log(data);
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
