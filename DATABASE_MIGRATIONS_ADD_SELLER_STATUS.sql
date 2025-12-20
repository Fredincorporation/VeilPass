-- Add seller_status column to users table
-- Used to track seller application approval status: PENDING, APPROVED, REJECTED
-- Run this migration in Supabase SQL editor or via psql

ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS seller_status VARCHAR(32) DEFAULT 'PENDING';

-- Index for fast filtering by seller status
CREATE INDEX IF NOT EXISTS idx_users_seller_status ON users(seller_status);

-- Notes:
-- Values: 'PENDING', 'APPROVED', 'REJECTED'
-- Default is 'PENDING' for new users or those who haven't applied to be sellers
-- UPDATE existing sellers to set appropriate status based on their role/history if needed
