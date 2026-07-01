// frontend/src/components/StockOCR.jsx — v3 FULLY FIXED
// All fields fill correctly: batch, expiry, qty, purchase price, manufacturer
// Supplier select + manual option in OCR flow
import { useState, useRef, useEffect } from 'react';

const BACKEND = '';
const getToken = () => localStorage.getItem('pharmacist_token');

export default function StockOCR({ onStockAdded, toast }) {
  const [suppliers, setSuppliers] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [items, setItems] = useState([]);
  const [step, setStep] = useState('upload'); // upload | review
  const [globalMargin, setGlobalMargin] = useState(20);
  const [adding, setAdding] = useState(false);
  const [addingProgress, setAddingProgress] = useState(0);
  const fileRef = useRef(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${BACKEND}/api/pharmacist/suppliers`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(d => Array.isArray(d) && setSuppliers(d)).catch(() => {});
  }, []);

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(f.type.startsWith('image/') ? URL.createObjectURL(f) : null);
    setItems([]);
    setStep('upload');
  }

  function calcSell(buy, margin) {
    const b = parseFloat(buy), m = parseFloat(margin);
    if (!b || isNaN(b)) return '';
    return (b * (1 + (m || 0) / 100)).toFixed(2);
  }

  function createEmpty() {
    return {
      id: Math.random().toString(36).slice(2),
      medicineName: '', genericName: '', manufacturer: '',
      batchNo: '', expiryDate: '',
      purchasePrice: '', markupPercent: globalMargin, sellingPrice: '',
      units: 1, minStock: 10, category: '', gstRate: 12,
      supplierId: '', supplierName: '',
      included: true,
    };
  }

  async function scan() {
    if (!file) return;
    setScanning(true);
    try {
      const fd = new FormData();
      fd.append('prescription', file);
      const res = await fetch(`${BACKEND}/api/prescription/scan-bill`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const meds = data.medicines || [];

      if (!meds.length) {
        toast('No medicines detected — fill manually', 'error');
        setItems([createEmpty()]);
        setStep('review');
        return;
      }

      // Map each detected field to its correct input
      const mapped = meds.map(m => {
        const buy = parseFloat(m.price) || 0;
        const margin = globalMargin;
        return {
          id: Math.random().toString(36).slice(2),
          medicineName: (m.searchName || m.name || '').trim(),
          genericName: '',
          manufacturer: m.manufacturer || '',
          batchNo: m.batchNo || '',           // → batch field
          expiryDate: m.expiryDate || '',     // → expiry field (YYYY-MM)
          purchasePrice: m.price || '',       // → purchase price field
          markupPercent: margin,
          sellingPrice: buy > 0 ? calcSell(buy, margin) : '',
          units: parseInt(m.quantity) || 1,   // → units/qty field
          minStock: 10,
          category: '',
          gstRate: 12,
          supplierId: '',
          supplierName: data.supplierName || '',  // detected from bill header
          included: true,
        };
      });

      setItems(mapped);
      setStep('review');
      toast(`✅ Detected ${mapped.length} medicine(s) — review fields below`);
    } catch (err) {
      toast('Scan error: ' + err.message, 'error');
      setItems([createEmpty()]);
      setStep('review');
    }
    setScanning(false);
  }

  function upd(id, field, val) {
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it;
      const u = { ...it, [field]: val };
      if (field === 'purchasePrice' || field === 'markupPercent') {
        const b = parseFloat(field === 'purchasePrice' ? val : u.purchasePrice) || 0;
        const m = parseFloat(field === 'markupPercent' ? val : u.markupPercent) || 0;
        if (b > 0) u.sellingPrice = calcSell(b, m);
      }
      if (field === 'supplierId') {
        const s = suppliers.find(x => x._id === val);
        u.supplierName = s?.name || '';
      }
      return u;
    }));
  }

  function applyMarginAll() {
    setItems(prev => prev.map(it => {
      const b = parseFloat(it.purchasePrice) || 0;
      return { ...it, markupPercent: globalMargin, sellingPrice: b > 0 ? calcSell(b, globalMargin) : it.sellingPrice };
    }));
  }

  async function addAll() {
    const toAdd = items.filter(i => i.included && i.medicineName.trim() && i.sellingPrice);
    if (!toAdd.length) { toast('Fill name + selling price for at least one item', 'error'); return; }
    const token = getToken();
    setAdding(true);
    let ok = 0, fail = 0;
    for (let i = 0; i < toAdd.length; i++) {
      const it = toAdd[i];
      setAddingProgress(Math.round(((i + 1) / toAdd.length) * 100));
      try {
        const res = await fetch(`${BACKEND}/api/pharmacist/stock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            medicineName: it.medicineName,
            genericName: it.genericName,
            manufacturer: it.manufacturer,
            batchNo: it.batchNo,
            expiryDate: it.expiryDate,
            purchasePrice: parseFloat(it.purchasePrice) || 0,
            sellingPrice: parseFloat(it.sellingPrice),
            units: parseInt(it.units) || 1,
            minStock: parseInt(it.minStock) || 10,
            category: it.category,
            gstRate: parseFloat(it.gstRate) || 12,
            supplierId: it.supplierId || undefined,
            supplierName: it.supplierName || undefined,
          }),
        });
        const d = await res.json();
        if (d.error) throw new Error(d.error);
        ok++;
      } catch { fail++; }
    }
    setAdding(false);
    toast(`✅ ${ok} medicine(s) added${fail ? `, ${fail} failed` : ''}!`);
    if (ok > 0) {
      setTimeout(() => {
        onStockAdded();
        setFile(null); setPreview(null); setItems([]); setStep('upload');
      }, 1000);
    }
  }

  const included = items.filter(i => i.included && i.medicineName.trim()).length;

  const fieldStyle = {
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 8, padding: '8px 11px', color: 'white', fontSize: 12,
    outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'DM Sans,sans-serif',
  };
  const labelStyle = { color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, display: 'block', marginBottom: 3, letterSpacing: '0.05em' };

  return (
    <div style={{ marginBottom: 14 }}>

      {/* UPLOAD */}
      {step === 'upload' && (
        <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: 14 }}>
          <p style={{ color: '#10b981', fontWeight: 700, fontSize: 12, margin: '0 0 9px', letterSpacing: '0.04em' }}>📄 UPLOAD PURCHASE BILL → OCR AUTO-FILL</p>
          <div
            onClick={() => fileRef.current.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile({ target: { files: [f] } }); }}
            style={{ border: `2px dashed ${file ? '#10b981' : 'rgba(255,255,255,0.15)'}`, borderRadius: 11, padding: 18, textAlign: 'center', cursor: 'pointer', background: file ? 'rgba(16,185,129,0.05)' : 'transparent', marginBottom: 10 }}>
            {preview
              ? <img src={preview} alt="bill" style={{ maxHeight: 100, display: 'block', margin: '0 auto', borderRadius: 8 }} />
              : <><div style={{ fontSize: 26, marginBottom: 5 }}>{file ? '📄' : '⬆️'}</div>
                 <p style={{ color: file ? '#10b981' : 'rgba(255,255,255,0.35)', fontSize: 12, margin: 0 }}>{file ? file.name : 'Drop bill / invoice or click'}</p>
                 <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, marginTop: 3 }}>JPG · PNG · PDF · 10MB</p></>}
            <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} style={{ display: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 9 }}>
            {file && (
              <button onClick={scan} disabled={scanning} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: scanning ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                {scanning ? '⏳ Scanning bill...' : '🔍 Scan & Auto-detect'}
              </button>
            )}
            <button onClick={() => { setItems([createEmpty()]); setStep('review'); }} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              ✏️ Manual Entry
            </button>
          </div>
        </div>
      )}

      {/* REVIEW */}
      {step === 'review' && (
        <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: 12, margin: 0, letterSpacing: '0.04em' }}>
              📋 REVIEW — {items.length} MEDICINE{items.length !== 1 ? 'S' : ''}
            </p>
            <button onClick={() => { setStep('upload'); setFile(null); setPreview(null); setItems([]); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>← Rescan</button>
          </div>

          {/* Global margin */}
          {items.length > 0 && (
            <div style={{ background: 'rgba(27,110,243,0.08)', border: '1px solid rgba(27,110,243,0.15)', borderRadius: 9, padding: '9px 12px', marginBottom: 11 }}>
              <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, margin: '0 0 7px' }}>⚡ Apply margin to all</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                {[10, 15, 20, 25, 30].map(p => (
                  <button key={p} onClick={() => setGlobalMargin(p)} style={{ padding: '3px 9px', borderRadius: 18, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: globalMargin === p ? '#1B6EF3' : 'rgba(255,255,255,0.07)', color: globalMargin === p ? 'white' : 'rgba(255,255,255,0.45)' }}>{p}%</button>
                ))}
                <input type="number" value={globalMargin} onChange={e => setGlobalMargin(parseInt(e.target.value) || 0)} style={{ width: 48, ...fieldStyle, textAlign: 'center', padding: '3px 7px' }} />
                <button onClick={applyMarginAll} style={{ padding: '3px 11px', borderRadius: 7, border: 'none', background: '#1B6EF3', color: 'white', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Apply All</button>
              </div>
            </div>
          )}

          {/* Medicine cards */}
          <div style={{ maxHeight: 520, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((it, idx) => (
              <div key={it.id} style={{ background: it.included ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.01)', border: `1px solid ${it.included ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}`, borderRadius: 12, padding: 13, opacity: it.included ? 1 : 0.45 }}>

                {/* Row 1: checkbox + index + badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                    <input type="checkbox" checked={it.included} onChange={e => upd(it.id, 'included', e.target.checked)} style={{ accentColor: '#10b981', width: 14, height: 14 }} />
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}>#{idx + 1}</span>
                    {it.batchNo && <span style={{ fontSize: 10, background: 'rgba(27,110,243,0.2)', color: '#60a5fa', padding: '1px 7px', borderRadius: 18 }}>Batch: {it.batchNo}</span>}
                    {it.expiryDate && <span style={{ fontSize: 10, background: 'rgba(245,158,11,0.2)', color: '#fbbf24', padding: '1px 7px', borderRadius: 18 }}>Exp: {it.expiryDate}</span>}
                  </label>
                  <button onClick={() => setItems(p => p.filter(x => x.id !== it.id))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>✕</button>
                </div>

                {/* Fields grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>

                  {/* Medicine Name */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>MEDICINE NAME *</label>
                    <input value={it.medicineName} onChange={e => upd(it.id, 'medicineName', e.target.value)} placeholder="e.g. Paracetamol 500mg" style={{ ...fieldStyle, borderColor: it.medicineName ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.2)' }} />
                  </div>

                  {/* Manufacturer */}
                  <div>
                    <label style={labelStyle}>MANUFACTURER</label>
                    <input value={it.manufacturer} onChange={e => upd(it.id, 'manufacturer', e.target.value)} placeholder="Cipla, Sun Pharma..." style={fieldStyle} />
                  </div>

                  {/* Generic Name */}
                  <div>
                    <label style={labelStyle}>GENERIC NAME</label>
                    <input value={it.genericName} onChange={e => upd(it.id, 'genericName', e.target.value)} placeholder="Generic name" style={fieldStyle} />
                  </div>

                  {/* Batch No — pre-filled from OCR */}
                  <div>
                    <label style={labelStyle}>BATCH NO {it.batchNo && '✅'}</label>
                    <input value={it.batchNo} onChange={e => upd(it.id, 'batchNo', e.target.value)} placeholder="e.g. ABC123" style={{ ...fieldStyle, borderColor: it.batchNo ? 'rgba(27,110,243,0.4)' : 'rgba(255,255,255,0.2)', background: it.batchNo ? 'rgba(27,110,243,0.07)' : fieldStyle.background }} />
                  </div>

                  {/* Expiry Date — pre-filled from OCR in YYYY-MM */}
                  <div>
                    <label style={labelStyle}>EXPIRY DATE {it.expiryDate && '✅'}</label>
                    <input value={it.expiryDate} onChange={e => upd(it.id, 'expiryDate', e.target.value)} placeholder="YYYY-MM e.g. 2026-12" style={{ ...fieldStyle, borderColor: it.expiryDate ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.2)', background: it.expiryDate ? 'rgba(245,158,11,0.07)' : fieldStyle.background }} />
                  </div>

                  {/* Purchase Price — pre-filled from OCR */}
                  <div>
                    <label style={labelStyle}>PURCHASE ₹ {it.purchasePrice && '✅'}</label>
                    <input value={it.purchasePrice} onChange={e => upd(it.id, 'purchasePrice', e.target.value)} placeholder="Cost price" inputMode="decimal" style={fieldStyle} />
                  </div>

                  {/* Margin % */}
                  <div>
                    <label style={labelStyle}>MARGIN %</label>
                    <input value={it.markupPercent} onChange={e => upd(it.id, 'markupPercent', e.target.value)} placeholder="20" inputMode="numeric" style={fieldStyle} />
                  </div>

                  {/* Selling Price — auto-calculated */}
                  <div>
                    <label style={labelStyle}>SELLING ₹ * {it.sellingPrice && '✅'}</label>
                    <input value={it.sellingPrice} onChange={e => upd(it.id, 'sellingPrice', e.target.value)} placeholder="Auto-calculated" inputMode="decimal" style={{ ...fieldStyle, borderColor: it.sellingPrice ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.2)', color: it.sellingPrice ? '#34d399' : 'white', fontWeight: it.sellingPrice ? 700 : 400, background: it.sellingPrice ? 'rgba(16,185,129,0.07)' : fieldStyle.background }} />
                  </div>

                  {/* Units/Qty — pre-filled from OCR */}
                  <div>
                    <label style={labelStyle}>UNITS / QTY * {parseInt(it.units) > 1 && '✅'}</label>
                    <input value={it.units} onChange={e => upd(it.id, 'units', e.target.value.replace(/\D/g, ''))} placeholder="1" inputMode="numeric" style={fieldStyle} />
                  </div>

                  {/* GST */}
                  <div>
                    <label style={labelStyle}>GST %</label>
                    <select value={it.gstRate} onChange={e => upd(it.id, 'gstRate', e.target.value)} style={{ ...fieldStyle }}>
                      <option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option>
                    </select>
                  </div>

                  {/* Supplier tag — dropdown of saved suppliers + manual */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>🏭 SUPPLIER TAG</label>
                    <select value={it.supplierId} onChange={e => upd(it.id, 'supplierId', e.target.value)} style={{ ...fieldStyle, borderColor: it.supplierId ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.2)', color: it.supplierId ? '#34d399' : 'rgba(255,255,255,0.5)' }}>
                      <option value="">— No supplier tag (local/unknown) —</option>
                      {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}{s.phone ? ` (${s.phone})` : ''}</option>)}
                    </select>
                    {/* If no saved suppliers, show manual text input */}
                    {!suppliers.length && (
                      <input value={it.supplierName} onChange={e => upd(it.id, 'supplierName', e.target.value)} placeholder="Type supplier name manually..." style={{ ...fieldStyle, marginTop: 5, color: 'rgba(255,255,255,0.5)' }} />
                    )}
                    {it.supplierId && <p style={{ color: '#34d399', fontSize: 10, margin: '3px 0 0' }}>✅ Tagged: {it.supplierName}</p>}
                  </div>
                </div>

                {/* Margin preview */}
                {it.purchasePrice && it.sellingPrice && parseFloat(it.purchasePrice) > 0 && (
                  <div style={{ marginTop: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 7, padding: '5px 10px', fontSize: 11, color: '#34d399', fontWeight: 600 }}>
                    ₹{it.purchasePrice} → ₹{it.sellingPrice} · {(((parseFloat(it.sellingPrice) - parseFloat(it.purchasePrice)) / parseFloat(it.purchasePrice)) * 100).toFixed(1)}% margin
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer actions */}
          <div style={{ display: 'flex', gap: 9, marginTop: 11 }}>
            <button onClick={() => setItems(p => [...p, createEmpty()])} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>+ Add Row</button>
            <button onClick={addAll} disabled={adding || included === 0} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: adding || included === 0 ? 0.5 : 1 }}>
              {adding ? `Adding ${addingProgress}%...` : `✅ Add ${included} to Stock`}
            </button>
          </div>

          {adding && (
            <div style={{ marginTop: 7, width: '100%', height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{ width: `${addingProgress}%`, height: '100%', background: 'linear-gradient(90deg,#10b981,#059669)', transition: 'width 0.3s' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
