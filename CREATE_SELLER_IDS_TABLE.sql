-- Create seller_ids table for identity verification records
CREATE TABLE IF NOT EXISTS seller_ids (
  id BIGSERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  business_type VARCHAR(255),
  id_type VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'VERIFIED', 'REJECTED')),
  verification_score INTEGER,
  encrypted_id TEXT,
  location VARCHAR(255),
  age INTEGER,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_seller_ids_wallet ON seller_ids(wallet_address);
CREATE INDEX IF NOT EXISTS idx_seller_ids_status ON seller_ids(status);
CREATE INDEX IF NOT EXISTS idx_seller_ids_created_at ON seller_ids(created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_seller_ids_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS seller_ids_updated_at_trigger ON seller_ids;
CREATE TRIGGER seller_ids_updated_at_trigger
BEFORE UPDATE ON seller_ids
FOR EACH ROW
EXECUTE FUNCTION update_seller_ids_updated_at();
