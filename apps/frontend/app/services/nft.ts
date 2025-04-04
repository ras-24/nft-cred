interface ApproveNFTParams {
  borrower: string;
  contractAddress: string;
  tokenId: number;
}

interface LockNFTParams {
  nftId: string;
  contractAddress: string;
}

interface CreateCredentialParams {
  userId: string;
  credentialTypeId: string;
  contractAddress: string;
  tokenId: string;
  institution: string;
  verification: string;
  metadata: string;
}

export const nftService = {
  approveNFT: async (params: ApproveNFTParams): Promise<any> => {
    try {
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
};
