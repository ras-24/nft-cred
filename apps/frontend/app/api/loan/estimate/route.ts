import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { duration, contractAddress } = await req.json();

    if (!duration || !contractAddress ) {
      return NextResponse.json(
        { error: "All fields are required" },
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

