const express = require('express');
const router = express.Router();
const { getMockResults, mockMedicines } = require('../data/seed');

// GET /api/medicines/search?q=paracetamol&lat=12.9716&lng=77.6101
router.get('/search', async (req, res) => {
  try {
    const { q, lat = 12.9716, lng = 77.6101 } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter q is required' });

    // Try MongoDB first, fallback to mock
    try {
      const Medicine = require('../models/Medicine');
      const Price = require('../models/Price');
      const mongoose = require('mongoose');

      if (mongoose.connection.readyState !== 1) throw new Error('Not connected');

      const medicines = await Medicine.find({ $text: { $search: q } }).limit(5);
      if (!medicines.length) throw new Error('No results');

      const medicine = medicines[0];
      const prices = await Price.find({ medicine: medicine._id })
        .populate('pharmacy')
        .sort({ price: 1 });

      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      const results = prices.map(p => ({
        _id: p._id,
        pharmacy: p.pharmacy,
        medicine,
        price: p.price,
        inStock: p.inStock,
        distance: calcDistance(userLat, userLng,
          p.pharmacy.location.coordinates[1],
          p.pharmacy.location.coordinates[0]),
        lastUpdated: p.lastUpdated,
        priceHistory: p.priceHistory
      }));

      const minPrice = Math.min(...results.filter(r => r.inStock).map(r => r.price));
      const final = results.map(r => ({ ...r, isCheapest: r.price === minPrice && r.inStock }));
      return res.json({ medicine, results: final });
    } catch {
      // Fallback to mock
      const results = getMockResults(q, parseFloat(lat), parseFloat(lng));
      if (!results) return res.status(404).json({ error: 'Medicine not found', suggestions: mockMedicines.map(m => m.name).slice(0, 5) });
      const medicine = mockMedicines.find(m =>
        m.name.toLowerCase().includes(q.toLowerCase()) ||
        (m.genericName && m.genericName.toLowerCase().includes(q.toLowerCase()))
      );
      return res.json({ medicine, results });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/medicines - list all
router.get('/', async (req, res) => {
  try {
    res.json(mockMedicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1));
}

module.exports = router;
