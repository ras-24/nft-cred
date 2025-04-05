import { client } from "./viemClient";
import { type Address } from "viem";
import ERC721ABI from "@/app/lib/ABI/ERC721ABI.json";

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
          const balance = (await client.readContract({
            address: contractAddress as Address,
            abi: ERC721ABI,
            functionName: "balanceOf",
            args: [walletAddress as Address],
          })) as bigint;

          if (balance === 0n) {
            return {
              contractAddress,
              borrowers_nft: "NFT not found",
              responseTime: "0 ms",
            };
          }

          const tokenIds = await Promise.all(
            Array.from({ length: Number(balance) }).map(
              (_, index) =>
                client.readContract({
                  address: contractAddress as Address,
                  abi: ERC721ABI,
                  functionName: "tokenOfOwnerByIndex",
                  args: [walletAddress as Address, BigInt(index)],
                }) as Promise<bigint>
            )
          );

          const borrowers_nft = await Promise.all(
            tokenIds.map(async (tokenId) => {
              try {
                let tokenURI = (await client.readContract({
                  address: contractAddress as Address,
                  abi: ERC721ABI,
                  functionName: "tokenURI",
                  args: [tokenId],
                })) as string;

                if (tokenURI.startsWith("ipfs://")) {
                  tokenURI = tokenURI.replace(
                    "ipfs://",
                    "https://ipfs.io/ipfs/"
                  );
                }

                if (tokenURI.startsWith("ar://")) {
                  tokenURI = tokenURI.replace("ar://", "https://arweave.net/");
                }

                const metadataResponse = await fetch(tokenURI);
                const metadata = await metadataResponse.json();

                let imageUrl = metadata.image;
                if (imageUrl?.startsWith("ipfs://")) {
                  imageUrl = imageUrl.replace(
                    "ipfs://",
                    "https://ipfs.io/ipfs/"
                  );
                }

                return {
                  tokenId: tokenId.toString(),
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
          const responseTime = `${(contractEndTime - contractStartTime).toFixed(
            2
          )} ms`;
          console.log(
            `Contract ${contractAddress} completed in ${responseTime}`
          );

          return {
            contractAddress,
            borrowers_nft: borrowers_nft.filter(Boolean),
            responseTime,
          };
        } catch (error) {
          console.error("Error fetching contract:", contractAddress, error);
          return {
            contractAddress,
            error: "Failed to fetch",
            responseTime: "0 ms",
          };
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
