require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3001;

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Enable CORS for all origins in development
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  });
});

// Properties endpoint with Supabase integration
app.get('/api/properties', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Database error',
        details: error
      });
    }

    // If no data, return mock data for testing
    if (!data || data.length === 0) {
      return res.json({
        success: true,
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            address: "123 Test St, San Francisco, CA 94105",
            price: 1250000,
            bedrooms: 3,
            bathrooms: 2,
            square_feet: 1800,
            property_type: "Single Family",
            status: "available",
            image_url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
            sell_probability_score: 0.85,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            address: "456 Sample Ave, San Francisco, CA 94107",
            price: 950000,
            bedrooms: 2,
            bathrooms: 2,
            square_feet: 1200,
            property_type: "Condo",
            status: "pending",
            image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
            sell_probability_score: 0.72,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ],
        note: "Using mock data as no records found in database"
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Debug endpoint to inspect database structure
app.get('/api/debug/schema', async (req, res) => {
  try {
    // Get list of tables
    const { data: tables, error: tablesError } = await supabase
      .from('_tables')
      .select('*');

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      
      // Try alternative approach using RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_schema_info');
      
      if (rpcError) {
        return res.status(500).json({
          success: false,
          error: 'Could not fetch schema information',
          details: { tablesError, rpcError }
        });
      }
      
      return res.json({
        success: true,
        schema_info: rpcData
      });
    }

    // Try to get sample data from properties table if it exists
    const { data: sampleData, error: sampleError } = await supabase
      .from('properties')
      .select('*')
      .limit(1);

    res.json({
      success: true,
      tables: tables,
      properties_sample: sampleData,
      properties_error: sampleError ? sampleError.message : null
    });
  } catch (error) {
    console.error('Schema inspection error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Setup database endpoint
app.post('/api/setup/database', async (req, res) => {
  try {
    // Create the properties table with the correct schema
    const { error: createError } = await supabase
      .from('properties')
      .insert([
        {
          address: '123 Test Street, San Francisco, CA 94105',
          price: 1250000,
          bedrooms: 3,
          bathrooms: 2,
          square_feet: 1800,
          property_type: 'Single Family',
          status: 'available',
          image_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
          sell_probability_score: 0.85
        },
        {
          address: '456 Sample Avenue, San Francisco, CA 94107',
          price: 950000,
          bedrooms: 2,
          bathrooms: 2,
          square_feet: 1200,
          property_type: 'Condo',
          status: 'pending',
          image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
          sell_probability_score: 0.72
        }
      ]);

    if (createError) {
      console.error('Error creating data:', createError);
      return res.status(500).json({
        success: false,
        error: createError.message,
        details: createError
      });
    }

    res.json({
      success: true,
      message: 'Database setup completed successfully'
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start the server
app.listen(port, () => {
  console.log(`API Server running at http://localhost:${port}`);
  console.log('Environment:', {
    SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    PORT: port
  });
}); 