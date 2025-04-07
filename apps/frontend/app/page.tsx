'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from './components/layout/Navbar';
import { useTheme } from './components/ThemeProvider';

export default function Home() {
  const { theme } = useTheme();
  // Use state for client-side rendering only elements
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state after component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      {/* Theme indicator shown only after client-side hydration complete */}
      {mounted && (
        <div className="absolute top-20 right-4 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
          {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
        </div>
      )}
      
      <main className="pt-16">
        {/* Hero Section - Enhanced for light mode */}
        <section className="px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="light-mode-gradient rounded-xl p-0.5 mb-6 hidden dark:hidden">
            <div className="bg-white rounded-lg p-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
                Turn Your NFTs into
                <span className="text-blue-500"> Borrowing Power</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                Unlock the value of your NFT collection. Borrow against your NFTs or earn interest by lending to others.
              </p>
            </div>
          </div>
          
          {/* Dark mode version (same as before) */}
          <div className="dark:block hidden">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Turn Your NFTs into
              <span className="text-blue-500"> Borrowing Power</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Unlock the value of your NFT collection. Borrow against your NFTs or earn interest by lending to others.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/borrow"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg text-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              Start Borrowing
            </Link>
            <Link
              href="/lend"
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-500 font-medium py-3 px-6 rounded-lg text-lg border border-blue-500 dark:border-blue-400 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              Start Lending
            </Link>
          </div>
        </section>

        {/* Features Section - Enhanced for light mode */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Image
                  src="/file.svg"
                  alt="Smart Contracts"
                  width={24}
                  height={24}
                  className="text-blue-500 dark:text-blue-400 dark:invert"
                />
              </div>
              <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-white">
                Secure Smart Contracts
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Our platform is built on audited smart contracts ensuring the safety of your assets.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Image
                  src="/window.svg"
                  alt="Flexible Terms"
                  width={24}
                  height={24}
                  className="text-blue-500 dark:text-blue-400 dark:invert"
                />
              </div>
              <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-white">
                Flexible Terms
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose your loan terms, including duration and interest rate that work best for you.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Image
                  src="/globe.svg"
                  alt="Global Market"
                  width={24}
                  height={24}
                  className="text-blue-500 dark:text-blue-400 dark:invert"
                />
              </div>
              <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-white">
                Global NFT Market
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access a worldwide market of NFT-backed loans and lending opportunities.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      {/* Additional styles for light mode */}
      <style jsx global>{`
        .light-mode-gradient {
          background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 50%, #8b5cf6 100%);
        }
      `}</style>
    </div>
  );
}
