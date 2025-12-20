-- ID Blacklist Table
-- Stores deterministic hashes of fraudulent IDs for fast lookups
-- Does NOT store raw ID data - only hashes
CREATE TABLE IF NOT EXISTS id_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_hash VARCHAR(64) NOT NULL UNIQUE,
  reason VARCHAR(50) NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by_admin VARCHAR(255) NOT NULL,
  notes TEXT,
  CHECK (reason IN ('fraud', 'duplicate', 'invalid', 'reported', 'other'))
);

CREATE INDEX idx_id_blacklist_hash ON id_blacklist(id_hash);
CREATE INDEX idx_id_blacklist_reason ON id_blacklist(reason);

-- Verification Log Table
-- Records verification attempts and results (for compliance/audit)
CREATE TABLE IF NOT EXISTS id_verification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(255) NOT NULL,
  deterministic_hash VARCHAR(64) NOT NULL,
  verification_result JSONB NOT NULL,
  verified BOOLEAN NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_verification_log_wallet ON id_verification_log(wallet_address);
CREATE INDEX idx_verification_log_hash ON id_verification_log(deterministic_hash);
CREATE INDEX idx_verification_log_verified ON id_verification_log(verified);

-- Homomorphic Verification Results Table
-- Stores encrypted metadata for later auditing without decryption
CREATE TABLE IF NOT EXISTS homomorphic_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(255) NOT NULL UNIQUE,
  age_verified_encrypted BYTEA,
  expiration_verified_encrypted BYTEA,
  format_verified BOOLEAN,
  blacklist_verified BOOLEAN,
  verification_score NUMERIC(3, 1),
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_homomorphic_wallet ON homomorphic_verification(wallet_address);
CREATE INDEX idx_homomorphic_verified ON homomorphic_verification(format_verified, blacklist_verified);
