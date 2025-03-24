import { NextRequest, NextResponse } from "next/server";
import { fetchNFTs } from "../../lib/fetchNFTs";

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, contractAddress } = await req.json();

    if (!walletAddress || !contractAddress) {
      return NextResponse.json(
        { error: "walletAddress and contractAddress are required" },
        { status: 400 }
      );
    }

    const nfts = await fetchNFTs(walletAddress, contractAddress);
    return NextResponse.json({ nfts }, { status: 200 });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch NFTs" },
      { status: 500 }
    );
  }
}
