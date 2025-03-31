import { NextResponse } from "next/server";
import { PrismaClient, UserType } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { wallet } = await req.json();

    // Input validation
    if (!wallet || typeof wallet !== "string") {
      return NextResponse.json(
        { error: "Wallet address is required and must be a string" },
        { status: 400 }
      );
    }

    // Check if the wallet is registered
    const existingUser = await prisma.user.findUnique({
      where: { wallet },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Wallet address already exists" },
        { status: 409 }
      );
    }

    // Insert new user
    const newUser = await prisma.user.create({
      data: {
        wallet,
        userType: UserType.BORROWER, // Default sebagai borrower
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
