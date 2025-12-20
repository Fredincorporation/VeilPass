import { Contract, isAddress } from 'ethers';
import { CONTRACT_ADDRESSES } from './constants';

/**
 * ABI for GovernmentIDVerification contract
 * Includes only the functions needed for frontend interaction
 */
const GOVERNMENT_ID_VERIFICATION_ABI = [
  // submitID function
  {
    inputs: [{ internalType: 'bytes', name: '_encryptedIDHash', type: 'bytes' }],
    name: 'submitID',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // getSellerRecord function
  {
    inputs: [{ internalType: 'address', name: '_seller', type: 'address' }],
    name: 'getSellerRecord',
    outputs: [
      { internalType: 'address', name: 'seller', type: 'address' },
      { internalType: 'bytes', name: 'encryptedIDHash', type: 'bytes' },
      { internalType: 'uint256', name: 'verificationScore', type: 'uint256' },
      { internalType: 'uint8', name: 'status', type: 'uint8' },
      { internalType: 'string', name: 'rejectionReason', type: 'string' },
      { internalType: 'uint256', name: 'submittedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'verifiedAt', type: 'uint256' },
      { internalType: 'bool', name: 'authenticityChecked', type: 'bool' },
      { internalType: 'bool', name: 'ageVerified', type: 'bool' },
      { internalType: 'bool', name: 'notBlacklisted', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // getVerificationStatus function
  {
    inputs: [{ internalType: 'address', name: '_seller', type: 'address' }],
    name: 'getVerificationStatus',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  // isSellerVerified function
  {
    inputs: [{ internalType: 'address', name: '_seller', type: 'address' }],
    name: 'isSellerVerified',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // getVerificationScore function
  {
    inputs: [{ internalType: 'address', name: '_seller', type: 'address' }],
    name: 'getVerificationScore',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // getVerifiedSellersCount function
  {
    inputs: [],
    name: 'getVerifiedSellersCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const STATUS_MAP: { [key: number]: string } = {
  0: 'PENDING',
  1: 'PROCESSING',
  2: 'VERIFIED',
  3: 'REJECTED',
};

/**
 * Encrypt ID data using SHA-256 hashing
 * In production, this would use @zama/tfhe-js for homomorphic encryption
 * 
 * @param idData Plain text ID data to encrypt
 * @returns Encrypted hash as hex string
 */
export async function encryptIDDataWithZama(idData: string): Promise<string> {
  try {
    // New behavior: fetch server public key and perform RSA-OAEP encryption
    // Client will send a base64-encoded encrypted blob to the server
    const res = await fetch('/api/crypto/public-key');
    if (!res.ok) throw new Error('Failed to fetch public key');
    const json = await res.json();
    const pubPem: string = json.publicKey;

    // Convert PEM to ArrayBuffer SPKI
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    const pemContents = pubPem.substring(pubPem.indexOf(pemHeader) + pemHeader.length, pubPem.indexOf(pemFooter)).replace(/\s+/g, '');
    const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0)).buffer;

    const publicKey = await crypto.subtle.importKey(
      'spki',
      binaryDer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt']
    );

    // Prepare payload: we wrap the raw idData in a JSON object so server can parse
    const payload = JSON.stringify({ raw: idData });
    const enc = new TextEncoder().encode(payload);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      enc
    );

    // Return base64 encoded encrypted blob
    const b64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    return b64;
  } catch (error) {
    console.error('Error encrypting ID data with server key:', error);
    throw new Error('Failed to encrypt ID data');
  }
}

/**
 * Submit encrypted seller ID to smart contract
 * 
 * @param signer Ethers.js signer (user's wallet)
 * @param encryptedIDHash Encrypted ID hash from encryptIDDataWithZama
 * @returns Transaction hash
 */
export async function submitSellerID(
  signer: any,
  encryptedIDHash: string
): Promise<string> {
  try {
    if (!CONTRACT_ADDRESSES.governmentIDVerification || 
        CONTRACT_ADDRESSES.governmentIDVerification === '0x0000000000000000000000000000000000000000') {
      throw new Error('GovernmentIDVerification contract not deployed. Deploy contracts first.');
    }

    const contract = new Contract(
      CONTRACT_ADDRESSES.governmentIDVerification,
      GOVERNMENT_ID_VERIFICATION_ABI,
      signer
    );

    // Convert hex string to bytes
    function hexToBytes(hex: string) {
      const clean = hex.replace(/^0x/, '');
      const bytes = new Uint8Array(clean.length / 2);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
      }
      return bytes;
    }

    const encryptedBytes = hexToBytes(encryptedIDHash);
    
    const tx = await contract.submitID(encryptedBytes);
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error('Transaction failed - no receipt returned');
    }
    
    return receipt.hash;
  } catch (error: any) {
    console.error('Error submitting ID to contract:', error);
    throw new Error(`Failed to submit ID: ${error.message}`);
  }
}

/**
 * Fetch seller verification record from smart contract
 * 
 * @param provider Ethers.js provider or signer
 * @param sellerAddress Seller's wallet address
 * @returns Seller verification record
 */
export async function getSellerVerificationRecord(
  provider: any,
  sellerAddress: string
) {
  try {
    if (!CONTRACT_ADDRESSES.governmentIDVerification || 
        CONTRACT_ADDRESSES.governmentIDVerification === '0x0000000000000000000000000000000000000000') {
      throw new Error('GovernmentIDVerification contract not deployed');
    }

    // Validate seller address
    if (!isAddress(sellerAddress)) {
      throw new Error('Invalid seller address');
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.governmentIDVerification,
      GOVERNMENT_ID_VERIFICATION_ABI,
      provider
    );

    const record = await contract.getSellerRecord(sellerAddress);
    
    // Handle case where no record exists
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    if (record.seller === ZERO_ADDRESS) {
      return null;
    }

    return {
      seller: record.seller,
      encryptedIDHash: record.encryptedIDHash,
      verificationScore: parseInt(record.verificationScore.toString(), 10),
      status: STATUS_MAP[parseInt(record.status.toString(), 10)] || 'UNKNOWN',
      rejectionReason: record.rejectionReason,
      submittedAt: new Date(parseInt(record.submittedAt.toString(), 10) * 1000),
      verifiedAt: parseInt(record.verifiedAt.toString(), 10) > 0 
        ? new Date(parseInt(record.verifiedAt.toString(), 10) * 1000)
        : null,
      authenticityChecked: record.authenticityChecked,
      ageVerified: record.ageVerified,
      notBlacklisted: record.notBlacklisted,
    };
  } catch (error: any) {
    console.error('Error fetching seller record:', error);
    throw new Error(`Failed to fetch verification record: ${error.message}`);
  }
}

/**
 * Check if seller is verified on-chain
 * 
 * @param provider Ethers.js provider
 * @param sellerAddress Seller's wallet address
 * @returns true if seller is verified (score >= 70)
 */
export async function checkSellerVerified(
  provider: any,
  sellerAddress: string
): Promise<boolean> {
  try {
    if (!isAddress(sellerAddress)) {
      return false;
    }

    if (!CONTRACT_ADDRESSES.governmentIDVerification || 
        CONTRACT_ADDRESSES.governmentIDVerification === '0x0000000000000000000000000000000000000000') {
      return false;
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.governmentIDVerification,
      GOVERNMENT_ID_VERIFICATION_ABI,
      provider
    );

    return await contract.isSellerVerified(sellerAddress);
  } catch (error) {
    console.error('Error checking seller verification:', error);
    return false;
  }
}

/**
 * Get verification score from smart contract
 * 
 * @param provider Ethers.js provider
 * @param sellerAddress Seller's wallet address
 * @returns Verification score (0-100)
 */
export async function getVerificationScore(
  provider: any,
  sellerAddress: string
): Promise<number> {
  try {
    if (!isAddress(sellerAddress)) {
      return 0;
    }

    if (!CONTRACT_ADDRESSES.governmentIDVerification || 
        CONTRACT_ADDRESSES.governmentIDVerification === '0x0000000000000000000000000000000000000000') {
      return 0;
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.governmentIDVerification,
      GOVERNMENT_ID_VERIFICATION_ABI,
      provider
    );

    const score = await contract.getVerificationScore(sellerAddress);
    return parseInt(score.toString(), 10);
  } catch (error) {
    console.error('Error fetching verification score:', error);
    return 0;
  }
}

/**
 * Get total number of verified sellers on-chain
 * 
 * @param provider Ethers.js provider
 * @returns Number of verified sellers
 */
export async function getVerifiedSellersCount(
  provider: any
): Promise<number> {
  try {
    if (!CONTRACT_ADDRESSES.governmentIDVerification || 
        CONTRACT_ADDRESSES.governmentIDVerification === '0x0000000000000000000000000000000000000000') {
      return 0;
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.governmentIDVerification,
      GOVERNMENT_ID_VERIFICATION_ABI,
      provider
    );

    const count = await contract.getVerifiedSellersCount();
    return parseInt(count.toString(), 10);
  } catch (error) {
    console.error('Error fetching verified sellers count:', error);
    return 0;
  }
}

/**
 * Convert verification status number to string
 */
export function getStatusString(statusNum: number): string {
  return STATUS_MAP[statusNum] || 'UNKNOWN';
}

/**
 * Check if address is valid Ethereum address
 */
export function isValidEthereumAddress(address: string): boolean {
  return isAddress(address);
}

/**
 * Format verification data for display
 */
export function formatVerificationData(record: any) {
  return {
    ...record,
    verificationScorePercentage: `${record.verificationScore}%`,
    submittedAtFormatted: record.submittedAt?.toLocaleDateString(),
    verifiedAtFormatted: record.verifiedAt?.toLocaleDateString(),
    isVerified: record.status === 'VERIFIED' && record.verificationScore >= 70,
  };
}
