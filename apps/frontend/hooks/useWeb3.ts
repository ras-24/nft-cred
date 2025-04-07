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

  // Connect wallet function - now returns the signer
  const connectWallet = useCallback(async () => {
    if (!provider || !window.ethereum) {
      setError('No provider available');
      throw new Error('No provider available');
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
        
        // Return the signer so it can be used immediately
        return web3Signer;
      }
      throw new Error('No accounts returned from wallet');
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      throw err;
    }
  }, [provider]);

  // Function to get a signer, connecting if needed
  const ensureSigner = useCallback(async () => {
    if (signer) return signer;
    
    if (!provider) {
      throw new Error('Provider not available');
    }
    
    // Try to get accounts without prompting
    try {
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        // User is already connected, just get the signer
        const web3Signer = await provider.getSigner();
        setSigner(web3Signer);
        setAccount(accounts[0].address);
        setIsConnected(true);
        return web3Signer;
      }
    } catch (e) {
      // Silently fail and continue to connect flow
    }
    
    // Need to connect
    return await connectWallet();
  }, [provider, signer, connectWallet]);

  // Function to execute contract calls - now ensures signer before proceeding
  const executeContractCall = useCallback(async (
    contractAddress: string,
    abi: any[],
    method: string,
    args: any[]
  ) => {
    // Get or establish a signer
    const currentSigner = await ensureSigner();
    
    console.log('Executing contract call:', { contractAddress, method, args });
    const contract = new ethers.Contract(contractAddress, abi, currentSigner);
    const tx = await contract[method](...args);
    return tx;
  }, [ensureSigner]);

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
