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

app.get('/api/prescription/test', (req, res) => res.json({ ok: true }));

// Prescription Scanner — inline routes
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `prescription_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const scannedPrescriptions = [];

app.get('/api/prescription/history', (req, res) => {
  res.json(scannedPrescriptions.slice(-10).reverse());
});

app.post('/api/prescription/scan', upload.single('prescription'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }
    const { processPrescription } = require('./services/ocrService');
    const result = await processPrescription(req.file.path);
    if (!result.medicines.length) {
      return res.status(422).json({ error: 'No medicines found. Please upload a clearer image.' });
    }
    const record = {
      id: `scan_${Date.now()}`,
      originalFilename: req.file.originalname,
      ...result,
      scannedAt: new Date().toISOString()
    };
    scannedPrescriptions.push(record);
    res.json({
      success: true,
      id: record.id,
      medicines: result.medicines,
      medicineCount: result.medicineCount,
      ocrConfidence: result.confidence,
      parseMethod: result.parseMethod,
      rawText: result.rawText,
      scannedAt: record.scannedAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medimap';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const { seedDatabase } = require('./data/seed');
    seedDatabase();
  })
  .catch(() => {
    console.log('⚠️  MongoDB not available — running in mock data mode');
  });

app.listen(PORT, () => {
  console.log(`🚀 MediMap API running on http://localhost:${PORT}`);
});