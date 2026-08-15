-- Original: DATABASE_MIGRATIONS.sql
-- Consolidated database schema updates

-- Add new columns to events table if they don't exist
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tickets_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE events 
ALTER COLUMN capacity TYPE INTEGER USING CASE 
  WHEN capacity IS NULL OR capacity = '' THEN 0 
  ELSE CAST(REGEXP_REPLACE(capacity, '[^0-9]', '', 'g') AS INTEGER)
END;

-- Disputes & messages
DROP TABLE IF EXISTS disputes CASCADE;

CREATE TABLE IF NOT EXISTS disputes (
  id BIGSERIAL PRIMARY KEY,
  ticket_id UUID NOT NULL,
  user_address VARCHAR(42) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'OPEN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dispute_messages (
  id BIGSERIAL PRIMARY KEY,
  dispute_id BIGINT NOT NULL,
  sender_address VARCHAR(42) NOT NULL,
  sender_role VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50),
  is_status_change BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_dispute_messages FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE
);

-- Additional tables are included in separate migrations (ticket_tiers, notifications, etc.)
