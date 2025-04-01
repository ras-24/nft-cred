import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET All Loan
export async function GET(req: NextRequest) {
  try {
    const loans = await prisma.loan.findMany({
      include: { user: true, credential: true },
    });
    return NextResponse.json(loans);
  } catch (error: any) {
    console.error("Error creating loan:", error);

    return NextResponse.json(
      {
        error: "Failed to create loan",
        details: error.message || error,
      },
      { status: 500 }
    );
  }
}

// Create New Loan
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, contractAddress, tokenId, loanAmount, duration, ltv } =
      body;
    const newLoan = await prisma.loan.create({
      data: {
        userId,
        contractAddress,
        tokenId,
        loanAmount,
        duration,
        ltv,
        status: "PENDING",
      },
    });
    return NextResponse.json(newLoan, { status: 201 });
  } catch (error: any) {
    console.error("Error creating loan:", error);

    return NextResponse.json(
      {
        error: "Failed to create loan",
        details: error.message || error,
      },
      { status: 500 }
    );
  }
}
