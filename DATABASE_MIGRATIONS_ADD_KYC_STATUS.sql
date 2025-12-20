-- Add kyc_status column to users table
-- Run this migration in Supabase SQL editor or via psql

ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(32) DEFAULT 'PENDING';

-- Optional: set existing users who have role 'seller' or 'awaiting_seller' to PENDING/NOT_VERIFIED as desired
-- UPDATE users SET kyc_status = 'PENDING' WHERE kyc_status IS NULL;

-- Index for fast filtering by KYC status
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);

-- Grant execute/select if needed is handled by Supabase role policies

-- Notes:
-- Values expected by application: 'VERIFIED', 'REJECTED', 'PENDING', 'NOT_VERIFIED'
-- If you prefer a CHECK constraint or ENUM, replace the column type accordingly.
