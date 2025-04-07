'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from './components/layout/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            Turn Your NFTs into
            <span className="text-blue-500"> Borrowing Power</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Unlock the value of your NFT collection. Borrow against your NFTs or earn interest by lending to others.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/borrow"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg text-lg transition-colors shadow-sm"
            >
              Start Borrowing
            </Link>
            <Link
              href="/lend"
              className="bg-white hover:bg-gray-50 text-blue-500 font-medium py-3 px-6 rounded-lg text-lg border border-blue-500 transition-colors"
            >
              Start Lending
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Image
                  src="/file.svg"
                  alt="Smart Contracts"
                  width={24}
                  height={24}
                  className="text-blue-500"
                />
              </div>
              <h3 className="text-xl font-medium mb-2 text-gray-800">
                Secure Smart Contracts
              </h3>
              <p className="text-gray-600">
                Our platform is built on audited smart contracts ensuring the safety of your assets.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Image
                  src="/window.svg"
                  alt="Flexible Terms"
                  width={24}
                  height={24}
                  className="text-blue-500"
                />
              </div>
              <h3 className="text-xl font-medium mb-2 text-gray-800">
                Flexible Terms
              </h3>
              <p className="text-gray-600">
                Choose your loan terms, including duration and interest rate that work best for you.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Image
                  src="/globe.svg"
                  alt="Global Market"
                  width={24}
                  height={24}
                  className="text-blue-500"
                />
              </div>
              <h3 className="text-xl font-medium mb-2 text-gray-800">
                Global NFT Market
              </h3>
              <p className="text-gray-600">
                Access a worldwide market of NFT-backed loans and lending opportunities.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
