-- Original: TICKET_TIERS_SAMPLE_DATA.sql
-- Sample Ticket Tiers Data for Testing

INSERT INTO ticket_tiers (event_id, name, description, price, available, sold, features, display_order)
VALUES 
  (1, 'General Admission', 'Standard access to all performances', 0.25, 2500, 0, ARRAY['All 3-day performances', 'General seating', 'Access to common areas'], 1),
  (1, 'Standard VIP', 'Premium experience with reserved seating', 0.35, 1200, 0, ARRAY['VIP reserved seating', 'All 3-day performances', 'Early entry', 'Exclusive lounge access'], 2),
  (1, 'Premium VIP', 'Ultimate festival experience', 0.55, 300, 0, ARRAY['Premium reserved seating', 'Meet & greet opportunity', 'Exclusive dining', 'VIP parking', 'Merchandise pack'], 3)
ON CONFLICT DO NOTHING;

INSERT INTO ticket_tiers (event_id, name, description, price, available, sold, features, display_order)
VALUES 
  (2, 'Early Bird', 'Limited early bird pricing', 0.15, 500, 0, ARRAY['Early entry', 'Exclusive merch', 'Priority seating'], 1),
  (2, 'Standard', 'Regular ticket', 0.25, 2000, 0, ARRAY['Regular seating', 'Access to all zones'], 2)
ON CONFLICT DO NOTHING;
