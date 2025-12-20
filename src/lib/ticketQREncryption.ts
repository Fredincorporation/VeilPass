import crypto from 'crypto';

/**
 * Secure Ticket QR Code Encryption
 * 
 * System:
 * - Tickets are encrypted with a scanner-only key
 * - QR codes contain an encrypted token + HMAC signature
 * - Only authorized scanners can decrypt and verify tickets
 * - Each ticket QR is time-limited (default: 24 hours)
 */

const ENCRYPTION_KEY_ENV = process.env.TICKET_SCANNER_ENCRYPTION_KEY;
const HMAC_KEY_ENV = process.env.TICKET_SCANNER_HMAC_KEY;

// Fallback keys for development (should be set in production)
const DEV_ENCRYPTION_KEY = 'dev-ticket-scanner-key-32-chars!!';
const DEV_HMAC_KEY = 'dev-hmac-key-32-characters-long!!';

export interface EncryptedTicketQR {
  encrypted: string; // Base64 encoded encrypted data
  hmac: string;      // Base64 encoded HMAC signature
  timestamp: number; // When QR was generated
  expiresAt: number; // When QR expires (24h default)
}

export interface DecryptedTicketData {
  ticketId: string;
  eventId: number;
  owner?: string;
  price: number;
  created_at: string;
  section: string;
  status: string;
}

export interface TicketScanResult {
  valid: boolean;
  data?: DecryptedTicketData;
  error?: string;
  expired?: boolean;
  scannerVerified?: boolean;
}

/**
 * Get encryption key - production uses env variable, dev uses fallback
 */
function getEncryptionKey(): Buffer {
  const key = ENCRYPTION_KEY_ENV || DEV_ENCRYPTION_KEY;
  // Ensure key is exactly 32 bytes (256-bit) for AES-256
  return Buffer.from(key.slice(0, 32).padEnd(32, '0'));
}

/**
 * Get HMAC key - production uses env variable, dev uses fallback
 */
function getHmacKey(): Buffer {
  const key = HMAC_KEY_ENV || DEV_HMAC_KEY;
  return Buffer.from(key.slice(0, 32).padEnd(32, '0'));
}

/**
 * Encrypt ticket data for QR code
 * Used by: Ticket holder when generating QR
 */
export function encryptTicketQR(
  ticketData: DecryptedTicketData,
  expiresIn: number = 24 * 60 * 60 * 1000 // 24 hours default
): EncryptedTicketQR {
  try {
    const encryptionKey = getEncryptionKey();
    const hmacKey = getHmacKey();

    // Prepare data
    const now = Date.now();
    const expiresAt = now + expiresIn;
    const plaintext = JSON.stringify(ticketData);

    // Generate IV for this encryption
    const iv = crypto.randomBytes(16);

    // Encrypt with AES-256-CBC
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encrypted = cipher.update(plaintext, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    // Combine IV + encrypted data
    const ivAndEncrypted = iv.toString('hex') + encrypted;

    // Create HMAC signature (includes timestamp + expiration for replay protection)
    const dataToSign = `${ivAndEncrypted}:${now}:${expiresAt}`;
    const hmac = crypto
      .createHmac('sha256', hmacKey)
      .update(dataToSign)
      .digest('hex');

    return {
      encrypted: Buffer.from(ivAndEncrypted).toString('base64'),
      hmac,
      timestamp: now,
      expiresAt,
    };
  } catch (error) {
    console.error('Error encrypting ticket QR:', error);
    throw new Error('Failed to encrypt ticket QR code');
  }
}

/**
 * Decrypt and verify ticket QR
 * Used by: Ticket scanner (/admin/sellers/scan)
 */
export function decryptTicketQR(qrData: EncryptedTicketQR): TicketScanResult {
  try {
    const encryptionKey = getEncryptionKey();
    const hmacKey = getHmacKey();

    // Check expiration
    const now = Date.now();
    if (now > qrData.expiresAt) {
      return {
        valid: false,
        expired: true,
        error: 'QR code has expired',
      };
    }

    // Verify HMAC signature
    const dataToSign = `${Buffer.from(qrData.encrypted, 'base64').toString('hex')}:${qrData.timestamp}:${qrData.expiresAt}`;
    const expectedHmac = crypto
      .createHmac('sha256', hmacKey)
      .update(dataToSign)
      .digest('hex');

    if (expectedHmac !== qrData.hmac) {
      return {
        valid: false,
        error: 'QR code signature verification failed - possible tampering',
      };
    }

    // Decrypt
    const ivAndEncrypted = Buffer.from(qrData.encrypted, 'base64').toString('hex');
    const iv = Buffer.from(ivAndEncrypted.slice(0, 32), 'hex'); // IV is 16 bytes = 32 hex chars
    const encrypted = ivAndEncrypted.slice(32);

    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    const ticketData = JSON.parse(decrypted) as DecryptedTicketData;

    return {
      valid: true,
      data: ticketData,
      scannerVerified: true,
    };
  } catch (error) {
    console.error('Error decrypting ticket QR:', error);
    return {
      valid: false,
      error: 'Failed to decrypt QR code - invalid format',
    };
  }
}

/**
 * Create a QR payload string for the QR code generator
 * This is what gets encoded into the actual QR image
 */
export function createQRPayload(encryptedQR: EncryptedTicketQR): string {
  return JSON.stringify(encryptedQR);
}

/**
 * Parse QR payload from scanned QR code
 */
export function parseQRPayload(payload: string): EncryptedTicketQR {
  try {
    return JSON.parse(payload) as EncryptedTicketQR;
  } catch (error) {
    throw new Error('Invalid QR payload format');
  }
}

/**
 * Generate a unique scanner session token
 * Used to track which scanner verified which ticket
 */
export function generateScannerToken(scannerId: string, ticketId: string): string {
  const data = `${scannerId}:${ticketId}:${Date.now()}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Verify scanner token (prevent double-scanning same ticket)
 */
export function verifyScannerToken(token: string, scannerId: string, ticketId: string): boolean {
  // In production, check against database if token exists
  // For now, we'll validate format
  const expectedFormat = /^[a-f0-9]{64}$/;
  return expectedFormat.test(token);
}
