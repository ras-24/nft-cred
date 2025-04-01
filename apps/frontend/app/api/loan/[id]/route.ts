import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET Loan by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: { user: true, credential: true, transactions: true },
    });

    if (!loan)
      return NextResponse.json({ message: "Loan not found" }, { status: 404 });
    return NextResponse.json(loan);
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

// UPDATE Loan by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedLoan);
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

// DELETE Loan by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.loan.delete({ where: { id } });

    return NextResponse.json(
      { message: `Loan with ID ${id} successfully deleted.` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting loan:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          error: "Loan not found",
          details: "No loan found with the provided ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to delete loan",
        details: error.message || error,
      },
      { status: 500 }
    );
  }
}



