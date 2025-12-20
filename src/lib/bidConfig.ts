/**
 * Bid Increment Configuration
 * Defines minimum bid increments based on auction price levels
 */

export interface BidIncrementTier {
  minAmount: number; // Minimum bid amount in ETH for this tier
  increment: number; // Minimum increment in ETH from previous bid
  incrementPercent?: number; // Alternative: percentage increment (e.g., 5% of current bid)
}

/**
 * Configurable bid increment tiers
 * Lower amounts require larger absolute increments
 * Higher amounts can use percentage-based increments
 */
export const BID_INCREMENT_TIERS: BidIncrementTier[] = [
  // For bids under 0.1 ETH: 0.0001 ETH minimum increment
  { minAmount: 0, increment: 0.0001, incrementPercent: undefined },
  
  // For bids 0.1 - 1 ETH: 0.001 ETH minimum increment or 1%
  { minAmount: 0.1, increment: 0.001, incrementPercent: 1 },
  
  // For bids 1 - 10 ETH: 0.01 ETH minimum increment or 0.5%
  { minAmount: 1, increment: 0.01, incrementPercent: 0.5 },
  
  // For bids above 10 ETH: 0.1 ETH minimum increment or 0.25%
  { minAmount: 10, increment: 0.1, incrementPercent: 0.25 },
];

/**
 * Calculate the minimum bid increment for a given current bid amount
 * @param currentBid Current highest bid amount in ETH
 * @returns Minimum increment required for next bid in ETH
 */
export function getMinimumBidIncrement(currentBid: number): number {
  // Find the applicable tier for the current bid
  let applicableTier = BID_INCREMENT_TIERS[0];
  
  for (const tier of BID_INCREMENT_TIERS) {
    if (currentBid >= tier.minAmount) {
      applicableTier = tier;
    } else {
      break;
    }
  }

  // Calculate the minimum increment
  const absoluteIncrement = applicableTier.increment;
  
  // If a percentage is defined, use the higher of absolute or percentage
  if (applicableTier.incrementPercent !== undefined) {
    const percentIncrement = (currentBid * applicableTier.incrementPercent) / 100;
    return Math.max(absoluteIncrement, percentIncrement);
  }

  return absoluteIncrement;
}

/**
 * Calculate the minimum valid next bid amount
 * @param currentBid Current highest bid in ETH
 * @returns Minimum valid bid for next bidder in ETH
 */
export function getMinimumNextBid(currentBid: number): number {
  const increment = getMinimumBidIncrement(currentBid);
  // Add increment and round to 6 decimal places (wei precision)
  return Math.round((currentBid + increment) * 1e6) / 1e6;
}

/**
 * Validate if a proposed bid meets the minimum increment requirement
 * @param proposedBid New bid amount in ETH
 * @param currentBid Current highest bid in ETH
 * @returns Object with valid flag and optional error message
 */
export function validateBidIncrement(
  proposedBid: number,
  currentBid: number
): { valid: boolean; message?: string } {
  const minimumNext = getMinimumNextBid(currentBid);
  
  if (proposedBid < minimumNext) {
    const increment = getMinimumBidIncrement(currentBid);
    return {
      valid: false,
      message: `Bid must be at least ${minimumNext.toFixed(6)} ETH (current minimum increment: ${increment.toFixed(6)} ETH from ${currentBid.toFixed(6)} ETH)`,
    };
  }

  return { valid: true };
}

/**
 * Format bid increment info for display
 * @param currentBid Current highest bid in ETH
 * @returns Human-readable increment info
 */
export function formatBidIncrementInfo(currentBid: number): string {
  const increment = getMinimumBidIncrement(currentBid);
  const nextBid = getMinimumNextBid(currentBid);
  return `Next minimum bid: ${nextBid.toFixed(6)} ETH (${increment.toFixed(6)} ETH above current)`;
}
