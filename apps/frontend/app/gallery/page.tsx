'use client';

import React from 'react';
import Image from 'next/image';
import Navbar from '../components/layout/Navbar';

interface NFT {
  id: string;
  name: string;
  image: string;
  collection: string;
}

// Mock data for testing
const mockNFTs: NFT[] = [
  {
    id: '1',
    name: 'NFT #1',
    image: '/nft-placeholder.png',
    collection: 'Collection A'
  },
  {
    id: '2',
    name: 'NFT #2',
    image: '/nft-placeholder.png',
    collection: 'Collection B'
  },
  {
    id: '3',
    name: 'NFT #3',
    image: '/nft-placeholder.png',
    collection: 'Collection A'
  },
];

export default function Gallery() {
  const [selectedCollection, setSelectedCollection] = React.useState<string>('all');
  
  const collections = ['all', ...new Set(mockNFTs.map(nft => nft.collection))];
  const filteredNFTs = selectedCollection === 'all' 
    ? mockNFTs 
    : mockNFTs.filter(nft => nft.collection === selectedCollection);

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
            {filteredNFTs.map((nft) => (
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