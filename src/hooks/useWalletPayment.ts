/**
 * Custom hook for handling wallet payments using Wagmi + RainbowKit
 * 
 * This hook provides proper integration with the application's configured
 * Wagmi setup and RainbowKit for seamless wallet payments.
 */

import { useCallback } from 'react';
import { useSendTransaction, useAccount, useConnect } from 'wagmi';
import { parseEther } from 'ethers';
import { useToast } from '@/components/ToastContainer';
import { NETWORK_CONFIG } from '@/lib/wallet-utils';

interface PaymentParams {
  to: string;
  amount: number; // ETH amount
  description?: string;
}

interface UseWalletPaymentReturn {
  sendPayment: (params: PaymentParams) => Promise<string | null>;
  isPending: boolean;
  error: Error | null;
  connectWallet: () => Promise<void>;
  isWalletConnected: boolean;
}

/**
 * Hook for handling wallet payments with proper Wagmi integration
 */
export function useWalletPayment(): UseWalletPaymentReturn {
  const { sendTransaction, isPending, error } = useSendTransaction();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { chain } = useAccount(); // Use useAccount instead of useNetwork
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  /**
   * Send payment using Wagmi's sendTransaction hook
   */
  const sendPayment = useCallback(async ({ to, amount, description }: PaymentParams): Promise<string | null> => {
    try {
      // Validate inputs
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!to || !to.startsWith('0x') || to.length !== 42) {
        throw new Error('Invalid recipient address');
      }

      if (amount <= 0) {
        throw new Error('Invalid payment amount');
      }

      // Check network
      if (chain?.id !== NETWORK_CONFIG.chainId) {
        throw new Error(`Please switch to ${NETWORK_CONFIG.name} network`);
      }

      // Format amount to wei
      const amountInWei = parseEther(amount.toString());

      showInfo(`Requesting transaction confirmation for ${amount.toFixed(4)} Ξ...`);

      // Send transaction using Wagmi
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await new Promise<`0x${string}`>((resolve, reject) => {
        sendTransaction({
          to,
          value: amountInWei,
        } as any, {
          onSuccess: (hash: any) => {
            showSuccess(`✓ Transaction submitted! Hash: ${hash.slice(0, 10)}...`);
            resolve(hash as `0x${string}`);
          },
          onError: (err) => {
            reject(err);
          },
        });
      });

      return result;

    } catch (error: any) {
      console.error('Payment error:', error);
      
      let displayMsg = 'Payment failed';
      
      if (error?.code === 4001 || error?.message?.includes('cancelled') || error?.message?.includes('rejected')) {
        displayMsg = 'Payment cancelled';
        showWarning(displayMsg);
      } else if (error?.message) {
        displayMsg = error.message;
        showError(displayMsg);
      } else {
        showError(displayMsg);
      }
      
      return null;
    }
  }, [address, chain, sendTransaction]);

  /**
   * Connect wallet using the first available connector
   */
  const connectWallet = useCallback(async (): Promise<void> => {
    try {
      if (connectors.length > 0) {
        await connect({ connector: connectors[0] });
        showSuccess('Wallet connected successfully');
      } else {
        showError('No wallet connectors available');
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      showError('Failed to connect wallet');
    }
  }, [connectors, connect]);

  return {
    sendPayment,
    isPending,
    error: error as Error | null,
    connectWallet,
    isWalletConnected: isConnected,
  };
}
