'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/app/components/layout/Navbar';
import { fetchNFTs } from '@/app/lib/fetchNFTs';
import { useWallet } from '@/app/contexts/WalletContext';

interface NFT {
  id: string;
  name: string;
  image: string;
  collection: string;
}

export default function Gallery() {
  const [selectedCollection, setSelectedCollection] = React.useState<string>('all');
  const [nfts, setNFTs] = React.useState<NFT[]>([]);
  const [error, setError] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const { walletAddress } = useWallet();

  useEffect(() => {
    if (!walletAddress) {
      setNFTs([]);
      setLoading(false);
      return;
    }

    const loadNFTs = async () => {
      try {
        setLoading(true);
        const { borrowers_nft } = await fetchNFTs(
          walletAddress,
          process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!
        );
        
        const formattedNFTs = borrowers_nft.map((nft: any) => ({
          id: nft.tokenId,
          name: nft.metadata.name || `NFT #${nft.tokenId}`,
          image: nft.metadata.image || '/nft-placeholder.png',
          collection: nft.metadata.collection || 'Default Collection'
        }));
        
        setNFTs(formattedNFTs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load NFTs');
      } finally {
        setLoading(false);
      }
    };

    loadNFTs();
  }, [walletAddress]);

  // Replace mock-based collections with dynamic ones
  const collections = ['all', ...new Set(nfts.map(nft => nft.collection))];
  const filteredNFTs = selectedCollection === 'all' 
    ? nfts 
    : nfts.filter(nft => nft.collection === selectedCollection);

  if (loading) {
    return <div className="text-center mt-8">Loading NFTs...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mt-8 text-gray-600 dark:text-gray-400">
            Please connect your wallet to view your NFTs.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            NFT Gallery
          </h1>
          
          {/* Collection Filter */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Collection
            </label>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="block w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {collections.map((collection) => (
                <option key={collection} value={collection}>
                  {collection.charAt(0).toUpperCase() + collection.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* NFT Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredNFTs.map((nft) => ( // Now using dynamic nfts
              <div
                key={nft.id}
                className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
              >
                <div className="relative aspect-square">
                  <Image
                    src={nft.image}
                    alt={nft.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {nft.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {nft.collection}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredNFTs.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
              No NFTs found in this collection.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}