import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // await prisma.user.create({
  //   data: {
  //     wallet: "0x123456789abcdef123456789abcdef1234567890",
  //     email: "user@example.com",
  //     username: "nftcreduser",
  //     profilePic: "https://example.com/profile.jpg",
  //     userType: "BORROWER",
  //     credentials: {},
  //     loans: {},
  //   },
  // });

  // const allUsers = await prisma.user.findMany();
  // console.log(allUsers);

  const registeredNFTs = await prisma.registeredNFT.findMany();
  console.log(registeredNFTs);
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
