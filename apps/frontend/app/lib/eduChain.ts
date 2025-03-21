import { defineChain } from "viem";

export const eduChainTestnet = defineChain({
  id: 656476,
  name: "EDU Chain Testnet",
  network: "edu-chain-testnet",
  nativeCurrency: { name: "EDU", symbol: "EDU", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.EDU_CHAIN_TESTNET_RPC_URL as string] },
  },
});
