// frontend/src/pages/PharmacistDashboard.jsx — v6 ALL 11 POINTS
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StockOCR from '../components/StockOCR';

const API = 'https://medimap-backend-ygqj.onrender.com/api/pharmacist';
const getToken = () => localStorage.getItem('pharmacist_token');
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });
const eForm = { medicineName:'', genericName:'', manufacturer:'', batchNo:'', expiryDate:'', purchasePrice:'', sellingPrice:'', units:'', minStock:'10', category:'', gstRate:'12', supplierId:'', supplierName:'' };

function useTheme() {
  const [t, setT] = useState(() => localStorage.getItem('ph_theme') || 'dark');
  const toggle = () => setT(p => { const n = p==='dark'?'light':'dark'; localStorage.setItem('ph_theme',n); return n; });
  return [t, toggle];
}

const C = (t) => t === 'dark' ? {
  bg:'#060D1F', sb:'rgba(255,255,255,0.03)', sbBd:'rgba(255,255,255,0.06)',
  card:'rgba(255,255,255,0.04)', cardBd:'rgba(255,255,255,0.08)', cardHov:'rgba(255,255,255,0.08)',
  txt:'#fff', txtS:'rgba(255,255,255,0.6)', txtM:'rgba(255,255,255,0.3)',
  inp:'rgba(255,255,255,0.07)', inpBd:'rgba(255,255,255,0.15)',
  tblBd:'rgba(255,255,255,0.05)', tblHov:'rgba(255,255,255,0.03)',
  div:'rgba(255,255,255,0.07)', secBg:'rgba(255,255,255,0.05)', secClr:'rgba(255,255,255,0.5)',
  modal:'#0f172a',
} : {
  bg:'#f8faff', sb:'#fff', sbBd:'#e5e7eb',
  card:'#fff', cardBd:'#e5e7eb', cardHov:'#f9fafb',
  txt:'#111827', txtS:'#4b5563', txtM:'#9ca3af',
  inp:'#fff', inpBd:'#d1d5db',
  tblBd:'#f3f4f6', tblHov:'#f9fafb',
  div:'#e5e7eb', secBg:'#f3f4f6', secClr:'#6b7280',
  modal:'#fff',
};

// ─── Premium gate component ───────────────────────────────────
function SupplierPastOrders({ supplier, theme }) {
  const c = C(theme);
  const [expanded, setExpanded] = useState(false);
  const allOrders = supplier.orders || [];
  const past = allOrders.filter(o => o.status !== 'Pending');
  if (!past.length) return null;
  return (
    <div style={{ borderTop:`1px solid ${c.div}`,padding:'8px 18px',background:theme==='dark'?'rgba(0,0,0,0.07)':'rgba(0,0,0,0.01)' }}>
      <button onClick={()=>setExpanded(!expanded)} style={{ background:'none',border:'none',cursor:'pointer',color:c.txtM,fontSize:12,fontWeight:600,padding:0,display:'flex',alignItems:'center',gap:6 }}>
        {expanded?'▲':'▼'} {past.length} Past Order{past.length!==1?'s':''}
      </button>
      {expanded && (
        <div style={{ marginTop:8,display:'flex',flexDirection:'column',gap:5 }}>
          {past.map((o,i)=>(
            <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:`1px solid ${c.div}` }}>
              <div style={{ flex:1 }}>
                <span style={{ color:c.txt,fontSize:12,fontWeight:600 }}>{o.medicineName}</span>
                <span style={{ color:c.txtM,fontSize:11,marginLeft:8 }}>× {o.quantity}</span>
                {o.expectedDate && <span style={{ color:c.txtM,fontSize:11,marginLeft:8 }}>· {o.expectedDate}</span>}
                {o.cancellationReason && <p style={{ color:'#ef4444',fontSize:11,margin:'2px 0 0',fontStyle:'italic' }}>Reason: {o.cancellationReason}</p>}
                {o.emailSent && <span style={{ color:'#10b981',fontSize:10,marginLeft:8 }}>✅ Email sent</span>}
              </div>
              <span style={{ fontSize:11,fontWeight:700,padding:'2px 9px',borderRadius:18,flexShrink:0,
                background:o.status==='Received'?'rgba(16,185,129,0.15)':o.status==='Cancelled'?'rgba(239,68,68,0.15)':'rgba(245,158,11,0.15)',
                color:o.status==='Received'?'#10b981':o.status==='Cancelled'?'#ef4444':'#f59e0b' }}>{o.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MedicineSearch({ value, onChange, inp, c }) {
  const [query, setQuery] = useState(value || '');
  const [options, setOptions] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => { setQuery(value||''); }, [value]);
  useEffect(() => {
    if (query.length < 2) { setOptions([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`https://medimap-backend-ygqj.onrender.com/api/medicines/search?q=${encodeURIComponent(query)}&lat=28.4089&lng=77.3178`);
        const data = await res.json();
        if (data.medicine) {
          const names = [data.medicine.name,...(data.results||[]).map(r=>r.medicine?.name).filter(Boolean)].filter((v,i,a)=>v&&a.indexOf(v)===i).slice(0,8);
          setOptions(names);
        } else if (data.error) { setOptions([]); }
      } catch { setOptions([]); }
      setLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);
  return (
    <div style={{ position:'relative',gridColumn:'span 2' }}>
      <label style={{ color:c.txtM,fontSize:11,fontWeight:700,display:'block',marginBottom:5,letterSpacing:'0.04em' }}>MEDICINE NAME *</label>
      <input value={query} onChange={e=>{setQuery(e.target.value);onChange(e.target.value);setShow(true);}} onFocus={()=>setShow(true)} onBlur={()=>setTimeout(()=>setShow(false),200)} placeholder="Search medicine or type manually..." style={inp}/>
      {show && query.length >= 2 && (
        <div style={{ position:'absolute',top:'100%',left:0,right:0,background:c.modal||'#fff',border:`1px solid ${c.cardBd}`,borderRadius:10,zIndex:200,maxHeight:180,overflowY:'auto',boxShadow:'0 8px 24px rgba(0,0,0,0.18)',marginTop:3 }}>
          {loading && <p style={{ color:c.txtM,fontSize:12,padding:'8px 13px',margin:0 }}>Searching...</p>}
          {!loading&&!options.length&&<p style={{ color:c.txtM,fontSize:12,padding:'8px 13px',margin:0 }}>No matches — press Enter to use typed name</p>}
          {options.map((opt,i)=>(
            <div key={i} onMouseDown={()=>{onChange(opt);setQuery(opt);setShow(false);}} style={{ padding:'9px 13px',cursor:'pointer',fontSize:13,color:c.txt,borderBottom:`1px solid ${c.div}` }} onMouseEnter={e=>e.currentTarget.style.background=c.cardHov} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FrequencySelector({ frequency, typicalDate, onFreqChange, onDateChange, inp, c }) {
  const WEEK_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  return (<>
    <div>
      <label style={{ color:c.txtM,fontSize:11,fontWeight:700,display:'block',marginBottom:5,letterSpacing:'0.04em' }}>FREQUENCY</label>
      <select value={frequency} onChange={e=>onFreqChange(e.target.value)} style={inp}>
        <option value="daily">Daily</option><option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option><option value="as_needed">As Needed</option>
      </select>
    </div>
    <div>
      {frequency==='weekly'?(<>
        <label style={{ color:c.txtM,fontSize:11,fontWeight:700,display:'block',marginBottom:5,letterSpacing:'0.04em' }}>DAY OF WEEK</label>
        <select value={typicalDate} onChange={e=>onDateChange(e.target.value)} style={inp}>
          <option value="">— Select day —</option>
          {WEEK_DAYS.map((d,i)=><option key={d} value={i+1}>{d}</option>)}
        </select>
      </>):frequency==='monthly'?(<>
        <label style={{ color:c.txtM,fontSize:11,fontWeight:700,display:'block',marginBottom:5,letterSpacing:'0.04em' }}>DAY OF MONTH</label>
        <select value={typicalDate} onChange={e=>onDateChange(e.target.value)} style={inp}>
          <option value="">— Select day —</option>
          {Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={d}>Day {d}</option>)}
        </select>
      </>):(<>
        <label style={{ color:c.txtM,fontSize:11,fontWeight:700,display:'block',marginBottom:5,letterSpacing:'0.04em' }}>TYPICAL TIMING</label>
        <input value={typicalDate} onChange={e=>onDateChange(e.target.value)} placeholder="Optional" style={inp}/>
      </>)}
    </div>
  </>);
}

function PremiumGate({ feature, theme }) {
  const c = C(theme);
  const FEATURES = [
    {icon:'📊',title:'Sales Analytics',desc:'Monthly revenue charts, profit per medicine, avg bill value'},
    {icon:'💰',title:'Margin Analysis',desc:'See which medicines give the highest profit margin'},
    {icon:'🔮',title:'Expiry Alerts',desc:'30/15/7-day alerts before medicines expire'},
    {icon:'📉',title:'Slow-Moving Stock',desc:'Identify medicines sitting idle before they expire'},
    {icon:'📈',title:'Top Sellers',desc:'Best-performing medicines by revenue and quantity'},
    {icon:'🏭',title:'Supplier Management',desc:'Track distributors, place orders, get email confirmations'},
    {icon:'📋',title:'Purchase Requirements',desc:'Create buy lists and email any supplier in one click'},
    {icon:'👥',title:'Regular Customers',desc:'Track patient medication history with refill reminders'},
    {icon:'🔔',title:'Smart Alerts',desc:'Notified before a regular customer is due for medicine'},
  ];
  return (
    <div style={{ maxWidth:720,margin:'0 auto' }}>
      <div style={{ background:'linear-gradient(135deg,#10b981 0%,#059669 40%,#1B6EF3 100%)',borderRadius:22,padding:'32px 28px',textAlign:'center',marginBottom:22,position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',top:-20,right:-20,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,0.08)' }}/>
        <div style={{ position:'relative',zIndex:1 }}>
          <div style={{ fontSize:44,marginBottom:12 }}>✨</div>
          <h2 style={{ color:'white',fontFamily:'Sora,sans-serif',margin:'0 0 8px',fontSize:24,fontWeight:800 }}>Unlock Premium</h2>
          <p style={{ color:'rgba(255,255,255,0.8)',fontSize:14,margin:'0 0 22px',maxWidth:380,marginInline:'auto' }}>
            Get <b>{feature}</b> + all premium features
          </p>
          <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap' }}>
            {[['MONTHLY','₹299','₹299/month · cancel anytime'],['ANNUAL','₹2,999','₹250/mo · save 17%']].map(([n,p,sub],i)=>(
              <div key={n} style={{ background:i===1?'rgba(255,255,255,0.22)':'rgba(255,255,255,0.12)',backdropFilter:'blur(10px)',border:i===1?'2px solid white':'1px solid rgba(255,255,255,0.25)',borderRadius:16,padding:'16px 22px',minWidth:160,textAlign:'center',position:'relative' }}>
                {i===1&&<div style={{ position:'absolute',top:-11,left:'50%',transform:'translateX(-50%)',background:'#f59e0b',color:'white',fontSize:10,fontWeight:800,padding:'2px 10px',borderRadius:999,whiteSpace:'nowrap' }}>BEST VALUE</div>}
                <p style={{ color:'rgba(255,255,255,0.8)',fontSize:11,margin:'0 0 4px',fontWeight:700 }}>{n}</p>
                <p style={{ color:'white',fontSize:26,fontWeight:800,margin:'0 0 2px',fontFamily:'Sora,sans-serif' }}>{p}</p>
                <p style={{ color:'rgba(255,255,255,0.55)',fontSize:11,margin:'0 0 12px' }}>{sub}</p>
                <button onClick={()=>alert('Add RAZORPAY_KEY_ID to .env to activate')} style={{ width:'100%',padding:'8px',borderRadius:9,border:'none',background:'white',color:'#059669',fontWeight:700,cursor:'pointer',fontSize:13,fontFamily:'Sora,sans-serif' }}>Buy {n==='MONTHLY'?'Monthly':'Annual'}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 14px',fontSize:14,textAlign:'center' }}>Everything included</h3>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:9 }}>
        {FEATURES.map((f,i)=>(
          <div key={i} style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:13,padding:'13px 15px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:5 }}>
              <span style={{ fontSize:18 }}>{f.icon}</span>
              <p style={{ color:c.txt,fontWeight:700,margin:0,fontSize:13,fontFamily:'Sora,sans-serif' }}>{f.title}</p>
            </div>
            <p style={{ color:c.txtM,fontSize:12,margin:0,lineHeight:1.5 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return <div style={{ position:'fixed',top:20,right:24,zIndex:9999,padding:'12px 20px',borderRadius:14,fontWeight:600,fontSize:14,background:type==='error'?'#fef2f2':'#f0fdf4',color:type==='error'?'#dc2626':'#16a34a',border:`1px solid ${type==='error'?'#fecaca':'#bbf7d0'}`,boxShadow:'0 8px 32px rgba(0,0,0,0.15)',maxWidth:380 }}>{msg}</div>;
}

// ── Confirmation dialog ───────────────────────────────────────
function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText='Delete', confirmColor='#ef4444', children }) {
  if (!open) return null;
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div style={{ background:'#fff',borderRadius:20,padding:28,width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
        <h3 style={{ fontFamily:'Sora,sans-serif',margin:'0 0 10px',color:'#111827',fontSize:17 }}>{title}</h3>
        <p style={{ color:'#4b5563',fontSize:14,margin:'0 0 16px',lineHeight:1.6 }}>{message}</p>
        {children}
        <div style={{ display:'flex',gap:10,marginTop:16 }}>
          <button onClick={onConfirm} style={{ flex:1,padding:'11px',borderRadius:11,border:'none',background:confirmColor,color:'white',fontWeight:700,cursor:'pointer',fontSize:14 }}>{confirmText}</button>
          <button onClick={onCancel} style={{ flex:1,padding:'11px',borderRadius:11,border:'1px solid #e5e7eb',background:'#f9fafb',color:'#374151',cursor:'pointer',fontSize:14 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Notification panel ────────────────────────────────────────
function NotifPanel({ pharmacistId, theme }) {
  const c = C(theme);
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [responding, setResponding] = useState(null);
  const [notes, setNotes] = useState({});
  const ref = useRef(null);

  async function load() {
    if (!pharmacistId) return;
    try { const d = await fetch(`https://medimap-backend-ygqj.onrender.com/api/admin/pharmacist-notifications/${pharmacistId}`).then(r=>r.json()); setNotifs(d.notifications||[]); setUnread(d.unread||0); } catch {}
  }
  useEffect(() => { load(); const iv = setInterval(load, 15000); return () => clearInterval(iv); }, [pharmacistId]);
  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener('mousedown',h); return () => document.removeEventListener('mousedown',h); }, []);

  async function respond(nid, resp) {
    setResponding(nid);
    try {
      const d = await fetch(`https://medimap-backend-ygqj.onrender.com/api/admin/pharmacist-notifications/${pharmacistId}/${nid}/respond`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ pharmacistId, response:resp, note:notes[nid]||'' }) }).then(r=>r.json());
      if (d.error) throw new Error(d.error);
      load();
    } catch {}
    setResponding(null);
  }

  const ago = d => { if (!d) return ''; const s = Math.floor((Date.now()-new Date(d))/1000); if (s<60) return `${s}s ago`; if (s<3600) return `${Math.floor(s/60)}m ago`; return `${Math.floor(s/3600)}h ago`; };

  return (
    <div ref={ref} style={{ position:'fixed',top:16,right:20,zIndex:1100 }}>
      <button onClick={() => setOpen(!open)} style={{ position:'relative',width:40,height:40,borderRadius:11,border:`1px solid ${c.cardBd}`,background:c.card,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:c.txtS }}>
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        {unread > 0 && <span style={{ position:'absolute',top:-4,right:-4,minWidth:17,height:17,background:'#ef4444',color:'white',fontSize:10,fontWeight:800,borderRadius:999,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px',border:'2px solid #060D1F' }}>{unread>9?'9+':unread}</span>}
      </button>
      {open && (
        <div style={{ position:'absolute',top:48,right:0,width:390,maxWidth:'calc(100vw - 32px)',background:c.modal,border:`1px solid ${c.cardBd}`,borderRadius:18,boxShadow:'0 20px 60px rgba(0,0,0,0.25)',zIndex:1200,overflow:'hidden' }}>
          <div style={{ padding:'12px 18px',borderBottom:`1px solid ${c.div}`,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <span style={{ color:c.txt,fontWeight:700,fontFamily:'Sora,sans-serif',fontSize:15 }}>🔔 Price Requests</span>
            {unread>0 && <span style={{ background:'#ef4444',color:'white',fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:999 }}>{unread} new</span>}
          </div>
          <div style={{ maxHeight:440,overflowY:'auto' }}>
            {!notifs.length ? <div style={{ textAlign:'center',padding:40,color:c.txtM }}><div style={{ fontSize:32,marginBottom:8 }}>🔕</div>No requests</div> :
            notifs.map(n => (
              <div key={n.id} style={{ padding:'14px 18px',borderBottom:`1px solid ${c.div}`,background:n.isRead?'transparent':theme==='dark'?'rgba(27,110,243,0.04)':'rgba(27,110,243,0.02)' }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}>
                  <div><p style={{ color:c.txt,fontWeight:600,margin:0,fontSize:14 }}>{n.submissionData?.medicineName}</p><p style={{ color:c.txtM,fontSize:11,margin:'2px 0 0' }}>{ago(n.createdAt)} · {n.submissionData?.userName||'User'}</p></div>
                  {!n.isRead && <span style={{ width:8,height:8,borderRadius:'50%',background:'#3b82f6',flexShrink:0,marginTop:4 }}/>}
                </div>
                <div style={{ background:theme==='dark'?'rgba(0,0,0,0.2)':'#f9fafb',borderRadius:10,padding:'9px 13px',marginBottom:10,fontSize:13 }}>
                  <div style={{ display:'flex',justifyContent:'space-between' }}><span style={{ color:c.txtM }}>Price</span><span style={{ color:'#10b981',fontWeight:700 }}>₹{n.submissionData?.price}</span></div>
                  <div style={{ display:'flex',justifyContent:'space-between',marginTop:3 }}><span style={{ color:c.txtM }}>Pharmacy</span><span style={{ color:c.txtS }}>{n.submissionData?.pharmacyName}</span></div>
                </div>
                {n.submissionData?.imageUrl && <img src={n.submissionData.imageUrl} alt="bill" onClick={() => window.open(n.submissionData.imageUrl,'_blank')} onError={e=>e.target.style.display='none'} style={{ width:'100%',maxHeight:100,objectFit:'contain',borderRadius:8,marginBottom:8,cursor:'pointer',background:theme==='dark'?'rgba(0,0,0,0.2)':'#f3f4f6' }}/>}
                {n.pharmacistResponse ? (
                  <div style={{ padding:'7px 12px',borderRadius:8,fontSize:12,fontWeight:600,background:n.pharmacistResponse==='approved'?(theme==='dark'?'rgba(16,185,129,0.1)':'#ecfdf5'):(theme==='dark'?'rgba(239,68,68,0.1)':'#fef2f2'),color:n.pharmacistResponse==='approved'?'#10b981':'#ef4444' }}>
                    {n.pharmacistResponse==='approved'?'✅ Approved':'❌ Rejected'}
                  </div>
                ) : (
                  <div>
                    <textarea value={notes[n.id]||''} onChange={e=>setNotes(p=>({...p,[n.id]:e.target.value}))} placeholder="Optional note..." rows={2} style={{ width:'100%',background:theme==='dark'?'rgba(0,0,0,0.2)':'#f9fafb',border:`1px solid ${c.inpBd}`,borderRadius:8,padding:'6px 10px',color:c.txt,fontSize:12,resize:'none',outline:'none',marginBottom:8,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box' }}/>
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                      <button onClick={()=>respond(n.id,'approved')} disabled={responding===n.id} style={{ padding:'8px',borderRadius:9,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'white',fontWeight:700,cursor:'pointer',fontSize:12,opacity:responding===n.id?0.6:1 }}>✅ Approve</button>
                      <button onClick={()=>respond(n.id,'rejected')} disabled={responding===n.id} style={{ padding:'8px',borderRadius:9,border:'none',background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'white',fontWeight:700,cursor:'pointer',fontSize:12,opacity:responding===n.id?0.6:1 }}>❌ Reject</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ padding:'8px 16px',borderTop:`1px solid ${c.div}`,textAlign:'center' }}>
            <button onClick={load} style={{ background:'none',border:'none',color:'#10b981',fontSize:12,fontWeight:600,cursor:'pointer' }}>🔄 Refresh</button>
          </div>
        </div>
      )}
    </div>
  );
}

// POINT 1 — Login/Register screen
function LoginScreen({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', address:'', gstin:'', licenseNo:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!form.email || !form.password) { setError('Email and password required'); return; }
    setLoading(true); setError('');
    try {
      const d = await fetch(`${API}/${tab==='login'?'login':'register'}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) }).then(r=>r.json());
      if (d.error) throw new Error(d.error);
      localStorage.setItem('pharmacist_token', d.token);
      localStorage.setItem('pharmacist_info', JSON.stringify(d.pharmacist));
      onLogin(d.pharmacist);
    } catch(e) { setError(e.message); }
    setLoading(false);
  }

  const inp = { background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:12,padding:'12px 16px',color:'white',fontSize:14,outline:'none',width:'100%',boxSizing:'border-box',fontFamily:'DM Sans,sans-serif' };

  return (
    <div style={{ minHeight:'100vh',background:'linear-gradient(135deg,#060D1F 0%,#0B1628 60%,#0A2030 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,overflow:'hidden',position:'relative' }}>
      <div style={{ position:'absolute',top:'15%',left:'10%',width:280,height:280,borderRadius:'50%',background:'radial-gradient(circle,rgba(16,185,129,0.2),transparent)',filter:'blur(40px)' }}/>
      <div style={{ position:'absolute',bottom:'20%',right:'10%',width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(27,110,243,0.18),transparent)',filter:'blur(30px)' }}/>
      <div style={{ width:'100%',maxWidth:480,position:'relative',zIndex:10 }}>
        <div style={{ textAlign:'center',marginBottom:28 }}>
          <div style={{ width:68,height:68,borderRadius:22,background:'linear-gradient(135deg,#10b981,#059669)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,margin:'0 auto 14px',boxShadow:'0 8px 32px rgba(16,185,129,0.4)' }}>🏥</div>
          <h1 style={{ fontFamily:'Sora,sans-serif',fontSize:26,fontWeight:800,color:'white',margin:0 }}>Pharmacist Portal</h1>
          <p style={{ color:'rgba(255,255,255,0.4)',margin:'6px 0 0',fontSize:13 }}>MediMap — Pharmacy Management Dashboard</p>
        </div>
        <div style={{ background:'rgba(255,255,255,0.04)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:22,padding:28 }}>
          <div style={{ display:'flex',gap:8,marginBottom:22,background:'rgba(0,0,0,0.3)',padding:4,borderRadius:13 }}>
            {['login','register'].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{ flex:1,padding:'10px',borderRadius:10,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'Sora,sans-serif',background:tab===t?'white':'transparent',color:tab===t?'#111':'rgba(255,255,255,0.4)',transition:'all 0.2s' }}>
                {t==='login'?'🔑 Login':'✏️ Register'}
              </button>
            ))}
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:11 }}>
            {tab==='register' && (<>
              <input style={inp} placeholder="Pharmacy Name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
              <input style={inp} placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
              <input style={inp} placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:11 }}>
                <input style={inp} placeholder="GSTIN" value={form.gstin} onChange={e=>setForm({...form,gstin:e.target.value})}/>
                <input style={inp} placeholder="Drug License No" value={form.licenseNo} onChange={e=>setForm({...form,licenseNo:e.target.value})}/>
              </div>
            </>)}
            <input style={inp} type="email" placeholder="Email *" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
            <input style={inp} type="password" placeholder="Password *" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==='Enter'&&submit()}/>
          </div>
          {error && <div style={{ marginTop:10,background:'rgba(220,38,38,0.1)',border:'1px solid rgba(220,38,38,0.3)',color:'#fca5a5',padding:'10px 14px',borderRadius:9,fontSize:13 }}>{error}</div>}
          <button onClick={submit} disabled={loading} style={{ marginTop:14,width:'100%',padding:'13px',borderRadius:13,border:'none',cursor:'pointer',fontFamily:'Sora,sans-serif',fontWeight:700,fontSize:15,background:'linear-gradient(135deg,#10b981,#059669)',color:'white',boxShadow:'0 4px 20px rgba(16,185,129,0.4)',opacity:loading?0.7:1 }}>
            {loading?'Please wait...':tab==='login'?'🔑 Login to Dashboard':'✅ Create Account'}
          </button>
          <p style={{ textAlign:'center',fontSize:12,color:'rgba(255,255,255,0.2)',marginTop:12 }}>Demo: apollo@medimap.com / Apollo@123</p>
        </div>
        <div style={{ textAlign:'center',marginTop:14 }}><Link to="/" style={{ color:'rgba(255,255,255,0.3)',fontSize:13,textDecoration:'none' }}>← Back to MediMap</Link></div>
      </div>
    </div>
  );
}

const TABS = [
  { id:'overview',icon:'⚡',label:'Overview' },
  { id:'stock',icon:'📦',label:'Stock' },
  { id:'billing',icon:'🧾',label:'Billing' },
  { id:'analytics',icon:'📊',label:'Analytics',premium:true },
  { id:'suppliers',icon:'🏭',label:'Suppliers',premium:true },
  { id:'requirements',icon:'📋',label:'Requirements',premium:true },
  { id:'customers',icon:'👥',label:'Customers',premium:true },
  { id:'profile',icon:'⚙️',label:'Profile' },
];

function SC({ icon,label,value,gradient,glow }) {
  return (
    <div style={{ background:gradient,borderRadius:18,padding:18,color:'white',boxShadow:glow,position:'relative',overflow:'hidden' }}>
      <div style={{ position:'absolute',top:-8,right:-8,width:60,height:60,borderRadius:'50%',background:'rgba(255,255,255,0.08)' }}/>
      <div style={{ fontSize:24,marginBottom:6 }}>{icon}</div>
      <div style={{ fontSize:22,fontWeight:800,fontFamily:'Sora,sans-serif',lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11,opacity:0.7,marginTop:3,fontWeight:500 }}>{label}</div>
    </div>
  );
}

// ════════ OVERVIEW ════════════════════════════════════════════
function OverviewTab({ pharmacist, isPremium, theme }) {
  const c = C(theme);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [bills, setBills] = useState([]);
  useEffect(() => {
    Promise.all([
      fetch(`${API}/stock`,{headers:authH()}).then(r=>r.json()),
      fetch(`${API}/bills`,{headers:authH()}).then(r=>r.json()),
    ]).then(([s,b]) => {
      const stock = s.stock||[]; const bl = b.bills||[];
      const today = new Date().toDateString();
      const tb = bl.filter(x=>new Date(x.createdAt).toDateString()===today);
      setStats({ totalStock:stock.length, lowStock:stock.filter(x=>x.units<=(x.minStock||10)&&x.units>0).length, outOfStock:stock.filter(x=>x.units===0).length, todayRevenue:tb.reduce((s,x)=>s+x.grandTotal,0).toFixed(0), todayBills:tb.length, totalRevenue:bl.reduce((s,x)=>s+x.grandTotal,0).toFixed(0), totalBills:bl.length });
      setBills(bl.slice(0,5));
    }).catch(()=>{});
    if (isPremium) fetch(`${API}/customers/alerts?days=3`,{headers:authH()}).then(r=>r.json()).then(d=>setAlerts(d.alerts||[])).catch(()=>{});
  }, []);
  return (
    <div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(148px,1fr))',gap:14,marginBottom:22 }}>
        <SC icon="💰" label="Today Revenue" value={`₹${stats?.todayRevenue||0}`} gradient="linear-gradient(135deg,#10b981,#059669)" glow="0 4px 20px rgba(16,185,129,0.3)"/>
        <SC icon="🧾" label="Today Bills" value={stats?.todayBills||0} gradient="linear-gradient(135deg,#1B6EF3,#0ea5e9)" glow="0 4px 20px rgba(27,110,243,0.3)"/>
        <SC icon="📦" label="Stock Items" value={stats?.totalStock||0} gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)" glow="0 4px 20px rgba(139,92,246,0.3)"/>
        <SC icon="⚠️" label="Low Stock" value={stats?.lowStock||0} gradient="linear-gradient(135deg,#f59e0b,#d97706)" glow="0 4px 20px rgba(245,158,11,0.3)"/>
        <SC icon="❌" label="Out of Stock" value={stats?.outOfStock||0} gradient="linear-gradient(135deg,#ef4444,#dc2626)" glow="0 4px 20px rgba(239,68,68,0.3)"/>
        <SC icon="📈" label="Total Revenue" value={`₹${stats?.totalRevenue||0}`} gradient="linear-gradient(135deg,#06b6d4,#0891b2)" glow="0 4px 20px rgba(6,182,212,0.3)"/>
      </div>
      {isPremium && alerts.length > 0 && (
        <div style={{ background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:18,padding:18,marginBottom:18 }}>
          <h3 style={{ color:'#fca5a5',fontFamily:'Sora,sans-serif',margin:'0 0 12px',fontSize:14 }}>🔔 Upcoming Customers (3 Days)</h3>
          {alerts.map((a,i) => (
            <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(0,0,0,0.12)',borderRadius:10,padding:'9px 14px',marginBottom:6 }}>
              <div><p style={{ color:c.txt,fontWeight:600,margin:0,fontSize:13 }}>{a.customerName}</p><p style={{ color:c.txtM,fontSize:11,margin:'1px 0 0' }}>{a.medicineName} ×{a.quantity} · {a.customerPhone}</p></div>
              <span style={{ padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:800,background:a.daysFromNow===0?'#ef4444':a.daysFromNow===1?'#f59e0b':'#1B6EF3',color:'white' }}>{a.urgency==='today'?'TODAY':a.urgency==='tomorrow'?'TOMORROW':a.urgency}</span>
            </div>
          ))}
        </div>
      )}
      {bills.length > 0 && (
        <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:18 }}>
          <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 12px',fontSize:14 }}>🧾 Recent Bills</h3>
          {bills.map((b,i) => (
            <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:i<bills.length-1?`1px solid ${c.div}`:'none' }}>
              <div><p style={{ color:c.txt,fontWeight:600,margin:0,fontSize:13 }}>{b.billNumber||b.id} — {b.customerName}</p><p style={{ color:c.txtM,fontSize:11,margin:'1px 0 0' }}>{new Date(b.createdAt).toLocaleString('en-IN')} · {b.paymentMode}</p></div>
              <span style={{ color:'#10b981',fontWeight:800,fontFamily:'Sora,sans-serif' }}>₹{b.grandTotal}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════ STOCK ════════════════════════════════════════════════
function StockTab({ toast, theme }) {
  const c = C(theme);
  const [stock, setStock] = useState([]);
  const [stats, setStats] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [showOCR, setShowOCR] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(eForm);

  const inp = { background:c.inp,border:`1px solid ${c.inpBd}`,borderRadius:10,padding:'9px 13px',color:c.txt,fontSize:13,outline:'none',width:'100%',boxSizing:'border-box',fontFamily:'DM Sans,sans-serif' };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetch(`${API}/stock`,{headers:authH()}).then(r=>r.json());
      setStock((d.stock||[]).map(s=>({...s,id:s._id||s.id})));
      setStats({ low:d.lowStock?.length||0, out:d.outOfStock?.length||0, total:d.totalItems||0, value:+(d.totalValue||0).toFixed(0) });
    } catch(e) { toast(e.message,'error'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); fetch(`${API}/suppliers`,{headers:authH()}).then(r=>r.json()).then(d=>setSuppliers(Array.isArray(d)?d:[])).catch(()=>{}); }, [load]);

  async function save() {
    if (!form.medicineName.trim()) return toast('Medicine name required','error');
    if (!form.sellingPrice) return toast('Selling price required','error');
    if (form.units === '') return toast('Units required','error');
    setSaving(true);
    try {
      const url = editing ? `${API}/stock/${editing}` : `${API}/stock`;
      const d = await fetch(url, { method:editing?'PATCH':'POST', headers:authH(), body:JSON.stringify({ ...form, purchasePrice:parseFloat(form.purchasePrice)||0, sellingPrice:parseFloat(form.sellingPrice), units:parseInt(form.units), minStock:parseInt(form.minStock)||10, gstRate:parseFloat(form.gstRate)||12 }) }).then(r=>r.json());
      if (d.error) throw new Error(d.error);
      toast(editing?'✅ Stock updated!':'✅ Added! Visible to customers.');
      setShowAdd(false); setEditing(null); setForm(eForm); load();
    } catch(e) { toast(e.message,'error'); }
    setSaving(false);
  }

  async function del(id) {
    if (!confirm('Delete this medicine from stock?')) return;
    try { const d = await fetch(`${API}/stock/${id}`,{method:'DELETE',headers:authH()}).then(r=>r.json()); if(d.error) throw new Error(d.error); toast('Deleted'); load(); }
    catch(e) { toast(e.message,'error'); }
  }

  const filtered = stock.filter(s=>s.medicineName?.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>sort==='units'?(a.units-b.units):sort==='price'?(b.sellingPrice-a.sellingPrice):(a.medicineName||'').localeCompare(b.medicineName||''));
  const margin = s => s.purchasePrice>0?(((s.sellingPrice-s.purchasePrice)/s.purchasePrice)*100).toFixed(0):'-';

  return (
    <div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:11,marginBottom:18 }}>
        {[{icon:'📦',l:'Total',v:stats.total||0},{icon:'⚠️',l:'Low',v:stats.low||0},{icon:'❌',l:'Out',v:stats.out||0},{icon:'💰',l:'Value',v:`₹${stats.value||0}`}].map(s=>(
          <div key={s.l} style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:14,padding:14 }}>
            <div style={{ fontSize:20,marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontSize:18,fontWeight:800,color:c.txt,fontFamily:'Sora,sans-serif' }}>{s.v}</div>
            <div style={{ fontSize:11,color:c.txtM,marginTop:1 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <button onClick={()=>{setShowOCR(!showOCR);setShowAdd(false);setEditing(null);}} style={{ width:'100%',padding:'12px',borderRadius:13,border:`2px dashed ${showOCR?'#10b981':'rgba(16,185,129,0.3)'}`,background:showOCR?'rgba(16,185,129,0.07)':'transparent',color:'#10b981',fontWeight:700,fontSize:14,cursor:'pointer',marginBottom:11,fontFamily:'Sora,sans-serif',transition:'all 0.2s' }}>
        📄 {showOCR?'Hide OCR':'Scan Purchase Bill → Auto-fill Stock (OCR)'}
      </button>
      {showOCR && <StockOCR onStockAdded={()=>{load();setShowOCR(false);}} toast={toast}/>}

      <div style={{ display:'flex',gap:10,marginBottom:14 }}>
        <input placeholder="🔍 Search stock..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inp,flex:1 }}/>
        <select value={sort} onChange={e=>setSort(e.target.value)} style={{ ...inp,width:130 }}>
          <option value="name">Sort: Name</option>
          <option value="units">Sort: Units ↑</option>
          <option value="price">Sort: Price ↓</option>
        </select>
        <button onClick={()=>{setShowAdd(!showAdd);setEditing(null);setForm(eForm);setShowOCR(false);}} style={{ padding:'9px 18px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'white',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',fontSize:14 }}>+ Add</button>
      </div>

      {showAdd && (
        <div style={{ background:theme==='dark'?'rgba(16,185,129,0.05)':'#f0fdf4',border:`1px solid ${theme==='dark'?'rgba(16,185,129,0.2)':'#bbf7d0'}`,borderRadius:18,padding:18,marginBottom:18 }}>
          <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 14px',fontSize:15 }}>{editing?'✏️ Edit':'+ New Medicine'}</h3>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:9 }}>
            <input placeholder="Medicine Name *" value={form.medicineName} onChange={e=>setForm({...form,medicineName:e.target.value})} style={{ ...inp,gridColumn:'span 2' }}/>
            <input placeholder="Generic Name" value={form.genericName} onChange={e=>setForm({...form,genericName:e.target.value})} style={inp}/>
            <input placeholder="Manufacturer" value={form.manufacturer} onChange={e=>setForm({...form,manufacturer:e.target.value})} style={inp}/>
            <input placeholder="Batch No" value={form.batchNo} onChange={e=>setForm({...form,batchNo:e.target.value})} style={inp}/>
            <input placeholder="Expiry (YYYY-MM)" value={form.expiryDate} onChange={e=>setForm({...form,expiryDate:e.target.value})} style={inp}/>
            <input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inp}/>
            <select value={form.gstRate} onChange={e=>setForm({...form,gstRate:e.target.value})} style={inp}>
              <option value="0">GST 0%</option><option value="5">GST 5%</option><option value="12">GST 12%</option><option value="18">GST 18%</option>
            </select>
            <div style={{ position:'relative' }}><span style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:c.txtM,fontSize:12 }}>₹</span><input placeholder="Purchase Price" inputMode="decimal" value={form.purchasePrice} onChange={e=>setForm({...form,purchasePrice:e.target.value})} style={{ ...inp,paddingLeft:26 }}/></div>
            <div style={{ position:'relative' }}><span style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:c.txtM,fontSize:12 }}>₹</span><input placeholder="Selling Price *" inputMode="decimal" value={form.sellingPrice} onChange={e=>setForm({...form,sellingPrice:e.target.value})} style={{ ...inp,paddingLeft:26 }}/></div>
            <input placeholder="Units *" inputMode="numeric" value={form.units} onChange={e=>setForm({...form,units:e.target.value.replace(/\D/g,'')})} style={inp}/>
            <input placeholder="Min Stock Alert (10)" inputMode="numeric" value={form.minStock} onChange={e=>setForm({...form,minStock:e.target.value.replace(/\D/g,'')})} style={inp}/>
            {/* POINT 4 — Supplier tagging on manual add */}
            <div style={{ gridColumn:'span 2' }}>
              <p style={{ color:c.txtM,fontSize:11,fontWeight:700,margin:'0 0 6px',letterSpacing:'0.04em' }}>🏭 SUPPLIER TAG</p>
              <select value={form.supplierId} onChange={e=>{ const s=suppliers.find(x=>x._id===e.target.value); setForm({...form,supplierId:e.target.value,supplierName:s?.name||''}); }} style={inp}>
                <option value="">— No supplier tagging —</option>
                {suppliers.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              {form.supplierId && <p style={{ color:'#10b981',fontSize:11,margin:'4px 0 0' }}>✅ Tagged: {form.supplierName}</p>}
            </div>
          </div>
          {form.purchasePrice && form.sellingPrice && parseFloat(form.purchasePrice)>0 && (
            <div style={{ marginTop:8,background:theme==='dark'?'rgba(16,185,129,0.08)':'#dcfce7',border:`1px solid ${theme==='dark'?'rgba(16,185,129,0.2)':'#bbf7d0'}`,borderRadius:9,padding:'7px 13px',color:'#10b981',fontSize:13,fontWeight:600 }}>
              Margin: {(((parseFloat(form.sellingPrice)-parseFloat(form.purchasePrice))/parseFloat(form.purchasePrice))*100).toFixed(1)}%
            </div>
          )}
          <div style={{ display:'flex',gap:9,marginTop:13 }}>
            <button onClick={save} disabled={saving} style={{ flex:1,padding:'11px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'white',fontWeight:700,cursor:'pointer',fontSize:14,opacity:saving?0.7:1 }}>{saving?'Saving...':(editing?'💾 Update':'✅ Add to Stock')}</button>
            <button onClick={()=>{setShowAdd(false);setEditing(null);setForm(eForm);}} style={{ flex:1,padding:'11px',borderRadius:11,border:`1px solid ${c.inpBd}`,background:c.secBg,color:c.secClr,cursor:'pointer',fontSize:14 }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div style={{ textAlign:'center',padding:40,color:c.txtM }}>Loading stock...</div> : (
        <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%',borderCollapse:'collapse',fontSize:13 }}>
              <thead><tr style={{ borderBottom:`1px solid ${c.tblBd}`,background:theme==='dark'?'rgba(0,0,0,0.15)':'rgba(0,0,0,0.02)' }}>
                {['Medicine','Batch','Expiry','Buy ₹','Sell ₹','Margin','Qty','Supplier','Status',''].map(h=><th key={h} style={{ padding:'11px 13px',textAlign:'left',fontSize:11,fontWeight:700,color:c.txtM,letterSpacing:'0.04em',whiteSpace:'nowrap' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(s => {
                  const id=s._id||s.id, m=margin(s), isLow=s.units<=(s.minStock||10)&&s.units>0;
                  return (
                    <tr key={id} style={{ borderBottom:`1px solid ${c.tblBd}` }} onMouseEnter={e=>e.currentTarget.style.background=c.tblHov} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'10px 13px' }}><p style={{ color:c.txt,fontWeight:600,margin:0 }}>{s.medicineName}</p>{s.genericName&&<p style={{ color:c.txtM,fontSize:11,margin:'1px 0 0' }}>{s.genericName}</p>}</td>
                      <td style={{ padding:'10px 13px',color:c.txtS,fontSize:12 }}>{s.batchNo||'—'}</td>
                      <td style={{ padding:'10px 13px',color:s.expiryDate&&new Date(s.expiryDate)<new Date(Date.now()+30*86400000)?'#ef4444':c.txtS,fontSize:12 }}>{s.expiryDate||'—'}</td>
                      <td style={{ padding:'10px 13px',color:c.txtS,fontSize:12 }}>₹{s.purchasePrice||0}</td>
                      <td style={{ padding:'10px 13px',color:c.txt,fontWeight:600 }}>₹{s.sellingPrice}</td>
                      <td style={{ padding:'10px 13px',color:'#10b981',fontWeight:700 }}>{m==='—'?'—':`${m}%`}</td>
                      <td style={{ padding:'10px 13px',color:c.txt,fontWeight:700 }}>{s.units}</td>
                      <td style={{ padding:'10px 13px' }}>{s.supplierName?<span style={{ fontSize:11,background:theme==='dark'?'rgba(27,110,243,0.15)':'#dbeafe',color:'#3b82f6',padding:'2px 8px',borderRadius:20,fontWeight:600 }}>{s.supplierName}</span>:<span style={{ color:c.txtM,fontSize:11 }}>—</span>}</td>
                      <td style={{ padding:'10px 13px' }}><span style={{ padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:700,background:s.units===0?(theme==='dark'?'rgba(239,68,68,0.15)':'#fef2f2'):isLow?(theme==='dark'?'rgba(245,158,11,0.15)':'#fffbeb'):(theme==='dark'?'rgba(16,185,129,0.15)':'#f0fdf4'),color:s.units===0?'#ef4444':isLow?'#f59e0b':'#10b981' }}>{s.units===0?'Out':isLow?'Low':'OK'}</span></td>
                      <td style={{ padding:'10px 13px' }}>
                        <div style={{ display:'flex',gap:8 }}>
                          <button onClick={()=>{ setEditing(id); setForm({ medicineName:s.medicineName||'',genericName:s.genericName||'',manufacturer:s.manufacturer||'',batchNo:s.batchNo||'',expiryDate:s.expiryDate||'',purchasePrice:String(s.purchasePrice||''),sellingPrice:String(s.sellingPrice||''),units:String(s.units||''),minStock:String(s.minStock||'10'),category:s.category||'',gstRate:String(s.gstRate||'12'),supplierId:s.supplierId||'',supplierName:s.supplierName||'' }); setShowAdd(true); setShowOCR(false); }} style={{ fontSize:12,color:'#3b82f6',background:'none',border:'none',cursor:'pointer',fontWeight:600,padding:0 }}>Edit</button>
                          <button onClick={()=>del(id)} style={{ fontSize:12,color:'#ef4444',background:'none',border:'none',cursor:'pointer',fontWeight:600,padding:0 }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!filtered.length && <div style={{ textAlign:'center',padding:40,color:c.txtM }}><div style={{ fontSize:32,marginBottom:8 }}>📦</div>No stock. Scan bill or add manually!</div>}
          </div>
          {filtered.length > 0 && <div style={{ padding:'9px 16px',borderTop:`1px solid ${c.tblBd}`,display:'flex',justifyContent:'space-between' }}><span style={{ color:c.txtM,fontSize:12 }}>{filtered.length} items · ₹{stats.value||0}</span><button onClick={load} style={{ fontSize:12,color:'#3b82f6',background:'none',border:'none',cursor:'pointer',fontWeight:600 }}>🔄 Refresh</button></div>}
        </div>
      )}
    </div>
  );
}

// PART 2 — Billing, Analytics, Suppliers, Requirements, Customers, Profile, Main
// ════════ BILLING ══════════════════════════════════════════════
function BillingTab({ pharmacist, toast, theme }) {
  const c = C(theme);
  const inp = { background:c.inp,border:`1px solid ${c.inpBd}`,borderRadius:10,padding:'9px 13px',color:c.txt,fontSize:13,outline:'none',width:'100%',boxSizing:'border-box',fontFamily:'DM Sans,sans-serif' };
  const [stock, setStock] = useState([]);
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState({ name:'', phone:'', email:'', address:'' });
  const [discount, setDiscount] = useState(0);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDisc, setCouponDisc] = useState(0);
  const [couponErr, setCouponErr] = useState('');
  const [payMode, setPayMode] = useState('Cash');
  const [bill, setBill] = useState(null);
  const [bills, setBills] = useState([]);
  const [sSearch, setSSearch] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ medicineName:'', price:'', quantity:'1' });
  const [generating, setGenerating] = useState(false);
  // POINT 2 — delete bill confirm
  const [delBill, setDelBill] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`${API}/stock`,{headers:authH()}).then(r=>r.json()).then(d=>setStock((d.stock||[]).map(s=>({...s,id:s._id||s.id}))));
    fetch(`${API}/bills`,{headers:authH()}).then(r=>r.json()).then(d=>setBills(d.bills||[]));
    if (pharmacist?.isPremium) fetch(`${API}/customers`,{headers:authH()}).then(r=>r.json()).then(d=>setCustomers(Array.isArray(d)?d:[])).catch(()=>{});
  }, []);

  function addItem(s) {
    const id=s._id||s.id;
    if (items.find(i=>i.stockId===id)) { setItems(items.map(i=>i.stockId===id?{...i,quantity:i.quantity+1}:i)); return; }
    setItems([...items,{stockId:id,medicineName:s.medicineName,price:s.sellingPrice,quantity:1,maxUnits:s.units,gstRate:s.gstRate||12,batchNo:s.batchNo||'-',isManual:false}]);
  }
  function addManual() {
    if (!manual.medicineName.trim()||!manual.price) return;
    setItems([...items,{stockId:`m_${Date.now()}`,medicineName:manual.medicineName,price:parseFloat(manual.price),quantity:parseInt(manual.quantity)||1,maxUnits:9999,gstRate:12,batchNo:'-',isManual:true}]);
    setManual({medicineName:'',price:'',quantity:'1'}); setShowManual(false);
  }
  async function validateCoupon() {
    setCouponErr('');
    try { const d=await fetch('https://medimap-backend-ygqj.onrender.com/api/points/validate-coupon',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:coupon.trim().toUpperCase()})}).then(r=>r.json()); if(d.error){setCouponErr(d.error);return;} setCouponDisc(d.discount); setCouponApplied(true); toast(`🎉 ${d.discount}% coupon applied!`); } catch { setCouponErr('Could not validate'); }
  }
  const sub = items.reduce((s,i)=>s+i.price*i.quantity,0);
  const coupAmt = couponApplied?(sub*couponDisc)/100:0;
  const discAmt = (sub*discount)/100;
  const grand = sub-coupAmt-discAmt;

  async function generate() {
    if (!items.length) return toast('Add medicines first','error');
    setGenerating(true);
    try {
      const d = await fetch(`${API}/bill`,{method:'POST',headers:authH(),body:JSON.stringify({ customerName:customer.name||'Walk-in', customerPhone:customer.phone, customerEmail:customer.email, customerAddress:customer.address, items, discount:discount+couponDisc, paymentMode:payMode, couponCode:couponApplied?coupon:null })}).then(r=>r.json());
      if(d.error) throw new Error(d.error);
      if (couponApplied&&coupon) await fetch('https://medimap-backend-ygqj.onrender.com/api/points/use-coupon',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:coupon.trim().toUpperCase()})});
      setBill(d); setBills(p=>[d,...p]); toast('✅ Bill saved to database!');
    } catch(e) { toast(e.message,'error'); }
    setGenerating(false);
  }

  // POINT 2 — Delete bill from DB
  async function confirmDeleteBill() {
    if (!delBill) return;
    setDeleting(true);
    try {
      const bn = delBill.billNumber || delBill.id;
      const d = await fetch(`${API}/bill/${bn}`,{method:'DELETE',headers:authH()}).then(r=>r.json());
      if(d.error) throw new Error(d.error);
      setBills(p => p.filter(b => (b.billNumber||b.id) !== bn));
      if (bill && (bill.billNumber||bill.id) === bn) setBill(null);
      toast('🗑️ Bill deleted from database');
    } catch(e) { toast(e.message,'error'); }
    setDelBill(null); setDeleting(false);
  }

  function printBill(b) {
    const id = b.billNumber||b.id;
    const w = window.open('','_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>${id}</title><style>body{font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px}th{background:#f5f5f5}@media print{.np{display:none}}</style></head><body><div style="text-align:center;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:10px"><b style="font-size:16px">${b.pharmacyName}</b><br><small>${b.pharmacyAddress||''}</small></div><div style="display:flex;justify-content:space-between;margin-bottom:10px"><div><b>Bill:</b> ${id}<br><b>Date:</b> ${new Date(b.createdAt).toLocaleString('en-IN')}</div><div><b>Patient:</b> ${b.customerName}</div></div><table><thead><tr><th>#</th><th>Medicine</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead><tbody>${b.items.map((it,i)=>`<tr><td>${i+1}</td><td>${it.medicineName}</td><td>${it.quantity}</td><td>₹${it.unitPrice}</td><td>₹${it.total}</td></tr>`).join('')}</tbody></table><div style="text-align:right;margin-top:8px"><b>Total: ₹${b.grandTotal}</b> | ${b.paymentMode}</div><button class="np" onclick="window.print()" style="margin-top:10px;padding:8px 20px;background:#1B6EF3;color:white;border:none;border-radius:6px;cursor:pointer">🖨️ Print</button></body></html>`);
    w.document.close();
  }
  function whatsApp(b) {
    const phone = (customer.phone||b.customerPhone||'').replace(/\D/g,'');
    if (!phone) return toast('Enter customer phone','error');
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(`*${b.pharmacyName}*\nBill: ${b.billNumber||b.id}\n\n${b.items.map(i=>`${i.medicineName} ×${i.quantity} = ₹${i.total}`).join('\n')}\n\n*Total: ₹${b.grandTotal}* | ${b.paymentMode}\n\nThank you! 💊`)}`,'_blank');
  }
  function email(b) {
    const em = customer.email||b.customerEmail;
    if (!em) return toast('Enter customer email','error');
    window.open(`mailto:${em}?subject=Bill ${b.billNumber||b.id}&body=${encodeURIComponent(`Dear ${b.customerName},\n\n${b.items.map(i=>`${i.medicineName} x${i.quantity} = ₹${i.total}`).join('\n')}\n\nTotal: ₹${b.grandTotal}\n\nThank you!`)}`,'_blank');
  }

  const filtStock = stock.filter(s=>s.units>0&&s.medicineName?.toLowerCase().includes(sSearch.toLowerCase()));

  return (
    <div>
      {/* POINT 2 — Delete confirm dialog */}
      <ConfirmDialog open={!!delBill} title="🗑️ Delete Bill" message={`Delete bill ${delBill?.billNumber||delBill?.id} for ₹${delBill?.grandTotal}? This cannot be undone.`} onConfirm={confirmDeleteBill} onCancel={()=>setDelBill(null)} confirmText={deleting?'Deleting...':"Yes, Delete"} confirmColor="#ef4444"/>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:18 }}>
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          {/* Customer */}
          <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:18 }}>
            <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 12px',fontSize:15 }}>👤 Customer</h3>
            {customers.length>0 && <select onChange={e=>{const x=customers.find(x=>x._id===e.target.value);if(x)setCustomer({name:x.name,phone:x.phone||'',email:x.email||'',address:x.address||''});}} style={{ ...inp,marginBottom:9 }}><option value="">— Regular Customer —</option>{customers.map(x=><option key={x._id} value={x._id}>{x.name} ({x.phone||'—'})</option>)}</select>}
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
              <input placeholder="Name" value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} style={inp}/>
              <input placeholder="📱 Phone (WhatsApp)" value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} style={inp}/>
              <input placeholder="📧 Email" type="email" value={customer.email} onChange={e=>setCustomer({...customer,email:e.target.value})} style={inp}/>
              <input placeholder="Address" value={customer.address} onChange={e=>setCustomer({...customer,address:e.target.value})} style={inp}/>
            </div>
          </div>
          {/* Add medicines */}
          <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:18 }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:11 }}>
              <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:0,fontSize:15 }}>💊 Add Medicines</h3>
              <button onClick={()=>setShowManual(!showManual)} style={{ fontSize:11,background:theme==='dark'?'rgba(139,92,246,0.15)':'#ede9fe',border:`1px solid ${theme==='dark'?'rgba(139,92,246,0.3)':'#c4b5fd'}`,color:'#8b5cf6',padding:'4px 11px',borderRadius:7,cursor:'pointer',fontWeight:600 }}>+ Manual</button>
            </div>
            {showManual && <div style={{ background:theme==='dark'?'rgba(139,92,246,0.08)':'#faf5ff',border:`1px solid ${theme==='dark'?'rgba(139,92,246,0.2)':'#e9d5ff'}`,borderRadius:11,padding:11,marginBottom:11 }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 70px 70px 44px',gap:7 }}>
                <input placeholder="Medicine *" value={manual.medicineName} onChange={e=>setManual({...manual,medicineName:e.target.value})} style={inp}/>
                <input placeholder="₹" inputMode="decimal" value={manual.price} onChange={e=>setManual({...manual,price:e.target.value})} style={inp}/>
                <input placeholder="Qty" inputMode="numeric" value={manual.quantity} onChange={e=>setManual({...manual,quantity:e.target.value})} style={inp}/>
                <button onClick={addManual} style={{ background:'#8b5cf6',border:'none',borderRadius:9,color:'white',cursor:'pointer',fontSize:14,fontWeight:700 }}>+</button>
              </div>
            </div>}
            <input placeholder="Search stock..." value={sSearch} onChange={e=>setSSearch(e.target.value)} style={{ ...inp,marginBottom:9 }}/>
            <div style={{ maxHeight:160,overflowY:'auto' }}>
              {filtStock.map(s=>(
                <div key={s.id} onClick={()=>addItem(s)} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 11px',borderRadius:9,cursor:'pointer',transition:'background 0.15s' }} onMouseEnter={e=>e.currentTarget.style.background=c.cardHov} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div><p style={{ color:c.txt,fontWeight:500,margin:0,fontSize:13 }}>{s.medicineName}</p><p style={{ color:c.txtM,fontSize:11,margin:0 }}>₹{s.sellingPrice} · {s.units} left</p></div>
                  <span style={{ background:theme==='dark'?'rgba(27,110,243,0.2)':'#dbeafe',color:'#3b82f6',padding:'3px 11px',borderRadius:20,fontSize:12,fontWeight:600 }}>+ Add</span>
                </div>
              ))}
              {!stock.length && <p style={{ color:c.txtM,fontSize:12,textAlign:'center',padding:18 }}>Add stock first</p>}
            </div>
          </div>
        </div>

        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          {items.length > 0 && (
            <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:18 }}>
              <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 12px',fontSize:15 }}>🧾 Bill Items</h3>
              {items.map(it=>(
                <div key={it.stockId} style={{ display:'flex',alignItems:'center',gap:7,padding:'7px 0',borderBottom:`1px solid ${c.div}` }}>
                  <div style={{ flex:1 }}><p style={{ color:c.txt,fontWeight:500,margin:0,fontSize:13 }}>{it.medicineName}</p>{it.isManual&&<span style={{ fontSize:10,color:'#8b5cf6' }}>manual</span>}</div>
                  <button onClick={()=>setItems(items.map(i=>i.stockId===it.stockId?{...i,quantity:Math.max(1,i.quantity-1)}:i))} style={{ width:24,height:24,borderRadius:6,border:`1px solid ${c.inpBd}`,background:c.inp,color:c.txt,cursor:'pointer',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center' }}>-</button>
                  <span style={{ color:c.txt,fontWeight:700,width:22,textAlign:'center',fontSize:13 }}>{it.quantity}</span>
                  <button onClick={()=>setItems(items.map(i=>i.stockId===it.stockId?{...i,quantity:Math.min(i.maxUnits,i.quantity+1)}:i))} style={{ width:24,height:24,borderRadius:6,border:`1px solid ${c.inpBd}`,background:c.inp,color:c.txt,cursor:'pointer',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center' }}>+</button>
                  <span style={{ color:c.txt,fontWeight:700,width:54,textAlign:'right',fontSize:13 }}>₹{(it.price*it.quantity).toFixed(0)}</span>
                  <button onClick={()=>setItems(items.filter(i=>i.stockId!==it.stockId))} style={{ color:'#ef4444',background:'none',border:'none',cursor:'pointer',fontSize:15,lineHeight:1 }}>✕</button>
                </div>
              ))}
              <div style={{ background:theme==='dark'?'rgba(27,110,243,0.07)':'#eff6ff',border:`1px solid ${theme==='dark'?'rgba(27,110,243,0.2)':'#bfdbfe'}`,borderRadius:11,padding:11,margin:'12px 0' }}>
                <p style={{ color:'#3b82f6',fontWeight:700,fontSize:12,margin:'0 0 7px' }}>🎟️ MediPoints Coupon</p>
                <div style={{ display:'flex',gap:7 }}>
                  <input placeholder="COUPON CODE" value={coupon} onChange={e=>{setCoupon(e.target.value.toUpperCase());setCouponApplied(false);setCouponDisc(0);setCouponErr('');}} disabled={couponApplied} style={{ ...inp,flex:1,fontFamily:'monospace',fontWeight:700 }}/>
                  <button onClick={validateCoupon} disabled={!coupon.trim()||couponApplied} style={{ padding:'0 13px',borderRadius:9,border:'none',background:couponApplied?'#10b981':'#1B6EF3',color:'white',cursor:'pointer',fontWeight:700,fontSize:13,opacity:!coupon.trim()||couponApplied?0.5:1 }}>{couponApplied?'✅':'Apply'}</button>
                </div>
                {couponErr && <p style={{ color:'#ef4444',fontSize:12,margin:'4px 0 0' }}>❌ {couponErr}</p>}
                {couponApplied && <p style={{ color:'#10b981',fontSize:12,margin:'4px 0 0',fontWeight:600 }}>🎉 {couponDisc}% off!</p>}
              </div>
              <div style={{ borderTop:`1px solid ${c.div}`,paddingTop:11 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:5,fontSize:13 }}><span style={{ color:c.txtM }}>Subtotal</span><span style={{ color:c.txt }}>₹{sub.toFixed(2)}</span></div>
                <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:5 }}>
                  <span style={{ color:c.txtM,fontSize:13 }}>Disc %</span>
                  <input type="number" value={discount} onChange={e=>setDiscount(Math.max(0,Math.min(100,Number(e.target.value))))} min="0" max="100" style={{ ...inp,width:54,textAlign:'center',padding:'5px 8px' }}/>
                </div>
                {couponApplied && <div style={{ display:'flex',justifyContent:'space-between',marginBottom:5,fontSize:13 }}><span style={{ color:'#3b82f6' }}>Coupon</span><span style={{ color:'#3b82f6' }}>-₹{coupAmt.toFixed(2)}</span></div>}
                <div style={{ display:'flex',justifyContent:'space-between',borderTop:`1px solid ${c.div}`,paddingTop:8,marginTop:4 }}>
                  <span style={{ color:c.txt,fontWeight:700,fontFamily:'Sora,sans-serif' }}>Total</span>
                  <span style={{ color:'#10b981',fontWeight:800,fontSize:18,fontFamily:'Sora,sans-serif' }}>₹{grand.toFixed(2)}</span>
                </div>
              </div>
              <div style={{ display:'flex',gap:7,margin:'12px 0' }}>
                {['Cash','Card','UPI','Credit'].map(m=><button key={m} onClick={()=>setPayMode(m)} style={{ flex:1,padding:'7px',borderRadius:9,border:'none',cursor:'pointer',fontWeight:600,fontSize:12,background:payMode===m?'#1B6EF3':c.inp,color:payMode===m?'white':c.txtS }}>{m}</button>)}
              </div>
              <button onClick={generate} disabled={generating} style={{ width:'100%',padding:'13px',borderRadius:13,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'white',fontWeight:700,cursor:'pointer',fontSize:14,fontFamily:'Sora,sans-serif',boxShadow:'0 4px 20px rgba(16,185,129,0.3)',opacity:generating?0.7:1 }}>{generating?'Generating...':'🧾 Generate GST Bill'}</button>
            </div>
          )}

          {bill ? (
            <div style={{ background:theme==='dark'?'rgba(16,185,129,0.06)':'#f0fdf4',border:`1px solid ${theme==='dark'?'rgba(16,185,129,0.2)':'#bbf7d0'}`,borderRadius:18,padding:18 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:13 }}>
                <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:0 }}>✅ {bill.billNumber||bill.id}</h3>
                <span style={{ color:'#10b981',fontWeight:800,fontSize:18,fontFamily:'Sora,sans-serif' }}>₹{bill.grandTotal}</span>
              </div>
              <div style={{ background:theme==='dark'?'rgba(0,0,0,0.15)':'#fff',borderRadius:12,padding:13,marginBottom:13,fontSize:12,maxHeight:140,overflowY:'auto',border:`1px solid ${c.cardBd}` }}>
                <p style={{ color:c.txt,fontWeight:700,margin:'0 0 3px' }}>{bill.pharmacyName}</p>
                <p style={{ color:c.txtM,margin:'0 0 7px',fontSize:11 }}>{bill.customerName} · {new Date(bill.createdAt).toLocaleString('en-IN')}</p>
                {bill.items.map((it,i)=><div key={i} style={{ display:'flex',justifyContent:'space-between',padding:'3px 0',borderBottom:`1px solid ${c.div}` }}><span style={{ color:c.txtS }}>{it.medicineName} ×{it.quantity}</span><span style={{ color:c.txt,fontWeight:600 }}>₹{it.total}</span></div>)}
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:7 }}>
                <button onClick={()=>printBill(bill)} style={{ padding:'10px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#1B6EF3,#00C2A8)',color:'white',fontWeight:700,cursor:'pointer',fontSize:12 }}>🖨️ Print</button>
                <button onClick={()=>whatsApp(bill)} style={{ padding:'10px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#25D366,#128C7E)',color:'white',fontWeight:700,cursor:'pointer',fontSize:12 }}>💬 WhatsApp</button>
              </div>
              <button onClick={()=>email(bill)} style={{ width:'100%',padding:'10px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#EA4335,#C62828)',color:'white',fontWeight:700,cursor:'pointer',fontSize:12,marginBottom:7 }}>📧 Email</button>
              <button onClick={()=>{setBill(null);setItems([]);setCustomer({name:'',phone:'',email:'',address:''});setDiscount(0);setCoupon('');setCouponApplied(false);setCouponDisc(0);}} style={{ width:'100%',padding:'9px',borderRadius:11,border:`1px solid ${c.inpBd}`,background:c.secBg,color:c.secClr,cursor:'pointer',fontSize:13 }}>New Bill</button>
            </div>
          ) : items.length===0 && (
            <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:36,textAlign:'center' }}>
              <div style={{ fontSize:40,marginBottom:10 }}>🧾</div>
              <p style={{ color:c.txtM,fontSize:14 }}>Add medicines to create a GST bill</p>
            </div>
          )}

          {/* Bills list with POINT 2 delete */}
          <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:18 }}>
            <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 13px',fontSize:15 }}>📋 Bills ({bills.length})</h3>
            <div style={{ maxHeight:280,overflowY:'auto' }}>
              {bills.slice(0,20).map((b,i)=>(
                <div key={i} style={{ display:'flex',alignItems:'center',gap:8,padding:'9px 0',borderBottom:i<Math.min(bills.length-1,19)?`1px solid ${c.div}`:'none' }}>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ color:c.txt,fontWeight:600,margin:0,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{b.billNumber||b.id} — {b.customerName}</p>
                    <p style={{ color:c.txtM,fontSize:11,margin:'1px 0 0' }}>{new Date(b.createdAt).toLocaleDateString('en-IN')} · {b.paymentMode}</p>
                  </div>
                  <span style={{ color:'#10b981',fontWeight:800,fontFamily:'Sora,sans-serif',flexShrink:0 }}>₹{b.grandTotal}</span>
                  <button onClick={()=>printBill(b)} title="Print" style={{ background:'none',border:'none',cursor:'pointer',fontSize:14,padding:2,color:c.txtS,flexShrink:0 }}>🖨️</button>
                  {/* POINT 2 — Delete bill button */}
                  <button onClick={()=>setDelBill(b)} title="Delete bill" style={{ background:'none',border:'none',cursor:'pointer',fontSize:14,padding:2,color:'#ef4444',flexShrink:0 }}>🗑️</button>
                </div>
              ))}
              {!bills.length && <p style={{ color:c.txtM,fontSize:13,textAlign:'center',padding:18 }}>No bills yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════ ANALYTICS ════════════════════════════════════════════
function AnalyticsTab({ isPremium, theme }) {
  const c = C(theme);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sec, setSec] = useState('overview');
  useEffect(() => {
    if (!isPremium){setLoading(false);return;}
    fetch(`${API}/analytics`,{headers:authH()}).then(r=>r.json()).then(d=>{if(!d.error)setData(d);}).catch(()=>{}).finally(()=>setLoading(false));
  },[isPremium]);
  const sb = (id,l) => <button key={id} onClick={()=>setSec(id)} style={{ padding:'7px 14px',borderRadius:20,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,transition:'all 0.2s',background:sec===id?'#1B6EF3':c.inp,color:sec===id?'white':c.txtS }}>{l}</button>;
  if (!isPremium) return <PremiumGate feature="Analytics" theme={theme}/>;
  if (loading) return <div style={{ textAlign:'center',padding:56,color:c.txtM }}>Loading analytics from database...</div>;
  if (!data) return <div style={{ textAlign:'center',padding:56,color:c.txtM }}>No data yet — generate some bills first!</div>;
  const { summary, monthlyData, topMedicines, marginAnalysis, expiryAlerts, slowMoving } = data;
  return (
    <div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(145px,1fr))',gap:11,marginBottom:20 }}>
        {[{icon:'💰',l:'Revenue',v:`₹${summary.totalRevenue}`,g:'linear-gradient(135deg,#10b981,#059669)',gw:'rgba(16,185,129,0.3)'},
          {icon:'📈',l:'Profit',v:`₹${summary.totalProfit}`,g:'linear-gradient(135deg,#1B6EF3,#0ea5e9)',gw:'rgba(27,110,243,0.3)'},
          {icon:'📊',l:'Margin',v:`${summary.overallMargin}%`,g:'linear-gradient(135deg,#8b5cf6,#7c3aed)',gw:'rgba(139,92,246,0.3)'},
          {icon:'🧾',l:'Bills',v:summary.totalBills,g:'linear-gradient(135deg,#f59e0b,#d97706)',gw:'rgba(245,158,11,0.3)'},
          {icon:'⚠️',l:'Expiring',v:summary.expiringItems,g:'linear-gradient(135deg,#ef4444,#dc2626)',gw:'rgba(239,68,68,0.3)'},
          {icon:'📉',l:'Slow',v:summary.slowMovingItems,g:'linear-gradient(135deg,#f97316,#ea580c)',gw:'rgba(249,115,22,0.3)'},
        ].map(s=><SC key={s.l} icon={s.icon} label={s.l} value={s.v} gradient={s.g} glow={`0 4px 20px ${s.gw}`}/>)}
      </div>
      <div style={{ display:'flex',gap:7,marginBottom:18,flexWrap:'wrap' }}>
        {[['overview','📊 Monthly'],['margin','💰 Margins'],['expiry','🔮 Expiry'],['slow','📉 Slow'],['top','📈 Top']].map(([id,l])=>sb(id,l))}
      </div>
      <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:22 }}>
        {sec==='overview' && (<>
          <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 18px',fontSize:15 }}>📊 Monthly Revenue</h3>
          <div style={{ display:'flex',alignItems:'flex-end',gap:3,height:100,marginBottom:6 }}>
            {monthlyData.map((m,i)=>{const max=Math.max(...monthlyData.map(d=>d.revenue),1);return<div key={i} title={`₹${m.revenue}`} style={{ flex:1,borderRadius:'3px 3px 0 0',background:m.revenue>0?'linear-gradient(to top,#1B6EF3,#00C2A8)':c.inp,height:`${Math.max((m.revenue/max)*100,2)}%`,minHeight:3,cursor:'default' }}/>;  })}
          </div>
          <div style={{ display:'flex',gap:3,marginBottom:18 }}>{monthlyData.map((m,i)=><div key={i} style={{ flex:1,textAlign:'center',fontSize:9,color:c.txtM }}>{m.month}</div>)}</div>
          <div style={{ overflowX:'auto' }}><table style={{ width:'100%',borderCollapse:'collapse',fontSize:13 }}><thead><tr style={{ borderBottom:`1px solid ${c.tblBd}` }}>{['Month','Revenue','Cost','Profit','Margin','Bills'].map(h=><th key={h} style={{ textAlign:'left',padding:'7px 10px',fontSize:11,color:c.txtM,fontWeight:700 }}>{h}</th>)}</tr></thead><tbody>{monthlyData.filter(m=>m.revenue>0).map((m,i)=><tr key={i} style={{ borderBottom:`1px solid ${c.tblBd}` }}><td style={{ padding:'8px 10px',color:c.txt,fontWeight:600 }}>{m.month}</td><td style={{ padding:'8px 10px',color:'#10b981' }}>₹{m.revenue}</td><td style={{ padding:'8px 10px',color:c.txtS }}>₹{m.cost}</td><td style={{ padding:'8px 10px',color:'#3b82f6',fontWeight:700 }}>₹{m.profit}</td><td style={{ padding:'8px 10px',color:c.txtS }}>{m.margin}%</td><td style={{ padding:'8px 10px',color:c.txtS }}>{m.bills}</td></tr>)}{monthlyData.every(m=>m.revenue===0)&&<tr><td colSpan="6" style={{ textAlign:'center',padding:24,color:c.txtM }}>No bills yet</td></tr>}</tbody></table></div>
        </>)}
        {sec==='margin' && (<><h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 14px',fontSize:15 }}>💰 Per-Medicine Margin</h3><div style={{ overflowX:'auto' }}><table style={{ width:'100%',borderCollapse:'collapse',fontSize:13 }}><thead><tr style={{ borderBottom:`1px solid ${c.tblBd}` }}>{['Medicine','Buy','Sell','Margin','Sold','Revenue','Profit'].map(h=><th key={h} style={{ textAlign:'left',padding:'7px 11px',fontSize:11,color:c.txtM,fontWeight:700 }}>{h}</th>)}</tr></thead><tbody>{(marginAnalysis||[]).map((m,i)=><tr key={i} style={{ borderBottom:`1px solid ${c.tblBd}` }} onMouseEnter={e=>e.currentTarget.style.background=c.tblHov} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><td style={{ padding:'8px 11px',color:c.txt,fontWeight:600 }}>{m.medicineName}</td><td style={{ padding:'8px 11px',color:c.txtS }}>₹{m.purchasePrice}</td><td style={{ padding:'8px 11px',color:c.txt }}>₹{m.sellingPrice}</td><td style={{ padding:'8px 11px' }}><span style={{ color:m.margin>=20?'#10b981':'#f59e0b',fontWeight:700 }}>{m.margin}%</span></td><td style={{ padding:'8px 11px',color:c.txtS }}>{m.unitsSold}</td><td style={{ padding:'8px 11px',color:'#10b981' }}>₹{m.revenue}</td><td style={{ padding:'8px 11px',color:'#3b82f6',fontWeight:700 }}>₹{m.profit}</td></tr>)}{!marginAnalysis?.length&&<tr><td colSpan="7" style={{ textAlign:'center',padding:24,color:c.txtM }}>No data</td></tr>}</tbody></table></div></>)}
        {sec==='expiry' && (<><h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 14px',fontSize:15 }}>🔮 Expiry Alerts</h3>{!expiryAlerts?.length?<p style={{ color:c.txtM,textAlign:'center',padding:24 }}>✅ No expiring medicines</p>:<div style={{ display:'flex',flexDirection:'column',gap:9 }}>{expiryAlerts.map((s,i)=><div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',background:s.urgency==='critical'?(theme==='dark'?'rgba(239,68,68,0.1)':'#fef2f2'):s.urgency==='warning'?(theme==='dark'?'rgba(245,158,11,0.1)':'#fffbeb'):(theme==='dark'?'rgba(27,110,243,0.07)':'#eff6ff'),border:`1px solid ${s.urgency==='critical'?'rgba(239,68,68,0.3)':s.urgency==='warning'?'rgba(245,158,11,0.3)':'rgba(27,110,243,0.2)'}`,borderRadius:13,padding:'11px 15px' }}><div><p style={{ color:c.txt,fontWeight:600,margin:0 }}>{s.medicineName}</p><p style={{ color:c.txtM,fontSize:12,margin:'2px 0 0' }}>Batch: {s.batchNo||'—'} · Exp: {s.expiryDate} · {s.units} units</p></div><span style={{ padding:'4px 13px',borderRadius:20,fontWeight:700,fontSize:12,background:s.urgency==='critical'?'#ef4444':s.urgency==='warning'?'#f59e0b':'#1B6EF3',color:'white' }}>{s.daysLeft}d</span></div>)}</div>}</>)}
        {sec==='slow' && (<><h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 6px',fontSize:15 }}>📉 Slow-Moving Stock</h3><p style={{ color:c.txtM,fontSize:12,margin:'0 0 14px' }}>30+ days in stock · &lt;3 sold</p>{!slowMoving?.length?<p style={{ color:c.txtM,textAlign:'center',padding:24 }}>✅ No slow-moving stock</p>:slowMoving.map((s,i)=><div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',background:theme==='dark'?'rgba(249,115,22,0.08)':'#fff7ed',border:`1px solid ${theme==='dark'?'rgba(249,115,22,0.2)':'#fed7aa'}`,borderRadius:13,padding:'11px 15px',marginBottom:8 }}><div><p style={{ color:c.txt,fontWeight:600,margin:0 }}>{s.medicineName}</p><p style={{ color:c.txtM,fontSize:12,margin:'2px 0 0' }}>{s.units} units · ₹{s.sellingPrice}</p></div><span style={{ padding:'3px 11px',borderRadius:20,background:'#f97316',color:'white',fontSize:11,fontWeight:700 }}>Slow</span></div>)}</>)}
        {sec==='top' && (<><h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 14px',fontSize:15 }}>📈 Top Sellers</h3>{!topMedicines?.length?<p style={{ color:c.txtM,textAlign:'center',padding:24 }}>No sales data yet</p>:topMedicines.map((m,i)=><div key={i} style={{ display:'flex',alignItems:'center',gap:12,padding:'11px 0',borderBottom:`1px solid ${c.div}` }}><span style={{ width:30,height:30,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:i<3?15:11,fontWeight:800,flexShrink:0,background:i===0?'linear-gradient(135deg,#f59e0b,#d97706)':i===1?'linear-gradient(135deg,#9ca3af,#6b7280)':i===2?'linear-gradient(135deg,#cd7c2f,#92400e)':c.inp,color:i<3?'white':c.txtS }}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</span><div style={{ flex:1 }}><p style={{ color:c.txt,fontWeight:600,margin:0 }}>{m.name}</p><p style={{ color:c.txtM,fontSize:12,margin:'1px 0 0' }}>{m.qty} units</p></div><span style={{ color:'#10b981',fontWeight:800,fontFamily:'Sora,sans-serif' }}>₹{m.revenue.toFixed(0)}</span></div>)}</>)}
      </div>
    </div>
  );
}

// ════════ SUPPLIERS ════════════════════════════════════════════
function SuppliersTab({ isPremium, toast, theme }) {
  const c = C(theme);
  const inp = { background:c.inp,border:`1px solid ${c.inpBd}`,borderRadius:10,padding:'9px 13px',color:c.txt,fontSize:13,outline:'none',width:'100%',boxSizing:'border-box',fontFamily:'DM Sans,sans-serif' };
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  // POINT 7 — cancel dialog
  const [cancelTarget, setCancelTarget] = useState(null); // {supplierId, orderId, medicineName}
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  // POINT 5 — order form has no unit cost
  const [orderModal, setOrderModal] = useState(null);
  const [orderSaving, setOrderSaving] = useState(false);
  const [form, setForm] = useState({ name:'', phone:'', email:'', address:'', gstNo:'', category:'', creditDays:'30', notes:'' });
  const [orderForm, setOrderForm] = useState({ medicineName:'', quantity:'', expectedDate:'', notes:'' });

  const load = useCallback(async () => {
    setLoading(true);
    try { setSuppliers(await fetch(`${API}/suppliers`,{headers:authH()}).then(r=>r.json()).then(d=>Array.isArray(d)?d:[])); } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { if (isPremium) load(); else setLoading(false); }, [isPremium, load]);

  async function addSupplier() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const d = await fetch(`${API}/suppliers`,{method:'POST',headers:authH(),body:JSON.stringify(form)}).then(r=>r.json());
      if (d.error) throw new Error(d.error);
      setForm({ name:'',phone:'',email:'',address:'',gstNo:'',category:'',creditDays:'30',notes:'' });
      setShowAdd(false); load(); toast('✅ Supplier saved!');
    } catch(e) { toast(e.message,'error'); }
    setSaving(false);
  }

  // POINT 5 — no unit cost in order
  async function placeOrder() {
    if (!orderForm.medicineName.trim()||!orderForm.quantity) return toast('Medicine and quantity required','error');
    setOrderSaving(true);
    try {
      const d = await fetch(`${API}/suppliers/${orderModal}/order`,{method:'POST',headers:authH(),body:JSON.stringify({ medicineName:orderForm.medicineName, quantity:orderForm.quantity, expectedDate:orderForm.expectedDate, notes:orderForm.notes })}).then(r=>r.json());
      if (d.error) throw new Error(d.error);
      toast(d.emailSent ? `✅ Order placed & email sent to supplier!` : '✅ Order placed!');
      setOrderModal(null); setOrderForm({ medicineName:'',quantity:'',expectedDate:'',notes:'' }); load();
    } catch(e) { toast(e.message,'error'); }
    setOrderSaving(false);
  }

  // POINT 7 — Cancel with reason dialog + email
  async function confirmCancel() {
    if (!cancelReason.trim()) { toast('Please provide a reason','error'); return; }
    setCancelling(true);
    try {
      const d = await fetch(`${API}/suppliers/${cancelTarget.supplierId}/orders/${cancelTarget.orderId}/cancel`,{method:'PATCH',headers:authH(),body:JSON.stringify({ reason:cancelReason })}).then(r=>r.json());
      if (d.error) throw new Error(d.error);
      toast(d.emailSent ? '✅ Cancelled & email sent to supplier!' : '✅ Order cancelled');
      setCancelTarget(null); setCancelReason(''); load();
    } catch(e) { toast(e.message,'error'); }
    setCancelling(false);
  }

  async function received(sId, oId) {
    try { await fetch(`${API}/suppliers/${sId}/orders/${oId}`,{method:'PATCH',headers:authH(),body:JSON.stringify({status:'Received'})}).then(r=>r.json()); load(); toast('✅ Marked as received'); }
    catch(e) { toast(e.message,'error'); }
  }

  async function del(id) {
    if (!confirm('Remove supplier?')) return;
    try { await fetch(`${API}/suppliers/${id}`,{method:'DELETE',headers:authH()}); toast('Removed'); load(); } catch(e) { toast(e.message,'error'); }
  }

  if (!isPremium) return <PremiumGate feature="Supplier Management" theme={theme}/>;

  return (
    <div>
      {/* POINT 7 — Cancel dialog */}
      {cancelTarget && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
          <div style={{ background:c.modal,border:`1px solid ${c.cardBd}`,borderRadius:22,padding:26,width:'100%',maxWidth:440 }}>
            <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 8px',fontSize:16 }}>❌ Cancel Order</h3>
            <p style={{ color:c.txtM,fontSize:13,margin:'0 0 16px' }}>Cancelling: <b style={{ color:c.txt }}>{cancelTarget.medicineName}</b><br/>A cancellation email will be sent to the supplier.</p>
            <p style={{ color:c.txt,fontSize:13,fontWeight:600,margin:'0 0 7px' }}>Reason for cancellation *</p>
            <textarea value={cancelReason} onChange={e=>setCancelReason(e.target.value)} placeholder="e.g. Found better price, Stock procured from another source, Order placed by mistake..." rows={3} style={{ ...inp,resize:'vertical',marginBottom:14,height:80 }}/>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={confirmCancel} disabled={cancelling||!cancelReason.trim()} style={{ flex:1,padding:'12px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'white',fontWeight:700,cursor:'pointer',opacity:cancelling||!cancelReason.trim()?0.6:1 }}>
                {cancelling?'Cancelling...':'❌ Cancel Order + Notify'}
              </button>
              <button onClick={()=>{setCancelTarget(null);setCancelReason('');}} style={{ flex:1,padding:'12px',borderRadius:11,border:`1px solid ${c.inpBd}`,background:c.secBg,color:c.secClr,cursor:'pointer' }}>Keep Order</button>
            </div>
          </div>
        </div>
      )}

      {/* Order modal — POINT 5: no unit cost field */}
      {orderModal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
          <div style={{ background:c.modal,border:`1px solid ${c.cardBd}`,borderRadius:22,padding:26,width:'100%',maxWidth:440 }}>
            <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 18px' }}>📦 Place Order — {suppliers.find(s=>s._id===orderModal)?.name}</h3>
            <p style={{ color:'#10b981',fontSize:12,margin:'0 0 14px',background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:8,padding:'7px 12px' }}>
              ℹ️ Pricing will be confirmed by the supplier. No unit cost needed.
            </p>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              <input placeholder="Medicine / Item Name *" value={orderForm.medicineName} onChange={e=>setOrderForm({...orderForm,medicineName:e.target.value})} style={inp}/>
              <input placeholder="Quantity *" inputMode="numeric" value={orderForm.quantity} onChange={e=>setOrderForm({...orderForm,quantity:e.target.value})} style={inp}/>
              <input type="date" value={orderForm.expectedDate} onChange={e=>setOrderForm({...orderForm,expectedDate:e.target.value})} style={inp}/>
              <textarea placeholder="Notes / specifications (optional)" value={orderForm.notes} onChange={e=>setOrderForm({...orderForm,notes:e.target.value})} style={{ ...inp,height:68,resize:'vertical' }}/>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:14 }}>
              <button onClick={placeOrder} disabled={orderSaving} style={{ padding:'12px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'white',fontWeight:700,cursor:'pointer',opacity:orderSaving?0.7:1 }}>
                {orderSaving?'Sending...':'📦 Place + Email'}
              </button>
              <button onClick={()=>{setOrderModal(null);setOrderForm({medicineName:'',quantity:'',expectedDate:'',notes:''}); }} style={{ padding:'12px',borderRadius:11,border:`1px solid ${c.inpBd}`,background:c.secBg,color:c.secClr,cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
        <h2 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:0,fontSize:17 }}>🏭 Suppliers</h2>
        <button onClick={()=>setShowAdd(!showAdd)} style={{ padding:'9px 18px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#1B6EF3,#00C2A8)',color:'white',fontWeight:700,cursor:'pointer',fontSize:14 }}>+ Add Supplier</button>
      </div>

      {showAdd && (
        <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:18,marginBottom:18 }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
            <input placeholder="Supplier Name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{ ...inp,gridColumn:'span 2' }}/>
            <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={inp}/>
            <input placeholder="Email (for order emails) *" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={inp}/>
            <input placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} style={{ ...inp,gridColumn:'span 2' }}/>
            <input placeholder="GST No" value={form.gstNo} onChange={e=>setForm({...form,gstNo:e.target.value})} style={inp}/>
            <input placeholder="Category (Generic/OTC/Branded)" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inp}/>
            <input placeholder="Credit Days" inputMode="numeric" value={form.creditDays} onChange={e=>setForm({...form,creditDays:e.target.value})} style={inp}/>
            <textarea placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{ ...inp,height:56,resize:'none' }}/>
          </div>
          <div style={{ display:'flex',gap:10,marginTop:13 }}>
            <button onClick={addSupplier} disabled={saving} style={{ flex:1,padding:'11px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#1B6EF3,#00C2A8)',color:'white',fontWeight:700,cursor:'pointer',opacity:saving?0.7:1 }}>{saving?'Saving...':'✅ Save Supplier'}</button>
            <button onClick={()=>setShowAdd(false)} style={{ flex:1,padding:'11px',borderRadius:11,border:`1px solid ${c.inpBd}`,background:c.secBg,color:c.secClr,cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div style={{ textAlign:'center',padding:40,color:c.txtM }}>Loading...</div> :
       !suppliers.length ? <div style={{ textAlign:'center',padding:56,color:c.txtM }}><div style={{ fontSize:44,marginBottom:10 }}>🏭</div>No suppliers yet</div> :
       <div style={{ display:'flex',flexDirection:'column',gap:13 }}>
         {suppliers.map(s=>(
           <div key={s._id} style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,overflow:'hidden' }}>
             <div style={{ padding:'15px 18px',display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
               <div style={{ flex:1 }}>
                 <div style={{ display:'flex',alignItems:'center',gap:9,flexWrap:'wrap',marginBottom:6 }}>
                   <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:0,fontSize:15 }}>{s.name}</h3>
                   {s.category && <span style={{ fontSize:11,background:theme==='dark'?'rgba(27,110,243,0.2)':'#dbeafe',color:'#3b82f6',padding:'2px 9px',borderRadius:20,fontWeight:600 }}>{s.category}</span>}
                   <span style={{ fontSize:11,background:c.inp,color:c.txtM,padding:'2px 9px',borderRadius:20 }}>Credit: {s.creditDays}d</span>
                 </div>
                 <div style={{ display:'flex',gap:13,flexWrap:'wrap',fontSize:12,color:c.txtM }}>
                   {s.phone && <span>📱 {s.phone}</span>}
                   {s.email && <span>📧 {s.email}</span>}
                 </div>
                 <p style={{ color:c.txtM,fontSize:11,margin:'5px 0 0' }}>Total orders: {s.totalOrders}</p>
               </div>
               <div style={{ display:'flex',gap:7,flexShrink:0 }}>
                 <button onClick={()=>setOrderModal(s._id)} style={{ padding:'7px 14px',borderRadius:9,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'white',fontWeight:700,cursor:'pointer',fontSize:12 }}>📦 Order</button>
                 <button onClick={()=>del(s._id)} style={{ padding:'7px 11px',borderRadius:9,border:`1px solid ${theme==='dark'?'rgba(239,68,68,0.3)':'#fecaca'}`,background:theme==='dark'?'rgba(239,68,68,0.08)':'#fef2f2',color:'#ef4444',cursor:'pointer' }}>🗑️</button>
               </div>
             </div>
             {s.orders?.filter(o=>o.status==='Pending').length > 0 && (
               <div style={{ borderTop:`1px solid ${c.div}`,padding:'10px 18px',background:theme==='dark'?'rgba(0,0,0,0.1)':'rgba(0,0,0,0.02)' }}>
                 <p style={{ color:c.txtM,fontSize:11,margin:'0 0 7px',fontWeight:700,letterSpacing:'0.04em' }}>PENDING ORDERS</p>
                 {s.orders.filter(o=>o.status==='Pending').map(o=>(
                   <div key={o._id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:`1px solid ${c.div}` }}>
                     <div>
                       <span style={{ color:c.txtS,fontSize:12 }}>{o.medicineName} × {o.quantity}</span>
                       {o.expectedDate && <span style={{ color:c.txtM,fontSize:11 }}> · By {o.expectedDate}</span>}
                       {o.emailSent && <span style={{ fontSize:10,color:'#10b981',marginLeft:6 }}>✅ Email sent</span>}
                     </div>
                     <div style={{ display:'flex',gap:6,flexShrink:0 }}>
                       <button onClick={()=>received(s._id,o._id)} style={{ fontSize:11,background:theme==='dark'?'rgba(16,185,129,0.15)':'#dcfce7',color:'#10b981',border:'none',padding:'3px 9px',borderRadius:6,cursor:'pointer',fontWeight:600 }}>✅ Received</button>
                       {/* POINT 7 — cancel with dialog */}
                       <button onClick={()=>setCancelTarget({supplierId:s._id,orderId:o._id,medicineName:o.medicineName})} style={{ fontSize:11,background:theme==='dark'?'rgba(239,68,68,0.15)':'#fef2f2',color:'#ef4444',border:'none',padding:'3px 9px',borderRadius:6,cursor:'pointer',fontWeight:600 }}>❌ Cancel</button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
             <SupplierPastOrders supplier={s} theme={theme}/>
           </div>
         ))}
       </div>
      }
    </div>
  );
}

// ════════ REQUIREMENTS ════════════════════════════════════════
function RequirementsTab({ isPremium, toast, theme }) {
  const c = C(theme);
  const inp = { background:c.inp,border:`1px solid ${c.inpBd}`,borderRadius:10,padding:'9px 13px',color:c.txt,fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif',boxSizing:'border-box' };
  const [reqs, setReqs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [active, setActive] = useState(null);
  const [newItem, setNewItem] = useState({ medicineName:'',quantity:'',unit:'strips',priority:'medium',notes:'' });
  const [sendModal, setSendModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [title, setTitle] = useState(`List ${new Date().toLocaleDateString('en-IN')}`);
  // POINT 8 — delete list confirm
  const [delReq, setDelReq] = useState(null);

  const load = useCallback(async () => {
    try {
      const [r,s] = await Promise.all([
        fetch(`${API}/requirements`,{headers:authH()}).then(r=>r.json()),
        fetch(`${API}/suppliers`,{headers:authH()}).then(r=>r.json()),
      ]);
      const newReqs = Array.isArray(r)?r:[];
      setReqs(newReqs);
      setSuppliers(Array.isArray(s)?s:[]);
      // Refresh active if open
      if (active?._id) {
        const updated = newReqs.find(x=>x._id===active._id);
        if (updated) setActive(updated);
      }
    } catch {}
  }, [active?._id]);
  useEffect(() => { if (isPremium) load(); }, [isPremium, load]);

  async function createReq() {
    try { const d=await fetch(`${API}/requirements`,{method:'POST',headers:authH(),body:JSON.stringify({title,items:[]})}).then(r=>r.json()); if(!d.error){setActive(d);load();toast('✅ List created!');} } catch(e) { toast(e.message,'error'); }
  }

  async function addItem() {
    if (!newItem.medicineName.trim()||!newItem.quantity) return toast('Fill name and quantity','error');
    if (!active) return toast('Create or select a list first','error');
    const items=[...active.items,{...newItem,status:'pending'}];
    try { const d=await fetch(`${API}/requirements/${active._id}`,{method:'PATCH',headers:authH(),body:JSON.stringify({items})}).then(r=>r.json()); if(!d.error){setActive(d);load();setNewItem({medicineName:'',quantity:'',unit:'strips',priority:'medium',notes:''});} } catch {}
  }

  async function removeItem(idx) {
    if (!active) return;
    const items=active.items.filter((_,i)=>i!==idx);
    try { const d=await fetch(`${API}/requirements/${active._id}`,{method:'PATCH',headers:authH(),body:JSON.stringify({items})}).then(r=>r.json()); if(!d.error){setActive(d);load();} } catch {}
  }

  // POINT 8 — delete list
  async function confirmDeleteReq() {
    if (!delReq) return;
    try {
      const d = await fetch(`${API}/requirements/${delReq._id}`,{method:'DELETE',headers:authH()}).then(r=>r.json());
      if (d.error) throw new Error(d.error);
      toast(`🗑️ "${delReq.title}" deleted`);
      if (active?._id === delReq._id) setActive(null);
      setDelReq(null); load();
    } catch(e) { toast(e.message,'error'); setDelReq(null); }
  }

  // POINT 9 — send creates supplier orders + marks sent
  async function sendToSupplier(sId) {
    setSending(true);
    try {
      const d = await fetch(`${API}/requirements/${active._id}/send`,{method:'POST',headers:authH(),body:JSON.stringify({supplierId:sId})}).then(r=>r.json());
      if (d.error) throw new Error(d.error);
      toast(`✅ ${d.message}`);
      setSendModal(false); load();
    } catch(e) { toast(e.message,'error'); }
    setSending(false);
  }

  if (!isPremium) return <PremiumGate feature="Purchase Requirements" theme={theme}/>;
  const pc = { high:'#ef4444',medium:'#f59e0b',low:'#10b981' };

  return (
    <div>
      {/* POINT 8 — Delete list confirm */}
      <ConfirmDialog open={!!delReq} title="🗑️ Delete List" message={`Delete "${delReq?.title}" with ${delReq?.items?.length||0} items? This cannot be undone.`} onConfirm={confirmDeleteReq} onCancel={()=>setDelReq(null)} confirmText="Delete List"/>

      {sendModal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
          <div style={{ background:c.modal,border:`1px solid ${c.cardBd}`,borderRadius:22,padding:26,width:'100%',maxWidth:420 }}>
            <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 16px' }}>📧 Send List to Supplier</h3>
            <p style={{ color:c.txtM,fontSize:13,margin:'0 0 14px' }}>{active?.items?.length||0} items · orders will be created in Suppliers tab</p>
            {suppliers.filter(s=>s.email).map(s=>(
              <button key={s._id} onClick={()=>!sending&&sendToSupplier(s._id)} style={{ display:'flex',justifyContent:'space-between',width:'100%',padding:'11px 15px',borderRadius:11,border:`1px solid ${c.cardBd}`,background:c.card,color:c.txt,cursor:'pointer',marginBottom:7,fontSize:13,opacity:sending?0.6:1 }}>
                <span><b>{s.name}</b> · {s.email}</span><span style={{ color:'#10b981',fontWeight:700 }}>Send →</span>
              </button>
            ))}
            {!suppliers.filter(s=>s.email).length && <p style={{ color:'#ef4444',textAlign:'center',fontSize:13 }}>No suppliers with email. Add supplier emails first.</p>}
            <button onClick={()=>setSendModal(false)} style={{ width:'100%',padding:'11px',borderRadius:11,border:`1px solid ${c.inpBd}`,background:c.secBg,color:c.secClr,cursor:'pointer',marginTop:7 }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display:'grid',gridTemplateColumns:'240px 1fr',gap:18 }}>
        <div>
          <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:14,padding:13,marginBottom:11 }}>
            <input placeholder="List title" value={title} onChange={e=>setTitle(e.target.value)} style={{ ...inp,width:'100%',marginBottom:9 }}/>
            <button onClick={createReq} style={{ width:'100%',padding:'9px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#1B6EF3,#00C2A8)',color:'white',fontWeight:700,cursor:'pointer',fontSize:13 }}>+ New List</button>
          </div>
          {reqs.map(r=>(
            <div key={r._id} style={{ padding:'9px 13px',borderRadius:11,cursor:'pointer',marginBottom:5,transition:'all 0.15s',display:'flex',justifyContent:'space-between',alignItems:'center',
              background:active?._id===r._id?(theme==='dark'?'rgba(27,110,243,0.15)':'#dbeafe'):c.card,
              border:`1px solid ${active?._id===r._id?'rgba(27,110,243,0.4)':c.cardBd}` }}>
              <div onClick={()=>setActive(r)} style={{ flex:1 }}>
                <p style={{ color:c.txt,fontWeight:600,margin:0,fontSize:13 }}>{r.title}</p>
                <p style={{ color:c.txtM,fontSize:11,margin:'2px 0 0' }}>{r.items?.length||0} items · {r.status}</p>
              </div>
              {/* POINT 8 — Delete list button */}
              <button onClick={e=>{e.stopPropagation();setDelReq(r);}} style={{ background:'none',border:'none',cursor:'pointer',color:'#ef4444',fontSize:13,padding:'2px 4px',flexShrink:0 }}>🗑️</button>
            </div>
          ))}
        </div>

        <div>
          {active ? (<>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
              <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:0 }}>{active.title}</h3>
              <button onClick={()=>setSendModal(true)} disabled={!active.items?.length} style={{ padding:'9px 18px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'white',fontWeight:700,cursor:'pointer',fontSize:13,opacity:!active.items?.length?0.4:1 }}>📧 Send to Supplier</button>
            </div>
            {active.sentToSuppliers?.length > 0 && (
              <div style={{ background:theme==='dark'?'rgba(16,185,129,0.06)':'#f0fdf4',border:`1px solid ${theme==='dark'?'rgba(16,185,129,0.2)':'#bbf7d0'}`,borderRadius:11,padding:'9px 14px',marginBottom:13,fontSize:12 }}>
                <p style={{ color:'#10b981',fontWeight:700,margin:'0 0 4px' }}>✅ Sent to suppliers:</p>
                {active.sentToSuppliers.map((s,i)=><p key={i} style={{ color:c.txtS,margin:0 }}>{s.supplierName} · {new Date(s.sentAt).toLocaleDateString('en-IN')}</p>)}
              </div>
            )}
            <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:16,padding:16,marginBottom:14 }}>
              <p style={{ color:c.txtM,fontSize:11,fontWeight:700,margin:'0 0 11px',letterSpacing:'0.04em' }}>+ ADD MEDICINE</p>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 70px 70px',gap:7,marginBottom:7 }}>
                <input placeholder="Medicine *" value={newItem.medicineName} onChange={e=>setNewItem({...newItem,medicineName:e.target.value})} style={inp}/>
                <input placeholder="Qty *" inputMode="numeric" value={newItem.quantity} onChange={e=>setNewItem({...newItem,quantity:e.target.value})} style={inp}/>
                <input placeholder="Unit" value={newItem.unit} onChange={e=>setNewItem({...newItem,unit:e.target.value})} style={inp}/>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:9 }}>
                <select value={newItem.priority} onChange={e=>setNewItem({...newItem,priority:e.target.value})} style={inp}>
                  <option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option>
                </select>
                <input placeholder="Notes" value={newItem.notes} onChange={e=>setNewItem({...newItem,notes:e.target.value})} style={inp}/>
              </div>
              <button onClick={addItem} style={{ width:'100%',padding:'9px',borderRadius:10,border:'none',background:theme==='dark'?'rgba(27,110,243,0.3)':'#1B6EF3',color:'white',fontWeight:700,cursor:'pointer',fontSize:13 }}>+ Add to List</button>
            </div>
            {!active.items?.length ? <div style={{ textAlign:'center',padding:36,color:c.txtM }}>Add medicines above</div> : (
              <div style={{ display:'flex',flexDirection:'column',gap:7 }}>
                {active.items.map((it,i)=>(
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:11,padding:'11px 15px',background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:13 }}>
                    <div style={{ width:9,height:9,borderRadius:'50%',background:pc[it.priority]||'#fff',flexShrink:0 }}/>
                    <div style={{ flex:1 }}><p style={{ color:c.txt,fontWeight:600,margin:0 }}>{it.medicineName}</p><p style={{ color:c.txtM,fontSize:12,margin:'1px 0 0' }}>×{it.quantity} {it.unit}{it.notes?` · ${it.notes}`:''}</p></div>
                    <span style={{ fontSize:11,fontWeight:700,padding:'2px 9px',borderRadius:20,background:pc[it.priority]+'20',color:pc[it.priority] }}>{it.priority}</span>
                    <button onClick={()=>removeItem(i)} style={{ color:'#ef4444',background:'none',border:'none',cursor:'pointer',fontSize:15,lineHeight:1 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </>) : <div style={{ textAlign:'center',padding:56,color:c.txtM }}><div style={{ fontSize:44,marginBottom:10 }}>📋</div>Create or select a list</div>}
        </div>
      </div>
    </div>
  );
}

// ════════ CUSTOMERS ════════════════════════════════════════════
function CustomersTab({ isPremium, toast, theme }) {
  const c = C(theme);
  const inp = { background:c.inp,border:`1px solid ${c.inpBd}`,borderRadius:10,padding:'9px 13px',color:c.txt,fontSize:13,outline:'none',width:'100%',boxSizing:'border-box',fontFamily:'DM Sans,sans-serif' };
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [medModal, setMedModal] = useState(null);
  const [form, setForm] = useState({ name:'',phone:'',email:'',address:'',age:'',notes:'' });
  const [medForm, setMedForm] = useState({ medicineName:'',dosage:'',quantity:'1',frequency:'monthly',typicalDate:'',alertEnabled:true,alertDaysBefore:'1',notes:'' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, aRes] = await Promise.all([
        fetch(`${API}/customers`,{headers:authH()}).then(r=>r.json()),
        fetch(`${API}/customers/alerts?days=7`,{headers:authH()}).then(r=>r.json()),
      ]);
      setCustomers(Array.isArray(cRes)?cRes:[]); setAlerts(aRes.alerts||[]);
    } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { if (isPremium) load(); else setLoading(false); }, [isPremium, load]);

  async function save() {
    if (!form.name.trim()) return toast('Name required','error');
    setSaving(true);
    try { const d=await fetch(`${API}/customers`,{method:'POST',headers:authH(),body:JSON.stringify(form)}).then(r=>r.json()); if(d.error) throw new Error(d.error); toast('✅ Customer saved!'); setShowAdd(false); setForm({name:'',phone:'',email:'',address:'',age:'',notes:''}); load(); } catch(e) { toast(e.message,'error'); }
    setSaving(false);
  }

  async function addMed() {
    if (!medForm.medicineName.trim()||!medForm.quantity) return toast('Fill name and quantity','error');
    const cx = customers.find(x=>x._id===medModal); if (!cx) return;
    const medicines=[...(cx.medicines||[]),{...medForm,quantity:parseInt(medForm.quantity)||1,typicalDate:parseInt(medForm.typicalDate)||null,alertDaysBefore:parseInt(medForm.alertDaysBefore)||1}];
    try {
      const d=await fetch(`${API}/customers/${medModal}`,{method:'PATCH',headers:authH(),body:JSON.stringify({medicines})}).then(r=>r.json());
      if(d.error) throw new Error(d.error);
      toast('✅ Medicine record saved!');
      setMedModal(null); setMedForm({medicineName:'',dosage:'',quantity:'1',frequency:'monthly',typicalDate:'',alertEnabled:true,alertDaysBefore:'1',notes:''}); load();
    } catch(e) { toast(e.message,'error'); }
  }

  // POINT 10 — Delete individual medicine
  async function delMedicine(customerId, medIdx) {
    if (!confirm('Remove this medicine record?')) return;
    try {
      const d = await fetch(`${API}/customers/${customerId}/medicines/${medIdx}`,{method:'DELETE',headers:authH()}).then(r=>r.json());
      if (d.error) throw new Error(d.error);
      toast('Medicine record deleted');
      // Update local state immediately
      setCustomers(prev => prev.map(cx => {
        if (cx._id !== customerId) return cx;
        return { ...cx, medicines: cx.medicines.filter((_,i)=>i!==medIdx) };
      }));
    } catch(e) { toast(e.message,'error'); }
  }

  async function del(id) { if (!confirm('Remove customer?')) return; try { await fetch(`${API}/customers/${id}`,{method:'DELETE',headers:authH()}); toast('Removed'); load(); } catch(e) { toast(e.message,'error'); } }

  if (!isPremium) return <PremiumGate feature="Customer Tracking" theme={theme}/>;

  return (
    <div>
      {medModal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
          <div style={{ background:c.modal,border:`1px solid ${c.cardBd}`,borderRadius:22,padding:26,width:'100%',maxWidth:480 }}>
            <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 18px',fontSize:16 }}>💊 Add Medicine — {customers.find(x=>x._id===medModal)?.name}</h3>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
              <MedicineSearch value={medForm.medicineName} onChange={val=>setMedForm({...medForm,medicineName:val})} inp={{...inp,gridColumn:undefined}} c={c}/>
              <input placeholder="Dosage (500mg)" value={medForm.dosage} onChange={e=>setMedForm({...medForm,dosage:e.target.value})} style={inp}/>
              <input placeholder="Qty per purchase" inputMode="numeric" value={medForm.quantity} onChange={e=>setMedForm({...medForm,quantity:e.target.value})} style={inp}/>
              <select value={medForm.frequency} onChange={e=>setMedForm({...medForm,frequency:e.target.value})} style={inp}>
                <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="as_needed">As Needed</option>
              </select>
              <input placeholder="Typical day of month (1-31)" inputMode="numeric" value={medForm.typicalDate} onChange={e=>setMedForm({...medForm,typicalDate:e.target.value})} style={inp}/>
              <input placeholder="Alert N days before" inputMode="numeric" value={medForm.alertDaysBefore} onChange={e=>setMedForm({...medForm,alertDaysBefore:e.target.value})} style={inp}/>
              <label style={{ display:'flex',alignItems:'center',gap:7,color:c.txtS,fontSize:13,cursor:'pointer' }}>
                <input type="checkbox" checked={medForm.alertEnabled} onChange={e=>setMedForm({...medForm,alertEnabled:e.target.checked})} style={{ accentColor:'#10b981' }}/>Enable Alert
              </label>
              <input placeholder="Notes" value={medForm.notes} onChange={e=>setMedForm({...medForm,notes:e.target.value})} style={inp}/>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:14 }}>
              <button onClick={addMed} style={{ padding:'12px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'white',fontWeight:700,cursor:'pointer' }}>💾 Save</button>
              <button onClick={()=>setMedModal(null)} style={{ padding:'12px',borderRadius:11,border:`1px solid ${c.inpBd}`,background:c.secBg,color:c.secClr,cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {alerts.length > 0 && (
        <div style={{ background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:18,padding:18,marginBottom:18 }}>
          <h3 style={{ color:'#fca5a5',fontFamily:'Sora,sans-serif',margin:'0 0 12px',fontSize:14 }}>🔔 Upcoming (Next 7 Days)</h3>
          {alerts.map((a,i)=>(
            <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(0,0,0,0.12)',borderRadius:10,padding:'9px 13px',marginBottom:6 }}>
              <div><p style={{ color:c.txt,fontWeight:600,margin:0,fontSize:14 }}>{a.customerName}</p><p style={{ color:c.txtM,fontSize:12,margin:'1px 0 0' }}>{a.medicineName} ×{a.quantity} · {a.customerPhone||'—'}</p></div>
              <span style={{ padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:800,background:a.daysFromNow===0?'#ef4444':a.daysFromNow===1?'#f59e0b':'#1B6EF3',color:'white' }}>{a.urgency==='today'?'TODAY':a.urgency==='tomorrow'?'TOMORROW':a.urgency}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
        <h2 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:0,fontSize:17 }}>👥 Customers ({customers.length})</h2>
        <button onClick={()=>setShowAdd(!showAdd)} style={{ padding:'9px 18px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#1B6EF3,#00C2A8)',color:'white',fontWeight:700,cursor:'pointer',fontSize:14 }}>+ Add Customer</button>
      </div>

      {showAdd && (
        <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:18,marginBottom:18 }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
            <input placeholder="Name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{ ...inp,gridColumn:'span 2' }}/>
            <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={inp}/>
            <input placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={inp}/>
            <input placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} style={{ ...inp,gridColumn:'span 2' }}/>
            <input placeholder="Age" inputMode="numeric" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} style={inp}/>
            <input placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={inp}/>
          </div>
          <div style={{ display:'flex',gap:10,marginTop:13 }}>
            <button onClick={save} disabled={saving} style={{ flex:1,padding:'11px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#1B6EF3,#00C2A8)',color:'white',fontWeight:700,cursor:'pointer',opacity:saving?0.7:1 }}>{saving?'Saving...':'✅ Save Customer'}</button>
            <button onClick={()=>setShowAdd(false)} style={{ flex:1,padding:'11px',borderRadius:11,border:`1px solid ${c.inpBd}`,background:c.secBg,color:c.secClr,cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div style={{ textAlign:'center',padding:40,color:c.txtM }}>Loading...</div> :
       !customers.length ? <div style={{ textAlign:'center',padding:56,color:c.txtM }}><div style={{ fontSize:44,marginBottom:10 }}>👥</div>No customers yet</div> :
       <div style={{ display:'flex',flexDirection:'column',gap:13 }}>
         {customers.map(cx=>(
           <div key={cx._id} style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,overflow:'hidden' }}>
             <div style={{ padding:'15px 18px',display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
               <div style={{ flex:1 }}>
                 <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 5px',fontSize:15 }}>{cx.name}</h3>
                 <div style={{ display:'flex',gap:13,flexWrap:'wrap',fontSize:12,color:c.txtM }}>
                   {cx.phone&&<span>📱 {cx.phone}</span>}
                   {cx.email&&<span>📧 {cx.email}</span>}
                   {cx.age&&<span>Age: {cx.age}</span>}
                 </div>
                 <p style={{ color:c.txtM,fontSize:11,margin:'5px 0 0' }}>Visits: {cx.totalVisits} · Spend: ₹{(cx.totalSpend||0).toFixed(0)}{cx.lastVisit?` · Last: ${new Date(cx.lastVisit).toLocaleDateString('en-IN')}`:''}</p>
               </div>
               <div style={{ display:'flex',gap:7 }}>
                 <button onClick={()=>setMedModal(cx._id)} style={{ padding:'7px 13px',borderRadius:9,border:'none',background:theme==='dark'?'rgba(16,185,129,0.2)':'#dcfce7',color:'#10b981',cursor:'pointer',fontSize:12,fontWeight:600 }}>+ Medicine</button>
                 <button onClick={()=>del(cx._id)} style={{ padding:'7px 11px',borderRadius:9,border:`1px solid ${theme==='dark'?'rgba(239,68,68,0.3)':'#fecaca'}`,background:theme==='dark'?'rgba(239,68,68,0.08)':'#fef2f2',color:'#ef4444',cursor:'pointer' }}>🗑️</button>
               </div>
             </div>
             {cx.medicines?.length > 0 && (
               <div style={{ borderTop:`1px solid ${c.div}`,padding:'11px 18px',background:theme==='dark'?'rgba(0,0,0,0.1)':'rgba(0,0,0,0.02)' }}>
                 <p style={{ color:c.txtM,fontSize:11,margin:'0 0 9px',fontWeight:700,letterSpacing:'0.04em' }}>MEDICINES</p>
                 <div style={{ display:'flex',flexWrap:'wrap',gap:7 }}>
                   {cx.medicines.map((m,i)=>(
                     <div key={i} style={{ background:c.inp,border:`1px solid ${c.cardBd}`,borderRadius:10,padding:'7px 12px',display:'flex',alignItems:'flex-start',gap:8 }}>
                       <div>
                         <p style={{ color:c.txt,fontWeight:600,margin:0,fontSize:13 }}>{m.medicineName}{m.dosage?` (${m.dosage})`:''}</p>
                         <p style={{ color:c.txtM,fontSize:11,margin:'2px 0 0' }}>×{m.quantity} · {m.frequency}{m.typicalDate?` · Day ${m.typicalDate}`:''}  {m.alertEnabled?'🔔':''}</p>
                       </div>
                       {/* POINT 10 — Delete individual medicine */}
                       <button onClick={()=>delMedicine(cx._id, i)} title="Remove medicine" style={{ background:'none',border:'none',cursor:'pointer',color:'#ef4444',fontSize:14,padding:0,lineHeight:1,flexShrink:0,marginTop:2 }}>✕</button>
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>
         ))}
       </div>
      }
    </div>
  );
}

// ════════ PROFILE ══════════════════════════════════════════════
// POINT 11 — Edit profile
function ProfileTab({ pharmacist, setPharmacist, theme, toggleTheme }) {
  const c = C(theme);
  const inp = { background:c.inp,border:`1px solid ${c.inpBd}`,borderRadius:10,padding:'10px 14px',color:c.txt,fontSize:13,outline:'none',width:'100%',boxSizing:'border-box',fontFamily:'DM Sans,sans-serif' };
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name:'', ownerName:'', phone:'', address:'' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetch(`${API}/me`,{headers:authH()}).then(r=>r.json()).then(d=>{ if (!d.error) setInfo(d); }).catch(()=>{});
  }, []);

  function startEdit() {
    const ph = info || pharmacist;
    setForm({ name:ph.name||'', ownerName:ph.ownerName||'', phone:ph.phone||'', address:ph.address||'' });
    setEditing(true);
  }

  async function saveProfile() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const d = await fetch(`${API}/profile`,{method:'PATCH',headers:authH(),body:JSON.stringify(form)}).then(r=>r.json());
      if (d.error) throw new Error(d.error);
      setInfo(d.pharmacist);
      // Update localStorage so dashboard header updates
      const cached = JSON.parse(localStorage.getItem('pharmacist_info')||'{}');
      const updated = { ...cached, ...d.pharmacist };
      localStorage.setItem('pharmacist_info', JSON.stringify(updated));
      setPharmacist(updated);
      setEditing(false);
      setToast({ msg:'✅ Profile updated!', type:'success' });
    } catch(e) { setToast({ msg:e.message, type:'error' }); }
    setSaving(false);
  }

  const ph = info || pharmacist;

  return (
    <div style={{ maxWidth:620 }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}

      {/* Theme */}
      <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:18,marginBottom:14 }}>
        <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 14px',fontSize:15 }}>🎨 Appearance</h3>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <p style={{ color:c.txt,fontWeight:600,margin:'0 0 3px',fontSize:14 }}>{theme==='dark'?'🌙 Dark Mode':'☀️ Light Mode'}</p>
            <p style={{ color:c.txtM,fontSize:12,margin:0 }}>Switch between dark and light theme</p>
          </div>
          <div onClick={toggleTheme} style={{ width:50,height:27,borderRadius:99,background:theme==='dark'?'#1B6EF3':'#e5e7eb',cursor:'pointer',position:'relative',transition:'background 0.3s',flexShrink:0 }}>
            <div style={{ position:'absolute',top:3,left:theme==='dark'?25:3,width:21,height:21,borderRadius:'50%',background:'white',boxShadow:'0 1px 4px rgba(0,0,0,0.2)',transition:'left 0.3s',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11 }}>
              {theme==='dark'?'🌙':'☀️'}
            </div>
          </div>
        </div>
      </div>

      {/* Profile info + edit — POINT 11 */}
      <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:18,marginBottom:14 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
          <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:0,fontSize:15 }}>🏥 Pharmacy Details</h3>
          {!editing && <button onClick={startEdit} style={{ padding:'7px 16px',borderRadius:9,border:`1px solid ${c.inpBd}`,background:c.secBg,color:c.txt,cursor:'pointer',fontWeight:600,fontSize:13 }}>✏️ Edit Profile</button>}
        </div>

        {editing ? (
          <div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:13 }}>
              <div style={{ gridColumn:'span 2' }}>
                <p style={{ color:c.txtM,fontSize:11,fontWeight:700,margin:'0 0 5px',letterSpacing:'0.04em' }}>PHARMACY NAME *</p>
                <input placeholder="Pharmacy Name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={inp}/>
              </div>
              <div>
                <p style={{ color:c.txtM,fontSize:11,fontWeight:700,margin:'0 0 5px',letterSpacing:'0.04em' }}>OWNER NAME</p>
                <input placeholder="Owner Name" value={form.ownerName} onChange={e=>setForm({...form,ownerName:e.target.value})} style={inp}/>
              </div>
              <div>
                <p style={{ color:c.txtM,fontSize:11,fontWeight:700,margin:'0 0 5px',letterSpacing:'0.04em' }}>PHONE NUMBER</p>
                <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={inp}/>
              </div>
              <div style={{ gridColumn:'span 2' }}>
                <p style={{ color:c.txtM,fontSize:11,fontWeight:700,margin:'0 0 5px',letterSpacing:'0.04em' }}>ADDRESS</p>
                <input placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} style={inp}/>
              </div>
            </div>
            <div style={{ display:'flex',gap:9 }}>
              <button onClick={saveProfile} disabled={saving||!form.name.trim()} style={{ flex:1,padding:'11px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'white',fontWeight:700,cursor:'pointer',opacity:saving||!form.name.trim()?0.7:1 }}>{saving?'Saving...':'💾 Save Changes'}</button>
              <button onClick={()=>setEditing(false)} style={{ flex:1,padding:'11px',borderRadius:11,border:`1px solid ${c.inpBd}`,background:c.secBg,color:c.secClr,cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
            {[['Pharmacy Name',ph?.name],['Owner',ph?.ownerName||'—'],['Email',ph?.email],['Phone',ph?.phone||'—'],['Address',ph?.address||'—'],['GSTIN',ph?.gstin||'—'],['License No',ph?.licenseNo||'—'],['Plan',ph?.isPremium?'✨ Premium':'Free']].map(([l,v])=>(
              <div key={l} style={{ background:c.inp,borderRadius:11,padding:'11px 13px' }}>
                <p style={{ color:c.txtM,fontSize:10,fontWeight:700,margin:'0 0 3px',letterSpacing:'0.04em' }}>{l.toUpperCase()}</p>
                <p style={{ color:c.txt,fontWeight:600,margin:0,fontSize:13,wordBreak:'break-all' }}>{v}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Premium upgrade */}
      {!ph?.isPremium && (
        <div style={{ background:'linear-gradient(135deg,rgba(16,185,129,0.07),rgba(27,110,243,0.07))',border:'1px solid rgba(16,185,129,0.2)',borderRadius:18,padding:22,textAlign:'center' }}>
          <div style={{ fontSize:36,marginBottom:10 }}>✨</div>
          <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 7px' }}>Upgrade to Premium</h3>
          <p style={{ color:c.txtM,fontSize:14,marginBottom:18 }}>Analytics · Suppliers · Requirements · Customer Tracking</p>
          <div style={{ display:'flex',gap:11,justifyContent:'center',flexWrap:'wrap' }}>
            {[['Monthly','₹299/mo'],['Annual','₹2,999/yr']].map(([n,p])=>(
              <div key={n} style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:14,padding:'15px 22px',minWidth:140,textAlign:'center' }}>
                <p style={{ color:c.txt,fontWeight:700,margin:'0 0 5px',fontFamily:'Sora,sans-serif' }}>{n}</p>
                <p style={{ color:'#10b981',fontWeight:800,fontSize:17,margin:'0 0 11px',fontFamily:'Sora,sans-serif' }}>{p}</p>
                <button onClick={()=>alert('Add RAZORPAY_KEY_ID to backend/.env')} style={{ width:'100%',padding:'8px',borderRadius:9,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'white',fontWeight:700,cursor:'pointer',fontSize:13 }}>Upgrade</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════ MAIN DASHBOARD ══════════════════════════════════════
export default function PharmacistDashboard() {
  const [pharmacist, setPharmacist] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [toastState, setToastState] = useState(null);
  const [theme, toggleTheme] = useTheme();
  const showToast = (msg, type='success') => setToastState({ msg, type });
  const c = C(theme);

  useEffect(() => {
    const token = getToken(), info = localStorage.getItem('pharmacist_info');
    if (token && info) setPharmacist(JSON.parse(info));
  }, []);

  function logout() { localStorage.removeItem('pharmacist_token'); localStorage.removeItem('pharmacist_info'); setPharmacist(null); }

  if (!pharmacist) return <LoginScreen onLogin={setPharmacist}/>;

  const pharmacistId = pharmacist._id || pharmacist.id;
  const isPremium = pharmacist.isPremium === true;

  return (
    <div style={{ display:'flex',minHeight:'100vh',background:c.bg,color:c.txt,fontFamily:'DM Sans,sans-serif' }}>
      {toastState && <Toast msg={toastState.msg} type={toastState.type} onClose={()=>setToastState(null)}/>}
      <NotifPanel pharmacistId={pharmacistId} theme={theme}/>

      {/* Sidebar */}
      <div style={{ width:215,flexShrink:0,background:c.sb,borderRight:`1px solid ${c.sbBd}`,display:'flex',flexDirection:'column',position:'sticky',top:0,height:'100vh',overflow:'auto' }}>
        <div style={{ padding:'16px 14px 14px',borderBottom:`1px solid ${c.sbBd}` }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
            <div style={{ display:'flex',alignItems:'center',gap:9 }}>
              <div style={{ width:34,height:34,borderRadius:11,background:'linear-gradient(135deg,#10b981,#059669)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,boxShadow:'0 3px 10px rgba(16,185,129,0.3)' }}>🏥</div>
              <div>
                <p style={{ color:c.txt,fontWeight:700,margin:0,fontSize:13,fontFamily:'Sora,sans-serif' }}>{pharmacist.name?.split(' ').slice(0,2).join(' ')}</p>
                <p style={{ color:isPremium?'#f59e0b':'rgba(107,114,128,0.8)',fontSize:10,margin:0,fontWeight:600 }}>{isPremium?'✨ Premium':'Free Plan'}</p>
              </div>
            </div>
            <button onClick={toggleTheme} title={`Switch to ${theme==='dark'?'light':'dark'} mode`} style={{ width:30,height:30,borderRadius:9,border:`1px solid ${c.sbBd}`,background:c.inp,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,transition:'all 0.2s',flexShrink:0 }}>
              {theme==='dark'?'☀️':'🌙'}
            </button>
          </div>
        </div>

        <div style={{ flex:1,padding:'11px 7px',overflowY:'auto' }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const locked = tab.premium && !isPremium;
            return (
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                style={{ width:'100%',display:'flex',alignItems:'center',gap:9,padding:'8px 11px',borderRadius:11,border:'none',cursor:'pointer',marginBottom:2,textAlign:'left',
                  background:active?(theme==='dark'?'rgba(16,185,129,0.14)':'rgba(16,185,129,0.1)'):'transparent',
                  color:active?'#10b981':locked?c.txtM:c.txtS,
                  fontWeight:active?700:500,fontSize:13,
                  fontFamily:active?'Sora,sans-serif':'DM Sans,sans-serif',
                  transition:'all 0.15s',borderLeft:active?'2px solid #10b981':'2px solid transparent' }}>
                <span style={{ fontSize:15 }}>{tab.icon}</span>
                <span style={{ flex:1 }}>{tab.label}</span>
                {locked && <span style={{ fontSize:9,color:c.txtM,background:c.inp,padding:'1px 5px',borderRadius:5 }}>PRO</span>}
              </button>
            );
          })}
        </div>

        <div style={{ padding:'11px 7px',borderTop:`1px solid ${c.sbBd}` }}>
          <Link to="/" style={{ display:'flex',alignItems:'center',gap:7,padding:'8px 11px',borderRadius:11,color:c.txtM,fontSize:12,textDecoration:'none',marginBottom:3,transition:'all 0.15s' }} onMouseEnter={e=>e.currentTarget.style.color=c.txt} onMouseLeave={e=>e.currentTarget.style.color=c.txtM}>← MediMap</Link>
          <button onClick={logout} style={{ width:'100%',display:'flex',alignItems:'center',gap:7,padding:'8px 11px',borderRadius:11,border:'none',background:theme==='dark'?'rgba(239,68,68,0.07)':'#fef2f2',color:'#ef4444',cursor:'pointer',fontSize:12,fontWeight:600,textAlign:'left' }}>🚪 Logout</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1,overflowY:'auto',maxHeight:'100vh' }}>
        <div style={{ padding:'18px 26px 0',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22,position:'sticky',top:0,zIndex:50,background:c.bg,paddingBottom:14,borderBottom:`1px solid ${c.sbBd}` }}>
          <div>
            <h1 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:0,fontSize:19,fontWeight:800 }}>
              {TABS.find(t=>t.id===activeTab)?.icon} {TABS.find(t=>t.id===activeTab)?.label}
            </h1>
            <p style={{ color:c.txtM,margin:'2px 0 0',fontSize:12 }}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
          </div>
          <div style={{ width:54 }}/>
        </div>
        <div style={{ padding:'0 26px 26px' }}>
          {activeTab==='overview'     && <OverviewTab pharmacist={pharmacist} isPremium={isPremium} theme={theme}/>}
          {activeTab==='stock'        && <StockTab toast={showToast} theme={theme}/>}
          {activeTab==='billing'      && <BillingTab pharmacist={pharmacist} toast={showToast} theme={theme}/>}
          {activeTab==='analytics'    && <AnalyticsTab isPremium={isPremium} theme={theme}/>}
          {activeTab==='suppliers'    && <SuppliersTab isPremium={isPremium} toast={showToast} theme={theme}/>}
          {activeTab==='requirements' && <RequirementsTab isPremium={isPremium} toast={showToast} theme={theme}/>}
          {activeTab==='customers'    && <CustomersTab isPremium={isPremium} toast={showToast} theme={theme}/>}
          {activeTab==='profile'      && <ProfileTab pharmacist={pharmacist} setPharmacist={setPharmacist} theme={theme} toggleTheme={toggleTheme}/>}
        </div>
      </div>
    </div>
  );
}
