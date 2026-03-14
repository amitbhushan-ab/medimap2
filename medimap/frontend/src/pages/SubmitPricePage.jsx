import { useState } from 'react';
import { submitPrice } from '../services/api';

const MEDICINE_OPTIONS = [
  'Paracetamol 500mg', 'Amoxicillin 250mg', 'Metformin 500mg', 'Atorvastatin 10mg',
  'Pantoprazole 40mg', 'Cetirizine 10mg', 'Aspirin 75mg', 'Azithromycin 500mg'
];

const PHARMACY_OPTIONS = [
  'MedPlus Pharmacy', 'Apollo Pharmacy - Koramangala', 'Netmeds Store - Indiranagar',
  'Wellness Forever - HSR Layout', 'Frank Ross Pharmacy', 'Wellness Pharmacy - Whitefield', 'Other'
];

export default function SubmitPricePage() {
  const [form, setForm] = useState({
    medicineName: '',
    pharmacyName: '',
    price: '',
    inStock: true,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!form.medicineName || !form.pharmacyName || !form.price) {
      setError('Please fill in all required fields.');
      return;
    }
    if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      setError('Please enter a valid price.');
      return;
    }
    setLoading(true);
    try {
      await submitPrice({
        medicineName: form.medicineName,
        pharmacyName: form.pharmacyName,
        price: parseFloat(form.price),
        inStock: form.inStock,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="card p-8 animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Thank You! 🎉</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your price update for <span className="font-semibold text-gray-900">{form.medicineName}</span> at{' '}
            <span className="font-semibold text-gray-900">{form.pharmacyName}</span> has been submitted.
            Our team will verify it shortly.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => { setSuccess(false); setForm({ medicineName: '', pharmacyName: '', price: '', inStock: true }); }}
              className="flex-1 btn-secondary text-sm"
            >
              Submit Another
            </button>
            <a href="/" className="flex-1 btn-primary text-sm text-center">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-up">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2E7DFF] to-[#00C2A8] mb-4 shadow-lg shadow-blue-500/25">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit a Price Update</h1>
        <p className="text-gray-500 text-sm">Help the community find affordable medicines by sharing real pharmacy prices.</p>
      </div>

      <div className="card p-6 animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="space-y-5">
          {/* Medicine Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Medicine Name <span className="text-red-500">*</span>
            </label>
            <select
              value={form.medicineName}
              onChange={e => handleChange('medicineName', e.target.value)}
              className="input-field"
            >
              <option value="">Select a medicine...</option>
              {MEDICINE_OPTIONS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Don't see your medicine? Type the name below after selecting "Other".</p>
          </div>

          {form.medicineName === 'Other' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Custom Medicine Name</label>
              <input
                type="text"
                placeholder="e.g., Losartan 50mg"
                className="input-field"
                onChange={e => handleChange('medicineName', e.target.value)}
              />
            </div>
          )}

          {/* Pharmacy */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Pharmacy Name <span className="text-red-500">*</span>
            </label>
            <select
              value={form.pharmacyName}
              onChange={e => handleChange('pharmacyName', e.target.value)}
              className="input-field"
            >
              <option value="">Select a pharmacy...</option>
              {PHARMACY_OPTIONS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
              <input
                type="number"
                value={form.price}
                onChange={e => handleChange('price', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.50"
                className="input-field pl-8"
              />
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Availability</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleChange('inStock', true)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  form.inStock
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                ✓ In Stock
              </button>
              <button
                type="button"
                onClick={() => handleChange('inStock', false)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  !form.inStock
                    ? 'bg-red-50 border-red-300 text-red-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                ✗ Out of Stock
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Submitting...
              </span>
            ) : 'Submit Price Update'}
          </button>
        </div>
      </div>

      {/* Info note */}
      <div className="mt-4 text-xs text-gray-400 text-center px-4">
        All submissions are reviewed before going live. By submitting, you help thousands of patients access affordable healthcare.
      </div>
    </div>
  );
}
