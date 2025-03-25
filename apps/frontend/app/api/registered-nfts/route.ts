import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const registeredNFTs = await prisma.registeredNFT.findMany();

    return NextResponse.json(registeredNFTs, { status: 200 });
  } catch (error) {
    console.error("Error fetching registered NFTs:", error);
    return NextResponse.json(
      { error: "Failed to fetch registered NFTs" },
      { status: 500 }
    );
  }
}
