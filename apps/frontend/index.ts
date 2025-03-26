import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const data = await prisma.registeredNFT.findMany();
  console.log(data);

  const data2 = await prisma.credentialType.findMany();
  console.log(data2);  
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
