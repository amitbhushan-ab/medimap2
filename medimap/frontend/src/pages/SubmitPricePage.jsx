// frontend/src/pages/SubmitPricePage.jsx — v3
// FIXED: Pharmacy search dropdown (ID-based), no name matching
import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

// ── Debounce hook ─────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SubmitPricePage() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const fileRef = useRef(null);
  const dropdownRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('medimap_user') || 'null');

  // ── Form state ────────────────────────────────────────────────
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: upload, 2: details, 3: confirm

  // ── Pharmacy search state ─────────────────────────────────────
  const [pharmacySearch, setPharmacySearch] = useState('');
  const [pharmacyResults, setPharmacyResults] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null); // { id, name, address, ... }
  const [pharmacyDropdownOpen, setPharmacyDropdownOpen] = useState(false);
  const [pharmacySearching, setPharmacySearching] = useState(false);
  const [isNewPharmacy, setIsNewPharmacy] = useState(false);
  const [newPharmacyData, setNewPharmacyData] = useState({ name: '', address: '', phone: '', city: '' });

  const debouncedPharmacySearch = useDebounce(pharmacySearch, 300);

  // Form fields
  const [form, setForm] = useState({ medicineName: '', price: '', inStock: true, personalNote: '' });

  // ── Geolocation for nearby pharmacy sort ─────────────────────
  const [userCoords, setUserCoords] = useState(null);
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  // ── Pharmacy search API ───────────────────────────────────────
  useEffect(() => {
    if (!debouncedPharmacySearch.trim() || debouncedPharmacySearch.length < 2) {
      setPharmacyResults([]); return;
    }
    setPharmacySearching(true);
    const params = new URLSearchParams({ q: debouncedPharmacySearch, limit: 8 });
    if (userCoords) { params.set('lat', userCoords.lat); params.set('lng', userCoords.lng); }

    fetch(`https://medimap-backend-production.up.railway.app/api/pharmacy-search?${params}`)
      .then(r => r.json())
      .then(data => setPharmacyResults(data.pharmacies || []))
      .catch(() => setPharmacyResults([]))
      .finally(() => setPharmacySearching(false));
  }, [debouncedPharmacySearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setPharmacyDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function selectPharmacy(pharmacy) {
    setSelectedPharmacy(pharmacy);
    setPharmacySearch(pharmacy.name);
    setPharmacyDropdownOpen(false);
    setIsNewPharmacy(false);
  }

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setScanned(false);
    setError('');
    if (f.type.startsWith('image/')) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  }

  async function handleScan() {
    if (!file) return;
    setScanning(true); setError('');
    try {
      const fd = new FormData(); fd.append('prescription', file);
      const res = await fetch('https://medimap-backend-production.up.railway.app/api/prescription/scan', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const meds = data.medicines || [];
      if (meds.length > 0) {
        setForm(prev => ({
          ...prev,
          medicineName: meds[0].name || prev.medicineName,
          price: meds[0].price || prev.price,
        }));
        if (meds.length > 1) {
          // Show all detected medicines
          setError(`Found ${meds.length} medicines: ${meds.map(m => m.name).join(', ')}. Showing first one.`);
        }
      }
      setScanned(true);
      setStep(2);
    } catch (err) {
      setError('OCR failed: ' + err.message + '. Fill manually.');
      setScanned(true);
      setStep(2);
    }
    setScanning(false);
  }

  async function handleSubmit() {
    if (!form.medicineName.trim()) return setError('Medicine name is required');
    if (!form.price || parseFloat(form.price) <= 0) return setError('Valid price is required');
    if (!selectedPharmacy && !isNewPharmacy) return setError('Please select a pharmacy from the dropdown, or check "New Pharmacy"');
    if (isNewPharmacy && !newPharmacyData.name.trim()) return setError('New pharmacy name is required');

    setSubmitting(true); setError('');
    try {
      const fd = new FormData();
      fd.append('medicineName', form.medicineName.trim());
      fd.append('price', form.price);
      fd.append('inStock', form.inStock);
      fd.append('personalNote', form.personalNote);
      fd.append('userName', user?.name || 'Anonymous');
      fd.append('userId', user?.email || 'anonymous');
      fd.append('userEmail', user?.email || '');

      // KEY FIX: Send pharmacyId, not pharmacyName
      if (selectedPharmacy) {
        fd.append('pharmacyId', selectedPharmacy.id);
        fd.append('pharmacyName', selectedPharmacy.name);
      } else {
        fd.append('isNewPharmacy', 'true');
        fd.append('pharmacyName', newPharmacyData.name);
        fd.append('newPharmacyData', JSON.stringify(newPharmacyData));
      }

      if (file) fd.append('billImage', file);

      const res = await fetch('https://medimap-backend-production.up.railway.app/api/requests', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSubmitted(true);
    } catch (err) {
      setError('Submission failed: ' + err.message);
    }
    setSubmitting(false);
  }

  // ── Success screen ────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-4xl" style={{ background: 'linear-gradient(135deg,#1B6EF3,#00C2A8)' }}>🎉</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Submitted!</h2>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            Price of <strong>₹{form.price}</strong> for <strong>{form.medicineName}</strong> submitted.
            {selectedPharmacy && <><br/><span className="text-emerald-600">✅ {selectedPharmacy.name} will be notified.</span></>}
            {isNewPharmacy && <><br/><span className="text-amber-600">⚠️ New pharmacy — admin will review and onboard.</span></>}
          </p>
          <div className="bg-blue-50 rounded-xl p-3 mb-6 text-xs text-blue-700">
            🏆 Once approved, you'll earn <strong>+20 MediPoints!</strong>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setSubmitted(false); setFile(null); setPreview(null); setScanned(false); setSelectedPharmacy(null); setPharmacySearch(''); setIsNewPharmacy(false); setForm({ medicineName:'', price:'', inStock:true, personalNote:'' }); setStep(1); }}
              className="flex-1 btn-secondary text-sm !py-3">Submit Another</button>
            <Link to="/" className="flex-1 btn-primary text-center text-sm !py-3">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-2xl" style={{ background: 'linear-gradient(135deg,#1B6EF3,#00C2A8)' }}>💊</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>Submit Price Update</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Help the community — earn <strong>+20 MediPoints</strong> on approval</p>
      </div>

      {/* Step 1: Upload Bill */}
      <div className="card p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ background: 'linear-gradient(135deg,#1B6EF3,#00C2A8)' }}>1</div>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Upload Receipt</h2>
          <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>Optional</span>
        </div>
        <div onClick={() => fileRef.current.click()}
          className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all"
          style={{ borderColor: file ? '#1B6EF3' : 'var(--border)', background: file ? 'rgba(27,110,243,0.02)' : 'var(--bg-subtle)' }}>
          {preview
            ? <img src={preview} alt="bill" className="max-h-48 mx-auto rounded-xl shadow-md"/>
            : <><div className="text-4xl mb-2">{file ? '📄' : '⬆️'}</div><p className="font-medium" style={{ color: 'var(--text-secondary)' }}>{file ? file.name : 'Drop receipt here or click'}</p><p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>JPG, PNG, PDF — 10MB max</p></>}
          <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden"/>
        </div>
        {file && !scanned && (
          <button onClick={handleScan} disabled={scanning}
            className="btn-primary w-full mt-3 !py-3 text-sm">
            {scanning ? <span className="flex items-center justify-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Scanning...</span> : '🔍 Scan with OCR'}
          </button>
        )}
        {scanned && <p className="text-emerald-600 text-sm font-medium mt-2 text-center">✅ Scanned! Review details below.</p>}
        <button onClick={() => setStep(2)} className="text-xs text-center w-full mt-2 block" style={{ color: 'var(--text-muted)' }}>Skip — fill manually ›</button>
      </div>

      {/* Step 2: Details */}
      <div className="card p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ background: 'linear-gradient(135deg,#1B6EF3,#00C2A8)' }}>2</div>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Medicine & Price</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>💊 Medicine Name *</label>
            <input className="input-field" placeholder="e.g. Paracetamol 500mg" value={form.medicineName} onChange={e => setForm({ ...form, medicineName: e.target.value })}/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>₹ Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold" style={{ color: 'var(--text-muted)' }}>₹</span>
              <input className="input-field !pl-8" inputMode="decimal" placeholder="0.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}/>
            </div>
          </div>

          {/* ── PHARMACY SELECTOR — KEY FIX ── */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>🏥 Pharmacy *</label>
            <div className="flex items-center gap-2 mb-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={isNewPharmacy} onChange={e => { setIsNewPharmacy(e.target.checked); setSelectedPharmacy(null); setPharmacySearch(''); }}/>
                Pharmacy not listed on MediMap
              </label>
            </div>

            {!isNewPharmacy ? (
              <div ref={dropdownRef} className="relative">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <input
                    className="input-field !pl-10"
                    placeholder="Search pharmacy name..."
                    value={pharmacySearch}
                    onChange={e => { setPharmacySearch(e.target.value); setSelectedPharmacy(null); setPharmacyDropdownOpen(true); }}
                    onFocus={() => setPharmacyDropdownOpen(true)}
                  />
                  {pharmacySearching && (
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  )}
                </div>

                {/* Dropdown */}
                {pharmacyDropdownOpen && pharmacyResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border overflow-hidden z-50 max-h-60 overflow-y-auto" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                    {pharmacyResults.map(ph => (
                      <div key={ph.id} onClick={() => selectPharmacy(ph)}
                        className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors border-b last:border-0"
                        style={{ borderColor: 'var(--border)' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm" style={{ background: 'rgba(27,110,243,0.1)', color: '#1B6EF3' }}>🏥</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{ph.name}</p>
                            {ph.isVerified && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full flex-shrink-0">✅</span>}
                            {ph.isFeatured && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex-shrink-0">⭐</span>}
                          </div>
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{ph.address}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {ph.rating && <span className="text-xs text-amber-500">★ {ph.rating}</span>}
                            {ph.distanceKm && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{ph.distanceKm} km</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected pharmacy confirmation */}
                {selectedPharmacy && (
                  <div className="mt-2 p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(18,183,106,0.08)', border: '1px solid rgba(18,183,106,0.2)' }}>
                    <span className="text-emerald-600 text-lg flex-shrink-0">✅</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-emerald-700">{selectedPharmacy.name}</p>
                      <p className="text-xs text-emerald-600">{selectedPharmacy.address}</p>
                      <p className="text-xs text-emerald-500 mt-0.5">Pharmacist will be notified of your submission.</p>
                    </div>
                    <button onClick={() => { setSelectedPharmacy(null); setPharmacySearch(''); }} className="text-xs text-gray-400 hover:text-red-500 flex-shrink-0">✕</button>
                  </div>
                )}

                {pharmacySearch.length >= 2 && pharmacyResults.length === 0 && !pharmacySearching && (
                  <div className="mt-2 p-3 rounded-xl text-xs" style={{ background: 'rgba(247,144,9,0.08)', border: '1px solid rgba(247,144,9,0.2)', color: '#92400e' }}>
                    ⚠️ No pharmacy found for "{pharmacySearch}". Check the "not listed" box above to submit for a new pharmacy.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 p-4 rounded-xl" style={{ background: 'rgba(247,144,9,0.06)', border: '1px solid rgba(247,144,9,0.2)' }}>
                <p className="text-xs font-semibold" style={{ color: '#92400e' }}>New Pharmacy Details</p>
                <input className="input-field" placeholder="Pharmacy Name *" value={newPharmacyData.name} onChange={e => setNewPharmacyData({ ...newPharmacyData, name: e.target.value })}/>
                <input className="input-field" placeholder="Address" value={newPharmacyData.address} onChange={e => setNewPharmacyData({ ...newPharmacyData, address: e.target.value })}/>
                <input className="input-field" placeholder="Phone (optional)" value={newPharmacyData.phone} onChange={e => setNewPharmacyData({ ...newPharmacyData, phone: e.target.value })}/>
                <input className="input-field" placeholder="City" value={newPharmacyData.city} onChange={e => setNewPharmacyData({ ...newPharmacyData, city: e.target.value })}/>
              </div>
            )}
          </div>

          {/* In stock toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`relative w-10 h-5 rounded-full transition-colors ${form.inStock ? 'bg-emerald-500' : 'bg-gray-300'}`}
                onClick={() => setForm({ ...form, inStock: !form.inStock })}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.inStock ? 'translate-x-5' : ''}`}/>
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{form.inStock ? '✅ In Stock' : '❌ Out of Stock'}</span>
            </label>
          </div>

          {/* Personal note */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>📝 Note (optional)</label>
            <textarea className="input-field" rows={2} placeholder="e.g. Bought 2 strips today, price on receipt..." value={form.personalNote} onChange={e => setForm({ ...form, personalNote: e.target.value })} maxLength={500}/>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="card p-6">
        {!user && (
          <div className="mb-4 p-3 rounded-xl text-xs" style={{ background: 'rgba(247,144,9,0.1)', color: '#92400e', border: '1px solid rgba(247,144,9,0.2)' }}>
            ⚠️ <Link to="/login" className="underline font-semibold">Login</Link> to earn +20 MediPoints when approved!
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            ❌ {error}
          </div>
        )}

        <button onClick={handleSubmit}
          disabled={submitting || !form.medicineName || !form.price || (!selectedPharmacy && !isNewPharmacy)}
          className="btn-primary w-full !py-4 text-base">
          {submitting
            ? <span className="flex items-center justify-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Submitting...</span>
            : '📤 Submit Price Update'}
        </button>
      </div>
    </div>
  );
}
