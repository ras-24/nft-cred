import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { duration, contractAddress, tokenId, metadata } = await req.json();

    if (!duration || !contractAddress || !tokenId || !metadata) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const requiredMetadataFields = [
      "name",
      "description",
      "image",
      "recipient",
      "issuer",
      "issue_date",
      "expiry_date",
      "verification_method",
      "blockchain",
      "ipfs_hash",
    ];

    for (const field of requiredMetadataFields) {
      if (!metadata[field]) {
        return NextResponse.json(
          { error: `Metadata field '${field}' is required` },
          { status: 400 }
        );
      }
    }

    if (!metadata.recipient?.name || !metadata.recipient?.id) {
      return NextResponse.json(
        { error: "Recipient name and ID are required" },
        { status: 400 }
      );
    }

    if (!metadata.issuer?.name || !metadata.issuer?.id) {
      return NextResponse.json(
        { error: "Issuer name and ID are required" },
        { status: 400 }
      );
    }

    if (
      !metadata.blockchain?.network ||
      !metadata.blockchain?.contract_address ||
      !metadata.blockchain?.token_id ||
      !metadata.blockchain?.tx_hash
    ) {
      return NextResponse.json(
        { error: "Blockchain details are required" },
        { status: 400 }
      );
    }

    const registeredNFT = await prisma.registeredNFT.findUnique({
      where: { contractAddress },
      include: { credentialType: true },
    });

    if (!registeredNFT) {
      return NextResponse.json(
        { error: "Registered NFT not found" },
        { status: 404 }
      );
    }

    const { basePrice, ltv, name } = registeredNFT.credentialType;

    const platformConfig = await prisma.platformConfig.findFirst();
    const interestRate = platformConfig?.interestRate ?? 0.01;

    const loanAmount = parseFloat((basePrice * (ltv / 100)).toFixed(4));
    const interest = parseFloat((loanAmount * (interestRate / 100)).toFixed(4));
    const totalLoan = parseFloat((loanAmount + interest).toFixed(4));

    return NextResponse.json(
      {
        message: "Loan estimate calculated successfully",
        credentialType: name,
        basePrice,
        duration: duration,
        ltv,
        loanAmount,
        interest,
        interestRate,
        totalLoan,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

