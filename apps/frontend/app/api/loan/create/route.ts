import { NextRequest, NextResponse } from "next/server";
import { ethers, Log, Interface, LogDescription } from "ethers";
import ABI from "@/app/lib/ABI/NFTCredABI.json";

const CONTRACT_ADDRESS = process.env.NFTCRED_CONTRACT as `0x${string}`;
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const RPC_URL = process.env.RPC_URL as string;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

export async function POST(req: NextRequest) {
  try {
    const { contractAddress, tokenId, loanAmount, duration, ltv } =
      await req.json();

    if (!contractAddress || !tokenId || !loanAmount || !duration || !ltv) {
      return NextResponse.json(
        { success: false, error: "Missing parameters" },
        { status: 400 }
      );
    }

    const amountInWei = ethers.parseUnits(loanAmount.toString(), 6);

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    const tx = await contract.createLoan(
      contractAddress,
      tokenId,
      amountInWei,
      duration,
      ltv
    );

    console.log("Transaction sent, awaiting confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction mined, receipt:", receipt);

    const loanCreatedEvent = receipt.logs
      .map((log: Log) => {
        try {
          return new Interface(ABI).parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .find(
        (event: LogDescription | null): event is LogDescription =>
          event !== null && event.name === "LoanCreated"
      );

    if (!loanCreatedEvent) {
      return NextResponse.json(
        { success: false, error: "LoanCreated event not found" },
        { status: 500 }
      );
    }

    const loanId = loanCreatedEvent.args[0];

    return NextResponse.json({
      success: true,
      loanId: loanId.toString(),
      txHash: receipt.hash,
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
