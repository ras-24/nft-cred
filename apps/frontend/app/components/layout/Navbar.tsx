'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '../ThemeProvider';
import { useWallet } from '@/app/contexts/WalletContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();
  const { isConnected, walletAddress, usdcBalance, connectWallet, disconnectWallet, refreshBalance } = useWallet();
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const [prevBalance, setPrevBalance] = useState('0');

  // Format USDC balance with commas and fixed to 2 decimal places
  const formattedBalance = parseFloat(usdcBalance || '0').toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Track balance changes to trigger animation
  useEffect(() => {
    if (usdcBalance !== prevBalance && prevBalance !== '0') {
      setIsRefreshingBalance(true);
      const timer = setTimeout(() => {
        setIsRefreshingBalance(false);
      }, 1500); // Animation duration
      return () => clearTimeout(timer);
    }
    setPrevBalance(usdcBalance || '0');
  }, [usdcBalance, prevBalance]);

  // Handle balance refresh click
  const handleRefreshBalance = async () => {
    setIsRefreshingBalance(true);
    await refreshBalance();
    setTimeout(() => {
      setIsRefreshingBalance(false);
    }, 1500);
  };

  const handleThemeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Direct DOM manipulation for immediate feedback
    const isDarkNow = document.documentElement.classList.contains('dark');
    console.log('Current theme (DOM check):', isDarkNow ? 'dark' : 'light');
    
    if (isDarkNow) {
      // Switching to light mode
      document.documentElement.classList.remove('dark');
      document.documentElement.dataset.theme = 'light';
      
      // Force immediate style updates for critical elements
      document.querySelectorAll('button.p-2.rounded-full').forEach(button => {
        button.classList.remove('dark-button');
        button.classList.add('light-button');
        (button as HTMLElement).style.backgroundColor = '#f1f5f9';
        (button as HTMLElement).style.color = '#4b5563';
        (button as HTMLElement).style.borderColor = '#e5e7eb';
      });
      
    } else {
      // Switching to dark mode
      document.documentElement.classList.add('dark');
      document.documentElement.dataset.theme = 'dark';
      
      // Force immediate style updates for critical elements
      document.querySelectorAll('button.p-2.rounded-full').forEach(button => {
        button.classList.add('dark-button');
        button.classList.remove('light-button');
        (button as HTMLElement).style.backgroundColor = '#1f2937';
        (button as HTMLElement).style.color = '#e5e7eb';
        (button as HTMLElement).style.borderColor = '#374151';
      });
    }
    
    // Allow any direct DOM effects to apply
    setTimeout(() => {
      console.log('Calling theme context toggle');
      toggleTheme();
    }, 10);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              {/* Enhanced logo for light mode */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 dark:opacity-0 light-mode-only"></div>
                <Image
                  src="/next.svg"
                  alt="NFT Cred Logo"
                  width={32}
                  height={32}
                  className="dark:invert relative z-10"
                />
              </div>
              <span className="text-xl font-medium text-gray-800 light-mode-logo">NFT Cred</span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link
                href="/gallery"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                NFT Gallery
              </Link>
              {/* <Link
                href="/transactions"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Transactions
              </Link> */}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            {/* <button
              onClick={handleThemeToggle}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              )}
            </button> */}
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            
            {/* USDC Balance Display with Refresh Animation */}
            {isConnected && (
              <div 
                className={`hidden md:flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 group ${isRefreshingBalance ? 'balance-refreshing' : ''}`}
                onClick={handleRefreshBalance}
                title="Click to refresh balance"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 text-blue-500 dark:text-blue-400 ${isRefreshingBalance ? 'spin-once' : 'group-hover:rotate-12 transition-transform'}`}>
                  <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                  <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" />
                  <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
                </svg>
                <span className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${isRefreshingBalance ? 'fade-transition' : ''}`}>
                  {formattedBalance} USDC
                </span>
                {isRefreshingBalance && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="loading-dots"></span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <button
                onClick={isConnected ? disconnectWallet : connectWallet}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-full text-sm shadow-sm transition-all duration-200  cursor-pointer"
              >
                {isConnected
                  ? `${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}`
                  : 'Connect Wallet'}
              </button>
              {isConnected && (
                <button
                  onClick={disconnectWallet}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-200  cursor-pointer"
                  aria-label="Disconnect wallet"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div
          className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}
          id="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-100 dark:border-gray-800">
            {isConnected && (
              <div 
                className={`flex items-center  cursor-pointer space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 ${isRefreshingBalance ? 'balance-refreshing' : ''}`}
                onClick={handleRefreshBalance}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 text-blue-500 dark:text-blue-400 ${isRefreshingBalance ? 'spin-once' : ''}`}>
                  <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                  <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" />
                  <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
                </svg>
                <span className={`text-sm font-medium ${isRefreshingBalance ? 'fade-transition' : ''}`}>
                  {formattedBalance} USDC
                </span>
              </div>
            )}
            <Link
              href="/gallery"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              NFT Gallery
            </Link>
            {/* <Link
              href="/lend"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Lend
            </Link>
            <Link
              href="/borrow"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Borrow
            </Link>
            <Link
              href="/transactions"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            > */}
              {/* Transactions */}
            {/* </Link> */}
            {/* Mobile Theme Toggle */}
            {/* <button
              onClick={handleThemeToggle}
              className="flex w-full items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-md text-base font-medium"
            >
              {isDark ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                  Light Mode
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                  Dark Mode
                </>
              )}
            </button> */}
          </div>
        </div>
      </div>
      
      {/* Add styles for light mode logo and balance animations */}
      <style jsx>{`
        .light-mode-only {
          opacity: 0.1;
          animation: pulse 3s infinite;
        }
        
        .light-mode-logo {
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-weight: 600;
        }
        
        @keyframes pulse {
          0% { opacity: 0.1; }
          50% { opacity: 0.2; }
          100% { opacity: 0.1; }
        }
        
        /* Only apply gradient in light mode */
        html.dark .light-mode-logo {
          background: none;
          -webkit-background-clip: unset;
          background-clip: unset;
          color: white;
        }
        
        html.dark .light-mode-only {
          display: none;
        }
        
        /* Balance refresh animations */
        .balance-refreshing {
          position: relative;
          background-color: rgba(59, 130, 246, 0.1);
        }
        
        .fade-transition {
          animation: fadeInOut 1.5s ease-in-out;
        }
        
        .spin-once {
          animation: spinOnce 1.5s ease;
        }
        
        @keyframes fadeInOut {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        
        @keyframes spinOnce {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
          100% { transform: rotate(360deg); }
        }
        
        .loading-dots {
          position: relative;
          width: 10px;
          height: 10px;
        }
        
        .loading-dots::before,
        .loading-dots::after {
          content: '';
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background-color: #3b82f6;
          animation: dotPulse 1.5s infinite;
        }
        
        .loading-dots::after {
          animation-delay: 0.5s;
          left: 6px;
        }
        
        @keyframes dotPulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </nav>
  );
}