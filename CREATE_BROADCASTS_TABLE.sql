-- Create broadcasts table to track all broadcast messages sent
CREATE TABLE IF NOT EXISTS broadcasts (
  id BIGSERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('customer', 'seller', 'all')),
  recipient_count INTEGER DEFAULT 0,
  created_by VARCHAR(42), -- Admin wallet address
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_broadcasts_created_at ON broadcasts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_broadcasts_user_type ON broadcasts(user_type);

-- Add triggers to auto-update updated_at
CREATE OR REPLACE FUNCTION update_broadcasts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS broadcasts_updated_at_trigger ON broadcasts;
CREATE TRIGGER broadcasts_updated_at_trigger
BEFORE UPDATE ON broadcasts
FOR EACH ROW
EXECUTE FUNCTION update_broadcasts_updated_at();
