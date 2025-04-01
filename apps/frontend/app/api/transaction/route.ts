import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get All Transactions or by userId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let transactions;

    if (userId) {
      // Get transaction based on userId
      transactions = await prisma.transaction.findMany({
        where: {
          loan: {
            userId: userId,
          },
        },
        include: { loan: true },
      });
    } else {
      // Get all transactions
      transactions = await prisma.transaction.findMany({
        include: { loan: true },
      });
    }

    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}

// Create New Transaction
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { loanId, amount, txType, txHash } = body;

    if (!loanId || !amount || !txType) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        loanId,
        amount,
        txType,
        txHash,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    console.error("Error creating transaction:", error);

    return NextResponse.json(
      {
        error: "Failed to create transaction",
        details: error.message || error,
      },
      { status: 500 }
    );
  }
}

