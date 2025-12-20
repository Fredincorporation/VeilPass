/**
 * Utility functions for currency conversion between ETH and USD
 * Uses CoinGecko API for live pricing
 */

// Cache for ETH price to avoid excessive API calls
let cachedEthPrice: number | null = null;
let lastPriceFetchTime: number = 0;
const PRICE_CACHE_DURATION = 60000; // Cache for 60 seconds

/**
 * Fetch live ETH to USD price from CoinGecko API
 * @returns ETH price in USD
 */
export async function fetchEthPrice(): Promise<number> {
  // Return cached price if still fresh
  const now = Date.now();
  if (cachedEthPrice !== null && now - lastPriceFetchTime < PRICE_CACHE_DURATION) {
    return cachedEthPrice;
  }

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add a reasonable timeout
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      console.error('CoinGecko API error:', response.status);
      throw new Error('Failed to fetch price from CoinGecko');
    }

    const data = await response.json();
    const price = data?.ethereum?.usd;

    if (!price || typeof price !== 'number') {
      throw new Error('Invalid price data from CoinGecko');
    }

    cachedEthPrice = price;
    lastPriceFetchTime = now;
    return price;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    // Fallback to default price if API fails
    return 2500;
  }
}

/**
 * Get current ETH to USD rate (synchronously from cache or fallback)
 * @returns Current ETH to USD rate
 */
export function getEthPriceSync(): number {
  // Return cached price if available, otherwise fallback
  return cachedEthPrice ?? 2500;
}

/**
 * Convert ETH amount to USD
 * @param ethAmount - Amount in ETH (can be number, string, or undefined)
 * @returns USD amount as a string formatted for display
 */
export function ethToUsd(ethAmount: number | string | undefined | null): string {
  // Handle invalid inputs
  if (ethAmount === null || ethAmount === undefined) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(0);
  }

  // Convert string to number if needed
  const numAmount = typeof ethAmount === 'string' ? parseFloat(ethAmount) : ethAmount;

  // Check if conversion resulted in NaN
  if (isNaN(numAmount)) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(0);
  }

  const rate = getEthPriceSync();
  const usdAmount = numAmount * rate;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(usdAmount);
}

/**
 * Format ETH amount with proper decimals
 * @param ethAmount - Amount in ETH (can be number, string, or undefined)
 * @returns Formatted ETH string
 */
export function formatEth(ethAmount: number | string | undefined | null): string {
  // Handle invalid inputs
  if (ethAmount === null || ethAmount === undefined) {
    return '0.0000 ETH';
  }

  // Convert string to number if needed
  const numAmount = typeof ethAmount === 'string' ? parseFloat(ethAmount) : ethAmount;

  // Check if conversion resulted in NaN
  if (isNaN(numAmount)) {
    return '0.0000 ETH';
  }

  return `${numAmount.toFixed(4)} ETH`;
}

/**
 * Get both ETH and USD representations
 * @param ethAmount - Amount in ETH (can be number, string, or undefined)
 * @returns Object with both currencies formatted
 */
export function getDualCurrency(ethAmount: number | string | undefined | null) {
  // Handle invalid inputs
  if (ethAmount === null || ethAmount === undefined) {
    return {
      eth: '0.0000 ETH',
      usd: '$0.00',
      raw: 0,
    };
  }

  // Convert string to number if needed
  const numAmount = typeof ethAmount === 'string' ? parseFloat(ethAmount) : ethAmount;

  // Check if conversion resulted in NaN
  if (isNaN(numAmount)) {
    return {
      eth: '0.0000 ETH',
      usd: '$0.00',
      raw: 0,
    };
  }

  return {
    eth: formatEth(numAmount),
    usd: ethToUsd(numAmount),
    raw: numAmount,
  };
}

/**
 * Format currency pair for display (ETH primary, USD secondary)
 * @param ethAmount - Amount in ETH
 * @returns Formatted string like "1.5 ETH ($3,750 USD)"
 */
export function formatCurrencyPair(ethAmount: number): string {
  return `${formatEth(ethAmount)} (${ethToUsd(ethAmount)})`;
}
