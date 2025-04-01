import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contractAddress = searchParams.get("contractAddress");

    // If contractAddress is given, fetch one NFT
    if (contractAddress) {
      const registeredNFT = await prisma.registeredNFT.findUnique({
        where: { contractAddress },
        select: {
          id: true,
          tokenName: true,
          tickerSymbol: true,
          contractAddress: true,
          credentialTypeId: true,
        },
      });

      if (!registeredNFT) {
        return NextResponse.json(
          { error: "Registered NFT not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(registeredNFT, { status: 200 });
    }

    // If contractAddress does not exist, take all NFTs
    const registeredNFTs = await prisma.registeredNFT.findMany();
    return NextResponse.json(registeredNFTs, { status: 200 });
  } catch (error) {
    console.error("Error fetching registered NFTs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
