import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);

      // Listen for chain changes
      const handleChainChanged = (chainId: string) => {
        window.location.reload();
      };
      
      // Listen for account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null);
          setSigner(null);
          setIsConnected(false);
        } else {
          setAccount(accounts[0]);
        }
      };
      
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Cleanup listeners when component unmounts
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    } else {
      setError('MetaMask or similar wallet not detected');
      return () => {}; // Empty cleanup function
    }
  }, []);

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    if (!provider || !window.ethereum) {
      setError('No provider available');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const web3Signer = await provider.getSigner();
        setSigner(web3Signer);
        setIsConnected(true);
        
        const { chainId } = await provider.getNetwork();
        setChainId(Number(chainId));
        setError(null);
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  }, [provider]);

  // Function to execute contract calls
  const executeContractCall = useCallback(async (
    contractAddress: string,
    abi: any[],
    method: string,
    args: any[]
  ) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract[method](...args);
    return tx;
  }, [signer]);

  return {
    account,
    provider,
    signer,
    isConnected,
    chainId,
    error,
    connectWallet,
    executeContractCall
  };
}
