import { useEffect, useState } from 'react';
import { fetchEthPrice, getEthPriceSync } from '@/lib/currency-utils';

/**
 * Hook to manage live ETH price from CoinGecko
 * Fetches price on mount and periodically refreshes
 */
export function useEthPrice() {
  const [price, setPrice] = useState<number>(getEthPriceSync());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const fetchPrice = async () => {
      setLoading(true);
      try {
        const newPrice = await fetchEthPrice();
        if (isMounted) {
          setPrice(newPrice);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(String(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Fetch immediately
    fetchPrice();

    // Refresh every 60 seconds
    intervalId = setInterval(fetchPrice, 60000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return { price, loading, error };
}
