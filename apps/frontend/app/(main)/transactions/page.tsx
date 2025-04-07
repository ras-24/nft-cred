'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/app/components/layout/Navbar';

interface Transaction {
  id: string;
  loanId: string;
  amount: number;
  txType: string;
  txHash: string;
  createdAt: string;
  from: string;
  to: string;
  status: string;
  date: string;
  loan: {
    id: string;
    userId: string;
    contractAddress: string;
    tokenId: string;
    loanAmount: number;
    duration: number;
    ltv: number;
    status: string;
    createdAt: string;
  };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transaction');
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data = await response.json();
        const transformedTransactions = data.map((tx: Transaction) => ({
          id: tx.id,
          txType: tx.txType,
          amount: `${tx.amount} ETH`,
          status: tx.loan.status.toLowerCase(),
          date: tx.createdAt,
          from: tx.loan.userId,
          to: tx.loan.contractAddress
        }));
        setTransactions(transformedTransactions);
      } catch (error) { 
        console.error('Error fetching transactions:', error);
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="py-8">
          <h1 className="text-2xl font-medium text-gray-800 mb-8">
            Transactions
          </h1>

          {loading ? (
            <div className="text-center text-gray-500 p-8">
              Loading transactions...
            </div>
          ) : error ? (
            <div className="text-center text-red-400 p-8">
              {error}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-gray-500 bg-gray-50 p-8 rounded-lg">
              No transactions found
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-lg p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-lg font-medium text-gray-800">
                        {transaction.txType}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        Amount: {transaction.amount}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        From: {transaction.from}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        To: {transaction.to}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === 'completed'
                            ? 'bg-green-50 text-green-700'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {transaction.status}
                      </span>
                      <div className="mt-1 text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}