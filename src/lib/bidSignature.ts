/**
 * Bid signature utilities for EIP-712 signing and verification
 * Signs bid data with the bidder's private key (client-side) and verifies on server
 */

import { ethers } from 'ethers';

export interface BidSignaturePayload {
  auction_id: number;
  bidder_address: string;
  amount: number; // ETH
  amount_usd?: number;
  encrypted: boolean;
  timestamp: number;
}

/**
 * EIP-712 domain separator for bid signatures
 */
export const BID_DOMAIN = {
  name: 'VeilPass',
  version: '1',
  chainId: 84532, // Base Sepolia
  verifyingContract: '0x0000000000000000000000000000000000000000', // Placeholder
};

/**
 * EIP-712 type definition for bids
 */
export const BID_TYPES = {
  Bid: [
    { name: 'auction_id', type: 'uint256' },
    { name: 'bidder_address', type: 'address' },
    { name: 'amount', type: 'uint256' }, // amount in wei (for precision)
    { name: 'amount_usd', type: 'uint256' },
    { name: 'encrypted', type: 'bool' },
    { name: 'timestamp', type: 'uint256' },
  ],
};

/**
 * Sign a bid with the user's wallet (client-side)
 * Attempts to use window.ethereum (MetaMask, etc.) or falls back to mock signature
 * @param bidData - The bid data to sign
 * @param signerAddress - The wallet address that will sign
 * @returns Signature string (real if wallet available, mock otherwise)
 */
export async function signBid(bidData: BidSignaturePayload, signerAddress?: string): Promise<string> {
  try {
    // Check if ethereum provider is available
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const domain = BID_DOMAIN;
        const types = BID_TYPES;
        // amount_usd is represented as dollars (may be fractional). For EIP-712
        // uint256 we use integer cents to avoid fractional BigInt conversion.
        const amountUsdCents = BigInt(Math.round(Number(bidData.amount_usd ?? 0) * 100));
        const value = {
          auction_id: BigInt(bidData.auction_id),
          bidder_address: bidData.bidder_address,
          amount: ethers.parseEther(bidData.amount.toString()),
          amount_usd: amountUsdCents,
          encrypted: bidData.encrypted,
          timestamp: BigInt(bidData.timestamp),
        };

        // Use ethers.js to sign with EIP-712
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        // Sign the typed data
        const signature = await signer.signTypedData(domain, types, value);
        return signature;
      } catch (walletErr: any) {
        console.warn('Failed to sign with wallet provider, falling back to mock:', walletErr.message);
        // Fall back to mock if signing fails
      }
    }
  } catch (err: any) {
    console.warn('Wallet provider not available, using mock signature:', err.message);
  }

  // Fallback: create a deterministic mock signature for testing
  const dataStr = JSON.stringify(bidData);
  const hash = ethers.id(dataStr);
  const mockSig = ethers.Signature.from({
    r: ethers.zeroPadValue(ethers.toBeHex(0x1234), 32),
    s: ethers.zeroPadValue(ethers.toBeHex(0x5678), 32),
    v: 28,
  }).serialized;

  return mockSig;
}

/**
 * Verify a bid signature on the server (server-side)
 * @param bidData - The original bid data
 * @param signature - The signature to verify
 * @returns true if signature is valid, false otherwise
 */
export function verifyBidSignature(bidData: BidSignaturePayload, signature: string): boolean {
  try {
    // Reconstruct the EIP-712 message with the same types used during signing
    const domain = BID_DOMAIN;
    const types = BID_TYPES;
    // Use integer cents for amount_usd to match signing logic
    const amountUsdCents = BigInt(Math.round(Number(bidData.amount_usd ?? 0) * 100));
    const value = {
      auction_id: BigInt(bidData.auction_id),
      bidder_address: bidData.bidder_address,
      amount: ethers.parseEther(bidData.amount.toString()),
      amount_usd: amountUsdCents,
      encrypted: bidData.encrypted,
      timestamp: BigInt(bidData.timestamp),
    };

    // Verify the signature
    const recoveredAddress = ethers.verifyTypedData(domain, types, value, signature);
    const matches = recoveredAddress.toLowerCase() === bidData.bidder_address.toLowerCase();
    if (!matches) {
      console.warn('Bid signature mismatch', {
        expected: bidData.bidder_address,
        recovered: recoveredAddress,
        value,
      });
    }
    return matches;
  } catch (err) {
    console.error('Error verifying bid signature:', err);
    return false;
  }
}
