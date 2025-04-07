'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/app/components/layout/Navbar';
import { useWallet } from '@/app/contexts/WalletContext';
import { fetchNFT } from '@/app/lib/fetchNFT';
import { NFTBorrowFlow } from '@/app/components/loan/NFTBorrowFlow';
import Link from 'next/link';

// Add NFT interface to match the structure returned by fetchNFT
interface NFTDetails {
  id: string;
  tokenName: string;
  tickerSymbol: string;
  tokenImage: string;
  contractAddress: string;
  credentialTypeId: string;
  metadata?: any;
  tokenId?: string;
}

export default function BorrowPage() {
  const params = useParams();
  const router = useRouter();
  // Fix the type to match what fetchNFT returns
  const [nft, setNft] = useState<NFTDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { walletAddress } = useWallet();

  useEffect(() => {
    // Redirect if not logged in
    if (!walletAddress) {
      router.push('/gallery');
      return;
    }

    async function loadNFT() {
      // Make sure nftId exists and is a string
      const nftId = params.nftId;
      if (!nftId || typeof nftId !== 'string') return;

      try {
        setLoading(true);
        
        // Parse the nftId (format: contractAddress-tokenId)
        const [contractAddress, tokenId] = nftId.split('-');
        
        if (!contractAddress || !tokenId) {
          throw new Error('Invalid NFT identifier');
        }
        
        if (!walletAddress) {
          throw new Error('Wallet address not found');
        }

        const nftData = await fetchNFT(walletAddress, contractAddress, tokenId);
        
        if (!nftData) {
          throw new Error('NFT not found or not owned by you');
        }
        
        setNft(nftData);
      } catch (err) {
        console.error('Error loading NFT details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load NFT details');
      } finally {
        setLoading(false);
      }
    }

    loadNFT();
  }, [params.nftId, walletAddress, router]);

  const handleLoanComplete = () => {
    // Return to gallery after loan completion
    router.push('/gallery');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <main className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mt-8 text-gray-600">Loading NFT details...</div>
        </main>
      </div>
    );
  }

  if (error || !nft) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <main className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mt-8 text-center">
            <h2 className="text-xl font-semibold text-red-500 mb-2">Error</h2>
            <p className="text-gray-600 dark:text-gray-400">{error || 'NFT not found'}</p>
            <Link href="/gallery" className="mt-4 inline-block text-blue-500 hover:underline">
              Return to Gallery
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="py-8">
          {/* Back button */}
          <Link
            href="/gallery"
            className="inline-flex items-center mb-6 text-blue-500 hover:text-blue-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Gallery
          </Link>

          <div className="max-w-3xl mx-auto">
            <NFTBorrowFlow
              nft={nft}
              onClose={() => router.push('/gallery')}
              onLoanComplete={handleLoanComplete}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
