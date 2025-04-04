import { Loan } from '@prisma/client';

interface CreateLoanParams {
  userId: string;
  contractAddress: string;
  tokenId: string;
  loanAmount: number;
  duration: number;
  ltv: number;
}

interface EstimateLoanParams {
  duration: string;
  contractAddress: string;
}

interface UpdateLoanParams {
  loanId: string;
  status: string;
}

interface CreateDirectLoanParams {
  nftId: string;
  contractAddress: string;
  amount: number;
  duration: number;
}

export const loanService = {
  getAllLoans: async (): Promise<Loan[]> => {
    try {
      const response = await fetch('/api/loan');
      if (!response.ok) {
        throw new Error('Failed to fetch loans');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching loans:', error);
      throw error;
    }
  },

  getLoanById: async (id: string): Promise<Loan> => {
    try {
      const response = await fetch(`/api/loan/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch loan');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching loan:', error);
      throw error;
    }
  },

  createLoan: async (params: CreateLoanParams): Promise<Loan> => {
    try {
      const response = await fetch('/api/loan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error('Failed to create loan');
      }
      return response.json();
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error;
    }
  },

  estimateLoan: async (params: EstimateLoanParams): Promise<any> => {
    try {
      const response = await fetch('/api/loan/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error('Failed to get loan estimation');
      }
      return response.json();
    } catch (error) {
      console.error('Error estimating loan:', error);
      throw error;
    }
  },

  updateLoanStatus: async (params: UpdateLoanParams): Promise<any> => {
    try {
      const response = await fetch('/api/loan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error('Failed to update loan status');
      }
      return response.json();
    } catch (error) {
      console.error('Error updating loan status:', error);
      throw error;
    }
  },

  createDirectLoan: async (params: CreateDirectLoanParams): Promise<any> => {
    try {
      const response = await fetch('/api/loan/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error('Failed to create loan');
      }
      return response.json();
    } catch (error) {
      console.error('Error creating direct loan:', error);
      throw error;
    }
  },
};