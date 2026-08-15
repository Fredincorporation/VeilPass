-- Original: DATABASE_MIGRATIONS_ADD_KYC_STATUS.sql
-- Add kyc_status column to users table

ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(32) DEFAULT 'PENDING';

CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
