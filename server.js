const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supabase: {
      url: supabaseUrl ? 'configured' : 'missing',
      key: supabaseKey ? 'configured' : 'missing'
    }
  });
});

// Properties endpoint
app.get('/api/properties', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ data });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Database setup endpoint
app.post('/api/setup/database', async (req, res) => {
  try {
    // Insert test data
    const { data, error } = await supabase
      .from('properties')
      .insert([
        {
          address: '123 Main St',
          price: 500000,
          bedrooms: 3,
          bathrooms: 2,
          square_feet: 2000,
          property_type: 'Single Family',
          status: 'available',
          image_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
          sell_probability_score: 0.85
        },
        {
          address: '456 Oak Ave',
          price: 750000,
          bedrooms: 4,
          bathrooms: 3,
          square_feet: 3000,
          property_type: 'Single Family',
          status: 'pending',
          image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
          sell_probability_score: 0.92
        }
      ])
      .select();

    if (error) throw error;

    res.json({ message: 'Test data inserted successfully', data });
  } catch (error) {
    console.error('Error setting up database:', error);
    res.status(500).json({ error: 'Failed to setup database' });
  }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 