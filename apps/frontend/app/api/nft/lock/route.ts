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

    const nftcredContract = process.env.NFTCRED_CONTRACT;
    if (!nftcredContract) {
      throw new Error(
        "NFTCRED_CONTRACT is not defined in the environment variables."
      );
    }

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(privateKey, provider);
    const loanContract = new ethers.Contract(
      nftcredContract,
      ["function lockNFT(address,uint256)"],
      signer
    );

    const tx = await loanContract.lockNFT(contractAddress, tokenId);
    await tx.wait();

    return NextResponse.json(
      { message: "NFT locked successfully", txHash: tx.hash },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
