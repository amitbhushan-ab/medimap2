// controllers/prescriptionController.js
const { processPrescription } = require('../services/ocrService');
const path = require('path');

// In-memory store when MongoDB not available
const scannedPrescriptions = [];

// POST /api/prescription/scan
async function scanPrescription(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image uploaded. Please upload a prescription image.'
      });
    }

    const imagePath = req.file.path;
    const originalFilename = req.file.originalname;

    console.log(`\n📋 Processing prescription: ${originalFilename}`);

    // Run OCR + AI parsing pipeline
    const result = await processPrescription(imagePath);

    if (result.medicines.length === 0) {
      return res.status(422).json({
        error: 'No medicines found in this prescription. Please upload a clearer image or ensure it contains medicine names.',
        rawText: result.rawText,
        confidence: result.confidence
      });
    }

    // Save to MongoDB if available
    let savedId = null;
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        const Prescription = require('../models/Prescription');
        const doc = await Prescription.create({
          originalFilename,
          rawText: result.rawText,
          ocrConfidence: result.confidence,
          medicines: result.medicines,
          parseMethod: result.parseMethod,
          medicineCount: result.medicineCount,
          status: 'completed'
        });
        savedId = doc._id;
      }
    } catch {}

    // In-memory fallback
    const record = {
      id: savedId || `scan_${Date.now()}`,
      originalFilename,
      ...result,
      scannedAt: new Date().toISOString()
    };
    scannedPrescriptions.push(record);

    console.log(`✅ Extracted ${result.medicines.length} medicines via ${result.parseMethod}`);

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
    console.error('❌ Prescription scan error:', err.message);
    res.status(500).json({
      error: err.message || 'Failed to process prescription. Please try again.'
    });
  }
}

// GET /api/prescription/history
function getPrescriptionHistory(req, res) {
  res.json(scannedPrescriptions.slice(-10).reverse());
}

module.exports = { scanPrescription, getPrescriptionHistory };