// frontend/src/pages/ScanPrescription.jsx — v2
// FIX: Uses searchName (clean drug name only) for search, not full "Paracetamol 500mg twice a day"
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

export default function ScanPrescription() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [rawText, setRawText] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [step, setStep] = useState('upload');
  const [error, setError] = useState('');

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setError(''); setMedicines([]); setRawText(''); setStep('upload');
    if (f.type.startsWith('image/')) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  }

  async function handleScan() {
    if (!file) return;
    setScanning(true); setError('');
    try {
      const fd = new FormData();
      fd.append('prescription', file);
      const res = await fetch('https://medimap-backend-production.up.railway.app/api/prescription/scan', { method:'POST', body:fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const detected = data.medicines || [];
      setRawText(data.rawText || '');
      setMedicines(detected.length > 0 ? detected : [{ name:'', searchName:'', dosage:'', quantity:'1', price:'' }]);
      setStep('results');
      if (!detected.length) setError('No medicines detected. Fill manually.');
    } catch (err) {
      setError('Scan failed: ' + err.message);
      setMedicines([{ name:'', searchName:'', dosage:'', quantity:'1', price:'' }]);
      setStep('results');
    }
    setScanning(false);
  }

  function updateMed(idx, field, val) {
    setMedicines(prev => prev.map((m, i) => {
      if (i !== idx) return m;
      const updated = { ...m, [field]: val };
      // If user edits name, update searchName too
      if (field === 'name') {
        // Strip dosage from name for search
        updated.searchName = val.replace(/\d+\s*(?:mg|ml|mcg|gm|g\b|iu|units?)/i, '').trim().split(/\s+/).slice(0,2).join(' ');
      }
      return updated;
    }));
  }

  // FIX: Use searchName for navigation, fallback to name
  function searchMed(med) {
    const query = (med.searchName || med.name || '').trim();
    if (!query) return;
    navigate(`/results?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor:'var(--bg-primary)', paddingTop:80 }}>
      <div className="max-w-2xl mx-auto px-4 pb-12">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-3xl"
            style={{ background:'linear-gradient(135deg,#1B6EF3,#00C2A8)' }}>📋</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color:'var(--text-primary)', fontFamily:'Sora,sans-serif' }}>
            {lang==='hi'?'पर्ची स्कैन करें':'Scan Prescription'}
          </h1>
          <p className="text-sm" style={{ color:'var(--text-secondary)' }}>
            {lang==='hi'?'पर्ची अपलोड करें — AI दवाइयां निकाल देगा':'Upload prescription — AI extracts medicines automatically'}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ background:'rgba(18,183,106,0.1)', color:'#12B76A', border:'1px solid rgba(18,183,106,0.2)' }}>
            ✅ No API Key needed — Tesseract AI
          </div>
        </div>

        {step === 'upload' && (
          <>
            <div className="card p-6 mb-4"
              onClick={() => fileRef.current.click()}
              onDragOver={e=>e.preventDefault()}
              onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleFile({target:{files:[f]}});}}
              style={{ cursor:'pointer', border:file?'2px solid #1B6EF3':'2px dashed var(--border)', background:file?'rgba(27,110,243,0.02)':'var(--bg-subtle)' }}>
              {preview
                ? <img src={preview} alt="rx" className="max-h-64 mx-auto rounded-xl object-contain"/>
                : <div className="text-center py-8">
                    <div className="text-5xl mb-3">{file?'📄':'⬆️'}</div>
                    <p className="font-medium mb-1" style={{ color:'var(--text-primary)' }}>
                      {file?file.name:(lang==='hi'?'पर्ची यहाँ छोड़ें या क्लिक करें':'Drop prescription or click to browse')}
                    </p>
                    <p className="text-xs" style={{ color:'var(--text-muted)' }}>JPG, PNG, PDF — 10MB max</p>
                  </div>}
              <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden"/>
            </div>

            {error && <div className="card p-3 mb-4 text-sm" style={{ background:'rgba(247,144,9,0.1)',border:'1px solid rgba(247,144,9,0.2)',color:'#92400e' }}>{error}</div>}

            {file && (
              <button onClick={handleScan} disabled={scanning} className="btn-primary w-full !py-4 text-base mb-3">
                {scanning
                  ? <span className="flex items-center justify-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Scanning...</span>
                  : `🔍 Scan with AI`}
              </button>
            )}

            <div className="card p-4 text-center">
              <p className="text-sm mb-2" style={{ color:'var(--text-secondary)' }}>
                {lang==='hi'?'सीधे दवाई नाम डालें':'Or add medicines manually'}
              </p>
              <button onClick={()=>{setMedicines([{name:'',searchName:'',dosage:'',quantity:'1',price:''}]);setStep('results');}} className="btn-secondary text-sm !py-2">
                ✏️ Manual Entry
              </button>
            </div>
          </>
        )}

        {step === 'results' && (
          <>
            {rawText && (
              <div className="card p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold" style={{ color:'var(--text-muted)' }}>📄 Extracted Text</p>
                  <button onClick={()=>setRawText('')} className="text-xs" style={{ color:'var(--text-muted)' }}>Hide</button>
                </div>
                <pre className="text-xs whitespace-pre-wrap font-mono p-3 rounded-xl max-h-28 overflow-y-auto" style={{ background:'var(--bg-subtle)',color:'var(--text-secondary)' }}>
                  {rawText}
                </pre>
              </div>
            )}

            {error && <div className="card p-3 mb-4 text-sm" style={{ background:'rgba(247,144,9,0.1)',border:'1px solid rgba(247,144,9,0.2)',color:'#92400e' }}>⚠️ {error}</div>}

            <div className="card p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-base" style={{ color:'var(--text-primary)', fontFamily:'Sora,sans-serif' }}>
                  💊 Medicines ({medicines.length})
                </h2>
                <button onClick={()=>{setStep('upload');setFile(null);setPreview(null);setMedicines([]);setRawText('');setError('');}} className="btn-secondary text-xs !py-1.5">
                  ← Rescan
                </button>
              </div>

              <div className="space-y-3">
                {medicines.map((med, idx) => (
                  <div key={idx} className="p-4 rounded-xl" style={{ background:'var(--bg-subtle)',border:'1px solid var(--border)' }}>
                    {/* Medicine display name (for reference) */}
                    <div className="mb-2">
                      <p className="text-xs font-semibold mb-1" style={{ color:'var(--text-muted)' }}>
                        Medicine Name
                      </p>
                      <input className="input-field" value={med.name}
                        onChange={e=>updateMed(idx,'name',e.target.value)}
                        placeholder="Medicine name (e.g. Paracetamol 500mg)"/>
                    </div>

                    {/* Search query shown */}
                    {med.searchName && med.searchName !== med.name && (
                      <div className="mb-2 flex items-center gap-2 text-xs" style={{ color:'var(--text-muted)' }}>
                        <span>🔍 Will search for:</span>
                        <span className="font-semibold px-2 py-0.5 rounded-full"
                          style={{ background:'rgba(27,110,243,0.1)',color:'#1B6EF3' }}>
                          {med.searchName}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {med.dosage && (
                        <div className="col-span-2">
                          <span className="text-xs px-2 py-1 rounded-full" style={{ background:'rgba(27,110,243,0.1)',color:'#1B6EF3' }}>
                            💉 {med.dosage}{med.frequency?` · ${med.frequency}`:''}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color:'var(--text-muted)' }}>Quantity</p>
                        <input className="input-field" inputMode="numeric" value={med.quantity||'1'}
                          onChange={e=>updateMed(idx,'quantity',e.target.value.replace(/\D/g,''))} placeholder="1"/>
                      </div>
                      {med.price && (
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color:'var(--text-muted)' }}>Price ₹</p>
                          <input className="input-field" value={med.price}
                            onChange={e=>updateMed(idx,'price',e.target.value)} placeholder="0"/>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={()=>searchMed(med)}
                        disabled={!med.name.trim() && !med.searchName?.trim()}
                        className="btn-primary flex-1 !py-2 text-xs disabled:opacity-40">
                        🔍 Find Price
                      </button>
                      <button onClick={()=>setMedicines(prev=>prev.filter((_,i)=>i!==idx))}
                        className="px-3 py-2 rounded-xl text-xs font-medium"
                        style={{ background:'#fee2e2',color:'#dc2626' }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={()=>setMedicines(p=>[...p,{name:'',searchName:'',dosage:'',quantity:'1',price:''}])} className="btn-secondary flex-1 !py-2.5 text-sm">
                  + Add
                </button>
                {medicines.filter(m=>m.name.trim()||m.searchName?.trim()).length > 0 && (
                  <button onClick={()=>searchMed(medicines.find(m=>m.name.trim()||m.searchName?.trim()))} className="btn-primary flex-1 !py-2.5 text-sm">
                    🔍 Search First
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}