-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if it exists
DROP TABLE IF EXISTS properties;

-- Create properties table
CREATE TABLE properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    address TEXT NOT NULL,
    sell_probability_score FLOAT DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Add RLS policies
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Allow read access" ON properties
    FOR SELECT USING (true);

-- Allow insert access to all users
CREATE POLICY "Allow insert access" ON properties
    FOR INSERT WITH CHECK (true);

-- Allow update access to all users
CREATE POLICY "Allow update access" ON properties
    FOR UPDATE USING (true);

-- Insert test data
INSERT INTO properties (address, sell_probability_score, status) VALUES
    ('123 Test Street, City, State 12345', 0.85, 'available'),
    ('456 Sample Avenue, City, State 12345', 0.72, 'pending');

-- Create an update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 