interface GetBalanceParams {
  walletAddress: string;
}

class USDCService {
  async getBalance({ walletAddress }: GetBalanceParams): Promise<string> {
    try {
      const response = await fetch(`/api/usdc/balance?address=${walletAddress}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch USDC balance: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.balance;
    } catch (error) {
      console.error('Error fetching USDC balance:', error);
      throw error;
    }
  }
}

export const usdcService = new USDCService();
