import { useState, useEffect } from 'react';

export interface PaymentStatus {
  id: number;
  auctionId: string;
  winnerAddress: string;
  winningAmount: number;
  status: 'pending_payment' | 'fallback_accepted' | 'fallback_offered' | 'paid' | 'failed_payment' | 'failed_all_fallbacks';
  paymentDeadline: string;
  paymentReceivedAt: string | null;
  isFallbackWinner: boolean;
  isExpired: boolean;
  timeRemaining: number | null; // milliseconds
  timeRemainingReadable: string | null;
}

/**
 * Hook to fetch and monitor payment status for an auction result
 */
export function usePaymentStatus(auctionResultId: string | null) {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auctionResultId) return;

    const fetchStatus = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/auction/confirm-payment?auctionResultId=${auctionResultId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch payment status: ${response.status}`);
        }

        const data = await response.json();
        if (data.ok && data.result) {
          setStatus(data.result);
        } else {
          setError(data.error || 'Failed to fetch status');
        }
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Poll every 10 seconds if payment is pending
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [auctionResultId]);

  return { status, loading, error };
}

/**
 * Hook to confirm payment for an auction result
 */
export function useConfirmPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmPayment = async (
    auctionResultId: string,
    paymentTxHash?: string,
    paymentMethod?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auction/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auctionResultId,
          paymentTxHash,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to confirm payment');
      }

      const data = await response.json();
      return data.result;
    } catch (err: any) {
      const message = err.message || 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { confirmPayment, loading, error };
}

/**
 * Hook to handle fallback bidder responses
 */
export function useFallbackResponse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const respondToFallback = async (
    auctionResultId: string,
    fallbackLogId: string,
    response: 'accepted' | 'rejected',
    bidderAddress: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetch('/api/auction/fallback-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auctionResultId,
          fallbackLogId,
          response,
          bidderAddress,
        }),
      });

      if (!result.ok) {
        const data = await result.json();
        throw new Error(data.error || 'Failed to submit response');
      }

      const data = await result.json();
      return data.result;
    } catch (err: any) {
      const message = err.message || 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { respondToFallback, loading, error };
}

/**
 * Helper function to get status badge color
 */
export function getPaymentStatusColor(status: PaymentStatus['status']) {
  switch (status) {
    case 'paid':
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    case 'pending_payment':
      return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
    case 'fallback_offered':
    case 'fallback_accepted':
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    case 'failed_payment':
    case 'failed_all_fallbacks':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
  }
}

/**
 * Helper function to get status label
 */
export function getPaymentStatusLabel(status: PaymentStatus['status']) {
  switch (status) {
    case 'pending_payment':
      return 'Awaiting Payment';
    case 'paid':
      return 'Payment Received';
    case 'failed_payment':
      return 'Payment Failed';
    case 'fallback_offered':
      return 'Offered to Next Bidder';
    case 'fallback_accepted':
      return 'Fallback Accepted';
    case 'failed_all_fallbacks':
      return 'Settlement Failed';
    default:
      return status;
  }
}
