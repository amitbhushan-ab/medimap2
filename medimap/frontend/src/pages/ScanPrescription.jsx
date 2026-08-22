// frontend/src/pages/ScanPrescription.jsx — v2
// FIX: Uses searchName (clean drug name only) for search, not full "Paracetamol 500mg twice a day"
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import Tesseract from 'tesseract.js';

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
      // Offline AI OCR using Tesseract.js directly in the browser!
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text || '';
      
      setRawText(text);
      
      // Simple parsing logic to find potential medicines based on common formats
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
      const detected = [];
      
      for (const line of lines) {
        // Look for typical medicine names (simple heuristic: starts with capital, has mg/ml or Cap/Tab)
        if (/(mg|ml|mcg|gm|g\b|iu|unit|cap|tab|syr|inj|drp)/i.test(line)) {
          const cleanName = line.replace(/[^a-zA-Z0-9\s]/g, '').trim();
          const searchName = cleanName.replace(/\d+\s*(?:mg|ml|mcg|gm|g\b|iu|units?)/i, '').trim().split(/\s+/).slice(0,2).join(' ');
          
          if (searchName.length > 2) {
            detected.push({
              name: line.substring(0, 40), // Truncate if too long
              searchName: searchName,
              dosage: '',
              quantity: '1',
              price: ''
            });
          }
        }
      }

      setMedicines(detected.length > 0 ? detected : [{ name:'', searchName:'', dosage:'', quantity:'1', price:'' }]);
      setStep('results');
      if (!detected.length) setError('No strict medicines detected automatically. Please fill manually from the text below.');
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
                          <div className="bg-[#e5e7eb] rounded-2xl p-6 mb-6 shadow-inner">
                <h3 className="font-bold text-gray-900 mb-6 text-lg">What is a valid prescription?</h3>
                
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <div className="bg-white rounded-2xl p-5 w-full md:w-64 shadow-sm border border-gray-100 flex-shrink-0 text-[10px] text-gray-500 leading-tight">
                    
                    <div className="flex items-center relative mb-5">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-[13px] mb-0.5">Dr Apurva Kumar</div>
                        <div>Name of Hospital/Clinic<br/>Address of Hospital/Clinic<br/>Regd. No : 1234567</div>
                      </div>
                      <div className="hidden md:flex items-center absolute left-[100%] ml-2 w-16"><div className="h-[2px] w-full border-b-[3px] border-dotted border-purple-300"></div></div>
                      <div className="hidden md:flex items-center gap-3 absolute left-[100%] ml-[4.5rem] whitespace-nowrap">
                        <span className="w-7 h-7 rounded-full bg-[#c4b5fd] text-purple-900 flex items-center justify-center text-xs font-bold">1</span>
                        <span className="text-gray-700 text-[15px] font-medium">Doctor's details</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center relative mb-5 mt-8">
                      <div className="text-blue-500 font-medium tracking-wide text-xs">20-01-2025</div>
                      <div className="hidden md:flex items-center absolute left-[100%] ml-2 w-16"><div className="h-[2px] w-full border-b-[3px] border-dotted border-purple-300"></div></div>
                      <div className="hidden md:flex items-center gap-3 absolute left-[100%] ml-[4.5rem] whitespace-nowrap">
                        <span className="w-7 h-7 rounded-full bg-[#c4b5fd] text-purple-900 flex items-center justify-center text-xs font-bold">2</span>
                        <span className="text-gray-700 text-[15px] font-medium">Date of prescription</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center relative mb-5 mt-8">
                      <div>
                        <div style={{ fontFamily: 'cursive', color: '#4f46e5', fontSize: '15px' }}>Meghna Raj</div>
                        <div className="text-[10px] font-medium mt-0.5">38 Y/F</div>
                      </div>
                      <div className="hidden md:flex items-center absolute left-[100%] ml-2 w-16"><div className="h-[2px] w-full border-b-[3px] border-dotted border-purple-300"></div></div>
                      <div className="hidden md:flex items-center gap-3 absolute left-[100%] ml-[4.5rem] whitespace-nowrap">
                        <span className="w-7 h-7 rounded-full bg-[#c4b5fd] text-purple-900 flex items-center justify-center text-xs font-bold">3</span>
                        <span className="text-gray-700 text-[15px] font-medium">Patient's details</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center relative mt-8">
                      <div style={{ fontFamily: 'cursive', color: '#2563eb', fontSize: '13px', lineHeight: '1.6' }}>
                        Paracetamol - 50mg<br/>
                        Ibuprofen - 150mg
                      </div>
                      <div className="hidden md:flex items-center absolute left-[100%] ml-2 w-16"><div className="h-[2px] w-full border-b-[3px] border-dotted border-purple-300"></div></div>
                      <div className="hidden md:flex items-center gap-3 absolute left-[100%] ml-[4.5rem] whitespace-nowrap">
                        <span className="w-7 h-7 rounded-full bg-[#c4b5fd] text-purple-900 flex items-center justify-center text-xs font-bold">4</span>
                        <span className="text-gray-700 text-[15px] font-medium">Medicines</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:hidden flex flex-col gap-3 mt-2">
                    {[ "Doctor's details", "Date of prescription", "Patient's details", "Medicines" ].map((lbl, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-[#c4b5fd] text-purple-900 flex items-center justify-center text-xs font-bold shadow-sm">{i+1}</span>
                        <span className="text-gray-800 text-[15px] font-medium">{lbl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <ul className="list-disc pl-5 text-[14px] text-gray-700 space-y-2 font-medium">
                  <li>Include details of doctor, patient & date of visit</li>
                  <li>Supported files: <span className="font-bold">PNG, JPEG, PDF</span></li>
                  <li>File size limit: <span className="font-bold">5MB</span></li>
                </ul>
              </div>
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
                  ? <span className="flex items-center justify-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{lang === 'hi' ? 'स्कैन हो रहा है...' : 'Scanning...'}</span>
                  : `🔍 ${lang === 'hi' ? 'AI से स्कैन करें' : 'Scan with AI'}`}
              </button>
            )}

            <div className="card p-4 text-center">
              <p className="text-sm mb-2" style={{ color:'var(--text-secondary)' }}>
                {lang==='hi'?'सीधे दवाई नाम डालें':'Or add medicines manually'}
              </p>
              <button onClick={()=>{setMedicines([{name:'',searchName:'',dosage:'',quantity:'1',price:''}]);setStep('results');}} className="btn-secondary text-sm !py-2">
                ✏️ {lang === 'hi' ? 'मैन्युअल प्रविष्टि' : 'Manual Entry'}
              </button>
            </div>
          </>
        )}

        {step === 'results' && (
          <>
            {rawText && (
              <div className="card p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold" style={{ color:'var(--text-muted)' }}>📄 {lang === 'hi' ? 'निकाला गया टेक्स्ट' : 'Extracted Text'}</p>
                  <button onClick={()=>setRawText('')} className="text-xs" style={{ color:'var(--text-muted)' }}>{lang === 'hi' ? 'छुपाएं' : 'Hide'}</button>
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
                  💊 {lang === 'hi' ? 'दवाइयां' : 'Medicines'} ({medicines.length})
                </h2>
                <button onClick={()=>{setStep('upload');setFile(null);setPreview(null);setMedicines([]);setRawText('');setError('');}} className="btn-secondary text-xs !py-1.5">
                  ← {lang === 'hi' ? 'फिर से स्कैन करें' : 'Rescan'}
                </button>
              </div>

              <div className="space-y-3">
                {medicines.map((med, idx) => (
                  <div key={idx} className="p-4 rounded-xl" style={{ background:'var(--bg-subtle)',border:'1px solid var(--border)' }}>
                    {/* Medicine display name (for reference) */}
                    <div className="mb-2">
                      <p className="text-xs font-semibold mb-1" style={{ color:'var(--text-muted)' }}>
                        {lang === 'hi' ? 'दवा का नाम' : 'Medicine Name'}
                      </p>
                      <input className="input-field" value={med.name}
                        onChange={e=>updateMed(idx,'name',e.target.value)}
                        placeholder={lang === 'hi' ? 'दवा का नाम (जैसे Paracetamol 500mg)' : 'Medicine name (e.g. Paracetamol 500mg)'}/>
                    </div>

                    {/* Search query shown */}
                    {med.searchName && med.searchName !== med.name && (
                      <div className="mb-2 flex items-center gap-2 text-xs" style={{ color:'var(--text-muted)' }}>
                        <span>🔍 {lang === 'hi' ? 'इसके लिए खोजा जाएगा:' : 'Will search for:'}</span>
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
                        <p className="text-xs font-semibold mb-1" style={{ color:'var(--text-muted)' }}>{lang === 'hi' ? 'मात्रा' : 'Quantity'}</p>
                        <input className="input-field" inputMode="numeric" value={med.quantity||'1'}
                          onChange={e=>updateMed(idx,'quantity',e.target.value.replace(/\D/g,''))} placeholder="1"/>
                      </div>
                      {med.price && (
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color:'var(--text-muted)' }}>{lang === 'hi' ? 'कीमत' : 'Price'} ₹</p>
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
                        🔍 {lang === 'hi' ? 'कीमत खोजें' : 'Find Price'}
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
                  + {lang === 'hi' ? 'जोड़ें' : 'Add'}
                </button>
                {medicines.filter(m=>m.name.trim()||m.searchName?.trim()).length > 0 && (
                  <button onClick={()=>searchMed(medicines.find(m=>m.name.trim()||m.searchName?.trim()))} className="btn-primary flex-1 !py-2.5 text-sm">
                    🔍 {lang === 'hi' ? 'पहले खोजें' : 'Search First'}
                  </button>
                )}
              </div>
            </div>
          </>        )}

        <div className="mt-8 p-4 rounded-xl text-sm" style={{ backgroundColor:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', color:'#b45309', display:'flex', gap:'12px', alignItems:'flex-start' }}>
          <span className="text-xl">⚠️</span>
          <div className="leading-relaxed font-medium">
            <strong className="font-bold">Important Disclaimer:</strong> OCR technology may occasionally misread or incorrectly identify medicines from a prescription. Please confirm the prescription and medicine details with a qualified pharmacist or doctor before purchasing or taking any medicine. MediMap's OCR results are for assistance only and should not be considered 100% accurate or a substitute for professional medical advice.
          </div>
        </div>
      </div>
    </div>
  );
}