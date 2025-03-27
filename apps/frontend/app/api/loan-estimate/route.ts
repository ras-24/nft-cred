import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { duration, contractAddress, tokenId, metadata } = await req.json();

    // Validation: Make sure all key fields are filled in.
    if (!duration || !contractAddress || !tokenId || !metadata) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Further metadata validation
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

    // Recipient validation
    if (!metadata.recipient?.name || !metadata.recipient?.id) {
      return NextResponse.json(
        { error: "Recipient name and ID are required" },
        { status: 400 }
      );
    }

    // Issuer validation
    if (!metadata.issuer?.name || !metadata.issuer?.id) {
      return NextResponse.json(
        { error: "Issuer name and ID are required" },
        { status: 400 }
      );
    }

    // Blockchain validation
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

    console.log(duration, contractAddress, tokenId, metadata);

    return NextResponse.json(
      { message: "Loan estimate request submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );  
  }
}
