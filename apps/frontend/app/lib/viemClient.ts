import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { eduChainTestnet } from "./eduChain";

const rawPrivateKey = process.env.PRIVATE_KEY as string;
const account = privateKeyToAccount(
  rawPrivateKey.startsWith("0x")
    ? (rawPrivateKey as `0x${string}`)
    : (`0x${rawPrivateKey}` as `0x${string}`)
);

export const client = createPublicClient({
  chain: eduChainTestnet,
  transport: http(),
});

export const getWalletClient = (accountParam: typeof account) => {
  return createWalletClient({
    chain: eduChainTestnet,
    transport: http(),
    account: accountParam,
  });
};
