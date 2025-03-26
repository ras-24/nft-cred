import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const data = await prisma.user.findMany();
  console.log(data);  

  const data2 = await prisma.registeredNFT.findMany();
  console.log(data2);

  const data3 = await prisma.credentialType.findMany();
  console.log(data3);
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
