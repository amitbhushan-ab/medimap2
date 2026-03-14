const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  price: { type: Number, required: true },
  inStock: { type: Boolean, default: true },
  stockCount: { type: Number },
  lastUpdated: { type: Date, default: Date.now },
  submittedBy: { type: String, default: 'system' }, // 'system' or 'user'
  priceHistory: [{
    price: Number,
    date: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Price', priceSchema);
