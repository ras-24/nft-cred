import { ethers, parseUnits } from "ethers";
import { NextRequest, NextResponse } from "next/server";
import NFTCredABI from "@/app/lib/ABI/NFTCredABI.json";
import ERC20ABI from "@/app/lib/ABI/ERC20ABI.json"

const nftcredContract = process.env.NEXT_PUBLIC_NFTCRED_CONTRACT;
if (!nftcredContract) {
  throw new Error(
    "NFTCRED_CONTRACT is not defined in the environment variables."
  );
}

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error(
    "PRIVATE_KEY is not defined in the environment variables."
  );
}

const usdcContract = process.env.USDC_CONTRACT;
if (!usdcContract) {
  throw new Error("USDC_CONTRACT is not defined in the environment variables.");
}

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(privateKey, provider);
const nftcred = new ethers.Contract(nftcredContract, NFTCredABI, signer);
const usdc = new ethers.Contract(usdcContract, ERC20ABI, signer);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount } = body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount", details: `Received amount: ${amount}` },
        { status: 400 }
      );
    }

    // Convert USDC Token to Wei
    const amountInWei = parseUnits(amount, 6);

    // Approve USDC
    const approveTx = await usdc.approve(nftcredContract, amountInWei);
    await approveTx.wait();

    // Deposit USDC
    const depositTx = await nftcred.depositUSDC(amountInWei);
    await depositTx.wait();

    return NextResponse.json(
      { message: "Deposit successful", transactionHash: depositTx.hash },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in depositUSDC API:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
