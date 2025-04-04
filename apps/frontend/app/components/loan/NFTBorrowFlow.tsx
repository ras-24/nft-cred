'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useToast, ToastTitle, ToastDescription } from '../ui/use-toast';
import { Card } from '../ui/card';
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
}

interface NFTBorrowFlowProps {
  nft: NFT;
  onClose: () => void;
}

const formSchema = z.object({
  duration: z.string().min(1, 'Duration is required'),
});

export function NFTBorrowFlow({ nft, onClose }: NFTBorrowFlowProps) {
  const { userId, walletAddress } = useWallet();
  const { executeContractCall, connectWallet, isConnected, signer } = useWeb3();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [estimation, setEstimation] = useState<any>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration: '30', // Default 30 days
    },
  });

  // Helper function to map credential type string to numeric value
  const mapCredentialTypeToNumber = (credentialType: string): number => {
    const typeMap: Record<string, number> = {
      "Academic Degree": 0,
      "Professional License": 1,
      "Online Course": 2
    };
    
    return typeMap[credentialType] || 0;
  };

  const handleEstimateLoan = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const estimationData = await loanService.estimateLoan({
        duration: values.duration,
        contractAddress: nft.contractAddress
      });
      
      setEstimation(estimationData);
      setCurrentStep(2);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLoan = async () => {
    setIsLoading(true);
    setApprovalStatus('pending');
    
    try {
      // Check for required values
      // if (process.env.NFTCRED_CONTRACT === undefined) {
      //   throw new Error('NFTCred contract address not configured');
      // }
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
      
      const tokenId = parseInt(nft.id);

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
        NFTCredABI,
        'approve',
        [walletAddress, tokenId]
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
      
      // Step 2: Create Credential
      await nftService.createCredential({
        userId,
        credentialTypeId: nft.credentialTypeId,
        contractAddress: nft.contractAddress,
        tokenId: nft.id,
        institution: nft.metadata.issuer?.name || nft.tokenName,
        verification: "PENDING",
        metadata: JSON.stringify(nft.metadata)
      });
      
      // Step 3: Lock NFT directly using the smart contract 
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
      
      // Execute lockNFT on the contract - use the correct ABI
      const lockTx = await executeContractCall(
        nft.contractAddress,
        NFTCredABI,
        'lockNFT',
        [nft.contractAddress, tokenId, credentialType]
      );
      
      setTxHash(lockTx.hash);
      
      toast({
        children: (
          <>
            <ToastTitle>Lock Transaction Submitted</ToastTitle>
            <ToastDescription>
              Waiting for confirmation...
              {process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL && (
                <a
                  href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL}/tx/${lockTx.hash}`}
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
      await lockTx.wait();
      
      toast({
        children: (
          <>
            <ToastTitle>NFT Locked Successfully</ToastTitle>
            <ToastDescription>Creating your loan...</ToastDescription>
          </>
        ),
      });

      // Step 4: Create loan directly using the smart contract
      const loanAmount = ethers.parseEther(estimation.loanAmount.toString());
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
      
      const createLoanTx = await executeContractCall(
        nft.contractAddress,
        NFTCredABI,
        'createLoan',
        [nft.contractAddress, tokenId, loanAmount, duration, ltv]
      );
      
      setTxHash(createLoanTx.hash);
      
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
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Borrow Against Your NFT</h2>
        <p className="text-gray-600">{nft.tokenName}</p>
      </div>

      {currentStep === 1 && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleEstimateLoan)} className="space-y-4">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (Days)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              Get Loan Estimation
            </Button>
          </form>
        </Form>
      )}

      {currentStep === 2 && estimation && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Loan Estimation</h3>
            <p>Credential Type: {estimation.credentialType}</p>
            <p>Base Price: {estimation.basePrice} ETH</p>
            <p>LTV: {estimation.ltv}%</p>
            <p>Loan Amount: {estimation.loanAmount} ETH</p>
            <p>Interest Rate: {estimation.interestRate}%</p>
            <p>Interest: {estimation.interest} ETH</p>
            <p>Total Loan: {estimation.totalLoan} ETH</p>
          </div>
          
          {approvalStatus === 'pending' && (
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <p className="flex items-center text-amber-700">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-amber-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                  className="text-blue-600 hover:underline text-sm mt-2 block"
                >
                  View transaction on block explorer
                </a>
              )}
            </div>
          )}
          
          <Button 
            onClick={handleCreateLoan} 
            className="w-full" 
            disabled={isLoading || approvalStatus === 'pending'}
          >
            {isLoading ? "Processing..." : approvalStatus === 'success' ? "Creating Loan..." : "Create Loan"}
          </Button>
        </div>
      )}

      <Button
        variant="outline"
        onClick={onClose}
        className="mt-4 w-full"
        disabled={isLoading}
      >
        Cancel
      </Button>
    </Card>
  );
}