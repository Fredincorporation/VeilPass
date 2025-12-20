import { z } from 'zod';
import { isAddress, getAddress } from 'ethers';
import { v4 as uuidv4, validate as validateUUID } from 'uuid';

/**
 * VeilPass Security & Validation Helpers
 * 
 * Centralized validation schemas and utilities for all API routes.
 * Prevents injection attacks, malformed data, and type confusion.
 */

// ============================================================================
// UUID Validation
// ============================================================================

export const UUIDSchema = z
  .string()
  .uuid('Invalid UUID format')
  .refine((val) => validateUUID(val), 'Invalid UUID');

// ============================================================================
// Ethereum Address Validation
// ============================================================================

export const AddressSchema = z
  .string()
  .refine((val) => isAddress(val), 'Invalid Ethereum address')
  .transform((val) => getAddress(val)); // Convert to checksummed format

// ============================================================================
// Amount Validation (uint256-safe bigint)
// ============================================================================

export const AmountSchema = z
  .string()
  .regex(/^\d+$/, 'Amount must be a non-negative integer')
  .refine((val) => {
    try {
      const amount = BigInt(val);
      return amount >= BigInt(0) && amount <= (BigInt(2) ** BigInt(256) - BigInt(1));
    } catch {
      return false;
    }
  }, 'Amount out of uint256 range')
  .transform((val) => BigInt(val));

// ============================================================================
// Payment Fallback Endpoint Schemas
// ============================================================================

export const ConfirmPaymentSchema = z.object({
  auctionResultId: UUIDSchema,
  paymentTxHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash').optional(),
  paymentMethod: z.enum(['ethereum', 'stripe', 'paypal']).optional(),
});

export const InitiateFallbackSchema = z.object({
  auctionId: UUIDSchema.optional(),
  maxFallbackAttempts: z.number().int().min(1).max(10).default(3),
});

export const FallbackResponseSchema = z.object({
  fallbackLogId: UUIDSchema,
  auctionResultId: UUIDSchema,
  response: z.enum(['accept', 'reject']),
  bidderAddress: AddressSchema,
  bidAmount: AmountSchema.optional(),
});

// ============================================================================
// Auction Endpoint Schemas
// ============================================================================

export const CreateAuctionSchema = z.object({
  eventId: UUIDSchema,
  ticketId: UUIDSchema,
  basePrice: AmountSchema,
  reservePrice: AmountSchema.optional(),
  duration: z.number().int().min(300).max(86400), // 5 min to 24 hours
});

export const PlaceBidSchema = z.object({
  auctionId: UUIDSchema,
  bidAmount: AmountSchema,
  bidderAddress: AddressSchema,
  encryptedBidData: z.string().optional(), // fhEVM encrypted bid
});

// ============================================================================
// Seller/Admin Endpoint Schemas
// ============================================================================

export const ApproveSellerSchema = z.object({
  sellerId: UUIDSchema,
  status: z.enum(['APPROVED', 'REJECTED']),
  kycStatus: z.enum(['VERIFIED', 'PENDING', 'REJECTED']).optional(),
  reason: z.string().max(500).optional(),
});

export const SellerFilterSchema = z.object({
  status: z.enum(['APPROVED', 'PENDING', 'REJECTED']).optional(),
  role: z.enum(['seller', 'awaiting_seller', 'organizer']).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// ============================================================================
// ID Verification Endpoint Schemas
// ============================================================================

export const SubmitIDSchema = z.object({
  sellerAddress: AddressSchema,
  encryptedIDHash: z.string().min(1).max(10000), // Base64 or hex encoded
  documentType: z.enum(['passport', 'driver_license', 'national_id']),
  expirationDate: z.string().datetime().optional(),
});

export const VerifyIDSchema = z.object({
  sellerAddress: AddressSchema,
  verificationScore: z.number().int().min(0).max(100),
  authenticityChecked: z.boolean(),
  ageVerified: z.boolean(),
  notBlacklisted: z.boolean(),
  notes: z.string().max(1000).optional(),
});

// ============================================================================
// Dispute Endpoint Schemas
// ============================================================================

export const CreateDisputeSchema = z.object({
  ticketId: UUIDSchema,
  buyerAddress: AddressSchema,
  sellerAddress: AddressSchema,
  reason: z.string().min(10).max(1000),
  attachmentUrl: z.string().url().optional(),
});

export const ResolveDisputeSchema = z.object({
  disputeId: UUIDSchema,
  resolution: z.enum(['RESOLVED', 'REJECTED', 'PENDING']),
  notes: z.string().max(1000).optional(),
  awardedTo: z.enum(['buyer', 'seller', 'split']).optional(),
});

// ============================================================================
// Notification Schemas
// ============================================================================

export const SendNotificationSchema = z.object({
  recipientAddress: AddressSchema.optional(),
  recipientEmail: z.string().email().optional(),
  type: z.enum(['payment_reminder', 'auction_won', 'dispute_resolved', 'fallback_offer']),
  data: z.record(z.any()).optional(),
}).refine(
  (obj) => obj.recipientAddress || obj.recipientEmail,
  'Either recipientAddress or recipientEmail is required'
);

// ============================================================================
// Validation Helper Function
// ============================================================================

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { valid: boolean; data?: T; error?: string } {
  try {
    const validatedData = schema.parse(data);
    return { valid: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('; ');
      return { valid: false, error: errorMessage };
    }
    return { valid: false, error: 'Validation failed' };
  }
}

// ============================================================================
// Sanitization Helpers
// ============================================================================

export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove HTML-like tags
    .trim();
}

export function sanitizeURL(input: string): string {
  try {
    const url = new URL(input);
    // Only allow https
    if (url.protocol !== 'https:') {
      throw new Error('Only HTTPS URLs allowed');
    }
    return url.toString();
  } catch {
    throw new Error('Invalid URL');
  }
}

// ============================================================================
// Rate Limiting Helper
// ============================================================================

// In-memory store for rate limiting (consider Redis for production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count < maxRequests) {
    record.count++;
    return true;
  }

  return false;
}

// ============================================================================
// Timestamp Validation
// ============================================================================

export function validateFutureTimestamp(timestamp: string): boolean {
  try {
    const date = new Date(timestamp);
    return date.getTime() > Date.now();
  } catch {
    return false;
  }
}

export function validateTimestampRange(timestamp: string, minMinutesInFuture: number = 5, maxMinutesInFuture: number = 1440): boolean {
  try {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = date.getTime() - now;
    const minMs = minMinutesInFuture * 60 * 1000;
    const maxMs = maxMinutesInFuture * 60 * 1000;
    return diff >= minMs && diff <= maxMs;
  } catch {
    return false;
  }
}

// ============================================================================
// CSRF Token Generation & Validation
// ============================================================================

export function generateCSRFToken(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length === 64;
}

export default {
  schemas: {
    ConfirmPaymentSchema,
    InitiateFallbackSchema,
    FallbackResponseSchema,
    CreateAuctionSchema,
    PlaceBidSchema,
    ApproveSellerSchema,
    SellerFilterSchema,
    SubmitIDSchema,
    VerifyIDSchema,
    CreateDisputeSchema,
    ResolveDisputeSchema,
    SendNotificationSchema,
  },
  helpers: {
    validateInput,
    sanitizeString,
    sanitizeURL,
    checkRateLimit,
    validateFutureTimestamp,
    validateTimestampRange,
    generateCSRFToken,
    validateCSRFToken,
  },
};
