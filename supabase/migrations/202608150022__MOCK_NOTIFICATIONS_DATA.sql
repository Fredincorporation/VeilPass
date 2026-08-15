-- Original: MOCK_NOTIFICATIONS_DATA.sql
-- Mock Notifications Data for Testing

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

CREATE INDEX IF NOT EXISTS idx_notifications_user_address ON notifications(user_address);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Insert sample entries using a valid wallet address placeholder
INSERT INTO notifications (user_address, type, title, message, read, created_at) VALUES
  ('WALLET_ADDRESS_HERE', 'success', 'Ticket Purchase Confirmed', 'Your ticket for Summer Music Fest has been confirmed.', false, NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;
