require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const medicineRoutes = require('./routes/medicines');
const pharmacyRoutes = require('./routes/pharmacies');
const priceRoutes = require('./routes/prices');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/medicines', medicineRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'MediMap API running', timestamp: new Date().toISOString() });
});

// Connect to MongoDB (with fallback to in-memory mock mode)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medimap';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    // Seed data on first run
    const { seedDatabase } = require('./data/seed');
    seedDatabase();
  })
  .catch(() => {
    console.log('⚠️  MongoDB not available — running in mock data mode');
  });

app.listen(PORT, () => {
  console.log(`🚀 MediMap API running on http://localhost:${PORT}`);
});
