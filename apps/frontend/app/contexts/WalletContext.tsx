'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { userService } from '@/app/services/user';
import { nftService } from '@/app/services/nft';
import { usdcService } from '@/app/services/usdc';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  usdcBalance: string;
  userId: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  fetchBorrowerNFTs: (contractAddresses: string[]) => Promise<any>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    console.log('Wallet connection state changed:', isConnected, userId);
  }, [isConnected, userId]);

  // Fetch USDC balance whenever wallet address changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (walletAddress && isConnected) {
        try {
          const balance = await usdcService.getBalance({ walletAddress });
          setUsdcBalance(balance);
        } catch (error) {
          console.error('Error fetching USDC balance:', error);
          // Don't show toast here to avoid spamming users
        }
      } else {
        setUsdcBalance('0');
      }
    };

    fetchBalance();
  }, [walletAddress, isConnected]);

  useEffect(() => {
    const storedWalletAddress = localStorage.getItem('walletAddress');
    const storedUserId = localStorage.getItem('userId');
    
    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
    }
    
    if (storedUserId) {
      setUserId(storedUserId);
    }

    const checkConnection = async () => {
      const wasDisconnected = localStorage.getItem('walletDisconnected') === 'true';
      if (wasDisconnected) return;

      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
            console.log('Connected to wallet:', accounts[0]);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        const newAccount = accounts[0];
        
        // Update the connection state with the new account
        setWalletAddress(newAccount);
        setIsConnected(true);
        localStorage.removeItem('walletDisconnected');
      } else {
        setWalletAddress('');
        setIsConnected(false);
        localStorage.removeItem('lastConnectedAccount');
      }
    };

    if (window.ethereum?.on) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const refreshBalance = async () => {
    if (!walletAddress || !isConnected) {
      return;
    }

    try {
      const balance = await usdcService.getBalance({ walletAddress });
      setUsdcBalance(balance);
    } catch (error) {
      console.error('Error refreshing USDC balance:', error);
      toast.error('Failed to refresh USDC balance');
    }
  };

  const disconnectWallet = async () => {
    try {
      setWalletAddress(null);
      setIsConnected(false);
      setUserId(null);
      setUsdcBalance('0');
      localStorage.setItem('walletDisconnected', 'true');
      localStorage.removeItem('lastConnectedAccount');
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('userId');
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        if (accounts && accounts.length > 0) {
          const currentAccount = accounts[0];
          
          try {
            // Check if user exists using the user service
            let userData;
            try {
              userData = await userService.checkUser({ wallet: currentAccount });
              setUserId(userData.id);
            } catch (error) {
              // If user not found, register a new user
              if (error instanceof Error && error.message === 'User not found') {
                const newUserData = await userService.registerUser({ wallet: currentAccount });
                setUserId(newUserData.id);
                console.log('User registered successfully');
                userData = newUserData;
              } else {
                throw error;
              }
            }
            
            // Update wallet state
            setWalletAddress(currentAccount);
            setIsConnected(true);
            localStorage.removeItem('walletDisconnected');
            localStorage.setItem('lastConnectedAccount', currentAccount);
            localStorage.setItem('walletAddress', currentAccount);
            localStorage.setItem('userId', userData.id);
            console.log('Connected to wallet:', currentAccount);
            toast.success('Wallet connected');
            
            // Fetch initial balance
            try {
              const balance = await usdcService.getBalance({ walletAddress: currentAccount });
              setUsdcBalance(balance);
            } catch (error) {
              console.error('Error fetching initial USDC balance:', error);
            }
            
          } catch (error) {
            console.error('Error in user registration flow:', error);
            toast.error('Failed to complete user registration');
          }
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast.error('Failed to connect wallet');
      }
    } else {
      alert('Please install MetaMask to use this application');
    }
  };

  const fetchBorrowerNFTs = async (contractAddresses: string[]) => {
    try {
      if (!walletAddress) {
        throw new Error('Wallet not connected');
      }
      
      // Use nftService to fetch borrower NFTs
      return await nftService.getBorrowerNFTs({
        walletAddress,
        contractAddresses
      });
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      toast.error('Failed to fetch NFTs');
      return [];
    }
  };

  return (
    <WalletContext.Provider value={{
      isConnected,
      walletAddress,
      usdcBalance,
      userId,
      connectWallet,
      disconnectWallet,
      fetchBorrowerNFTs,
      refreshBalance
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}