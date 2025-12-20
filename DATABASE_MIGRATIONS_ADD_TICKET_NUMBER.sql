-- Migration: Add ticket_number and transaction_hash columns to tickets table
-- Purpose: Track sequential ticket number for each ticket and store blockchain transaction hash

ALTER TABLE IF EXISTS tickets ADD COLUMN IF NOT EXISTS ticket_number INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS tickets ADD COLUMN IF NOT EXISTS transaction_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_transaction_hash ON tickets(transaction_hash);
