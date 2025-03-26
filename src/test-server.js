const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

// Enable CORS for all origins
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        address: "123 Test St",
        sell_probability_score: 0.85,
        status: "available"
      }
    ]
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
}); 