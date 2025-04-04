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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tokenName,
      tickerSymbol,
      tokenImage,
      contractAddress,
      credentialTypeId,
    } = body;

    if (
      !tokenName ||
      !tickerSymbol ||
      !tokenImage ||
      !contractAddress ||
      !credentialTypeId
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const newRegisteredNFT = await prisma.registeredNFT.create({
      data: {
        tokenName,
        tickerSymbol,
        tokenImage,
        contractAddress,
        credentialTypeId,
      },
    });

    return NextResponse.json(newRegisteredNFT, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}