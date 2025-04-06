import { ethers, formatUnits } from "ethers";
import { NextRequest, NextResponse } from "next/server";
import ERC20ABI from "@/app/lib/ABI/ERC20ABI.json";

export const dynamic = "force-dynamic";

const nftcredContract = process.env.NEXT_PUBLIC_NFTCRED_CONTRACT;
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
    // Get the wallet address from the query parameters
    const searchParams = req.nextUrl.searchParams;
    const address = searchParams.get('address');
    
    // If address is provided, get the balance of that address
    // Otherwise, fall back to getting the contract's balance
    const targetAddress = address || nftcredContract;
    
    const balance = await usdcContract.balanceOf(targetAddress);

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
