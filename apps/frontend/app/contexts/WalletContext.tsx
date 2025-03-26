'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
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

  const disconnectWallet = async () => {
    try {
      setWalletAddress('');
      setIsConnected(false);
      localStorage.setItem('walletDisconnected', 'true');
      localStorage.removeItem('lastConnectedAccount');
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request current accounts to ensure we get the active account
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        if (accounts && accounts.length > 0) {
          const currentAccount = accounts[0];
          setWalletAddress(currentAccount);
          setIsConnected(true);
          localStorage.removeItem('walletDisconnected');
          localStorage.setItem('lastConnectedAccount', currentAccount);
          console.log('Connected to wallet:', currentAccount);

          // Register user with the API
          try {
            const response = await fetch('/api/users/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                wallet: currentAccount
              })
            });
            if (!response.ok) {
              throw new Error('Failed to register user');
            }
            console.log('User registered successfully');
          } catch (error) {
            console.error('Error registering user:', error);
          }

          toast.success('Wallet connected');
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast.error('Failed to connect wallet');
      }
    } else {
      alert('Please install MetaMask to use this application');
    }
  };

  return (
    <WalletContext.Provider value={{ isConnected, walletAddress, connectWallet, disconnectWallet }}>
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