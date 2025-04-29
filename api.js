// api.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeEstimator } = require('./src/index');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize the nutrition estimator
const estimator = initializeEstimator(false);

// API endpoint to calculate nutrition
app.post('/api/nutrition', async (req, res) => {
  try {
    const { dishName } = req.body;
    
    if (!dishName) {
      return res.status(400).json({
        error: 'Missing dishName in request body'
      });
    }
    
    console.log(`Processing request for dish: ${dishName}`);
    const nutritionData = await estimator.estimateNutrition(dishName);
    
    return res.json(nutritionData);
  } catch (error) {
    console.error(`Error processing request: ${error.message}`);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Serve the index.html file for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nutrition Calculator API is running' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Nutrition Calculator running on http://localhost:${port}`);
    console.log(`Access the web interface at http://localhost:${port}`);
    console.log(`API endpoint available at http://localhost:${port}/api/nutrition`);
  });
}

// Export the Express app for Vercel
module.exports = app;