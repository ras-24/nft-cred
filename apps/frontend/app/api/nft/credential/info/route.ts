import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const credentials = await prisma.credential.findMany({
      where: { userId },
      include: {
        credentialType: true,
      },
    });

    return NextResponse.json(credentials, { status: 200 });
  } catch (error) {
    console.error("Error fetching Credentials:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
