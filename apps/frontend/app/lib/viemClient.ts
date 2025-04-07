import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { eduChainTestnet } from "./eduChain";

// Initialize account only if PRIVATE_KEY is available
let account: ReturnType<typeof privateKeyToAccount> | undefined;
const rawPrivateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY || process.env.PRIVATE_KEY;

if (rawPrivateKey) {
  account = privateKeyToAccount(
    rawPrivateKey.startsWith("0x")
      ? (rawPrivateKey as `0x${string}`)
      : (`0x${rawPrivateKey}` as `0x${string}`)
  );
}

export const client = createPublicClient({
  chain: eduChainTestnet,
  transport: http(),
});

export const getWalletClient = (accountParam: typeof account) => {
  if (!accountParam) {
    throw new Error("No account available. Make sure NEXT_PUBLIC_PRIVATE_KEY is set.");
  }
  
  return createWalletClient({
    chain: eduChainTestnet,
    transport: http(),
    account: accountParam,
  });
};
