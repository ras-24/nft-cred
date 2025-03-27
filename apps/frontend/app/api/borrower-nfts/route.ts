import { NextRequest, NextResponse } from "next/server";
import { fetchNFTs } from "../../lib/fetchNFTs";

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, contractAddresses } = await req.json();

    if (
      !walletAddress ||
      !Array.isArray(contractAddresses) ||
      contractAddresses.length === 0
    ) {
      return NextResponse.json(
        {
          error: "walletAddress and at least one contractAddress are required",
        },
        { status: 400 }
      );
    }

    const nfts = await fetchNFTs(walletAddress, contractAddresses);
    return NextResponse.json({ nfts }, { status: 200 });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch NFTs" },
      { status: 500 }
    );
  }
}
