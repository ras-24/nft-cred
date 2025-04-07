import { fetchNFTs } from './fetchNFTs';

// Define types to match the expected structure
interface NFTContractData {
  contractAddress: string;
  borrowers_nft: {
    tokenId: string;
    metadata: any;
  }[];
  symbol?: string; // Make optional since TypeScript doesn't see it
  credentialTypeId?: string; // Make optional since TypeScript doesn't see it
}

export async function fetchNFT(walletAddress: string, contractAddress: string, tokenId: string) {
  try {
    // Fetch NFTs using the existing function
    const response = await fetchNFTs(walletAddress, [contractAddress]);
    const nftData = response?.data || [];
    
    // Find the specific contract data
    const contractData = nftData.find(
      contract => contract.contractAddress.toLowerCase() === contractAddress.toLowerCase()
    ) as NFTContractData | undefined;
    
    if (!contractData || !Array.isArray(contractData.borrowers_nft)) {
      return null;
    }
    
    // Find the specific token
    const tokenData = contractData.borrowers_nft.find(
      (token: any) => token.tokenId === tokenId
    );
    
    if (!tokenData) {
      return null;
    }
    
    // Construct NFT object with null coalescing for potentially missing properties
    return {
      id: tokenId,
      tokenId: tokenId,
      tokenName: tokenData.metadata?.name || 'Unknown NFT',
      tickerSymbol: contractData.symbol || '---',
      tokenImage: tokenData.metadata?.image || '',
      contractAddress: contractAddress,
      credentialTypeId: contractData.credentialTypeId || '',
      metadata: tokenData.metadata || {}
    };
  } catch (error) {
    console.error('Error fetching NFT:', error);
    throw error;
  }
}
