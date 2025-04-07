'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Navbar from '@/app/components/layout/Navbar';
import { fetchNFTs } from '@/app/lib/fetchNFTs';
import { useWallet } from '@/app/contexts/WalletContext';
import { NFTBorrowFlow } from '@/app/components/loan/NFTBorrowFlow';
import { nftService } from '@/app/services/nft';

interface NFT {
  id: string;
  tokenName: string;
  tickerSymbol: string;
  tokenImage: string;
  contractAddress: string;
  credentialTypeId: string;
  uniqueId?: string; 
  metadata?: any;
  tokenId?: string;
}

export default function Gallery() {
  const [nfts, setNFTs] = React.useState<NFT[]>([]);
  const [registeredNFTs, setRegisteredNFTs] = React.useState<NFT[]>([]);
  const [ownedNFTs, setOwnedNFTs] = React.useState<NFT[]>([]);
  const [error, setError] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showOwnedOnly, setShowOwnedOnly] = React.useState<boolean>(false);
  const [selectedNFT, setSelectedNFT] = React.useState<NFT | null>(null);
  const { walletAddress } = useWallet();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Create a function to refresh NFTs
  const refreshNFTs = useCallback(async () => {
    if (!walletAddress) return;
    
    try {
      setLoading(true);
      
      // Re-fetch registered NFTs
      const registeredNFTs = await nftService.getRegisteredNFTs();
      setRegisteredNFTs(registeredNFTs);
      setNFTs(registeredNFTs);
      
      const contractAddresses = registeredNFTs.map(nft => nft.contractAddress);
      
      // Fetch all NFTs owned by the user for these contracts
      const response = await fetchNFTs(walletAddress, contractAddresses);
      const nftData = response?.data || [];
      console.log('Refreshed NFT Data:', nftData);
      
      const userOwnedNFTs: NFT[] = [];
      
      // Process each contract's returned NFTs
      nftData.forEach(contractResult => {
        const registeredNFT = registeredNFTs.find(
          nft => nft.contractAddress.toLowerCase() === contractResult.contractAddress.toLowerCase()
        );
        
        if (registeredNFT && Array.isArray(contractResult.borrowers_nft)) {
          // Map each token from this contract to an NFT object
          contractResult.borrowers_nft.forEach((tokenData: any) => {
            if (tokenData && tokenData.tokenId) {
              // Create a unique ID by combining contractAddress and tokenId
              const uniqueId = `${contractResult.contractAddress}-${tokenData.tokenId}`;
              
              userOwnedNFTs.push({
                id: tokenData.tokenId,
                uniqueId: uniqueId, 
                tokenName: tokenData.metadata?.name || registeredNFT.tokenName,
                tickerSymbol: registeredNFT.tickerSymbol,
                tokenImage: tokenData.metadata?.image || registeredNFT.tokenImage,
                contractAddress: contractResult.contractAddress,
                credentialTypeId: registeredNFT.credentialTypeId,
                metadata: tokenData.metadata,
                tokenId: tokenData.tokenId
              });
            }
          });
        }
      });
      
      setOwnedNFTs(userOwnedNFTs);
    } catch (err) {
      console.error('Error refreshing NFTs:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh NFTs');
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    // Initial load of NFTs
    refreshNFTs();
  }, [walletAddress, refreshNFTs]);

  const handleImageError = (nftId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [nftId]: true
    }));
  };

  const filteredNFTs = React.useMemo(() => {
    if (showOwnedOnly && walletAddress) {
      console.log('Filtering owned NFTs:', ownedNFTs);
      return ownedNFTs;
    }
    return registeredNFTs;
  }, [registeredNFTs, ownedNFTs, showOwnedOnly, walletAddress]);

  if (loading) {
    return <div className="text-center mt-8 text-gray-600">Loading NFTs...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-400">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-medium text-gray-800 dark:text-white">NFT Gallery</h1>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showOwnedOnly}
                  onChange={(e) => setShowOwnedOnly(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700 dark:text-gray-300">Show Owned NFTs Only</span>
              </label>
            </div>
          </div>

          {walletAddress ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNFTs.map((nft) => (
                <div
                  key={nft.uniqueId || `${nft.contractAddress}-${nft.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="relative w-full pt-[56.25%]">
                    {!imageErrors[nft.uniqueId || nft.id] ? (
                      <Image
                        src={nft.tokenImage}
                        alt={nft.tokenName}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-contain p-2"
                        onError={() => handleImageError(nft.uniqueId || nft.id)}
                        priority={true}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                        <span className="text-gray-400 dark:text-gray-500">Image not available</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">{nft.tokenName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {nft.tickerSymbol}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      ID: {nft.id.length > 10 ? `${nft.id.substring(0, 10)}...` : nft.id}
                    </p>
                    {showOwnedOnly && (
                      <div className="mt-4">
                        <button
                          onClick={() => setSelectedNFT(nft)}
                          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                        >
                          Get Loan
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
              <p>Please connect your wallet to view your NFTs</p>
            </div>
          )}
        </div>

        {selectedNFT && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="max-w-3xl w-full">
              <NFTBorrowFlow
                nft={selectedNFT}
                onClose={() => setSelectedNFT(null)}
                onLoanComplete={refreshNFTs}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}