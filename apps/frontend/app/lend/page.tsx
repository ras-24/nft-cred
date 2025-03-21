'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '../components/layout/Navbar';

interface LoanListing {
  id: string;
  nft: {
    name: string;
    image: string;
    collection: string;
  };
  amount: string;
  duration: string;
  interestRate: string;
  borrower: string;
}

export default function Lend() {
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);

  // Mock loan listings data - this would be fetched from the smart contract
  const mockListings: LoanListing[] = [
    {
      id: '1',
      nft: {
        name: 'Cool Cat #1234',
        image: '/file.svg',
        collection: 'Cool Cats'
      },
      amount: '10',
      duration: '30',
      interestRate: '15',
      borrower: '0x1234...5678'
    },
    {
      id: '2',
      nft: {
        name: 'Bored Ape #5678',
        image: '/globe.svg',
        collection: 'BAYC'
      },
      amount: '50',
      duration: '60',
      interestRate: '12',
      borrower: '0x8765...4321'
    },
    {
      id: '3',
      nft: {
        name: 'Doodle #9012',
        image: '/window.svg',
        collection: 'Doodles'
      },
      amount: '5',
      duration: '90',
      interestRate: '18',
      borrower: '0x2468...1357'
    }
  ];

  const handleLend = async (loanId: string) => {
    try {
      // Here we would integrate with the smart contract
      console.log('Processing loan:', loanId);
      alert('Loan funded successfully!');
    } catch (error) {
      console.error('Error processing loan:', error);
      alert('Failed to process loan. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Lend Against NFTs
          </h1>

          <div className="grid grid-cols-1 gap-6">
            {mockListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 relative flex-shrink-0">
                      <Image
                        src={listing.nft.image}
                        alt={listing.nft.name}
                        fill
                        className="object-cover rounded-lg dark:invert"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white text-lg">
                        {listing.nft.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Collection: {listing.nft.collection}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Borrower: {listing.borrower}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 md:gap-8">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.amount} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.duration} Days
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Interest Rate</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.interestRate}%
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLend(listing.id)}
                    className="bg-blue-600 text-white py-2 px-6 rounded-full font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Fund Loan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}