-- ============================================================================
-- Sample Ticket Tiers Data for Testing
-- ============================================================================
-- Insert sample ticket tiers for testing events

-- Example: Add ticket tiers for an existing event (replace event_id with actual event ID)
-- First, check what events exist:
-- SELECT id, title FROM events LIMIT 5;

-- Then insert ticket tiers using the event ID:

-- For event_id = 1 (example)
INSERT INTO ticket_tiers (event_id, name, description, price, available, sold, features, display_order)
VALUES 
  (1, 'General Admission', 'Standard access to all performances', 0.25, 2500, 0, ARRAY['All 3-day performances', 'General seating', 'Access to common areas'], 1),
  (1, 'Standard VIP', 'Premium experience with reserved seating', 0.35, 1200, 0, ARRAY['VIP reserved seating', 'All 3-day performances', 'Early entry', 'Exclusive lounge access'], 2),
  (1, 'Premium VIP', 'Ultimate festival experience', 0.55, 300, 0, ARRAY['Premium reserved seating', 'Meet & greet opportunity', 'Exclusive dining', 'VIP parking', 'Merchandise pack'], 3)
ON CONFLICT DO NOTHING;

-- For event_id = 2 (example - different tiers)
INSERT INTO ticket_tiers (event_id, name, description, price, available, sold, features, display_order)
VALUES 
  (2, 'Early Bird', 'Limited early bird pricing', 0.15, 500, 0, ARRAY['Early entry', 'Exclusive merch', 'Priority seating'], 1),
  (2, 'Standard', 'Regular ticket', 0.25, 2000, 0, ARRAY['Regular seating', 'Access to all zones'], 2)
ON CONFLICT DO NOTHING;

-- Notes:
-- - Update event_id to match actual event IDs in your database
-- - features is a TEXT[] array, so use ARRAY['feature1', 'feature2', ...] syntax
-- - display_order controls the order tiers are displayed (1, 2, 3, etc.)
-- - available represents total tickets for that tier
-- - sold tracks how many have been purchased
-- - price is in ETH (decimal format)

-- To view existing ticket tiers:
-- SELECT * FROM ticket_tiers ORDER BY event_id, display_order;

-- To delete all ticket tiers for an event:
-- DELETE FROM ticket_tiers WHERE event_id = 1;
