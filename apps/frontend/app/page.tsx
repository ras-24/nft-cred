'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from './components/layout/Navbar';
import { useTheme } from './components/ThemeProvider';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = typeof document !== 'undefined' ? 
    document.documentElement.classList.contains('dark') : 
    theme === 'dark';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-6">
            Turn Your NFTs into
            <span className="text-blue-500"> Borrowing Power</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Unlock the value in your NFT collection. Borrow against your NFTs while still maintaining ownership.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link
                  href="/gallery"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-4 px-8 rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center"
                >
                  <span>Browse NFT Gallery</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
        </section>

        {/* Features Section */}
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
              <p className="text-gray-600 dark:text-gray-300">
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
    </div>
  );
}
