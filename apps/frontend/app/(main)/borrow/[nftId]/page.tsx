'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/app/components/layout/Navbar';
import { useWallet } from '@/app/contexts/WalletContext';
import { fetchNFT } from '@/app/lib/fetchNFT';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';
import { useToast, ToastTitle, ToastDescription } from '@/app/components/ui/use-toast';
import { Card } from '@/app/components/ui/card';
import { Slider } from '@/app/components/ui/slider';
import { loanService } from '@/app/services/loan';
import { nftService } from '@/app/services/nft';
import { useWeb3 } from '@/hooks/useWeb3';
import { ethers } from 'ethers';
import NFTCredABI from '@/app/lib/ABI/NFTCredABI.json';

// NFT interface to match the structure returned by fetchNFT
interface NFTDetails {
  id: string;
  tokenName: string;
  tickerSymbol: string;
  tokenImage: string;
  contractAddress: string;
  credentialTypeId: string;
  metadata?: any;
  tokenId?: string;
}

const formSchema = z.object({
  duration: z.string().min(1, 'Duration is required'),
  requestedAmount: z.string().min(1, 'Requested amount is required'),
});

export default function BorrowPage() {
  const params = useParams();
  const router = useRouter();
  const [nft, setNft] = useState<NFTDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { walletAddress, userId, refreshBalance } = useWallet();
  const { executeContractCall, connectWallet, isConnected } = useWeb3();
  const { toast } = useToast();
  
  // Loan form and state
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [estimation, setEstimation] = useState<any>(null);
  const [contractBalance, setContractBalance] = useState<number>(0);
  const [maxLoanAmount, setMaxLoanAmount] = useState<number>(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [loanCreated, setLoanCreated] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration: '30', // Default 30 days
      requestedAmount: '0.001', // Default small amount
    },
  });

  useEffect(() => {
    // Redirect if not logged in
    if (!walletAddress) {
      router.push('/gallery');
      return;
    }

    async function loadNFT() {
      // Make sure nftId exists and is a string
      const nftId = params.nftId;
      if (!nftId || typeof nftId !== 'string') return;

      try {
        setLoading(true);
        
        // Parse the nftId (format: contractAddress-tokenId)
        const [contractAddress, tokenId] = nftId.split('-');
        
        if (!contractAddress || !tokenId) {
          throw new Error('Invalid NFT identifier');
        }
        
        if (!walletAddress) {
          throw new Error('Wallet address not found');
        }

        const nftData = await fetchNFT(walletAddress, contractAddress, tokenId);
        
        if (!nftData) {
          throw new Error('NFT not found or not owned by you');
        }
        
        // Check if credentialTypeId is empty, and fetch it if needed
        if (!nftData.credentialTypeId) {
          try {
            // Fetch registered NFTs to get the credentialTypeId
            const registeredNFT = await nftService.getRegisteredNFT(nftData.contractAddress);
            
            if (registeredNFT){
              nftData.credentialTypeId = registeredNFT.credentialTypeId;
            } else {
              console.warn("No matching registered NFT found for this contract address");
            }
          } catch (err) {
            console.error("Error fetching registered NFTs:", err);
            // Continue with empty credentialTypeId, will be handled in loan creation
          }
        }
        
        console.log("NFT loaded with credentialTypeId:", nftData);
        setNft(nftData);
      } catch (err) {
        console.error('Error loading NFT details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load NFT details');
      } finally {
        setLoading(false);
      }
    }

    loadNFT();
  }, [params.nftId, walletAddress, router]);

  // Helper function to map credential type string to numeric value
  const mapCredentialTypeToNumber = (credentialType: string): number => {
    const typeMap: Record<string, number> = {
      "Academic Degree": 0,
      "Professional License": 1,
      "Online Course": 2
    };
    
    return typeMap[credentialType] || 0;
  };

  // Fetch contract balance
  const fetchContractBalance = async () => {
    try {
      const response = await fetch(`/api/usdc/balance`);
      if (response.ok) {
        const data = await response.json();
        const balanceValue = parseFloat(data.balance);
        setContractBalance(balanceValue);
        return balanceValue;
      } else {
        console.error("Failed to fetch contract balance");
        toast({
          variant: 'destructive',
          children: (
            <>
              <ToastTitle>Error</ToastTitle>
              <ToastDescription>Failed to fetch contract balance</ToastDescription>
            </>
          ),
        });
        return 0;
      }
    } catch (error) {
      console.error("Error fetching contract balance:", error);
      toast({
        variant: 'destructive',
        children: (
          <>
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>Failed to fetch contract balance</ToastDescription>
          </>
        ),
      });
      return 0;
    }
  };

  // Get initial loan estimation
  const getInitialEstimation = async (currentBalance: number) => {
    if (!nft) return;
    
    try {
      const estimationData = await loanService.estimateLoan({
        duration: form.getValues('duration'),
        contractAddress: nft.contractAddress
      });
      
      setEstimation(estimationData);
      
      // Set max loan amount based on the lower of contract balance and estimated loan amount
      const maxAmount = Math.min(
        parseFloat(estimationData.loanAmount), 
        currentBalance // Use the current balance passed as a parameter
      );
      console.log(`loanAmount: ${estimationData.loanAmount}, contractBalance: ${currentBalance}`);
      setMaxLoanAmount(maxAmount);
      
      // Update form value with the max loan amount
      form.setValue('requestedAmount', maxAmount.toString());
    } catch (error) {
      toast({
        variant: 'destructive',
        children: (
          <>
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>{error instanceof Error ? error.message : 'Failed to get loan estimation'}</ToastDescription>
          </>
        ),
      });
    }
  };

  // Initialize loan data when NFT loads
  useEffect(() => {
    if (nft) {
      console.log("NFT loaded:", nft);
      const initialize = async () => {
        setIsInitializing(true);
        try {
          // First fetch the balance and store the returned value
          const balance = await fetchContractBalance();
          // Then pass that balance to getInitialEstimation
          await getInitialEstimation(balance);
        } catch (error) {
          console.error("Initialization error:", error);
        } finally {
          setIsInitializing(false);
        }
      };
      
      initialize();
    }
  }, [nft]);

  // Handle duration change
  const handleDurationChange = async (newDuration: string) => {
    try {
      form.setValue('duration', newDuration);
      // Use the current contract balance from state when duration changes
      await getInitialEstimation(contractBalance);
    } catch (error) {
      console.error("Error updating duration:", error);
    }
  };

  const handleCreateLoan = async () => {
    if (!nft) return;
    
    setIsLoading(true);
    setApprovalStatus('pending');
    
    try {
      // Check for required values
      const nftCredAddress = process.env.NEXT_PUBLIC_NFTCRED_CONTRACT;
      if (nftCredAddress === undefined) {
        throw new Error('NFTCred contract address not configured');
      }
      if (!walletAddress) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      if (!userId) {
        throw new Error('User ID not found. Please reconnect your wallet.');
      }

      // Check if metadata exists
      if (!nft.metadata) {
        throw new Error('NFT metadata not available. Cannot create credential.');
      }
      
      // Check if credentialTypeId exists, warn if not
      if (!nft.credentialTypeId) {
        console.warn("Creating credential without credentialTypeId - this may cause issues");
      }
      
      // Get lending contract address
      toast({
        children: (
          <>
            <ToastTitle>Preparing</ToastTitle>
            <ToastDescription>Getting lending contract address...</ToastDescription>
          </>
        ),
      });
      
      const tokenId = parseInt(nft.tokenId || '0');
      console.log("nft:", nft);

      // Step 1: Request NFT Approval via API
      toast({
        children: (
          <>
            <ToastTitle>Approval Request</ToastTitle>
            <ToastDescription>Please approve the NFT for collateral use in your wallet...</ToastDescription>
          </>
        ),
      });

      // Execute the approval transaction - This will automatically connect if needed
      const tx = await executeContractCall(
        nft.contractAddress,
        ["function approve(address, uint256)"],
        'approve',
        [nftCredAddress, tokenId]
      );
      
      setTxHash(tx.hash);
      
      toast({
        children: (
          <>
            <ToastTitle>Transaction Submitted</ToastTitle>
            <ToastDescription>
              Approval transaction submitted. Waiting for confirmation...
              {process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL && (
                <a
                  href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL}/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline ml-1"
                >
                  View on explorer
                </a>
              )}
            </ToastDescription>
          </>
        ),
      });
      
      // Wait for transaction to be mined
      await tx.wait();
      setApprovalStatus('success');
      
      toast({
        children: (
          <>
            <ToastTitle>Approval Confirmed</ToastTitle>
            <ToastDescription>Creating your credential and loan...</ToastDescription>
          </>
        ),
      });
      
      // Step 2: Lock NFT directly using the smart contract 
      toast({
        children: (
          <>
            <ToastTitle>Locking NFT</ToastTitle>
            <ToastDescription>Please confirm the transaction to lock your NFT as collateral...</ToastDescription>
          </>
        ),
      });
      
      // Map credential type to enum value
      const credentialType = estimation?.credentialType 
        ? mapCredentialTypeToNumber(estimation.credentialType)
        : 0;
      
      // Step 3: Create loan and lock directly
      const requestedAmountString = form.getValues('requestedAmount');
      console.log("Requested amount (string):", requestedAmountString);
      
      // Convert to a proper decimal format (USDC has 6 decimals)
      const requestedAmountNumber = parseFloat(requestedAmountString);
      console.log("Requested amount (number):", requestedAmountNumber);
      
      // Use parseUnits with 6 decimals for USDC
      const requestedAmount = ethers.parseUnits(
        requestedAmountString,
        6  // USDC uses 6 decimal places
      );
      console.log("Requested amount (formatted for contract):", requestedAmount.toString());
      
      const duration = parseInt(form.getValues('duration'));
      const ltv = parseInt(estimation.ltv.toString());
      
      toast({
        children: (
          <>
            <ToastTitle>Creating Loan</ToastTitle>
            <ToastDescription>Please confirm the transaction to create your loan...</ToastDescription>
          </>
        ),
      });
      
      console.log("Creating loan with params:", {
        "contractAddress": nft.contractAddress,
        "tokenId": tokenId,
        "requestedAmount": requestedAmount.toString(),
        "duration": duration,
        "ltv": ltv
      });
      
      const createLoanTx = await executeContractCall(
        nftCredAddress,
        NFTCredABI,
        'createLoan',
        [nft.contractAddress, tokenId, requestedAmount, duration, ltv, credentialType]
      );
      
      setTxHash(createLoanTx.hash);

      // Step 3: Create Credential
      await nftService.createCredential({
        userId,
        credentialTypeId: nft.credentialTypeId,
        contractAddress: nft.contractAddress,
        tokenId: nft.id,
        institution: nft.metadata.issuer?.name || nft.tokenName,
        verification: "PENDING",
        metadata: JSON.stringify(nft.metadata)
      });
      
      toast({
        children: (
          <>
            <ToastTitle>Loan Transaction Submitted</ToastTitle>
            <ToastDescription>
              Waiting for confirmation...
              {process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL && (
                <a
                  href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL}/tx/${createLoanTx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline ml-1"
                >
                  View on explorer
                </a>
              )}
            </ToastDescription>
          </>
        ),
      });
      
      // Wait for the transaction to be mined
      await createLoanTx.wait();
      
      toast({
        children: (
          <>
            <ToastTitle>Success</ToastTitle>
            <ToastDescription>Loan created successfully!</ToastDescription>
          </>
        ),
      });
      
      // Set loan created state to true instead of redirecting
      setLoanCreated(true);
      
      // Refresh the wallet balance to show the updated USDC amount
      await refreshBalance();
      
      setIsLoading(false);
      
    } catch (error) {
      setApprovalStatus('error');
      console.error("Error creating loan:", error);
      
      // Handle specific errors
      let errorMessage = 'Failed to process loan';
      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected in your wallet';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: 'destructive',
        children: (
          <>
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>{errorMessage}</ToastDescription>
          </>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <main className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mt-8 text-gray-600">Loading NFT details...</div>
        </main>
      </div>
    );
  }

  if (error || !nft) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <main className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mt-8 text-center">
            <h2 className="text-xl font-semibold text-red-500 mb-2">Error</h2>
            <p className="text-gray-600 dark:text-gray-400">{error || 'NFT not found'}</p>
            <Link href="/gallery" className="mt-4 inline-block text-blue-500 hover:underline">
              Return to Gallery
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="py-8">
          {/* Back button */}
          <Link
            href="/gallery"
            className="inline-flex items-center mb-6 text-blue-500 hover:text-blue-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Gallery
          </Link>

          <div className="max-w-3xl mx-auto">
            <Card className="p-6 bg-white shadow-md border border-gray-100 rounded-xl">
              <div className="mb-6">
                <h2 className="text-2xl font-medium mb-2 text-gray-800">Borrow Against Your NFT</h2>
                <p className="text-gray-500">{nft.tokenName}</p>
              </div>

              {isInitializing ? (
                <div className="flex items-center justify-center py-6">
                  <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-3 text-gray-600">Initializing loan parameters...</span>
                </div>
              ) : (
                <>
                {loanCreated ? (
                  <div className="space-y-6">
                    <div className="bg-green-50 p-6 rounded-md border border-green-100">
                      <div className="flex items-center text-green-700 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <h3 className="text-lg font-medium">Loan Created Successfully!</h3>
                      </div>
                      
                      <p className="mb-4 text-gray-700">Your NFT has been locked as collateral and the loan funds have been transferred to your wallet.</p>
                      
                      {txHash && (
                        <div className="bg-white p-4 rounded-md border border-gray-100 mb-4">
                          <p className="text-sm text-gray-500 mb-2">Transaction Hash:</p>
                          <p className="font-mono text-xs break-all text-gray-700 mb-2">{txHash}</p>
                          <a 
                            href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL}/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-500 hover:text-blue-600"
                          >
                            <span>View on explorer</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Button 
                          onClick={() => router.push('/gallery')} 
                          className="w-full bg-blue-500 hover:bg-blue-600"
                        >
                          Return to Gallery
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column - Loan Request Form */}
                      <div>
                        <Form {...form}>
                          <form className="space-y-4">
                            <FormField
                              control={form.control}
                              name="duration"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700">Duration (Days)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                      {...field} 
                                      onChange={(e) => {
                                        field.onChange(e);
                                        handleDurationChange(e.target.value);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="requestedAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex justify-between items-center">
                                    <FormLabel className="text-gray-700">Requested Amount (USDC)</FormLabel>
                                    <span className="text-xs text-gray-500">
                                      Max: {maxLoanAmount.toFixed(6)} USDC
                                    </span>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Slider
                                      value={[parseFloat(field.value)]}
                                      min={0.0001}
                                      max={maxLoanAmount}
                                      step={0.0001}
                                      onValueChange={(value: number[]) => {
                                        // Format the value to avoid scientific notation
                                        const formattedValue = value[0].toFixed(6);
                                        field.onChange(formattedValue);
                                      }}
                                    />
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.0001" 
                                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        {...field}
                                        onChange={(e) => {
                                          const value = parseFloat(e.target.value);
                                          if (isNaN(value)) {
                                            field.onChange("0");
                                          } else if (value > maxLoanAmount) {
                                            field.onChange(maxLoanAmount.toFixed(6));
                                          } else {
                                            field.onChange(value.toFixed(6));
                                          }
                                        }}
                                      />
                                    </FormControl>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </form>
                        </Form>
                      </div>
                      
                      {/* Right Column - Loan Details */}
                      <div className="space-y-4 border rounded p-4 border-gray-100 bg-gray-50">
                        <h3 className="font-medium text-lg text-gray-800">Loan Details</h3>
                        {estimation && (
                          <div className="space-y-2 text-gray-600">
                            <p>Credential Type: {estimation.credentialType}</p>
                            <p>Base Price: {estimation.basePrice} USDC</p>
                            <p>LTV: {estimation.ltv}%</p>
                            <p>Max Loan Amount: {estimation.loanAmount} USDC</p>
                            <p>Interest Rate: {estimation.interestRate}%</p>
                            <p>Interest: {estimation.interest} USDC</p>
                            <p>Total Loan: {estimation.totalLoan} USDC</p>
                            <p>Contract Balance: {contractBalance} USDC</p>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <p className="font-medium text-gray-800">You're requesting: {form.watch('requestedAmount')} USDC</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  
                    {approvalStatus === 'pending' && (
                      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100 my-4">
                        <p className="flex items-center text-yellow-700">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-yellow-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing transaction...
                        </p>
                        
                        {txHash && (
                          <a 
                            href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL}/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline text-sm mt-2 block"
                          >
                            View transaction on block explorer
                          </a>
                        )}
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleCreateLoan} 
                      className="w-full bg-blue-500 hover:bg-blue-600 mt-4 cursor-pointer text-white" 
                      disabled={isLoading || approvalStatus === 'pending' || parseFloat(form.getValues('requestedAmount')) <= 0}
                    >
                      {isLoading ? "Processing..." : approvalStatus === 'success' ? "Creating Loan..." : "Create Loan"}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => router.push('/gallery')}
                      className="w-full mt-2 border-gray-200 text-gray-700 hover:bg-gray-50  cursor-pointer"
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                </>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
