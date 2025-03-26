-- Add additional fields to properties table
ALTER TABLE properties 
ADD COLUMN price DECIMAL(12,2),
ADD COLUMN property_type TEXT,
ADD COLUMN bedrooms INTEGER,
ADD COLUMN bathrooms INTEGER,
ADD COLUMN square_feet DECIMAL(10,2),
ADD COLUMN year_built INTEGER;

-- Add unique constraint to deal_claims
ALTER TABLE deal_claims 
ADD CONSTRAINT unique_property_investor UNIQUE (property_id, investor_id);

-- Create property status history table
CREATE TABLE property_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id),
    status TEXT NOT NULL,
    changed_by UUID NOT NULL REFERENCES investors(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create index for faster queries on property status history
CREATE INDEX idx_property_status_history_property ON property_status_history(property_id);
CREATE INDEX idx_property_status_history_changed_by ON property_status_history(changed_by);

-- Enable RLS on property_status_history
ALTER TABLE property_status_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for property_status_history
CREATE POLICY "Allow authenticated users to read property status history"
    ON property_status_history FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow users to create property status history entries"
    ON property_status_history FOR INSERT
    TO authenticated
    WITH CHECK (changed_by = auth.uid());

-- Create trigger to automatically create status history entry when property status changes
CREATE OR REPLACE FUNCTION create_property_status_history()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO property_status_history (property_id, status, changed_by)
        VALUES (NEW.id, NEW.status, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER property_status_history_trigger
    AFTER UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION create_property_status_history();

-- Add some helpful comments to the tables
COMMENT ON TABLE properties IS 'Stores property listings with their details and status';
COMMENT ON TABLE deal_claims IS 'Tracks investor bids on properties with a unique constraint per property-investor pair';
COMMENT ON TABLE property_status_history IS 'Maintains an audit trail of property status changes';

-- Add some helpful comments to the columns
COMMENT ON COLUMN properties.price IS 'The asking price of the property';
COMMENT ON COLUMN properties.property_type IS 'Type of property (e.g., single-family, condo, multi-family)';
COMMENT ON COLUMN properties.bedrooms IS 'Number of bedrooms in the property';
COMMENT ON COLUMN properties.bathrooms IS 'Number of bathrooms in the property';
COMMENT ON COLUMN properties.square_feet IS 'Total square footage of the property';
COMMENT ON COLUMN properties.year_built IS 'Year the property was constructed';
COMMENT ON COLUMN property_status_history.status IS 'The new status that was set';
COMMENT ON COLUMN property_status_history.changed_by IS 'The investor who made the status change'; 