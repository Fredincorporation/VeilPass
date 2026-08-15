-- Original: DATABASE_MIGRATIONS_ADD_SELLER_STATUS.sql
-- Add seller_status column to users table

ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS seller_status VARCHAR(32) DEFAULT 'PENDING';

CREATE INDEX IF NOT EXISTS idx_users_seller_status ON users(seller_status);
