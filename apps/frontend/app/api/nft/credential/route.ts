import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, VerificationStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      credentialTypeId,
      contractAddress,
      tokenId,
      institution,
      verification,
      metadata,
    } = body;

    if (
      !userId ||
      !credentialTypeId ||
      !contractAddress ||
      !tokenId ||
      !institution ||
      !verification ||
      !metadata
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Object.values(VerificationStatus).includes(verification)) {
      return NextResponse.json(
        { error: "Invalid verification status" },
        { status: 400 }
      );
    }

    const credential = await prisma.credential.create({
      data: {
        userId,
        credentialTypeId,
        contractAddress,
        tokenId,
        institution,
        verification,
        metadata,
      },
    });

    return NextResponse.json(credential, { status: 201 });
  } catch (error) {
    console.error("Error creating Credential:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
