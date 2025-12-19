-- ============================================================================
-- VeilPass Database Schema Updates
-- ============================================================================
-- Run these queries in your Supabase SQL editor to set up ticket/bid tracking
-- ============================================================================

-- 1. Add new columns to events table if they don't exist
-- First, alter capacity column if it exists as text
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tickets_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Convert capacity from text to integer if needed
ALTER TABLE events 
ALTER COLUMN capacity TYPE INTEGER USING CASE 
  WHEN capacity IS NULL OR capacity = '' THEN 0 
  ELSE CAST(REGEXP_REPLACE(capacity, '[^0-9]', '', 'g') AS INTEGER)
END;

-- 2. Tables already exist with their own schema

-- 3. Update existing events with sample capacity if not set
UPDATE events SET capacity = 5000 WHERE capacity = 0 OR capacity IS NULL;

-- 4. Initialize tickets_sold count to 0
UPDATE events SET tickets_sold = 0;

-- 8. Verify the setup - run this to check everything is correct:
-- SELECT 'events' as table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'events' 
-- UNION ALL
-- SELECT 'tickets', column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'tickets'
-- UNION ALL
-- SELECT 'bids', column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'bids'
-- ORDER BY table_name, ordinal_position;

-- ============================================================================
-- Disputes Table for Ticket/Event Disputes
-- ============================================================================

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
  -- No foreign key constraint - tickets can be deleted/transferred
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_disputes_user_address ON disputes(user_address);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_ticket_id ON disputes(ticket_id);

-- ============================================================================
-- Dispute Messages Table for Message Center Communication
-- ============================================================================

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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_dispute_messages_dispute_id ON dispute_messages(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_messages_created_at ON dispute_messages(created_at DESC);

-- ============================================================================
-- User Profile & Preferences Extensions
-- ============================================================================

-- 1. Extend users table with seller/preference fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS business_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(10) DEFAULT 'auto',
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(5) DEFAULT 'en';

-- 2. Create user_preferences table for notification & general preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id BIGSERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL UNIQUE,
  event_reminders BOOLEAN DEFAULT true,
  promotions BOOLEAN DEFAULT true,
  reviews BOOLEAN DEFAULT true,
  auctions BOOLEAN DEFAULT true,
  disputes BOOLEAN DEFAULT true,
  newsletter BOOLEAN DEFAULT false,
  news_and_updates BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_preferences FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_wallet ON user_preferences(wallet_address);

-- 3. Create platform_settings table for admin configuration
CREATE TABLE IF NOT EXISTS platform_settings (
  id BIGSERIAL PRIMARY KEY,
  platform_name VARCHAR(255) DEFAULT 'VeilPass',
  platform_version VARCHAR(20) DEFAULT '1.0.0',
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT,
  platform_fee_percentage NUMERIC(5, 2) DEFAULT 2.5,
  minimum_ticket_price NUMERIC(10, 2) DEFAULT 0.05,
  maximum_ticket_price NUMERIC(10, 2) DEFAULT 1000,
  payout_threshold NUMERIC(10, 2) DEFAULT 100,
  enable_two_factor BOOLEAN DEFAULT true,
  max_login_attempts INTEGER DEFAULT 5,
  session_timeout INTEGER DEFAULT 30,
  require_kyc BOOLEAN DEFAULT true,
  enable_auctions BOOLEAN DEFAULT true,
  enable_disputes BOOLEAN DEFAULT true,
  enable_loyalty BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Notifications Table for User Notifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_address VARCHAR(42) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_address) REFERENCES users(wallet_address) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_address ON notifications(user_address);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- Ticket Tiers Table for Event Ticketing
-- ============================================================================

CREATE TABLE IF NOT EXISTS ticket_tiers (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10, 4) NOT NULL,
  available INTEGER DEFAULT 0,
  sold INTEGER DEFAULT 0,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ticket_tiers_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ticket_tiers_event_id ON ticket_tiers(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_tiers_display_order ON ticket_tiers(display_order);

-- ============================================================================
-- NOTES:
-- - capacity: Integer representing max tickets for the event
-- - tickets_sold: Auto-calculated count of active tickets
-- - The trigger automatically updates tickets_sold when tickets are added/removed
-- - occupancy% is calculated as: (tickets_sold / capacity) * 100
-- - revenue is calculated as: base_price * tickets_sold
-- - disputes: User-initiated disputes about tickets/events
-- - dispute_messages: Message thread between admin and user/seller
-- 
-- NEW USER EXTENSIONS:
-- - business_name: Seller's business/company name (set once during registration)
-- - theme_preference: User's theme choice (light|dark|auto)
-- - language_preference: User's language choice (en|es|fr|etc)
-- - user_preferences: Notification & general user preferences
-- - platform_settings: Admin-controlled platform configuration
-- ============================================================================

