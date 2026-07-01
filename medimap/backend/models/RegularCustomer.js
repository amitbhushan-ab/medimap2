// backend/models/RegularCustomer.js — Regular customer tracking for pharmacists
const mongoose = require('mongoose');

const medicineRecordSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  dosage: { type: String },
  quantity: { type: Number, default: 1 },
  frequency: { type: String, enum: ['daily','weekly','monthly','as_needed'], default: 'monthly' },
  typicalDate: { type: Number }, // day of month they usually buy (1-31)
  lastPurchased: { type: Date },
  notes: { type: String },
  alertEnabled: { type: Boolean, default: true },
  alertDaysBefore: { type: Number, default: 1 }, // alert N days before typicalDate
}, { _id: false });

const regularCustomerSchema = new mongoose.Schema({
  pharmacistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacist', required: true, index: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true, index: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String },
  age: { type: Number },
  notes: { type: String },
  medicines: [medicineRecordSchema],
  // Purchase history summary
  totalVisits: { type: Number, default: 0 },
  totalSpend: { type: Number, default: 0 },
  lastVisit: { type: Date },
  // Linked bills
  billIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bill' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

regularCustomerSchema.index({ pharmacistId: 1, phone: 1 });
regularCustomerSchema.index({ pharmacistId: 1, name: 'text' });

module.exports = mongoose.model('RegularCustomer', regularCustomerSchema);
