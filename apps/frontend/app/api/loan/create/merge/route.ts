import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getWalletClient } from "@/app/lib/viemClient";
import { privateKeyToAccount } from "viem/accounts";
import NFTCredABI from "@/app/lib/ABI/NFTCredABI.json";
import { parseUnits } from "viem";

const nftcredContract = process.env.NEXT_PUBLIC_NFTCRED_CONTRACT as `0x${string}`;
if (!nftcredContract) {
  throw new Error(
    "NFTCRED_CONTRACT is not defined in the environment variables."
  );
}

const loanSchema = z.object({
  contractAddress: z.string().startsWith("0x").length(42),
  tokenId: z.coerce.number().int().nonnegative(),
  loanAmount: z.coerce.number().nonnegative(),
  duration: z.coerce.number().int().nonnegative(),
  ltv: z.coerce.number().int().nonnegative(),
  credentialType: z.coerce.number().int().min(0).max(2),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = loanSchema.parse(json);

    const rawPrivateKey = process.env.PRIVATE_KEY || "";

    const privateKey = rawPrivateKey.startsWith("0x")
      ? rawPrivateKey
      : `0x${rawPrivateKey}`;

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const client = await getWalletClient(account);

    const txHash = await client.writeContract({
      address: nftcredContract,
      abi: NFTCredABI,
      functionName: "createLoan",
      args: [
        body.contractAddress as `0x${string}`,
        BigInt(body.tokenId),
        parseUnits(body.loanAmount.toString(), 6),
        BigInt(body.duration),
        BigInt(body.ltv),
        body.credentialType,
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
