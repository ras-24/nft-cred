import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { eduChainTestnet } from "./eduChain";

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

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
