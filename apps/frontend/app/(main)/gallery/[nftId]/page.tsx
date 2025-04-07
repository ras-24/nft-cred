'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/app/components/layout/Navbar';
import { useWallet } from '@/app/contexts/WalletContext';
import { fetchNFT } from '@/app/lib/fetchNFT';
import Link from 'next/link';

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

export default function NFTDetails() {
  const params = useParams();
  const router = useRouter();
  const [nft, setNFT] = useState<NFTDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { walletAddress } = useWallet();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!walletAddress) {
      router.push('/gallery');
      return;
    }

    async function loadNFTDetails() {
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
        
        setNFT(nftData);
      } catch (err) {
        console.error('Error loading NFT details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load NFT details');
      } finally {
        setLoading(false);
      }
    }
    
    loadNFTDetails();
  }, [params.nftId, walletAddress, router]);

  const handleImageError = () => {
    setImageError(true);
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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              {/* NFT Image */}
              <div className="md:w-1/2">
                <div className="relative pt-[100%]">
                  {!imageError ? (
                    <Image 
                      src={nft.tokenImage}
                      alt={nft.tokenName}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain p-4"
                      onError={handleImageError}
                      priority={true}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                      <span className="text-gray-400 dark:text-gray-500">Image not available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* NFT Details */}
              <div className="md:w-1/2 p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {nft.tokenName}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {nft.tickerSymbol}
                </p>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Details</h2>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Token ID</span>
                      <p className="text-gray-900 dark:text-white font-medium">{nft.tokenId}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Contract Address</span>
                      <p className="text-gray-900 dark:text-white font-medium break-all">
                        {nft.contractAddress}
                      </p>
                    </div>
                    
                    {nft.metadata && (
                      <div className="mt-6">
                        <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Metadata</h3>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-48">
                          <pre className="text-xs text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(nft.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => router.push(`/borrow/${nft.contractAddress}-${nft.tokenId}`)}
                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    Get Loan Using This NFT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
