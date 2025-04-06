import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getWalletClient } from "@/app/lib/viemClient";
import { privateKeyToAccount } from "viem/accounts";
import NFTCredABI from "@/app/lib/ABI/NFTCredABI.json";

const nftcredContract = process.env.NEXT_PUBLIC_NFTCRED_CONTRACT as `0x${string}`;
if (!nftcredContract) {
  throw new Error(
    "NFTCRED_CONTRACT is not defined in the environment variables."
  );
}

// ✅ 1. Define Zod schema untuk validasi input
const loanSchema = z.object({
  contractAddress: z.string().startsWith("0x").length(42),
  tokenId: z.string().regex(/^\d+$/),
  loanAmount: z.string().regex(/^\d+$/),
  duration: z.string().regex(/^\d+$/),
  ltv: z.string().regex(/^\d+$/),
  credentialType: z.enum(["0", "1", "2"]), // Ubah ke enum sesuai CredentialType enum di Solidity
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = loanSchema.parse(json);

    const account = privateKeyToAccount(
      process.env.PRIVATE_KEY as `0x${string}`
    );
    const client = await getWalletClient(account);

    // ✅ 2. Panggil smart contract
    const txHash = await client.writeContract({
      address: nftcredContract,
      abi: NFTCredABI,
      functionName: "createLoan",
      args: [
        body.contractAddress as `0x${string}`,
        BigInt(body.tokenId),
        BigInt(body.loanAmount),
        BigInt(body.duration),
        BigInt(body.ltv),
        parseInt(body.credentialType),
      ],
      account,
    });

    return NextResponse.json({
      success: true,
      message: "Loan creation transaction sent",
      txHash,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create loan",
        details:
          error instanceof Error
            ? error.message
            : typeof error === "string"
            ? error
            : JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}
