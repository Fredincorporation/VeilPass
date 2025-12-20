/**
 * Bid signature utilities for EIP-712 signing and verification
 * Signs bid data with the bidder's private key (client-side) and verifies on server
 */

import { ethers } from 'ethers';
import { _TypedDataEncoder } from '@ethersproject/hash';

export interface BidSignaturePayload {
  auction_id: number;
  bidder_address: string;
  // `amount` may be provided as an ETH decimal (number or string like "0.0022")
  // or as a wei-integer string ("2200000000000000"). Signing will canonicalize
  // to a wei integer string to match the EIP-712 `uint256` expectation.
  amount: number | string;
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

        // Normalize numeric fields to string form to ensure canonical EIP-712 encoding
        // Convert ETH decimal to wei integer string when possible. If the caller
        // already provided a wei integer string, keep it as-is.
        let amountWeiStr: string;
        try {
          if (typeof bidData.amount === 'number') {
            amountWeiStr = ethers.parseEther(String(bidData.amount)).toString();
          } else if (typeof bidData.amount === 'string') {
            // If it contains a decimal point, treat as ETH decimal and parse to wei
            if (bidData.amount.indexOf('.') >= 0) {
              amountWeiStr = ethers.parseEther(bidData.amount).toString();
            } else {
              // assume it's already a wei integer string
              amountWeiStr = bidData.amount;
            }
          } else {
            amountWeiStr = String(bidData.amount);
          }
        } catch (amtErr) {
          // Fallback: fall back to plain string form if parseEther fails
          // eslint-disable-next-line no-console
          console.warn('Failed to canonicalize amount to wei, using raw value:', amtErr?.message || amtErr);
          amountWeiStr = String(bidData.amount);
        }
        const amountUsdCentsStr = String(Math.round(Number(bidData.amount_usd ?? 0) * 100));

        const messageValue = {
          auction_id: String(bidData.auction_id),
          bidder_address: String(bidData.bidder_address).toLowerCase(),
          amount: amountWeiStr,
          amount_usd: amountUsdCentsStr,
          encrypted: Boolean(bidData.encrypted),
          timestamp: String(bidData.timestamp),
        };

        // Build types payload including EIP712Domain to satisfy wallets that expect it
        const typesWithDomain = {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          ...types,
        };

        // Ensure chainId is a hex string for eth_signTypedData_v4 (some wallets expect hex)
        const domainForPayload = {
          ...domain,
          chainId: typeof domain.chainId === 'number' ? '0x' + domain.chainId.toString(16) : String(domain.chainId),
        };

        // Debug log to make mismatches visible during development
        try {
          // eslint-disable-next-line no-console
          console.log('EIP-712 payload (signBid):', { domain: domainForPayload, types: typesWithDomain, message: messageValue });
        } catch (e) {}

        // Use the provider RPC to perform a v4 typed-data signature so the wallet
        // receives the exact JSON we intend to sign. Different wallets/providers
        // expect slightly different input shapes, so try a small sequence of
        // increasingly permissive formats before falling back to ethers Signer.
        const eth = (globalThis as any).ethereum;
        if (eth) {
          const accounts = await eth.request({ method: 'eth_requestAccounts' }).catch(() => []);
          const from = accounts && accounts[0];
          const payloadObj = { domain: domainForPayload, types: typesWithDomain, primaryType: 'Bid', message: messageValue };

          const attempts: Array<{ params: any[]; desc: string } > = [
            // common: [from, JSON.stringify(payload)]
            { params: [from, JSON.stringify(payloadObj)], desc: 'from + JSON-stringified payload' },
            // some providers accept the object directly
            { params: [from, payloadObj], desc: 'from + object payload' },
            // alternate order (rare)
            { params: [JSON.stringify(payloadObj), from], desc: 'JSON-stringified payload + from' },
            { params: [payloadObj, from], desc: 'object payload + from' },
          ];

          for (const attempt of attempts) {
            try {
              // eslint-disable-next-line no-console
              console.debug('Trying eth_signTypedData_v4 with', attempt.desc);
              const sig = await eth.request({ method: 'eth_signTypedData_v4', params: attempt.params });
              if (sig) return sig as string;
            } catch (rpcErr:any) {
              // eslint-disable-next-line no-console
              console.debug('eth_signTypedData_v4 attempt failed:', attempt.desc, rpcErr?.message || rpcErr);
              // continue to next attempt
            }
          }

          // Try legacy/v3 forms if v4 failed
          try {
            const sigV3 = await eth.request({ method: 'eth_signTypedData', params: [from, JSON.stringify(payloadObj)] });
            if (sigV3) return sigV3 as string;
          } catch (v3err) {
            // ignore
          }
        }

        // Fallback: try using ethers provider signer signing helpers if available.
        try {
          const provider = new ethers.BrowserProvider((globalThis as any).ethereum);
          const signer = await provider.getSigner();

          // Prepare domain with numeric chainId for signer methods
          const domainForSigner = { ...domain, chainId: typeof domain.chainId === 'string' ? Number.parseInt(domain.chainId, 16) : domain.chainId };

          // Try multiple possible signer method names to support different ethers versions
          const signerAny: any = signer as any;
          if (typeof signerAny._signTypedData === 'function') {
            return await signerAny._signTypedData(domainForSigner, types, messageValue);
          }
          if (typeof signerAny.signTypedData === 'function') {
            return await signerAny.signTypedData(domainForSigner, types, messageValue);
          }
          if (typeof signerAny._signTypedDataHex === 'function') {
            return await signerAny._signTypedDataHex(domainForSigner, types, messageValue);
          }

          // Some environments expose a low-level provider with request/send methods
          const lowLevel = (provider as any).provider || (globalThis as any).ethereum;
          if (lowLevel && typeof lowLevel.request === 'function') {
            try {
              const accounts = await lowLevel.request({ method: 'eth_accounts' }).catch(() => []);
              const from = accounts && accounts[0];
              const payload = { domain: domainForPayload, types: typesWithDomain, primaryType: 'Bid', message: messageValue };
              const sig = await lowLevel.request({ method: 'eth_signTypedData_v4', params: [from, JSON.stringify(payload)] });
              if (sig) return sig as string;
            } catch (lowErr) {
              // ignore
            }
          }
        } catch (signerErr) {
          // if fallback also fails, let outer catch handle mock
          // eslint-disable-next-line no-console
          console.warn('Signer-based typed-data fallback failed:', signerErr?.message || signerErr);
        }
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

    // Normalise amount to a wei bigint for verification. Accept either an
    // ETH decimal (number or string with '.') or a wei integer string.
    let amountWeiBigInt: bigint;
    if (typeof bidData.amount === 'number') {
      amountWeiBigInt = ethers.parseEther(String(bidData.amount));
    } else if (typeof bidData.amount === 'string') {
      if (bidData.amount.indexOf('.') >= 0) {
        amountWeiBigInt = ethers.parseEther(bidData.amount);
      } else {
        // assume wei integer string
        amountWeiBigInt = BigInt(bidData.amount);
      }
    } else {
      amountWeiBigInt = BigInt(String(bidData.amount));
    }

    const value = {
      auction_id: BigInt(bidData.auction_id),
      bidder_address: bidData.bidder_address,
      amount: amountWeiBigInt,
      amount_usd: amountUsdCents,
      encrypted: bidData.encrypted,
      timestamp: BigInt(bidData.timestamp),
    };


    // Compute typed-data hash for logging/debugging using normalized numeric types.
    let typedHash: string | null = null;
    try {
      const domainForHash = {
        ...domain,
        chainId: typeof domain.chainId === 'string' && domain.chainId.startsWith('0x') ? Number.parseInt(domain.chainId, 16) : Number(domain.chainId),
      } as any;

      // Build a message object using BigInt for uint256 fields so hashing is stable
      const messageForHash = {
        auction_id: BigInt(bidData.auction_id),
        bidder_address: String(bidData.bidder_address).toLowerCase(),
        amount: amountWeiBigInt,
        amount_usd: amountUsdCents,
        encrypted: Boolean(bidData.encrypted),
        timestamp: BigInt(bidData.timestamp),
      };

      typedHash = _TypedDataEncoder.hash(domainForHash, types, messageForHash);
    } catch (hErr) {
      // If hashing fails, leave typedHash null but continue to attempt verification
      // eslint-disable-next-line no-console
      console.debug('Failed to compute typed-data hash for debug:', hErr?.message || hErr);
    }

    // Verify the signature
    const recoveredAddress = ethers.verifyTypedData(domain, types, value, signature);
    const matches = recoveredAddress.toLowerCase() === bidData.bidder_address.toLowerCase();
    if (!matches) {
      console.warn('Bid signature mismatch', {
        expected: bidData.bidder_address,
        recovered: recoveredAddress,
        value,
        typedDataHash: typedHash,
      });
    }
    return matches;
  } catch (err) {
    console.error('Error verifying bid signature:', err);
    return false;
  }
}
