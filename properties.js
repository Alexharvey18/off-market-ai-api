// Test data
const testProperties = [
  {
    id: '1',
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
    id: '2',
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
];

module.exports = function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET request
  if (req.method === 'GET') {
    res.status(200).json({ data: testProperties });
    return;
  }

  // Handle other methods
  res.status(405).json({ error: 'Method not allowed' });
} 