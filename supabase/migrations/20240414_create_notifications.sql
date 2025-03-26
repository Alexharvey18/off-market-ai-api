-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id UUID NOT NULL REFERENCES investors(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  deal_claim_id UUID REFERENCES deal_claims(id),
  type TEXT NOT NULL CHECK (type IN ('new_deal', 'bid_update', 'bid_accepted', 'bid_rejected', 'deal_expired')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create index for faster queries
CREATE INDEX idx_notifications_investor ON notifications(investor_id);
CREATE INDEX idx_notifications_unread ON notifications(investor_id) WHERE NOT is_read;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow users to read their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (investor_id = auth.uid());

CREATE POLICY "Allow system to create notifications"
  ON notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow users to update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (investor_id = auth.uid())
  WITH CHECK (investor_id = auth.uid()); 