-- ============================================================================
-- Mock Notifications Data for Testing
-- Replace WALLET_ADDRESS_HERE with an actual wallet from the users table
-- ============================================================================

-- Step 1: Get a valid wallet address
-- SELECT wallet_address FROM users LIMIT 1;

-- Step 2: Copy wallet address and replace WALLET_ADDRESS_HERE below, then run this entire script

-- 1. Create notifications table if it doesn't exist
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_address ON notifications(user_address);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 2. Insert 10 mock notifications
INSERT INTO notifications (user_address, type, title, message, read, created_at) VALUES
  ('WALLET_ADDRESS_HERE', 'success', 'Ticket Purchase Confirmed', 'Your ticket for Summer Music Fest has been confirmed. Check your email for details.', false, NOW() - INTERVAL '2 hours'),
  ('WALLET_ADDRESS_HERE', 'alert', 'Auction Ending Soon', 'Your auction for Classic Vinyl Record ends in 24 hours. Current bid: $150', false, NOW() - INTERVAL '5 hours'),
  ('WALLET_ADDRESS_HERE', 'info', 'Event Reminder', 'Comedy Night at Theatre District starts tomorrow at 8 PM. See you there!', true, NOW() - INTERVAL '1 day'),
  ('WALLET_ADDRESS_HERE', 'success', 'Loyalty Points Earned', 'You earned 250 loyalty points from your recent purchase.', true, NOW() - INTERVAL '2 days'),
  ('WALLET_ADDRESS_HERE', 'alert', 'Action Required', 'Complete your seller verification to unlock auction features.', true, NOW() - INTERVAL '3 days'),
  ('WALLET_ADDRESS_HERE', 'info', 'New Feature Available', 'Ticket resale is now available for your upcoming events.', true, NOW() - INTERVAL '4 days'),
  ('WALLET_ADDRESS_HERE', 'success', 'Event Hosted Successfully', 'Your event Jazz Night has ended. Total attendees: 245', true, NOW() - INTERVAL '5 days'),
  ('WALLET_ADDRESS_HERE', 'alert', 'Payment Failed', 'Your payment for event registration failed. Please update your payment method.', true, NOW() - INTERVAL '6 days'),
  ('WALLET_ADDRESS_HERE', 'info', 'Newsletter Update', 'This weeks top events and deals are ready for you!', true, NOW() - INTERVAL '7 days'),
  ('WALLET_ADDRESS_HERE', 'success', 'Refund Processed', 'Your refund of $85.50 has been processed and will arrive in 3-5 business days.', true, NOW() - INTERVAL '8 days')
ON CONFLICT DO NOTHING;

-- 3. Verify insertion
SELECT COUNT(*) as total_notifications FROM notifications WHERE user_address = 'WALLET_ADDRESS_HERE';
SELECT id, type, title, read, created_at FROM notifications WHERE user_address = 'WALLET_ADDRESS_HERE' ORDER BY created_at DESC;
