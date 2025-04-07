'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useToast, ToastTitle, ToastDescription } from '../ui/use-toast';
import { Card } from '../ui/card';
import { Slider } from '../ui/slider';
import { useWallet } from '@/app/contexts/WalletContext';
import { loanService } from '@/app/services/loan';
import { nftService } from '@/app/services/nft';
import { useWeb3 } from '@/hooks/useWeb3';
import { ethers } from 'ethers';

import NFTCredABI from '@/app/lib/ABI/NFTCredABI.json';

interface NFT {
  id: string;
  tokenName: string;
  tickerSymbol: string;
  tokenImage: string;
  contractAddress: string;
  credentialTypeId: string;
  metadata?: any;
  tokenId?: string;
}

interface NFTBorrowFlowProps {
  nft: NFT;
  onClose: () => void;
  onLoanComplete?: () => void;
}

const formSchema = z.object({
  duration: z.string().min(1, 'Duration is required'),
  requestedAmount: z.string().min(1, 'Requested amount is required'),
});

export function NFTBorrowFlow({ nft, onClose, onLoanComplete }: NFTBorrowFlowProps) {
  const { userId, walletAddress } = useWallet();
  const { executeContractCall, connectWallet, isConnected, signer } = useWeb3();
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [estimation, setEstimation] = useState<any>(null);
  const [contractBalance, setContractBalance] = useState<number>(0);
  const [maxLoanAmount, setMaxLoanAmount] = useState<number>(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration: '30', // Default 30 days
      requestedAmount: '0.001', // Default small amount
    },
  });

  useEffect(() => {
    console.log(maxLoanAmount);
  }, [maxLoanAmount]);

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
        console.log("Contract balance data:", data);
        const balanceValue = parseFloat(data.balance);
        setContractBalance(balanceValue);
        return balanceValue; // Return the balance value so we can use it directly
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

  // Initialize data on component mount
  useEffect(() => {
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
      
      // Ensure wallet is connected
      if (!isConnected) {
        await connectWallet();
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

      // Execute the approval transaction
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
      
      if (onLoanComplete) {
        onLoanComplete();
      }
      
      onClose();
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

  return (
    <Card className="p-6 mt-20 bg-white shadow-md border border-gray-100 rounded-xl">
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
            className="w-full bg-blue-500 hover:bg-blue-600 mt-4" 
            disabled={isLoading || approvalStatus === 'pending' || parseFloat(form.getValues('requestedAmount')) <= 0}
          >
            {isLoading ? "Processing..." : approvalStatus === 'success' ? "Creating Loan..." : "Create Loan"}
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full mt-2 border-gray-200 text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </>
      )}
    </Card>
  );
}