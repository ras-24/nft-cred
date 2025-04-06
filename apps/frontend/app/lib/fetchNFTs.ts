import { client } from "./viemClient";
import { type Address, type Abi } from "viem";
import rawERC721ABI from "@/app/lib/ABI/ERC721ABI.json" assert { type: "json" };

const ERC721ABI = rawERC721ABI as Abi;

export const fetchNFTs = async (
  walletAddress: string,
  contractAddresses: string[]
) => {
  if (contractAddresses.length === 0) {
    throw new Error("No contract addresses provided");
  }

  console.log("Fetching NFTs for wallet:", walletAddress);
  console.log("Contracts:", contractAddresses);

  const totalStartTime = performance.now();

  const balanceCalls = contractAddresses.map((address) => ({
    address: address as Address,
    abi: ERC721ABI,
    functionName: "balanceOf",
    args: [walletAddress as Address],
  }));

  const balanceResults = await client.multicall({
    contracts: balanceCalls,
  });

  const tokenOfOwnerByIndexCalls: any[] = [];
  const tokenIndexMap: { [key: string]: bigint[] } = {};

  balanceResults.forEach((res, i) => {
    if (res.status === "success" && res.result as bigint > 0n) {
      const contract = contractAddresses[i];
      const indexes = Array.from({ length: Number(res.result) }, (_, idx) =>
        BigInt(idx)
      );
      tokenIndexMap[contract] = indexes;

      indexes.forEach((index) => {
        tokenOfOwnerByIndexCalls.push({
          address: contract as Address,
          abi: ERC721ABI,
          functionName: "tokenOfOwnerByIndex",
          args: [walletAddress as Address, index],
        });
      });
    }
  });

  const tokenIdResults = await client.multicall({
    contracts: tokenOfOwnerByIndexCalls,
  });

  const tokenURICalls: any[] = [];
  const tokenIdByContract: { [contract: string]: bigint[] } = {};
  let idx = 0;

  for (const contract of contractAddresses) {
    const indexes = tokenIndexMap[contract] || [];
    const tokenIds: bigint[] = [];

    for (let i = 0; i < indexes.length; i++) {
      const res = tokenIdResults[idx++];
      if (res?.status === "success") {
        const tokenId = res.result as bigint;
        tokenIds.push(tokenId);

        tokenURICalls.push({
          address: contract as Address,
          abi: ERC721ABI,
          functionName: "tokenURI",
          args: [tokenId],
        });
      }
    }

    if (tokenIds.length > 0) {
      tokenIdByContract[contract] = tokenIds;
    }
  }

  const tokenURIResults = await client.multicall({
    contracts: tokenURICalls,
  });

  const borrowers_nft_by_contract: {
    [contract: string]: { tokenId: string; metadata: any }[];
  } = {};
  let uriIndex = 0;

  await Promise.all(
    contractAddresses.map(async (contract) => {
      const tokenIds = tokenIdByContract[contract] || [];
      const nfts: { tokenId: string; metadata: any }[] = [];

      for (let i = 0; i < tokenIds.length; i++) {
        const uriRes = tokenURIResults[uriIndex++];
        if (uriRes?.status !== "success") continue;

        let uri = uriRes.result as string;
        if (uri.startsWith("ipfs://"))
          uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
        else if (uri.startsWith("ar://"))
          uri = uri.replace("ar://", "https://arweave.net/");

        try {
          const metadata = await fetch(uri).then((r) => r.json());
          let imageUrl = metadata.image;
          if (imageUrl?.startsWith("ipfs://")) {
            imageUrl = imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
          }

          nfts.push({
            tokenId: tokenIds[i].toString(),
            metadata: { ...metadata, image: imageUrl },
          });
        } catch {
          // skip if fetch fails
        }
      }

      borrowers_nft_by_contract[contract] = nfts;
    })
  );

  const results = contractAddresses.map((contract) => ({
    contractAddress: contract,
    borrowers_nft: borrowers_nft_by_contract[contract] ?? "NFT not found",
  }));

  const totalEndTime = performance.now();
  const totalFetchTime = `${(totalEndTime - totalStartTime).toFixed(2)} ms`;

  return { data: results, totalFetchTime };
};
