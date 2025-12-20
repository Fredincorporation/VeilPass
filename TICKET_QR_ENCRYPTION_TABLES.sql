-- Ticket QR Code Encryption & Scanning
-- Tracks which tickets have been scanned and by whom

CREATE TABLE IF NOT EXISTS ticket_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id VARCHAR(255) NOT NULL,
  event_id INTEGER NOT NULL,
  scanner_address VARCHAR(255) NOT NULL,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scanner_token VARCHAR(64) NOT NULL UNIQUE,
  ticket_status VARCHAR(50),
  is_valid BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ticket_scans_ticket ON ticket_scans(ticket_id);
CREATE INDEX idx_ticket_scans_event ON ticket_scans(event_id);
CREATE INDEX idx_ticket_scans_scanner ON ticket_scans(scanner_address);
CREATE INDEX idx_ticket_scans_timestamp ON ticket_scans(scanned_at);
CREATE INDEX idx_ticket_scans_valid ON ticket_scans(is_valid);

-- Ticket QR Generation Log
-- Tracks when QR codes are generated for audit purposes

CREATE TABLE IF NOT EXISTS ticket_qr_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id VARCHAR(255) NOT NULL,
  event_id INTEGER NOT NULL,
  owner_address VARCHAR(255) NOT NULL,
  qr_generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  qr_expires_at TIMESTAMP WITH TIME ZONE,
  qr_hash VARCHAR(64),
  device_info TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ticket_qr_log_ticket ON ticket_qr_log(ticket_id);
CREATE INDEX idx_ticket_qr_log_event ON ticket_qr_log(event_id);
CREATE INDEX idx_ticket_qr_log_owner ON ticket_qr_log(owner_address);
CREATE INDEX idx_ticket_qr_log_expires ON ticket_qr_log(qr_expires_at);
