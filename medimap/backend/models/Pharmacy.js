const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  hours: { type: String, default: 'Mon-Sat: 8AM–9PM, Sun: 9AM–6PM' },
  rating: { type: Number, min: 1, max: 5, default: 4.0 },
  isOpen: { type: Boolean, default: true },
  chain: { type: String },
  image: { type: String }
});

pharmacySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Pharmacy', pharmacySchema);
