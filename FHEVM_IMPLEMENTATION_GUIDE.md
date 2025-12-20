# Privacy-First fhEVM ID Verification System

## Overview

This document describes the advanced privacy-first ID verification system implementing:
1. **Real fhEVM Concepts** - Homomorphic encryption framework
2. **Blacklist Checking** - Deterministic hash-based fraud detection
3. **Document Format Validation** - OCR-ready heuristics
4. **KMS/HSM Key Management** - Production-grade key storage

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
├─────────────────────────────────────────────────────┤
│ 1. User uploads ID file + DOB + Expiration date     │
│ 2. Validate ID format (before encryption)            │
│ 3. Fetch server public key (/api/crypto/public-key)│
│ 4. Encrypt with RSA-OAEP (SHA-256)                  │
│ 5. POST to /api/seller-ids                          │
│    { wallet_address, encrypted_id, ...}            │
└──────────────┬──────────────────────────────────────┘
               │ (encrypted payload only)
               ▼
┌─────────────────────────────────────────────────────┐
│                  SERVER (Node.js)                    │
├─────────────────────────────────────────────────────┤
│ 1. Receive encrypted payload                        │
│ 2. Store encrypted_id (no raw data persisted)       │
│ 3. Decrypt in-memory (ephemeral)                    │
│ 4. Extract deterministic hash                       │
│ 5. Check blacklist (fast hash lookup)               │
│ 6. Validate format, DOB, expiration                 │
│ 7. Compute verification score                       │
│ 8. Log verification (encrypted metadata)            │
│ 9. Return: {verified, reasons, score, ...}         │
│ 10. Encrypted payload purged from memory            │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│          DATABASE (Supabase PostgreSQL)              │
├─────────────────────────────────────────────────────┤
│ seller_ids:                                         │
│   - encrypted_id (base64 RSA ciphertext)           │
│   - name, email, business_type                     │
│                                                    │
│ id_blacklist:                                       │
│   - id_hash (SHA-256, deterministic)                │
│   - reason, added_by_admin, notes                  │
│                                                    │
│ id_verification_log:                                │
│   - wallet_address, deterministic_hash            │
│   - verification_result (JSON)                     │
│   - verified, verified_at                          │
└─────────────────────────────────────────────────────┘
```

## Key Features

### 1. Homomorphic Encryption Concepts

**Client-Side:**
- Fetch server public key from `/api/crypto/public-key`
- Encrypt ID file + metadata using RSA-OAEP (SHA-256)
- Payload structure:
  ```json
  {
    "raw": "base64-encoded-id-file",
    "claimedDob": "YYYY-MM-DD",
    "claimedExpiresAt": "YYYY-MM-DD"
  }
  ```
- POST encrypted data (base64) to `/api/seller-ids`

**Server-Side:**
- Decrypt only in-memory (ephemeral)
- Perform verification checks without storing raw data
- Generate deterministic hash for blacklist lookup
- Validate format, age, expiration
- Return verification result

**Future Integration:**
- Replace RSA with @zama/tfhe-js for true homomorphic encryption
- Use Zama's FheVm contract for on-chain verification
- Perform encrypted comparisons without decryption

### 2. Deterministic Blacklist

**How It Works:**
- Compute SHA-256 hash of ID data with salt (before encryption)
- Hash is deterministic: same ID always produces same hash
- No reverse engineering possible (cryptographically one-way)
- Blacklist stores only hashes, never raw IDs

**Usage:**
- Admin adds fraudulent ID hashes to `/api/blacklist`
- Server checks deterministic hash against blacklist (fast)
- No decryption needed for blacklist lookup
- Fail-safe: if blacklist check fails, allow verification to proceed

**Tables:**
```sql
CREATE TABLE id_blacklist (
  id UUID PRIMARY KEY,
  id_hash VARCHAR(64) NOT NULL UNIQUE,  -- SHA-256 hash
  reason VARCHAR(50),                   -- fraud|duplicate|invalid|reported|other
  added_by_admin VARCHAR(255),
  notes TEXT,
  added_at TIMESTAMP
);
```

### 3. Document Format Validation

**Client-Side (Pre-Encryption):**
- Analyze ID file before encryption
- Detect document type: passport, driver's license, national ID, other
- Look for format markers:
  - Passport: MRZ (Machine-Readable Zone) signature
  - Driver's License: License-specific patterns
- Check for date patterns (expiration)
- Return metadata to be included in encrypted payload

**Server-Side (Post-Decryption):**
- Extract format flags from encrypted metadata
- Verify consistency of claimed format
- Future: OCR integration for detailed validation

**OCR Integration Ready:**
- Payload structure supports binary image data
- Easy to add OCR library (Tesseract, etc.)
- Validate text extraction matches expected format

### 4. KMS/HSM Key Management

**Supported Backends:**

| Backend | Environment | Security | Production |
|---------|-------------|----------|------------|
| Local | Development | Low | ❌ |
| AWS KMS | AWS | High | ✅ |
| HashiCorp Vault | Any | High | ✅ |
| Azure Key Vault | Azure | High | ✅ |
| PKCS#11 HSM | Any | Highest | ✅ |

**Configuration:**

```bash
# Local (default for dev)
KMS_BACKEND=local
KMS_LOCAL_PATH=.keys

# AWS KMS (production)
KMS_BACKEND=aws-kms
AWS_REGION=us-east-1
AWS_KMS_KEY_ID=arn:aws:kms:...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# HashiCorp Vault
KMS_BACKEND=vault
VAULT_ADDR=https://vault.example.com
VAULT_TOKEN=s.xxxxxxxxxxxxxxx

# HSM (PKCS#11)
KMS_BACKEND=hsm-pkcs11
HSM_SLOT=0
HSM_PIN=1234
```

**Usage:**
```typescript
import { getKeyManager } from '@/lib/kmsManager';

const keyManager = getKeyManager();
const pubKey = keyManager.getPublicKeyPEM();
const plaintext = keyManager.decryptBase64(ciphertext);
```

## API Endpoints

### 1. Public Key Endpoint

**GET /api/crypto/public-key**
```json
{
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
}
```

### 2. Seller ID Submission

**POST /api/seller-ids**
```json
{
  "wallet_address": "0x...",
  "encrypted_id": "base64-ciphertext",
  "name": "Business Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": { "id": 1, "wallet_address": "0x...", ... },
  "verification": {
    "verified": true,
    "reasons": [],
    "scores": {
      "age": 30,
      "expiration": 30,
      "format": 20,
      "blacklist": 20
    },
    "verificationScore": 100,
    "deterministicHash": "sha256...",
    "format": "passport"
  }
}
```

### 3. Blacklist Management

**GET /api/blacklist**
```bash
curl http://localhost:3000/api/blacklist?reason=fraud&limit=100
```

**POST /api/blacklist** (admin)
```json
{
  "idHash": "sha256...",
  "reason": "fraud|duplicate|invalid|reported|other",
  "notes": "Optional notes"
}
```

**DELETE /api/blacklist/{hash}** (admin)

### 4. Admin ID Review

**GET /api/admin/seller-ids**
```json
{
  "id": "uuid",
  "name": "Business Name",
  "walletAddress": "0x...",
  "encryptedID": "[PRESENT]",
  "verification": {
    "verified": true,
    "score": 100,
    "reasons": [],
    "format": "passport",
    "blacklisted": false
  }
}
```

## Verification Score Breakdown

- **Age Check** (30 pts): DOB is valid and applicant is ≥18
- **Expiration Check** (30 pts): ID not expired
- **Format Validation** (20 pts): Document format recognized
- **Blacklist Check** (20 pts): ID hash not in fraud blacklist
- **Total: 100 pts**

Scoring:
- 100: Fully verified
- 70-99: Minor issues (review recommended)
- 0-69: Failed verification (manual review required)
- 0: Blacklisted (automatic rejection)

## Compliance & Privacy

✅ **No raw ID stored on server**
✅ **Deterministic hashes enable audit trails**
✅ **In-memory decryption (ephemeral)**
✅ **GDPR-compliant (no PII persistence)**
✅ **Blacklist without raw data access**
✅ **KMS/HSM for key protection**

## Testing

### Manual Test (curl)

1. Generate test payload:
```bash
ENC_B64=$(base64 -w0 /tmp/id_enc.bin)
curl -X POST http://localhost:3000/api/seller-ids \
  -H "Content-Type: application/json" \
  -d '{"wallet_address":"0x...","encrypted_id":"'$ENC_B64'"}'
```

2. View admin list:
```bash
curl http://localhost:3000/api/admin/seller-ids | jq '.'
```

3. Check blacklist:
```bash
curl http://localhost:3000/api/blacklist
```

## Future Enhancements

1. **Full TFHE Integration** - @zama/tfhe-js for browser, FheVm contracts
2. **Multi-Signature Verification** - Multiple admins approve IDs
3. **Zero-Knowledge Proofs** - Prove age/validity without revealing data
4. **IPFS Storage** - Distributed encrypted ID archive
5. **Smart Contract Verification** - On-chain age/validity checks
6. **Mobile App Support** - Native iOS/Android encryption
7. **Biometric Verification** - Face recognition on encrypted data
8. **Liveness Detection** - Prevent spoofing with video verification

## References

- [Zama - Homomorphic Encryption](https://www.zama.ai/)
- [fhEVM - Encrypted Smart Contracts](https://docs.zama.ai/fhevm)
- [GDPR Data Protection](https://gdpr-info.eu/)
- [NIST Cryptography Standards](https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines/)
