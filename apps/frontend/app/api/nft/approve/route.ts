import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

export async function POST(req: NextRequest) {
  try {
    const { borrower, contractAddress, tokenId } = await req.json();

    // Input validation
    if (!borrower || !contractAddress || !tokenId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error(
        "PRIVATE_KEY is not defined in the environment variables."
      );
    }

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(privateKey, provider);
    const nftContract = new ethers.Contract(
      contractAddress,
      ["function approve(address, uint256)"],
      signer
    );

    console.log("Sending approval transaction...");
    console.log(
      `Approving NFT ${tokenId} for contract: ${process.env.NEXT_PUBLIC_NFTCRED_CONTRACT}`
    );

    const tx = await nftContract.approve(process.env.NEXT_PUBLIC_NFTCRED_CONTRACT, tokenId);
    await tx.wait();

    console.log(`Transaction successful: ${tx.hash}`);

    return NextResponse.json(
      { message: "NFT approved successfully", txHash: tx.hash },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during NFT approval:", error);
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
