const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

// Enable CORS
app.use(cors());

// Basic logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Properties endpoint with mock data
app.get('/api/properties', (req, res) => {
  const mockData = [
    {
      id: 1,
      address: "123 Test St",
      sell_probability_score: 0.85,
      status: "available"
    },
    {
      id: 2,
      address: "456 Sample Ave",
      sell_probability_score: 0.72,
      status: "pending"
    }
  ];

  res.json({
    success: true,
    data: mockData
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 