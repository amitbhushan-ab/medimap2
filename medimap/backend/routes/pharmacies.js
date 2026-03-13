const express = require('express');
const router = express.Router();
const { mockPharmacies } = require('../data/seed');

// GET /api/pharmacies
router.get('/', async (req, res) => {
  try {
    res.json(mockPharmacies.map((p, i) => ({ ...p, _id: `pharmacy_${i}` })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pharmacies/:id
router.get('/:id', async (req, res) => {
  try {
    const idx = parseInt(req.params.id.replace('pharmacy_', ''));
    const pharmacy = mockPharmacies[idx];
    if (!pharmacy) return res.status(404).json({ error: 'Pharmacy not found' });
    res.json({ ...pharmacy, _id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
