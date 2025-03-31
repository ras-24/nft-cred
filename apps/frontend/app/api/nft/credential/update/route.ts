import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, credentialId, verification, metadata } = body;

    if (!userId || !credentialId) {
      return NextResponse.json(
        { error: "userId and credentialId are required" },
        { status: 400 }
      );
    }

    const credential = await prisma.credential.update({
      where: { id: credentialId, userId },
      data: {
        verification,
        metadata,
      },
    });

    return NextResponse.json(credential, { status: 200 });
  } catch (error) {
    console.error("Error updating Credential:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
