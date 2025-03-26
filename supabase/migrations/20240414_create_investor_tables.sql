-- Create investors table
CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive')),
  subscription_tier TEXT NOT NULL DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium', 'enterprise')),
  max_deal_value DECIMAL(12,2),
  preferred_property_types TEXT[] DEFAULT '{}',
  preferred_locations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create deal_claims table
CREATE TABLE IF NOT EXISTS deal_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  investor_id UUID NOT NULL REFERENCES investors(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  bid_amount DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better query performance
CREATE INDEX idx_investors_subscription ON investors(subscription_status, subscription_tier);
CREATE INDEX idx_deal_claims_property ON deal_claims(property_id);
CREATE INDEX idx_deal_claims_investor ON deal_claims(investor_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_investors_updated_at
  BEFORE UPDATE ON investors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_claims_updated_at
  BEFORE UPDATE ON deal_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_claims ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all investors
CREATE POLICY "Allow authenticated users to read investors"
  ON investors FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to manage their own investor profile
CREATE POLICY "Allow users to manage their own investor profile"
  ON investors FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to read all deal claims
CREATE POLICY "Allow authenticated users to read deal claims"
  ON deal_claims FOR SELECT
  TO authenticated
  USING (true);

-- Allow investors to manage their own deal claims
CREATE POLICY "Allow investors to manage their own deal claims"
  ON deal_claims FOR ALL
  TO authenticated
  USING (investor_id = auth.uid())
  WITH CHECK (investor_id = auth.uid()); 