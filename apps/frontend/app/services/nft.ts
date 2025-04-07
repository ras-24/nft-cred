interface ApproveNFTParams {
  borrower: string | null;
  contractAddress: string;
  tokenId: number;
  txHash?: string;
}

interface LockNFTParams {
  tokenId: number;
  contractAddress: string;
  borrower?: string | null;
  credentialType?: number; 
}

interface CreateCredentialParams {
  userId: string | null;
  credentialTypeId: string;
  contractAddress: string;
  tokenId: string;
  institution: string;
  verification: string;
  metadata: string;
}

interface NFT {
  id: string;
  tokenName: string;
  tickerSymbol: string;
  tokenImage: string;
  contractAddress: string;
  credentialTypeId: string;
}

interface GetBorrowerNFTsParams {
  walletAddress: string;
  contractAddresses: string[];
}

export const nftService = {
  approveNFT: async (params: ApproveNFTParams): Promise<any> => {
    try {
     
      if (!params.borrower) {
        throw new Error('Borrower address is required');
      }

      const response = await fetch('/api/nft/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to approve NFT');
      }

      return response.json();
    } catch (error) {
      console.error('Error approving NFT:', error);
      throw error;
    }
  },

  lockNFT: async (params: LockNFTParams): Promise<any> => {
    try {
      const response = await fetch('/api/nft/lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to lock NFT');
      }

      return response.json();
    } catch (error) {
      console.error('Error locking NFT:', error);
      throw error;
    }
  },

  createCredential: async (params: CreateCredentialParams): Promise<any> => {
    try {
     
      if (!params.userId) {
        throw new Error('User ID is required');
      }

      const response = await fetch('/api/nft/credential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to create credential');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating credential:', error);
      throw error;
    }
  },

  getBorrowerNFTs: async (params: GetBorrowerNFTsParams): Promise<any> => {
    try {
      const response = await fetch('/api/nft/borrower', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch NFTs');
      }
      
      const data = await response.json();
      return data.nfts;
    } catch (error) {
      console.error('Error fetching borrower NFTs:', error);
      throw error;
    }
  },

  getRegisteredNFTs: async (contractAddress?: string): Promise<NFT[]> => {
    try {
      const url = contractAddress 
        ? `/api/nft/registered?contractAddress=${encodeURIComponent(contractAddress)}`
        : '/api/nft/registered';
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch registered NFTs');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching registered NFTs:', error);
      throw error;
    }
  }
};
