'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '../components/layout/Navbar';

interface NFT {
  id: string;
  name: string;
  image: string;
  collection: string;
}

interface LoanTerms {
  amount: string;
  duration: string;
  interestRate: string;
}

export default function Borrow() {
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [loanTerms, setLoanTerms] = useState<LoanTerms>({
    amount: '',
    duration: '30',
    interestRate: '10'
  });

  // Mock NFT data - this would be fetched from the user's wallet
  const mockNFTs: NFT[] = [
    {
      id: '1',
      name: 'Cool Cat #1234',
      image: '/file.svg',
      collection: 'Cool Cats'
    },
    {
      id: '2',
      name: 'Bored Ape #5678',
      image: '/globe.svg',
      collection: 'BAYC'
    },
    {
      id: '3',
      name: 'Doodle #9012',
      image: '/window.svg',
      collection: 'Doodles'
    }
  ];

  const handleLoanTermsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLoanTerms(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNFT) return;

    try {
      // Here we would integrate with the smart contract
      console.log('Initiating loan with terms:', {
        nft: selectedNFT,
        terms: loanTerms
      });
      alert('Loan request submitted successfully!');
    } catch (error) {
      console.error('Error initiating loan:', error);
      alert('Failed to submit loan request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Borrow Against Your NFTs
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* NFT Selection */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Select NFT Collateral
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockNFTs.map(nft => (
                  <div
                    key={nft.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedNFT?.id === nft.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                    onClick={() => setSelectedNFT(nft)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 relative">
                        <Image
                          src={nft.image}
                          alt={nft.name}
                          fill
                          className="object-cover rounded-lg dark:invert"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{nft.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{nft.collection}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loan Terms */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Set Loan Terms
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loan Amount (ETH)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    step="0.01"
                    required
                    value={loanTerms.amount}
                    onChange={handleLoanTermsChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loan Duration (Days)
                  </label>
                  <select
                    name="duration"
                    id="duration"
                    value={loanTerms.duration}
                    onChange={handleLoanTermsChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  >
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Interest Rate (%)
                  </label>
                  <select
                    name="interestRate"
                    id="interestRate"
                    value={loanTerms.interestRate}
                    onChange={handleLoanTermsChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  >
                    <option value="10">10%</option>
                    <option value="15">15%</option>
                    <option value="20">20%</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!selectedNFT}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-full font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {selectedNFT ? 'Request Loan' : 'Select an NFT to Continue'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}