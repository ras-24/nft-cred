import { ethers, formatUnits } from "ethers";
import { NextRequest, NextResponse } from "next/server";
import ERC20ABI from "@/app/lib/ABI/ERC20ABI.json";

const nftcredContract = process.env.NFTCRED_CONTRACT;
if (!nftcredContract) {
  throw new Error("NFTCRED_CONTRACT is not defined in environment variables.");
}

const usdcTokenAddress = process.env.USDC_CONTRACT;
if (!usdcTokenAddress) {
  throw new Error("USDC_CONTRACT is not defined in environment variables.");
}

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const usdcContract = new ethers.Contract(usdcTokenAddress, ERC20ABI, provider);

export async function GET(req: NextRequest) {
  try {
    const balance = await usdcContract.balanceOf(nftcredContract);

    // Convert Wei to USDC Token
    const formattedBalance = formatUnits(balance, 6);

    return NextResponse.json({ balance: formattedBalance }, { status: 200 });
  } catch (error: any) {
    console.error("Error in usdc get balance API:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
