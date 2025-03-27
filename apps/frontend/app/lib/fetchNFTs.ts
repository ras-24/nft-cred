import { client } from "./viemClient";
import { parseAbi } from "viem";
import { type Address } from "viem";

const nftAbi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_baseURI",
        type: "string",
      },
    ],
    name: "setBaseURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "TokenId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchNFTs = async (
  walletAddress: string,
  contractAddresses: string[]
) => {
  if (contractAddresses.length === 0) {
    throw new Error("No contract addresses provided");
  }

  console.log("Fetching NFTs for wallet:", walletAddress);
  console.log("Contracts:", contractAddresses);

  const batchSize = 10;
  const results: any[] = [];
  const totalStartTime = performance.now();

  for (let i = 0; i < contractAddresses.length; i += batchSize) {
    const batch = contractAddresses.slice(i, i + batchSize);
    console.log(`Processing batch ${i / batchSize + 1}`);

    const batchResults = await Promise.all(
      batch.map(async (contractAddress) => {
        const contractStartTime = performance.now();
        try {
          const ownedTokenIds = new Set<string>();

          const events = await client.getLogs({
            address: contractAddress as Address,
            event: parseAbi([
              "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
            ])[0],
            fromBlock: 0n,
            toBlock: "latest",
          });

          for (const event of events) {
            const tokenId = event.args?.tokenId;
            if (tokenId !== undefined) {
              try {
                const currentOwner = (await client.readContract({
                  address: contractAddress as Address,
                  abi: nftAbi,
                  functionName: "ownerOf",
                  args: [tokenId],
                })) as Address;

                if (
                  currentOwner.toLowerCase() === walletAddress.toLowerCase()
                ) {
                  ownedTokenIds.add(tokenId.toString());
                }
              } catch {
                // Skip token if error occurs
              }
            }
          }

          if (ownedTokenIds.size === 0) {
            return { contractAddress, borrowers_nft: "NFT not found", responseTime: "0 ms" };
          }

          const borrowers_nft = await Promise.all(
            [...ownedTokenIds].map(async (tokenId) => {
              let tokenURI = (await client.readContract({
                address: contractAddress as Address,
                abi: nftAbi,
                functionName: "tokenURI",
                args: [BigInt(tokenId)],
              })) as string;

              if (tokenURI.startsWith("ipfs://")) {
                tokenURI = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
              }

              if (tokenURI.startsWith("ar://")) {
                tokenURI = tokenURI.replace("ar://", "https://arweave.net/");
              }

              try {
                const metadataResponse = await fetch(tokenURI);
                const metadata = await metadataResponse.json();

                let imageUrl = metadata.image;
                if (imageUrl?.startsWith("ipfs://")) {
                  imageUrl = imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
                }

                return {
                  tokenId,
                  metadata: {
                    ...metadata,
                    image: imageUrl,
                  },
                };
              } catch {
                return null;
              }
            })
          );

          const contractEndTime = performance.now();
          const responseTime = `${(contractEndTime - contractStartTime).toFixed(2)} ms`;
          console.log(`Contract ${contractAddress} completed in ${responseTime}`);

          return {
            contractAddress,
            borrowers_nft: borrowers_nft.filter(Boolean),
            responseTime,
          };
        } catch (error) {
          console.error("Error fetching contract:", contractAddress, error);
          throw new Error(`Failed to fetch NFTs for contract ${contractAddress}`);
        }
      })
    );

    results.push(...batchResults);
    if (i + batchSize < contractAddresses.length) {
      await delay(1000);
    }
  }

  const totalEndTime = performance.now();
  const totalFetchTime = `${(totalEndTime - totalStartTime).toFixed(2)} ms`;
  console.log(`Total fetch time: ${totalFetchTime}`);

  return { data: results, totalFetchTime };
};
