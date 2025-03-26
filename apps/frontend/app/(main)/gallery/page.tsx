'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/app/components/layout/Navbar';
import { fetchNFTs } from '@/app/lib/fetchNFTs';
import { useWallet } from '@/app/contexts/WalletContext';

interface NFT {
  id: string;
  tokenName: string;
  tickerSymbol: string;
  tokenImage: string;
  contractAddress: string;
  credentialTypeId: string;
}

export default function Gallery() {
  const [nfts, setNFTs] = React.useState<NFT[]>([]);
  const [registeredNFTs, setRegisteredNFTs] = React.useState<NFT[]>([]);
  const [ownedNFTs, setOwnedNFTs] = React.useState<NFT[]>([]);
  const [error, setError] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showOwnedOnly, setShowOwnedOnly] = React.useState<boolean>(false);
  const { walletAddress } = useWallet();
  

  useEffect(() => {
    const loadNFTs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/registered-nfts');
        const registeredNFTs = await response.json();
        console.log('Registered NFTs:', registeredNFTs);
        setRegisteredNFTs(registeredNFTs);
        setNFTs(registeredNFTs);
        console.log('Wallet Address:', walletAddress);
        if (walletAddress) {
          let ownedNFTs: NFT[] = [];
          for (const nft of registeredNFTs) {
            const nftData = await fetchNFTs(walletAddress, nft.contractAddress);
            if (nftData && nftData.borrowers_nft) {
              for (const borrowerNft of nftData.borrowers_nft) {
                ownedNFTs.push({
                  id: `${borrowerNft.tokenId}-${nft.contractAddress}`,
                  tokenName: borrowerNft.metadata.name || 'Unnamed NFT',
                  tickerSymbol: borrowerNft.metadata.symbol || '-',
                  tokenImage: borrowerNft.metadata.image || '/placeholder.png',
                  contractAddress: nft.contractAddress,
                  credentialTypeId: nft.credentialTypeId
                });
              }
            }
          }
          setOwnedNFTs(ownedNFTs);
          console.log('Owned NFTs:', ownedNFTs);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load NFTs');
      } finally {
        setLoading(false);
      }
    };

    loadNFTs();
  }, [walletAddress]);

  const filteredNFTs = React.useMemo(() => {
    if (showOwnedOnly && walletAddress) {
      return ownedNFTs; 
    }
    return registeredNFTs;
  }, [registeredNFTs, ownedNFTs, showOwnedOnly, walletAddress]);

  if (loading) {
    return <div className="text-center mt-8">Loading NFTs...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              NFT Gallery
            </h1>
            <div className="flex items-center space-x-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showOwnedOnly}
                  onChange={(e) => setShowOwnedOnly(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Show Owned Only
                </span>
              </label>
            </div>
          </div>

          {/* NFT Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredNFTs.map((nft) => (
              <div
                key={nft.id}
                className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
              >
                <div className="relative w-full h-48">
                  <Image
                    src={nft.tokenImage}
                    alt={nft.tokenName}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {nft.tokenName}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {nft.tickerSymbol}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                    {nft.contractAddress}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {nfts.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
              No registered NFTs found.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}