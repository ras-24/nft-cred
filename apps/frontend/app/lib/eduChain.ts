import { defineChain } from "viem";

export const eduChainTestnet = defineChain({
  id: 656476,
  name: "EDU Chain Testnet",
  network: "edu-chain-testnet",
  nativeCurrency: { name: "EDU", symbol: "EDU", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.open-campus-codex.gelato.digital"] },

    // for local dev
    // default: { http: ["http://127.0.0.1:8545"] },
    // public: { http: ["http://127.0.0.1:8545"] },
  },
  contracts: {
    multicall3: {
      address: "0x499E9081A3F3edA393A24353AE5755d5bA951584",
    },
  },
});
