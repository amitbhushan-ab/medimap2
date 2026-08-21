// frontend/src/pages/PharmacistDashboard.jsx -- v6 ALL 11 POINTS
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StockOCR from '../components/StockOCR';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const getToken = () => localStorage.getItem('pharmacist_token');
const getPharmacist = () => {
 try { return JSON.parse(localStorage.getItem('pharmacist_info')); } catch { return null; }
};
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

function PortalIcon({ name, size = 18, color = 'currentColor' }) {
 const glyphs = {
 spark: <path d="M12 2l1.8 5.7L20 9.8l-4.7 3.4L17 19l-5-3.1L7 19l1.7-5.8L4 9.8l6.2-2.1L12 2z" fill="currentColor"/>,
 chart: <><path d="M4 19h16"/><path d="M7 16V9"/><path d="M12 16V5"/><path d="M17 16v-7"/></>,
 package: <><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/><path d="M8.5 5.2 17.5 9.8"/></>,
 warning: <><path d="M12 9v4"/><path d="M12 16.5h.01"/><path d="M10.3 4.8 2.4 18a1.8 1.8 0 0 0 1.6 2.7h16a1.8 1.8 0 0 0 1.6-2.7L13.7 4.8a2 2 0 0 0-3.4 0Z"/></>,
 error: <><path d="M15 9 9 15"/><path d="M9 9l6 6"/><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"/></>,
 bell: <><path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-4-5.7V5a2 2 0 0 0-4 0v.3A6 6 0 0 0 6 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1"/></>,
 note: <><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9 12h6M9 16h6"/></>,
 user: <><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></>,
 settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.9l.06.06a2 2 0 1 1-2.8 2.8l-.06-.06a1.7 1.7 0 0 0-1.9-.34 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.34l-.06.06a2 2 0 1 1-2.8-2.8l.06-.06A1.7 1.7 0 0 0 5 15.4a1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.5A1.7 1.7 0 0 0 5 9.4a1.7 1.7 0 0 0-.34-1.9l-.06-.06a2 2 0 1 1 2.8-2.8l.06.06A1.7 1.7 0 0 0 9.4 5h.2a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.5A1.7 1.7 0 0 0 15.6 5a1.7 1.7 0 0 0 1.9-.34l.06-.06a2 2 0 1 1 2.8 2.8l-.06.06A1.7 1.7 0 0 0 20 9.4v.2a1.7 1.7 0 0 0 1.5 1H22a2 2 0 1 1 0 4h-.5a1.7 1.7 0 0 0-1.1.6Z"/></>,
 sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
 moon: <path d="M17.7 14.4A8 8 0 0 1 9.6 3a8 8 0 1 0 8.1 11.4Z"/>,
 logout: <><path d="M10 17l1 1 5-5-5-5-1 1"/><path d="M15 13H3"/><path d="M21 21V3"/></>,
 refresh: <><path d="M21 12a9 9 0 0 1-15.4 6.4M3 12a9 9 0 0 1 15.4-6.4"/><path d="M3 4v5h5"/><path d="M21 20v-5h-5"/></>,
 printer: <><path d="M6 9V3h12v6"/><path d="M6 18H5a2 2 0 0 1-2-2v-4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4a2 2 0 0 1-2 2h-1"/><path d="M6 14h12v7H6z"/></>,
 chat: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></>,
 trash: <><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/><path d="M10 11v5M14 11v5"/></>,
 save: <><path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3"/><path d="M8 14h8"/></>,
 coupon: <><path d="M3 7a2 2 0 0 0 2 2 2 2 0 0 1 0 4 2 2 0 0 0-2 2v4h18v-4a2 2 0 0 0-2-2 2 2 0 0 1 0-4 2 2 0 0 0 2-2V3H3z"/><path d="M9 8h.01M15 16h.01"/><path d="M9 16l6-8"/></>,
 store: <><path d="M4 10h16"/><path d="M5 10V6h14v4"/><path d="M6 10v10h12V10"/><path d="M9 20v-6h6v6"/></>,
 medicine: <><path d="M8 3h8v4H8z"/><path d="M10 7v14h4V7"/><path d="M12 10v8"/><path d="M9 13h6"/></>,
 check: <><path d="M20 6 9 17l-5-5"/></>,
 close: <><path d="M18 6 6 18M6 6l12 12"/></>,
 tag: <><path d="M20 13 13 20a2 2 0 0 1-2.8 0L4 13V4h9l7 7Z"/><circle cx="8.5" cy="8.5" r="1.5"/></>,
 trend: <><path d="M4 18h16"/><path d="M7 13l3-3 3 3 5-6"/></>,
 };

 const glyph = glyphs[name];
 if (!glyph) return null;
 return (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 {glyph}
 </svg>
 );
}

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
 <PortalIcon name={expanded ? 'close' : 'trend'} size={13} color={c.txtM} /> {past.length} Past Order{past.length!==1?'s':''}
 </button>
 {expanded && (
 <div style={{ marginTop:8,display:'flex',flexDirection:'column',gap:5 }}>
 {past.map((o,i)=>(
 <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:`1px solid ${c.div}` }}>
 <div style={{ flex:1 }}>
 <span style={{ color:c.txt,fontSize:12,fontWeight:600 }}>{o.medicineName}</span>
 <span style={{ color:c.txtM,fontSize:11,marginLeft:8 }}>× {o.quantity}</span>
 {o.expectedDate && <span style={{ color:c.txtM,fontSize:11,marginLeft:8 }}>Â· {o.expectedDate}</span>}
 {o.cancellationReason && <p style={{ color:'#ef4444',fontSize:11,margin:'2px 0 0',fontStyle:'italic' }}>Reason: {o.cancellationReason}</p>}
 {o.emailSent && <span style={{ color:'#10b981',fontSize:10,marginLeft:8,display:'inline-flex',alignItems:'center',gap:4 }}><PortalIcon name="check" size={10} color="#10b981" />Email sent</span>}
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
 {!loading&&!options.length&&<p style={{ color:c.txtM,fontSize:12,padding:'8px 13px',margin:0 }}>No matches -- press Enter to use typed name</p>}
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
 <option value="">-- Select day --</option>
 {WEEK_DAYS.map((d,i)=><option key={d} value={i+1}>{d}</option>)}
 </select>
 </>):frequency==='monthly'?(<>
 <label style={{ color:c.txtM,fontSize:11,fontWeight:700,display:'block',marginBottom:5,letterSpacing:'0.04em' }}>DAY OF MONTH</label>
 <select value={typicalDate} onChange={e=>onDateChange(e.target.value)} style={inp}>
 <option value="">-- Select day --</option>
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
 {title:'Sales Analytics',desc:'Monthly revenue charts, profit per medicine, avg bill value'},
 {title:'Margin Analysis',desc:'See which medicines give the highest profit margin'},
 {title:'Expiry Alerts',desc:'30/15/7-day alerts before medicines expire'},
 {title:'Slow-Moving Stock',desc:'Identify medicines sitting idle before they expire'},
 {title:'Top Sellers',desc:'Best-performing medicines by revenue and quantity'},
 {title:'Supplier Management',desc:'Track distributors, place orders, get email confirmations'},
 {title:'Purchase Requirements',desc:'Create buy lists and email any supplier in one click'},
 {title:'Regular Customers',desc:'Track patient medication history with refill reminders'},
 {title:'Smart Alerts',desc:'Notified before a regular customer is due for medicine'},
 ];
 return (
 <div style={{ maxWidth:720,margin:'0 auto' }}>
 <div style={{ background:'linear-gradient(135deg,#10b981 0%,#059669 40%,#1B6EF3 100%)',borderRadius:22,padding:'32px 28px',textAlign:'center',marginBottom:22,position:'relative',overflow:'hidden' }}>
 <div style={{ position:'absolute',top:-20,right:-20,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,0.08)' }}/>
 <div style={{ position:'relative',zIndex:1 }}>
 <div style={{ width:48,height:48,borderRadius:'50%',background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px' }}><svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg></div>
 <h2 style={{ color:'white',fontFamily:'Sora,sans-serif',margin:'0 0 8px',fontSize:24,fontWeight:800 }}>Unlock Premium</h2>
 <p style={{ color:'rgba(255,255,255,0.8)',fontSize:14,margin:'0 0 22px',maxWidth:380,marginInline:'auto' }}>
 Get <b>{feature}</b> + all premium features
 </p>
 <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap' }}>
 {[['MONTHLY','Rs.299','Rs.299/month - cancel anytime'],['ANNUAL','Rs.2,999','Rs.250/mo - save 17%']].map(([n,p,sub],i)=>(
 <div key={n} style={{ background:i===1?'rgba(255,255,255,0.22)':'rgba(255,255,255,0.12)',backdropFilter:'blur(10px)',border:i===1?'2px solid white':'1px solid rgba(255,255,255,0.25)',borderRadius:16,padding:'16px 22px',minWidth:160,textAlign:'center',position:'relative' }}>
 {i===1&&<div style={{ position:'absolute',top:-11,left:'50%',transform:'translateX(-50%)',background:'#f59e0b',color:'white',fontSize:10,fontWeight:800,padding:'2px 10px',borderRadius:999,whiteSpace:'nowrap' }}>BEST VALUE</div>}
 <p style={{ color:'rgba(255,255,255,0.8)',fontSize:11,margin:'0 0 4px',fontWeight:700 }}>{n}</p>
 <p style={{ color:'white',fontSize:26,fontWeight:800,margin:'0 0 2px',fontFamily:'Sora,sans-serif' }}>{p}</p>
 <p style={{ color:'rgba(255,255,255,0.55)',fontSize:11,margin:'0 0 12px' }}>{sub}</p>
 <button onClick={()=>alert('Payment gateway mocked for demo! Feature fully activated.')} style={{ width:'100%',padding:'8px',borderRadius:9,border:'none',background:'white',color:'#059669',fontWeight:700,cursor:'pointer',fontSize:13,fontFamily:'Sora,sans-serif' }}>Buy {n==='MONTHLY'?'Monthly':'Annual'}</button>
 </div>
 ))}
 </div>
 </div>
 </div>
 <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'16px 0 14px',fontSize:14,textAlign:'center' }}>Everything included</h3>
 <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:9 }}>
 {FEATURES.map((f,i)=>(
 <div key={i} style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:13,padding:'13px 15px' }}>
 <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:5 }}>
 <div style={{ width:6,height:6,borderRadius:'50%',background:'#10b981',flexShrink:0 }}/>
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
 <button onClick={() => setOpen(!open)} style={{ position:'relative',width:40,height:40,borderRadius:11,border:`1px solid ${c.cardBd}`,background:open?(theme==='dark'?'rgba(16,185,129,0.12)':'#ecfdf5'):c.card,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:c.txtS,boxShadow:'0 8px 24px rgba(0,0,0,0.08)' }}>
 <PortalIcon name="bell" size={18} color={c.txtS} />
 {unread > 0 && <span style={{ position:'absolute',top:-4,right:-4,minWidth:17,height:17,background:'#ef4444',color:'white',fontSize:10,fontWeight:800,borderRadius:999,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px',border:'2px solid #060D1F' }}>{unread>9?'9+':unread}</span>}
 </button>
 {open && (
 <div style={{ position:'absolute',top:48,right:0,width:390,maxWidth:'calc(100vw - 32px)',background:c.modal,border:`1px solid ${c.cardBd}`,borderRadius:18,boxShadow:'0 20px 60px rgba(0,0,0,0.25)',zIndex:1200,overflow:'hidden' }}>
 <div style={{ padding:'12px 18px',borderBottom:`1px solid ${c.div}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:theme==='dark'?'rgba(16,185,129,0.06)':'#f8fafc' }}>
 <span style={{ color:c.txt,fontWeight:700,fontFamily:'Sora,sans-serif',fontSize:15,display:'flex',alignItems:'center',gap:8 }}><PortalIcon name="tag" size={15} color={c.txt} /> Price requests</span>
 {unread>0 && <span style={{ background:'#ef4444',color:'white',fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:999 }}>{unread} new</span>}
 </div>
 <div style={{ maxHeight:440,overflowY:'auto' }}>
 {!notifs.length ? <div style={{ textAlign:'center',padding:40,color:c.txtM }}><div style={{ fontSize:32,marginBottom:8 }}><PortalIcon name="bell" size={28} color={c.txtM} /></div><div style={{ fontSize:13 }}>No requests yet</div></div> :
 notifs.map(n => (
 <div key={n.id} style={{ padding:'14px 18px',borderBottom:`1px solid ${c.div}`,background:n.isRead?'transparent':theme==='dark'?'rgba(27,110,243,0.04)':'rgba(27,110,243,0.02)' }}>
 <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}>
 <div style={{ display:'flex',gap:10,alignItems:'flex-start' }}><div style={{ width:30,height:30,borderRadius:9,background:theme==='dark'?'rgba(16,185,129,0.14)':'#ecfdf5',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><PortalIcon name="medicine" size={14} color="#10b981" /></div><div><p style={{ color:c.txt,fontWeight:600,margin:0,fontSize:14 }}>{n.submissionData?.medicineName}</p><p style={{ color:c.txtM,fontSize:11,margin:'2px 0 0' }}>{ago(n.createdAt)} · {n.submissionData?.userName||'User'}</p></div></div>
 {!n.isRead && <span style={{ width:8,height:8,borderRadius:'50%',background:'#3b82f6',flexShrink:0,marginTop:4 }}/>}
 </div>
 <div style={{ background:theme==='dark'?'rgba(0,0,0,0.2)':'#f9fafb',borderRadius:10,padding:'9px 13px',marginBottom:10,fontSize:13 }}>
 <div style={{ display:'flex',justifyContent:'space-between' }}><span style={{ color:c.txtM }}>Price</span><span style={{ color:'#10b981',fontWeight:700 }}>₹{n.submissionData?.price}</span></div>
 <div style={{ display:'flex',justifyContent:'space-between',marginTop:3 }}><span style={{ color:c.txtM }}>Pharmacy</span><span style={{ color:c.txtS }}>{n.submissionData?.pharmacyName}</span></div>
 </div>
 {n.submissionData?.imageUrl && <img src={n.submissionData.imageUrl} alt="bill" onClick={() => window.open(n.submissionData.imageUrl,'_blank')} onError={e=>e.target.style.display='none'} style={{ width:'100%',maxHeight:100,objectFit:'contain',borderRadius:8,marginBottom:8,cursor:'pointer',background:theme==='dark'?'rgba(0,0,0,0.2)':'#f3f4f6' }}/>}
 {n.pharmacistResponse ? (
 <div style={{ padding:'7px 12px',borderRadius:8,fontSize:12,fontWeight:600,background:n.pharmacistResponse==='approved'?(theme==='dark'?'rgba(16,185,129,0.1)':'#ecfdf5'):(theme==='dark'?'rgba(239,68,68,0.1)':'#fef2f2'),color:n.pharmacistResponse==='approved'?'#10b981':'#ef4444' }}>
 {n.pharmacistResponse==='approved'?'Approved and updated':'Rejected'}
 </div>
 ) : (
 <div>
 <textarea value={notes[n.id]||''} onChange={e=>setNotes(p=>({...p,[n.id]:e.target.value}))} placeholder="Optional note..." rows={2} style={{ width:'100%',background:theme==='dark'?'rgba(0,0,0,0.2)':'#f9fafb',border:`1px solid ${c.inpBd}`,borderRadius:8,padding:'6px 10px',color:c.txt,fontSize:12,resize:'none',outline:'none',marginBottom:8,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box' }}/>
 <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
 <button onClick={()=>respond(n.id,'approved')} disabled={responding===n.id} style={{ padding:'8px',borderRadius:9,border:'none',background:'linear-gradient(135deg,#0f766e,#10b981)',color:'white',fontWeight:700,cursor:'pointer',fontSize:12,opacity:responding===n.id?0.6:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>{responding===n.id ? 'Processing' : <><PortalIcon name="check" size={12} color="white" /> Approve</>}</button>
 <button onClick={()=>respond(n.id,'rejected')} disabled={responding===n.id} style={{ padding:'8px',borderRadius:9,border:'none',background:'linear-gradient(135deg,#b91c1c,#ef4444)',color:'white',fontWeight:700,cursor:'pointer',fontSize:12,opacity:responding===n.id?0.6:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>{responding===n.id ? 'Processing' : <><PortalIcon name="close" size={12} color="white" /> Reject</>}</button>
 </div>
 </div>
 )}
 </div>
 ))}
 </div>
 <div style={{ padding:'8px 16px',borderTop:`1px solid ${c.div}`,textAlign:'center' }}>
 <button onClick={load} style={{ background:'none',border:'none',color:'#10b981',fontSize:12,fontWeight:600,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:6 }}><PortalIcon name="refresh" size={12} color="#10b981" /> Refresh</button>
 </div>
 </div>
 )}
 </div>
 );
}

function LoginScreen({ onLogin }) {
 const [tab, setTab] = useState('login');
 const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', address:'', gstin:'', licenseNo:'' });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const loginMutation = useMutation(api.pharmacistAuth.login);
 const registerMutation = useMutation(api.pharmacistAuth.register);

 async function submit() {
 if (!form.email || !form.password) { setError('Email and password required'); return; }
 setLoading(true); setError('');
 try {
 let d;
 if (tab === 'login') {
 d = await loginMutation({ email: form.email, password: form.password });
 } else {
 d = await registerMutation({ ...form });
 }
 localStorage.setItem('pharmacist_token', d.token);
 localStorage.setItem('pharmacist_info', JSON.stringify(d.pharmacist));
 onLogin(d.pharmacist);
 } catch(e) { setError(e.message || "Authentication failed"); }
 setLoading(false);
 }

 const inp = { background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:12,padding:'12px 16px',color:'white',fontSize:14,outline:'none',width:'100%',boxSizing:'border-box',fontFamily:'DM Sans,sans-serif' };

 return (
 <div style={{ minHeight:'100vh',background:'linear-gradient(135deg,#060D1F 0%,#0B1628 60%,#0A2030 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,overflow:'hidden',position:'relative' }}>
 <div style={{ position:'absolute',top:'15%',left:'10%',width:280,height:280,borderRadius:'50%',background:'radial-gradient(circle,rgba(16,185,129,0.2),transparent)',filter:'blur(40px)' }}/>
 <div style={{ position:'absolute',bottom:'20%',right:'10%',width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(27,110,243,0.18),transparent)',filter:'blur(30px)' }}/>
 <div style={{ width:'100%',maxWidth:480,position:'relative',zIndex:10 }}>
 <div style={{ textAlign:'center',marginBottom:28 }}>
 <div style={{ width:68,height:68,borderRadius:22,background:'linear-gradient(135deg,#10b981,#059669)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',boxShadow:'0 8px 32px rgba(16,185,129,0.4)' }}><svg width="30" height="30" fill="white" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg></div>
 <h1 style={{ fontFamily:'Sora,sans-serif',fontSize:26,fontWeight:800,color:'white',margin:0 }}>Pharmacist Portal</h1>
 <p style={{ color:'rgba(255,255,255,0.4)',margin:'6px 0 0',fontSize:13 }}>MediMap -- Pharmacy Management Dashboard</p>
 </div>
 <div style={{ background:'rgba(255,255,255,0.04)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:22,padding:28 }}>
 <div style={{ display:'flex',gap:8,marginBottom:22,background:'rgba(0,0,0,0.3)',padding:4,borderRadius:13 }}>
 {['login','register'].map(t=>(
 <button key={t} onClick={()=>setTab(t)} style={{ flex:1,padding:'10px',borderRadius:10,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'Sora,sans-serif',background:tab===t?'white':'transparent',color:tab===t?'#111':'rgba(255,255,255,0.4)',transition:'all 0.2s' }}>
 {t==='login'?'Login':'Register'}
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
 {loading?'Please wait...':tab==='login'?'Login to Dashboard':'Create Account'}
 </button>
 <p style={{ textAlign:'center',fontSize:12,color:'rgba(255,255,255,0.2)',marginTop:12 }}>Demo: apollo@medimap.com / Apollo@123</p>
 </div>
 <div style={{ textAlign:'center',marginTop:14 }}><Link to="/" style={{ color:'rgba(255,255,255,0.3)',fontSize:13,textDecoration:'none' }}>← Back to MediMap</Link></div>
 </div>
 </div>
 );
}

const TABS = [
 { id:'overview',label:'Overview' },
 { id:'stock',label:'Stock' },
 { id:'billing',label:'Billing' },
 { id:'analytics',label:'Analytics',premium:true },
 { id:'suppliers',label:'Suppliers',premium:true },
 { id:'customers',label:'Customers',premium:true },
 { id:'profile',label:'Profile' },
];

function SC({ label,value,gradient,glow }) {
 return (
 <div style={{ background:gradient,borderRadius:18,padding:'20px 18px',color:'white',boxShadow:glow,position:'relative',overflow:'hidden' }}>
 <div style={{ position:'absolute',top:-8,right:-8,width:60,height:60,borderRadius:'50%',background:'rgba(255,255,255,0.08)' }}/>
 <div style={{ fontSize:11,opacity:0.75,marginBottom:6,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px' }}>{label}</div>
 <div style={{ fontSize:22,fontWeight:800,fontFamily:'Sora,sans-serif',lineHeight:1 }}>{value}</div>
 </div>
 );
}


// ════════ OVERVIEW ════════════════════════════════════════════
function OverviewTab({ pharmacist, isPremium, theme }) {
 const c = C(theme);
 const pharmacistId = pharmacist?._id || "";
 
 const stockData = useQuery(api.pharmacistStock.getStock, { pharmacistId });
 const billsData = useQuery(api.pharmacistBills.getBills, { pharmacistId });
 const customersData = useQuery(api.pharmacistCustomers.getCustomers, { pharmacistId }) || [];
 const alerts = [];
 const todayDay = new Date().getDate();
 customersData.forEach(c => {
    (c.medicines || []).forEach(m => {
        if (m.frequency === 'monthly' && m.typicalDate) {
            let d = parseInt(m.typicalDate);
            if (!isNaN(d) && d >= todayDay && d <= todayDay + 3) {
                alerts.push({ customerName: c.name, medicine: m.medicineName, type: 'refill', dueIn: d - todayDay, phone: c.phone });
            }
        }
    });
 });
 
 const stock = stockData?.stock || [];
 const bills = billsData?.bills || [];
 const today = new Date().toDateString();
 const tb = bills.filter(x=>new Date(x.createdAt).toDateString()===today);
 
 const stats = { 
 totalStock: stock.length, 
 lowStock: stock.filter(x=>(x.units||0)<=(x.minStock||10)&&(x.units||0)>0).length, 
 outOfStock: stock.filter(x=>(x.units||0)===0).length, 
 todayRevenue: tb.reduce((s,x)=>s+x.grandTotal,0).toFixed(0), 
 todayBills: tb.length, 
 totalRevenue: bills.reduce((s,x)=>s+x.grandTotal,0).toFixed(0), 
 totalBills: bills.length 
 };
 
 const displayBills = bills.slice(0,5);
 return (
 <div>
 <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(148px,1fr))',gap:14,marginBottom:22 }}>
 <SC label="Today Revenue" value={`₹${stats?.todayRevenue||0}`} gradient="linear-gradient(135deg,#10b981,#059669)" glow="0 4px 20px rgba(16,185,129,0.3)"/>
 <SC label="Today Bills" value={stats?.todayBills||0} gradient="linear-gradient(135deg,#1B6EF3,#0ea5e9)" glow="0 4px 20px rgba(27,110,243,0.3)"/>
 <SC label="Stock Items" value={stats?.totalStock||0} gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)" glow="0 4px 20px rgba(139,92,246,0.3)"/>
 <SC icon={<PortalIcon name="warning" size={16} color="white" />} label="Low Stock" value={stats?.lowStock||0} gradient="linear-gradient(135deg,#f59e0b,#d97706)" glow="0 4px 20px rgba(245,158,11,0.3)"/>
 <SC icon={<PortalIcon name="error" size={16} color="white" />} label="Out of Stock" value={stats?.outOfStock||0} gradient="linear-gradient(135deg,#ef4444,#dc2626)" glow="0 4px 20px rgba(239,68,68,0.3)"/>
 <SC label="Total Revenue" value={`₹${stats?.totalRevenue||0}`} gradient="linear-gradient(135deg,#06b6d4,#0891b2)" glow="0 4px 20px rgba(6,182,212,0.3)"/>
 </div>
 {isPremium && alerts.length > 0 && (
 <div style={{ background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:18,padding:18,marginBottom:18 }}>
 <h3 style={{ color:'#fca5a5',fontFamily:'Sora,sans-serif',margin:'0 0 12px',fontSize:14 }}> Upcoming Customers (3 Days)</h3>
 {alerts.map((a,i) => (
 <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(0,0,0,0.12)',borderRadius:10,padding:'9px 14px',marginBottom:6 }}>
 <div><p style={{ color:c.txt,fontWeight:600,margin:0,fontSize:13 }}>{a.customerName}</p><p style={{ color:c.txtM,fontSize:11,margin:'1px 0 0' }}>{a.medicineName} ×{a.quantity} · {a.customerPhone}</p></div>
 <span style={{ padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:800,background:a.daysFromNow===0?'#ef4444':a.daysFromNow===1?'#f59e0b':'#1B6EF3',color:'white' }}>{a.urgency==='today'?'TODAY':a.urgency==='tomorrow'?'TOMORROW':a.urgency}</span>
 </div>
 ))}
 </div>
 )}
 {displayBills.length > 0 && (
 <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:18 }}>
 <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 12px',fontSize:14 }}> Recent Bills</h3>
 {displayBills.map((b,i) => (
 <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:i<bills.length-1?`1px solid ${c.div}`:'none' }}>
 <div><p style={{ color:c.txt,fontWeight:600,margin:0,fontSize:13 }}>{b.billNumber||b.id} -- {b.customerName}</p><p style={{ color:c.txtM,fontSize:11,margin:'1px 0 0' }}>{new Date(b.createdAt).toLocaleString('en-IN')} · {b.paymentMode}</p></div>
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
 const pharmacist = getPharmacist();
 const pharmacistId = pharmacist?._id || "";
 
 // Convex Hooks
 const stockData = useQuery(api.pharmacistStock.getStock, { pharmacistId });
 const suppliers = useQuery(api.pharmacistSuppliers.getSuppliers, { pharmacistId }) || [];
 
 const addStockMut = useMutation(api.pharmacistStock.addStock);
 const updateStockMut = useMutation(api.pharmacistStock.updateStock);
 const deleteStockMut = useMutation(api.pharmacistStock.deleteStock);

 const stock = stockData?.stock || [];
 const stats = stockData || {};
 
 const [showAdd, setShowAdd] = useState(false);
 const [showOCR, setShowOCR] = useState(false);
 const [editing, setEditing] = useState(null);
 const loading = stockData === undefined;
 const [saving, setSaving] = useState(false);
 const [search, setSearch] = useState('');
 const [sort, setSort] = useState('name');
 const [form, setForm] = useState(eForm);

 const inp = { background:c.inp,border:`1px solid ${c.inpBd}`,borderRadius:10,padding:'9px 13px',color:c.txt,fontSize:13,outline:'none',width:'100%',boxSizing:'border-box',fontFamily:'DM Sans,sans-serif' };

 async function save() {
 if (!form.medicineName.trim()) return toast('Medicine name required','error');
 if (!form.sellingPrice) return toast('Selling price required','error');
 if (form.units === '') return toast('Units required','error');
 setSaving(true);
 try {
 const payload = {
 pharmacistId,
 medicineName: form.medicineName,
 genericName: form.genericName,
 manufacturer: form.manufacturer,
 batchNo: form.batchNo,
 expiryDate: form.expiryDate,
 category: form.category,
 gstRate: parseFloat(form.gstRate) || 12,
 purchasePrice: parseFloat(form.purchasePrice) || 0,
 sellingPrice: parseFloat(form.sellingPrice),
 units: parseInt(form.units),
 minStock: parseInt(form.minStock) || 10,
 supplierId: form.supplierId,
 supplierName: form.supplierName
 };
 
 if (editing) {
 await updateStockMut({ id: editing, ...payload });
 toast('Stock updated');
 } else {
 await addStockMut({ ...payload });
 toast('Added and visible to customers');
 }
 setShowAdd(false); setEditing(null); setForm(eForm);
 } catch(e) { toast(e.message,'error'); }
 setSaving(false);
 }

 async function del(id) {
 if (!confirm('Delete this medicine from stock?')) return;
 try { 
 await deleteStockMut({ id });
 toast('Deleted'); 
 }
 catch(e) { toast(e.message,'error'); }
 }

 const filtered = stock.filter(s=>(s.medicineName||'').toLowerCase().includes((search||'').toLowerCase())).sort((a,b)=>sort==='units'?((a.units||0)-(b.units||0)):sort==='price'?((b.sellingPrice||0)-(a.sellingPrice||0)):(a.medicineName||'').localeCompare(b.medicineName||''));
 const margin = s => s.purchasePrice>0?(((s.sellingPrice-s.purchasePrice)/s.purchasePrice)*100).toFixed(0):'-';

 return (
 <div>
 <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:11,marginBottom:18 }}>
 {[{icon:<PortalIcon name="package" size={16} color="white" />,l:'Total',v:stats.total||0},{icon:<PortalIcon name="warning" size={16} color="white" />,l:'Low',v:stats.low||0},{icon:<PortalIcon name="error" size={16} color="white" />,l:'Out',v:stats.out||0},{icon:<PortalIcon name="trend" size={16} color="white" />,l:'Value',v:`₹${stats.value||0}`}].map(s=>(
 <div key={s.l} style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:14,padding:14 }}>
 <div style={{ fontSize:20,marginBottom:4 }}>{s.icon}</div>
 <div style={{ fontSize:18,fontWeight:800,color:c.txt,fontFamily:'Sora,sans-serif' }}>{s.v}</div>
 <div style={{ fontSize:11,color:c.txtM,marginTop:1 }}>{s.l}</div>
 </div>
 ))}
 </div>

 <button onClick={()=>{setShowOCR(!showOCR);setShowAdd(false);setEditing(null);}} style={{ width:'100%',padding:'12px',borderRadius:13,border:`2px dashed ${showOCR?'#10b981':'rgba(16,185,129,0.3)'}`,background:showOCR?'rgba(16,185,129,0.07)':'transparent',color:'#10b981',fontWeight:700,fontSize:14,cursor:'pointer',marginBottom:11,fontFamily:'Sora,sans-serif',transition:'all 0.2s' }}>
 <span style={{ display:'inline-flex',alignItems:'center',gap:8 }}><PortalIcon name="printer" size={14} color="#10b981" />{showOCR ? 'Hide OCR' : 'Scan purchase bill · Auto-fill stock'}</span>
 </button>
 {showOCR && <StockOCR onStockAdded={()=>{setShowOCR(false);}} toast={toast}/>}

 <div style={{ display:'flex',gap:10,marginBottom:14 }}>
 <input placeholder=" Search stock..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inp,flex:1 }}/>
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
 <div style={{ gridColumn:'span 2' }}>
 <p style={{ color:c.txtM,fontSize:11,fontWeight:700,margin:'0 0 6px',letterSpacing:'0.04em' }}> SUPPLIER TAG</p>
 <select value={form.supplierId} onChange={e=>{ const s=suppliers.find(x=>x._id===e.target.value); setForm({...form,supplierId:e.target.value,supplierName:s?.name||''}); }} style={inp}>
 <option value="">-- No supplier tagging --</option>
 {suppliers.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}
 </select>
 {form.supplierId && <p style={{ color:'#10b981',fontSize:11,margin:'4px 0 0',display:'flex',alignItems:'center',gap:5 }}><PortalIcon name="check" size={11} color="#10b981" /> Tagged: {form.supplierName}</p>}
 </div>
 </div>
 {form.purchasePrice && form.sellingPrice && parseFloat(form.purchasePrice)>0 && (
 <div style={{ marginTop:8,background:theme==='dark'?'rgba(16,185,129,0.08)':'#dcfce7',border:`1px solid ${theme==='dark'?'rgba(16,185,129,0.2)':'#bbf7d0'}`,borderRadius:9,padding:'7px 13px',color:'#10b981',fontSize:13,fontWeight:600 }}>
 Margin: {(((parseFloat(form.sellingPrice)-parseFloat(form.purchasePrice))/parseFloat(form.purchasePrice))*100).toFixed(1)}%
 </div>
 )}
 <div style={{ display:'flex',gap:9,marginTop:13 }}>
 <button onClick={save} disabled={saving} style={{ flex:1,padding:'11px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#0f766e,#10b981)',color:'white',fontWeight:700,cursor:'pointer',fontSize:14,opacity:saving?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:7 }}>{saving ? 'Saving...' : (<><PortalIcon name={editing ? 'save' : 'check'} size={13} color="white" /> {editing ? 'Update' : 'Add to stock'}</>)}</button>
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
 <td style={{ padding:'10px 13px',color:c.txtS,fontSize:12 }}>{s.batchNo||'--'}</td>
 <td style={{ padding:'10px 13px',color:s.expiryDate&&new Date(s.expiryDate)<new Date(Date.now()+30*86400000)?'#ef4444':c.txtS,fontSize:12 }}>{s.expiryDate||'--'}</td>
 <td style={{ padding:'10px 13px',color:c.txtS,fontSize:12 }}>₹{s.purchasePrice||0}</td>
 <td style={{ padding:'10px 13px',color:c.txt,fontWeight:600 }}>₹{s.sellingPrice}</td>
 <td style={{ padding:'10px 13px',color:'#10b981',fontWeight:700 }}>{m==='--'?'--':`${m}%`}</td>
 <td style={{ padding:'10px 13px',color:c.txt,fontWeight:700 }}>{s.units}</td>
 <td style={{ padding:'10px 13px' }}>{s.supplierName?<span style={{ fontSize:11,background:theme==='dark'?'rgba(27,110,243,0.15)':'#dbeafe',color:'#3b82f6',padding:'2px 8px',borderRadius:20,fontWeight:600 }}>{s.supplierName}</span>:<span style={{ color:c.txtM,fontSize:11 }}>--</span>}</td>
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
 {!filtered.length && <div style={{ textAlign:'center',padding:40,color:c.txtM }}>No stock. Scan bill or add manually!</div>}
 </div>
 {filtered.length > 0 && <div style={{ padding:'9px 16px',borderTop:`1px solid ${c.tblBd}`,display:'flex',justifyContent:'space-between' }}><span style={{ color:c.txtM,fontSize:12 }}>{filtered.length} items · ₹{stats.value||0}</span></div>}
 </div>
 )}
 </div>
 );
}

// ════════ BILLING ══════════════════════════════════════════════
function BillingTab({ toast, theme }) {
 const c = C(theme);
 const pharmacist = getPharmacist();
 const pharmacistId = pharmacist?._id || "";

 const stockData = useQuery(api.pharmacistStock.getStock, { pharmacistId });
 const customers = useQuery(api.pharmacistCustomers.getCustomers, { pharmacistId }) || [];
 const billsData = useQuery(api.pharmacistBills.getBills, { pharmacistId });
 
 const createBillMut = useMutation(api.pharmacistBills.createBill);
 
 const stock = stockData?.stock || [];
 const bills = billsData?.bills || [];
 
 const [items, setItems] = useState([]);
 const [customer, setCustomer] = useState({ name:'', phone:'', email:'', address:'' });
 const [discount, setDiscount] = useState(0);
 const [coupon, setCoupon] = useState('');
 const [couponApplied, setCouponApplied] = useState(false);
 const [couponDisc, setCouponDisc] = useState(0);
 const [payMode, setPayMode] = useState('Cash');
 const [bill, setBill] = useState(null);
 const [sSearch, setSSearch] = useState('');
 const [showManual, setShowManual] = useState(false);
 const [manual, setManual] = useState({ medicineName:'', price:'', quantity:'1' });
 const [loading, setLoading] = useState(false);
 const [delBill, setDelBill] = useState(null);
 const [deleting, setDeleting] = useState(false);
 const [generating, setGenerating] = useState(false);
 const [couponErr, setCouponErr] = useState('');

 const inp = { background:c.inp,border:`1px solid ${c.inpBd}`,borderRadius:10,padding:'9px 13px',color:c.txt,fontSize:13,outline:'none',width:'100%',boxSizing:'border-box',fontFamily:'DM Sans,sans-serif' };

 const sub = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
 const coupAmt = couponApplied ? sub * (couponDisc / 100) : 0;
 const grand = sub - coupAmt - (sub * (discount / 100));

 function validateCoupon() {
 if (coupon === 'WELCOME10' || coupon === 'MEDIMAP') { setCouponApplied(true); setCouponDisc(10); setCouponErr(''); }
 else { setCouponErr('Invalid coupon code'); }
 }

 async function generate() {
 if (!items.length) return toast('Add items to bill', 'error');
 if (!customer.name.trim()) return toast('Customer name required', 'error');
 setGenerating(true);
 try {
 const payload = {
 pharmacistId,
 customerName: customer.name,
 customerPhone: customer.phone,
 items: items.map(i => ({ stockId: i.stockId, medicineName: i.medicineName, quantity: i.quantity, unitPrice: i.price, total: i.price * i.quantity })),
 subtotal: sub,
 discountPercentage: discount,
 grandTotal: grand,
 paymentMode: payMode
 };
 const res = await createBillMut(payload);
 setBill({ ...payload, billNumber: res, _id: res, pharmacyName: pharmacist.pharmacyName, createdAt: Date.now() });
 toast('Bill generated');
 } catch(e) {
 toast(e.message, 'error');
 }
 setGenerating(false);
 }

 function addItem(s) {
 const id=s._id||s.id;
 if (items.find(i=>i.stockId===id)) { setItems(items.map(i=>i.stockId===id?{...i,quantity:i.quantity+1}:i)); return; }
 setItems([...items,{stockId:id,medicineName:s.medicineName,price:s.sellingPrice,quantity:1,maxUnits:s.units,gstRate:s.gstRate||12,isManual:false}]);
 }
 function addManual() {
 if (!manual.medicineName.trim()||!manual.price) return;
 setItems([...items,{stockId:`m_${Date.now()}`,medicineName:manual.medicineName,price:parseFloat(manual.price),quantity:parseInt(manual.quantity)||1,maxUnits:9999,isManual:true}]);
 setManual({medicineName:'',price:'',quantity:'1'}); setShowManual(false);
 }

 const deleteBillMut = useMutation(api.pharmacistBills.deleteBill);

 // POINT 2 -- Delete bill from DB
 async function confirmDeleteBill() {
 if (!delBill) return;
 setDeleting(true);
 try {
 const bn = delBill._id;
 await deleteBillMut({ billId: bn });
 toast('Bill deleted from database');
 } catch(e) { toast(e.message,'error'); }
 setDelBill(null); setDeleting(false);
 }

 function printBill(b) {
 const id = b.billNumber||b.id;
 const w = window.open('','_blank');
 w.document.write(`<!DOCTYPE html><html><head><title>${id}</title><style>body{font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px}th{background:#f5f5f5}@media print{.np{display:none}}</style></head><body><div style="text-align:center;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:10px"><b style="font-size:16px">${b.pharmacyName}</b><br><small>${b.pharmacyAddress||''}</small></div><div style="display:flex;justify-content:space-between;margin-bottom:10px"><div><b>Bill:</b> ${id}<br><b>Date:</b> ${new Date(b.createdAt).toLocaleString('en-IN')}</div><div><b>Patient:</b> ${b.customerName}</div></div><table><thead><tr><th>#</th><th>Medicine</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead><tbody>${b.items.map((it,i)=>`<tr><td>${i+1}</td><td>${it.medicineName}</td><td>${it.quantity}</td><td>₹${it.unitPrice}</td><td>₹${it.total}</td></tr>`).join('')}</tbody></table><div style="text-align:right;margin-top:8px"><b>Total: ₹${b.grandTotal}</b> | ${b.paymentMode}</div><button class="np" onclick="window.print()" style="margin-top:10px;padding:8px 20px;background:#1B6EF3;color:white;border:none;border-radius:6px;cursor:pointer">Print</button></body></html>`);
 w.document.close();
 }
 function whatsApp(b) {
 const phone = (customer.phone||b.customerPhone||'').replace(/\D/g,'');
 if (!phone) return toast('Enter customer phone','error');
 window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(`${b.pharmacyName}\nBill: ${b.billNumber||b.id}\n\n${b.items.map(i=>`${i.medicineName} ×${i.quantity} = ₹${i.total}`).join('\n')}\n\nTotal: ₹${b.grandTotal} | ${b.paymentMode}\n\nThank you.`)}`,'_blank');
 }
 function email(b) {
 const em = customer.email||b.customerEmail;
 if (!em) return toast('Enter customer email','error');
 window.open(`mailto:${em}?subject=Bill ${b.billNumber||b.id}&body=${encodeURIComponent(`Dear ${b.customerName},\n\n${b.items.map(i=>`${i.medicineName} x${i.quantity} = ₹${i.total}`).join('\n')}\n\nTotal: ₹${b.grandTotal}\n\nThank you!`)}`,'_blank');
 }

 const filtStock = stock.filter(s=>s.units>0&&(s.medicineName||'').toLowerCase().includes((sSearch||'').toLowerCase()));

 return (
 <div>
 {/* POINT 2 -- Delete confirm dialog */}
 <ConfirmDialog open={!!delBill} title="Delete bill" message={`Delete bill ${delBill?.billNumber||delBill?.id} for ₹${delBill?.grandTotal}? This cannot be undone.`} onConfirm={confirmDeleteBill} onCancel={()=>setDelBill(null)} confirmText={deleting?'Deleting...':"Delete bill"} confirmColor="#ef4444"/>

 <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:18 }}>
 <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
 {/* Customer */}
 <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:18 }}>
 <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 12px',fontSize:15,display:'flex',alignItems:'center',gap:8 }}><PortalIcon name="user" size={14} color={c.txt} /> Customer</h3>
 {customers.length>0 && <select onChange={e=>{const x=customers.find(x=>x._id===e.target.value);if(x)setCustomer({name:x.name,phone:x.phone||'',email:x.email||'',address:x.address||''});}} style={{ ...inp,marginBottom:9 }}><option value="">-- Regular Customer --</option>{customers.map(x=><option key={x._id} value={x._id}>{x.name} ({x.phone||'--'})</option>)}</select>}
 <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
 <input placeholder="Name" value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} style={inp}/>
 <input placeholder=" Phone (WhatsApp)" value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} style={inp}/>
 <input placeholder=" Email" type="email" value={customer.email} onChange={e=>setCustomer({...customer,email:e.target.value})} style={inp}/>
 <input placeholder="Address" value={customer.address} onChange={e=>setCustomer({...customer,address:e.target.value})} style={inp}/>
 </div>
 </div>
 {/* Add medicines */}
 <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:18 }}>
 <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:11 }}>
 <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:0,fontSize:15,display:'flex',alignItems:'center',gap:8 }}><PortalIcon name="medicine" size={14} color={c.txt} /> Add medicines</h3>
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
 <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 12px',fontSize:15 }}> Bill Items</h3>
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
 <p style={{ color:'#3b82f6',fontWeight:700,fontSize:12,margin:'0 0 7px',display:'flex',alignItems:'center',gap:6 }}><PortalIcon name="coupon" size={12} color="#3b82f6" /> MediPoints coupon</p>
 <div style={{ display:'flex',gap:7 }}>
 <input placeholder="COUPON CODE" value={coupon} onChange={e=>{setCoupon(e.target.value.toUpperCase());setCouponApplied(false);setCouponDisc(0);setCouponErr('');}} disabled={couponApplied} style={{ ...inp,flex:1,fontFamily:'monospace',fontWeight:700 }}/>
 <button onClick={validateCoupon} disabled={!coupon.trim()||couponApplied} style={{ padding:'0 13px',borderRadius:9,border:'none',background:couponApplied?'#10b981':'#1B6EF3',color:'white',cursor:'pointer',fontWeight:700,fontSize:13,opacity:!coupon.trim()||couponApplied?0.5:1 }}>{couponApplied?'Applied':'Apply'}</button>
 </div>
 {couponErr && <p style={{ color:'#ef4444',fontSize:12,margin:'4px 0 0',display:'flex',alignItems:'center',gap:5 }}><PortalIcon name="close" size={11} color="#ef4444" /> {couponErr}</p>}
 {couponApplied && <p style={{ color:'#10b981',fontSize:12,margin:'4px 0 0',fontWeight:600,display:'flex',alignItems:'center',gap:5 }}><PortalIcon name="check" size={11} color="#10b981" /> {couponDisc}% off</p>}
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
 <button onClick={generate} disabled={generating} style={{ width:'100%',padding:'13px',borderRadius:13,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'white',fontWeight:700,cursor:'pointer',fontSize:14,fontFamily:'Sora,sans-serif',boxShadow:'0 4px 20px rgba(16,185,129,0.3)',opacity:generating?0.7:1 }}>{generating?'Generating...':' Generate GST Bill'}</button>
 </div>
 )}

 {bill ? (
 <div style={{ background:theme==='dark'?'rgba(16,185,129,0.06)':'#f0fdf4',border:`1px solid ${theme==='dark'?'rgba(16,185,129,0.2)':'#bbf7d0'}`,borderRadius:18,padding:18 }}>
 <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:13 }}>
 <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:0,display:'flex',alignItems:'center',gap:8 }}><PortalIcon name="check" size={14} color={c.txt} /> {bill.billNumber||bill.id}</h3>
 <span style={{ color:'#10b981',fontWeight:800,fontSize:18,fontFamily:'Sora,sans-serif' }}>₹{bill.grandTotal}</span>
 </div>
 <div style={{ background:theme==='dark'?'rgba(0,0,0,0.15)':'#fff',borderRadius:12,padding:13,marginBottom:13,fontSize:12,maxHeight:140,overflowY:'auto',border:`1px solid ${c.cardBd}` }}>
 <p style={{ color:c.txt,fontWeight:700,margin:'0 0 3px' }}>{bill.pharmacyName}</p>
 <p style={{ color:c.txtM,margin:'0 0 7px',fontSize:11 }}>{bill.customerName} · {new Date(bill.createdAt).toLocaleString('en-IN')}</p>
 {bill.items.map((it,i)=><div key={i} style={{ display:'flex',justifyContent:'space-between',padding:'3px 0',borderBottom:`1px solid ${c.div}` }}><span style={{ color:c.txtS }}>{it.medicineName} ×{it.quantity}</span><span style={{ color:c.txt,fontWeight:600 }}>₹{it.total}</span></div>)}
 </div>
 <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:7 }}>
 <button onClick={()=>printBill(bill)} style={{ padding:'10px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#1B6EF3,#00C2A8)',color:'white',fontWeight:700,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}><PortalIcon name="printer" size={13} color="white" /> Print</button>
 <button onClick={()=>whatsApp(bill)} style={{ padding:'10px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#25D366,#128C7E)',color:'white',fontWeight:700,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}><PortalIcon name="chat" size={13} color="white" /> WhatsApp</button>
 </div>
 <button onClick={()=>email(bill)} style={{ width:'100%',padding:'10px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#EA4335,#C62828)',color:'white',fontWeight:700,cursor:'pointer',fontSize:12,marginBottom:7 }}> Email</button>
 <button onClick={()=>{setBill(null);setItems([]);setCustomer({name:'',phone:'',email:'',address:''});setDiscount(0);setCoupon('');setCouponApplied(false);setCouponDisc(0);}} style={{ width:'100%',padding:'9px',borderRadius:11,border:`1px solid ${c.inpBd}`,background:c.secBg,color:c.secClr,cursor:'pointer',fontSize:13 }}>New Bill</button>
 </div>
 ) : items.length===0 && (
 <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:36,textAlign:'center' }}>
 
 <p style={{ color:c.txtM,fontSize:14 }}>Add medicines to create a GST bill</p>
 </div>
 )}

 {/* Bills list with POINT 2 delete */}
 <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:18 }}>
 <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 13px',fontSize:15 }}> Bills ({bills.length})</h3>
 <div style={{ maxHeight:280,overflowY:'auto' }}>
 {bills.slice(0,20).map((b,i)=>(
 <div key={i} style={{ display:'flex',alignItems:'center',gap:8,padding:'9px 0',borderBottom:i<Math.min(bills.length-1,19)?`1px solid ${c.div}`:'none' }}>
 <div style={{ flex:1,minWidth:0 }}>
 <p style={{ color:c.txt,fontWeight:600,margin:0,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{b.billNumber||b._id} -- {b.customerName}</p>
 <p style={{ color:c.txtM,fontSize:11,margin:'1px 0 0' }}>{new Date(b.createdAt).toLocaleDateString('en-IN')} · {b.paymentMode}</p>
 </div>
 <span style={{ color:'#10b981',fontWeight:800,fontFamily:'Sora,sans-serif',flexShrink:0 }}>₹{b.grandTotal}</span>
 <button onClick={()=>{}} title="Print" style={{ background:'none',border:'none',cursor:'pointer',padding:2,color:c.txtS,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center' }}><PortalIcon name="printer" size={14} color={c.txtS} /></button>
 <button onClick={()=>setDelBill(b)} title="Delete bill disabled" style={{ background:'none',border:'none',cursor:'pointer',padding:2,color:'#ef4444',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center' }}><PortalIcon name="trash" size={14} color="#ef4444" /></button>
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

// ════════ ANALYTICS ═══════════════════════════════════════════
function AnalyticsTab({ theme }) {
 const c = C(theme);
 const pharmacist = getPharmacist();
 const pharmacistId = pharmacist?._id || "";
 
 const billsData = useQuery(api.pharmacistBills.getBills, { pharmacistId });
 const bills = billsData?.bills || [];
 
 const [loading, setLoading] = useState(false);
 const [data, setData] = useState(null);

 useEffect(() => {
 if (bills.length > 0) {
 const totalRev = bills.reduce((sum, b) => sum + b.grandTotal, 0);
 const totalBills = bills.length;
 
 const last7Days = Array(7).fill(0).map((_,i) => {
 const d = new Date(); d.setDate(d.getDate()-i);
 return { date: d.toISOString().split('T')[0], revenue: 0, bills: 0 };
 }).reverse();
 
 bills.forEach(b => {
 const date = new Date(b.createdAt).toISOString().split('T')[0];
 const day = last7Days.find(d => d.date === date);
 if (day) { day.revenue += b.grandTotal; day.bills += 1; }
 });
 
 setData({ totalRev, totalBills, dailyRev: last7Days });
 }
 }, [bills]);

 if (loading) return <div style={{ textAlign:'center',padding:56,color:c.txtM }}>Loading analytics from database...</div>;
 if (!data) return <div style={{ textAlign:'center',padding:56,color:c.txtM }}>No data yet -- generate some bills first!</div>;
 
 return (
 <div>
 <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(145px,1fr))',gap:11,marginBottom:20 }}>
 {[{icon:'',l:'Revenue',v:`₹${data.totalRev}`,g:'linear-gradient(135deg,#10b981,#059669)',gw:'rgba(16,185,129,0.3)'},
 {icon:'',l:'Bills',v:data.totalBills,g:'linear-gradient(135deg,#f59e0b,#d97706)',gw:'rgba(245,158,11,0.3)'},
 ].map(s=><SC key={s.l} icon={s.icon} label={s.l} value={s.v} gradient={s.g} glow={`0 4px 20px ${s.gw}`}/>)}
 </div>
 <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:22 }}>
 <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 18px',fontSize:15 }}> Revenue (Last 7 Days)</h3>
 <div style={{ display:'flex',alignItems:'flex-end',gap:3,height:100,marginBottom:6 }}>
 {data.dailyRev.map((m,i)=>{const max=Math.max(...data.dailyRev.map(d=>d.revenue),1);return<div key={i} title={`₹${m.revenue}`} style={{ flex:1,borderRadius:'3px 3px 0 0',background:m.revenue>0?'linear-gradient(to top,#1B6EF3,#00C2A8)':c.inp,height:`${Math.max((m.revenue/max)*100,2)}%`,minHeight:3,cursor:'default' }}/>; })}
 </div>
 </div>
 </div>
 );
}

// ════════ SUPPLIERS ═══════════════════════════════════════════
function SuppliersTab({ toast, theme }) {
 const c = C(theme);
 const pharmacist = getPharmacist();
 const pharmacistId = pharmacist?._id || "";

 const suppliers = useQuery(api.pharmacistSuppliers.getSuppliers, { pharmacistId }) || [];
 const addSupplierMut = useMutation(api.pharmacistSuppliers.addSupplier);

 const [showAdd, setShowAdd] = useState(false);
 const [form, setForm] = useState({ name:'', contactPerson:'', phone:'', email:'', address:'', gstin:'' });
 const [loading, setLoading] = useState(false);

 const inp = { background:c.inp,border:`1px solid ${c.inpBd}`,borderRadius:10,padding:'9px 13px',color:c.txt,fontSize:13,outline:'none',width:'100%',boxSizing:'border-box',fontFamily:'DM Sans,sans-serif' };

 async function save() {
 if (!form.name||!form.phone) return toast('Name & Phone required','error');
 setLoading(true);
 try {
 await addSupplierMut({ pharmacistId, ...form });
 toast('Supplier added');
 setShowAdd(false); setForm({ name:'', contactPerson:'', phone:'', email:'', address:'', gstin:'' });
 } catch(e) { toast(e.message,'error'); }
 setLoading(false);
 }

 return (
 <div>
 <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
 <h2 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:0,fontSize:17 }}> Suppliers</h2>
 <button onClick={()=>setShowAdd(!showAdd)} style={{ padding:'9px 18px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#1B6EF3,#00C2A8)',color:'white',fontWeight:700,cursor:'pointer',fontSize:14 }}>+ Add Supplier</button>
 </div>

 {showAdd && (
 <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:18,marginBottom:18 }}>
 <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
 <input placeholder="Supplier Name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{ ...inp,gridColumn:'span 2' }}/>
 <input placeholder="Phone *" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={inp}/>
 <input placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={inp}/>
 <input placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} style={{ ...inp,gridColumn:'span 2' }}/>
 <input placeholder="GST No" value={form.gstin} onChange={e=>setForm({...form,gstin:e.target.value})} style={inp}/>
 </div>
 <div style={{ display:'flex',gap:10,marginTop:13 }}>
 <button onClick={save} disabled={loading} style={{ flex:1,padding:'11px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#1B6EF3,#00C2A8)',color:'white',fontWeight:700,cursor:'pointer',opacity:loading?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:7 }}>{loading?'Saving...':(<><PortalIcon name="check" size={13} color="white" /> Save supplier</>)}</button>
 <button onClick={()=>setShowAdd(false)} style={{ flex:1,padding:'11px',borderRadius:11,border:`1px solid ${c.inpBd}`,background:c.secBg,color:c.secClr,cursor:'pointer' }}>Cancel</button>
 </div>
 </div>
 )}

 {suppliers.length === 0 ? <div style={{ textAlign:'center',padding:56,color:c.txtM }}>No suppliers yet</div> :
 <div style={{ display:'flex',flexDirection:'column',gap:13 }}>
 {suppliers.map(s=>(
 <div key={s._id} style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,overflow:'hidden' }}>
 <div style={{ padding:'15px 18px',display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
 <div style={{ flex:1 }}>
 <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:0,fontSize:15 }}>{s.name}</h3>
 <div style={{ display:'flex',gap:13,flexWrap:'wrap',fontSize:12,color:c.txtM }}>
 {s.phone && <span> {s.phone}</span>}
 {s.email && <span> {s.email}</span>}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 }
 </div>
 );
}

// ════════ CUSTOMERS ═══════════════════════════════════════════
function CustomersTab({ toast, theme, isPremium }) {
 const c = C(theme);
 const pharmacist = getPharmacist();
 const pharmacistId = pharmacist?._id || "";

 const customers = useQuery(api.pharmacistCustomers.getCustomers, { pharmacistId }) || [];
 const addCustomerMut = useMutation(api.pharmacistCustomers.addCustomer);

 const customersData = useQuery(api.pharmacistCustomers.getCustomers, { pharmacistId }) || [];
 const alerts = [];
 const todayDay = new Date().getDate();
 customersData.forEach(c => {
    (c.medicines || []).forEach(m => {
        if (m.frequency === 'monthly' && m.typicalDate) {
            let d = parseInt(m.typicalDate);
            if (!isNaN(d) && d >= todayDay && d <= todayDay + 3) {
                alerts.push({ customerName: c.name, medicine: m.medicineName, type: 'refill', dueIn: d - todayDay, phone: c.phone });
            }
        }
    });
 });
 const [showAdd, setShowAdd] = useState(false);
 const [form, setForm] = useState({ name:'', phone:'', email:'', address:'', age:'', notes:'' });
 const [loading, setLoading] = useState(false);
 const [saving, setSaving] = useState(false);
 const [medModal, setMedModal] = useState(null);
 const [medForm, setMedForm] = useState({ medicineName:'',dosage:'',quantity:'1',frequency:'monthly',typicalDate:'',alertEnabled:true,alertDaysBefore:'1',notes:'' });

 const inp = { background:c.inp,border:`1px solid ${c.inpBd}`,borderRadius:10,padding:'9px 13px',color:c.txt,fontSize:13,outline:'none',width:'100%',boxSizing:'border-box',fontFamily:'DM Sans,sans-serif' };

 const deleteCustomerMut = useMutation(api.pharmacistCustomers.deleteCustomer);
 const updateMedicinesMut = useMutation(api.pharmacistCustomers.updateMedicines);

 async function save() {
 if (!form.name.trim()) return toast('Name required','error');
 setSaving(true);
 try {
 await addCustomerMut({ pharmacistId, ...form });
 toast('Customer saved'); setShowAdd(false); setForm({name:'',phone:'',email:'',address:'',age:'',notes:''});
 } catch(e) { toast(e.message,'error'); }
 setSaving(false);
 }

 async function addMed() {
 if (!medForm.medicineName.trim()||!medForm.quantity) return toast('Fill name and quantity','error');
 const cx = customers.find(x=>x._id===medModal); if (!cx) return;
 const medicines=[...(cx.medicines||[]),{...medForm,quantity:parseInt(medForm.quantity)||1,typicalDate:parseInt(medForm.typicalDate)||null,alertDaysBefore:parseInt(medForm.alertDaysBefore)||1}];
 try {
 await updateMedicinesMut({ customerId: medModal, medicines });
 toast('Medicine record saved');
 setMedModal(null); setMedForm({medicineName:'',dosage:'',quantity:'1',frequency:'monthly',typicalDate:'',alertEnabled:true,alertDaysBefore:'1',notes:''});
 } catch(e) { toast(e.message,'error'); }
 }

 // POINT 10 -- Delete individual medicine
 async function delMedicine(customerId, medIdx) {
 if (!confirm('Remove this medicine record?')) return;
 try {
 const cx = customers.find(x=>x._id===customerId); if (!cx) return;
 const medicines = cx.medicines.filter((_,i)=>i!==medIdx);
 await updateMedicinesMut({ customerId, medicines });
 toast('Medicine record deleted');
 } catch(e) { toast(e.message,'error'); }
 }

 async function del(id) { 
 if (!confirm('Remove customer?')) return; 
 try { 
 await deleteCustomerMut({ customerId: id }); 
 toast('Removed'); 
 } catch(e) { toast(e.message,'error'); } 
 }

 if (!isPremium) return <PremiumGate feature="Customer Tracking" theme={theme}/>;

 return (
 <div>
 {medModal && (
 <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
 <div style={{ background:c.modal,border:`1px solid ${c.cardBd}`,borderRadius:22,padding:26,width:'100%',maxWidth:480 }}>
 <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 18px',fontSize:16,display:'flex',alignItems:'center',gap:8 }}><PortalIcon name="medicine" size={14} color={c.txt} /> Add medicine - {customers.find(x=>x._id===medModal)?.name}</h3>
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
 <button onClick={addMed} style={{ padding:'12px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'white',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7 }}><PortalIcon name="save" size={13} color="white" /> Save</button>
 <button onClick={()=>setMedModal(null)} style={{ padding:'12px',borderRadius:11,border:`1px solid ${c.inpBd}`,background:c.secBg,color:c.secClr,cursor:'pointer' }}>Cancel</button>
 </div>
 </div>
 </div>
 )}

 {alerts.length > 0 && (
 <div style={{ background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:18,padding:18,marginBottom:18 }}>
 <h3 style={{ color:'#fca5a5',fontFamily:'Sora,sans-serif',margin:'0 0 12px',fontSize:14 }}> Upcoming (Next 7 Days)</h3>
 {alerts.map((a,i)=>(
 <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(0,0,0,0.12)',borderRadius:10,padding:'9px 13px',marginBottom:6 }}>
 <div><p style={{ color:c.txt,fontWeight:600,margin:0,fontSize:14 }}>{a.customerName}</p><p style={{ color:c.txtM,fontSize:12,margin:'1px 0 0' }}>{a.medicineName} ×{a.quantity} · {a.customerPhone||'--'}</p></div>
 <span style={{ padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:800,background:a.daysFromNow===0?'#ef4444':a.daysFromNow===1?'#f59e0b':'#1B6EF3',color:'white' }}>{a.urgency==='today'?'TODAY':a.urgency==='tomorrow'?'TOMORROW':a.urgency}</span>
 </div>
 ))}
 </div>
 )}

 <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
 <h2 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:0,fontSize:17 }}> Customers ({customers.length})</h2>
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
 <button onClick={save} disabled={saving} style={{ flex:1,padding:'11px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#1B6EF3,#00C2A8)',color:'white',fontWeight:700,cursor:'pointer',opacity:saving?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:7 }}>{saving?'Saving...':(<><PortalIcon name="check" size={13} color="white" /> Save customer</>)}</button>
 <button onClick={()=>setShowAdd(false)} style={{ flex:1,padding:'11px',borderRadius:11,border:`1px solid ${c.inpBd}`,background:c.secBg,color:c.secClr,cursor:'pointer' }}>Cancel</button>
 </div>
 </div>
 )}

 {loading ? <div style={{ textAlign:'center',padding:40,color:c.txtM }}>Loading...</div> :
 !customers.length ? <div style={{ textAlign:'center',padding:56,color:c.txtM }}>No customers yet</div> :
 <div style={{ display:'flex',flexDirection:'column',gap:13 }}>
 {customers.map(cx=>(
 <div key={cx._id} style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,overflow:'hidden' }}>
 <div style={{ padding:'15px 18px',display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
 <div style={{ flex:1 }}>
 <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 5px',fontSize:15 }}>{cx.name}</h3>
 <div style={{ display:'flex',gap:13,flexWrap:'wrap',fontSize:12,color:c.txtM }}>
 {cx.phone&&<span> {cx.phone}</span>}
 {cx.email&&<span> {cx.email}</span>}
 {cx.age&&<span>Age: {cx.age}</span>}
 </div>
 <p style={{ color:c.txtM,fontSize:11,margin:'5px 0 0' }}>Visits: {cx.totalVisits} · Spend: ₹{(cx.totalSpend||0).toFixed(0)}{cx.lastVisit?` · Last: ${new Date(cx.lastVisit).toLocaleDateString('en-IN')}`:''}</p>
 </div>
 <div style={{ display:'flex',gap:7 }}>
 <button onClick={()=>setMedModal(cx._id)} style={{ padding:'7px 13px',borderRadius:9,border:'none',background:theme==='dark'?'rgba(16,185,129,0.2)':'#dcfce7',color:'#10b981',cursor:'pointer',fontSize:12,fontWeight:600 }}>+ Medicine</button>
 <button onClick={()=>del(cx._id)} style={{ padding:'7px 11px',borderRadius:9,border:`1px solid ${theme==='dark'?'rgba(239,68,68,0.3)':'#fecaca'}`,background:theme==='dark'?'rgba(239,68,68,0.08)':'#fef2f2',color:'#ef4444',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><PortalIcon name="trash" size={13} color="#ef4444" /></button>
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
 <p style={{ color:c.txtM,fontSize:11,margin:'2px 0 0' }}>×{m.quantity} · {m.frequency}{m.typicalDate?` · Day ${m.typicalDate}`:''} {m.alertEnabled?'':''}</p>
 </div>
 {/* POINT 10 -- Delete individual medicine */}
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
// POINT 11 -- Edit profile
function ProfileTab({ pharmacist, setPharmacist, theme, toggleTheme }) {
 const c = C(theme);
 const inp = { background:c.inp,border:`1px solid ${c.inpBd}`,borderRadius:10,padding:'10px 14px',color:c.txt,fontSize:13,outline:'none',width:'100%',boxSizing:'border-box',fontFamily:'DM Sans,sans-serif' };
 const [editing, setEditing] = useState(false);
 const [form, setForm] = useState({ name:'', ownerName:'', phone:'', address:'' });
 const [saving, setSaving] = useState(false);
 const [savingStatus, setSavingStatus] = useState(false);
 const [toast, setToast] = useState(null);
 const [info, setInfo] = useState(null);

 const updateProfileMut = useMutation(api.pharmacistAuth.updateProfile);

 function startEdit() {
 const ph = info || pharmacist;
 setForm({ name:ph.name||'', ownerName:ph.ownerName||'', phone:ph.phone||'', address:ph.address||'' });
 setEditing(true);
 }

 async function saveProfile() {
 if (!form.name.trim()) return;
 setSaving(true);
 try {
 const d = await updateProfileMut({ pharmacistId: pharmacist._id || pharmacist.id, ...form });
 setInfo(d.pharmacist);
 // Update localStorage so dashboard header updates
 const cached = JSON.parse(localStorage.getItem('pharmacist_info')||'{}');
 const updated = { ...cached, ...d.pharmacist };
 localStorage.setItem('pharmacist_info', JSON.stringify(updated));
 setPharmacist(updated);
 setEditing(false);
 setToast({ msg:'Profile updated', type:'success' });
 } catch(e) { setToast({ msg:e.message, type:'error' }); }
 setSaving(false);
 }

 const ph = info || pharmacist;

 async function toggleOpenStatus() {
 setSavingStatus(true);
 try {
 const nextOpen = !ph?.isOpen;
 const d = await updateProfileMut({ 
 pharmacistId: pharmacist._id || pharmacist.id, 
 isOpen: nextOpen 
 });
 setInfo(d.pharmacist);
 const cached = JSON.parse(localStorage.getItem('pharmacist_info')||'{}');
 const updated = { ...cached, ...d.pharmacist };
 localStorage.setItem('pharmacist_info', JSON.stringify(updated));
 setPharmacist(updated);
 setToast({ msg: nextOpen ? '🟢 Store marked as Open!' : '🔴 Store marked as Closed!', type:'success' });
 } catch(e) { 
 setToast({ msg: e.message, type:'error' }); 
 }
 setSavingStatus(false);
 }

 return (
 <div style={{ maxWidth:620 }}>
 {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}

 {/* Theme */}
 <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:18,marginBottom:14 }}>
 <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 14px',fontSize:15,display:'flex',alignItems:'center',gap:8 }}><PortalIcon name="spark" size={14} color={c.txt} /> Appearance</h3>
 <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
 <div>
 <p style={{ color:c.txt,fontWeight:600,margin:'0 0 3px',fontSize:14,display:'flex',alignItems:'center',gap:6 }}>{theme==='dark' ? <><PortalIcon name="moon" size={13} color={c.txt} /> Dark mode</> : <><PortalIcon name="sun" size={13} color={c.txt} /> Light mode</>}</p>
 <p style={{ color:c.txtM,fontSize:12,margin:0 }}>Switch between dark and light theme</p>
 </div>
 <div onClick={toggleTheme} style={{ width:50,height:27,borderRadius:99,background:theme==='dark'?'#1B6EF3':'#e5e7eb',cursor:'pointer',position:'relative',transition:'background 0.3s',flexShrink:0 }}>
 <div style={{ position:'absolute',top:3,left:theme==='dark'?25:3,width:21,height:21,borderRadius:'50%',background:'white',boxShadow:'0 1px 4px rgba(0,0,0,0.2)',transition:'left 0.3s',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11 }}>
 {theme==='dark' ? <PortalIcon name="moon" size={12} color="white" /> : <PortalIcon name="sun" size={12} color="#111827" />}
 </div>
 </div>
 </div>
 </div>

 {/* Store Status Toggle */}
 <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:18,marginBottom:14 }}>
 <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 14px',fontSize:15,display:'flex',alignItems:'center',gap:8 }}><PortalIcon name="store" size={14} color={c.txt} /> Store status</h3>
 <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
 <div>
 <p style={{ color:c.txt,fontWeight:600,margin:'0 0 3px',fontSize:14 }}>
 {ph?.isOpen ? 'Open now' : 'Closed'}
 </p>
 <p style={{ color:c.txtM,fontSize:12,margin:0 }}>Toggle your pharmacy's visibility on the search map</p>
 </div>
 <button 
 onClick={toggleOpenStatus}
 disabled={savingStatus}
 style={{ 
 padding:'8px 18px', 
 borderRadius:99, 
 border:'none', 
 background: ph?.isOpen ? '#ef4444' : '#10b981', 
 color:'white', 
 fontWeight:700, 
 cursor:'pointer',
 fontSize:13,
 boxShadow: ph?.isOpen ? '0 4px 14px rgba(239,68,68,0.2)' : '0 4px 14px rgba(16,183,106,0.2)',
 transition:'all 0.2s',
 opacity: savingStatus ? 0.7 : 1
 }}
 >
 {savingStatus ? 'Updating...' : (ph?.isOpen ? 'Mark Closed' : 'Mark Open')}
 </button>
 </div>
 </div>

 {/* Profile info + edit -- POINT 11 */}
 <div style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:18,padding:18,marginBottom:14 }}>
 <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
 <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:0,fontSize:15 }}> Pharmacy Details</h3>
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
 <button onClick={saveProfile} disabled={saving||!form.name.trim()} style={{ flex:1,padding:'11px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'white',fontWeight:700,cursor:'pointer',opacity:saving||!form.name.trim()?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:7 }}>{saving?'Saving...':(<><PortalIcon name="save" size={13} color="white" /> Save changes</>)}</button>
 <button onClick={()=>setEditing(false)} style={{ flex:1,padding:'11px',borderRadius:11,border:`1px solid ${c.inpBd}`,background:c.secBg,color:c.secClr,cursor:'pointer' }}>Cancel</button>
 </div>
 </div>
 ) : (
 <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
 {[
 ['Pharmacy Name', ph?.name],
 ['Status', ph?.isOpen ? '🟢 Open Now' : '🔴 Closed'],
 ['Owner', ph?.ownerName||'--'],
 ['Email', ph?.email],
 ['Phone', ph?.phone||'--'],
 ['Address', ph?.address||'--'],
 ['GSTIN', ph?.gstin||'--'],
 ['License No', ph?.licenseNo||'--'],
 ['Plan', ph?.isPremium?' Premium':'Free']
 ].map(([l,v])=>(
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
 
 <h3 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:'0 0 7px' }}>Upgrade to Premium</h3>
 <p style={{ color:c.txtM,fontSize:14,marginBottom:18 }}>Analytics · Suppliers · Requirements · Customer Tracking</p>
 <div style={{ display:'flex',gap:11,justifyContent:'center',flexWrap:'wrap' }}>
 {[['Monthly','₹299/mo'],['Annual','₹2,999/yr']].map(([n,p])=>(
 <div key={n} style={{ background:c.card,border:`1px solid ${c.cardBd}`,borderRadius:14,padding:'15px 22px',minWidth:140,textAlign:'center' }}>
 <p style={{ color:c.txt,fontWeight:700,margin:'0 0 5px',fontFamily:'Sora,sans-serif' }}>{n}</p>
 <p style={{ color:'#10b981',fontWeight:800,fontSize:17,margin:'0 0 11px',fontFamily:'Sora,sans-serif' }}>{p}</p>
 <button onClick={()=>alert('Payment gateway mocked for demo! Feature fully activated.')} style={{ width:'100%',padding:'8px',borderRadius:9,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'white',fontWeight:700,cursor:'pointer',fontSize:13 }}>Upgrade</button>
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
 <div style={{ width:34,height:34,borderRadius:11,background:'linear-gradient(135deg,#10b981,#059669)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 3px 10px rgba(16,185,129,0.3)' }}><PortalIcon name="user" size={16} color="white" /></div>
 <div>
 <p style={{ color:c.txt,fontWeight:700,margin:0,fontSize:13,fontFamily:'Sora,sans-serif' }}>{pharmacist.name?.split(' ').slice(0,2).join(' ')}</p>
 <p style={{ color:isPremium?'#f59e0b':'rgba(107,114,128,0.8)',fontSize:10,margin:0,fontWeight:600 }}>{isPremium?'Premium Plan':'Free Plan'}</p>
 </div>
 </div>
 <button onClick={toggleTheme} title={`Switch to ${theme==='dark'?'light':'dark'} mode`} style={{ width:30,height:30,borderRadius:9,border:`1px solid ${c.sbBd}`,background:c.inp,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,transition:'all 0.2s',flexShrink:0 }}>
 {theme==='dark' ? <PortalIcon name="sun" size={12} color="white" /> : <PortalIcon name="moon" size={12} color="#111827" />}
 </button>
 </div>
 </div>

 <div style={{ flex:1,padding:'11px 7px',overflowY:'auto' }}>
 {TABS.map(tab => {
 const active = activeTab === tab.id;
 const locked = tab.premium && !isPremium;
 const iconMap = { overview:'spark', stock:'package', billing:'note', analytics:'chart', suppliers:'store', customers:'user', profile:'settings' };
 return (
 <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
 style={{ width:'100%',display:'flex',alignItems:'center',gap:9,padding:'8px 11px',borderRadius:11,border:'none',cursor:'pointer',marginBottom:2,textAlign:'left',
 background:active?(theme==='dark'?'rgba(16,185,129,0.14)':'rgba(16,185,129,0.1)'):'transparent',
 color:active?'#10b981':locked?c.txtM:c.txtS,
 fontWeight:active?700:500,fontSize:13,
 fontFamily:active?'Sora,sans-serif':'DM Sans,sans-serif',
 transition:'all 0.15s',borderLeft:active?'2px solid #10b981':'2px solid transparent' }}>
 <PortalIcon name={iconMap[tab.id]||'spark'} size={14} color={active?'#10b981':locked?c.txtM:c.txtS} />
 <span style={{ flex:1 }}>{tab.label}</span>
 {locked && <span style={{ fontSize:9,color:c.txtM,background:c.inp,padding:'1px 5px',borderRadius:5 }}>PRO</span>}
 </button>
 );
 })}
 </div>

 <div style={{ padding:'11px 7px',borderTop:`1px solid ${c.sbBd}` }}>
 <Link to="/" style={{ display:'flex',alignItems:'center',gap:7,padding:'8px 11px',borderRadius:11,color:c.txtM,fontSize:12,textDecoration:'none',marginBottom:3,transition:'all 0.15s' }} onMouseEnter={e=>e.currentTarget.style.color=c.txt} onMouseLeave={e=>e.currentTarget.style.color=c.txtM}>← MediMap</Link>
 <button onClick={logout} style={{ width:'100%',display:'flex',alignItems:'center',gap:7,padding:'8px 11px',borderRadius:11,border:'none',background:theme==='dark'?'rgba(239,68,68,0.07)':'#fef2f2',color:'#ef4444',cursor:'pointer',fontSize:12,fontWeight:600,textAlign:'left' }}><PortalIcon name="logout" size={13} color="#ef4444" /> Logout</button>
 </div>
 </div>

 {/* Main */}
 <div style={{ flex:1,overflowY:'auto',maxHeight:'100vh' }}>
 <div style={{ padding:'18px 26px 0',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22,position:'sticky',top:0,zIndex:50,background:c.bg,paddingBottom:14,borderBottom:`1px solid ${c.sbBd}` }}>
 <div>
 <h1 style={{ color:c.txt,fontFamily:'Sora,sans-serif',margin:0,fontSize:19,fontWeight:800 }}>
 {TABS.find(t=>t.id===activeTab)?.label}
 </h1>
 <p style={{ color:c.txtM,margin:'2px 0 0',fontSize:12 }}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
 </div>
 <div style={{ width:54 }}/>
 </div>
 <div style={{ padding:'0 26px 26px' }}>
 {activeTab==='overview' && <OverviewTab pharmacist={pharmacist} isPremium={isPremium} theme={theme}/>}
 {activeTab==='stock' && <StockTab toast={showToast} theme={theme}/>}
 {activeTab==='billing' && <BillingTab pharmacist={pharmacist} toast={showToast} theme={theme}/>}
 {activeTab==='analytics' && <AnalyticsTab isPremium={isPremium} theme={theme}/>}
 {activeTab==='suppliers' && <SuppliersTab isPremium={isPremium} toast={showToast} theme={theme}/>}
 {activeTab==='requirements' && <RequirementsTab isPremium={isPremium} toast={showToast} theme={theme}/>}
 {activeTab==='customers' && <CustomersTab isPremium={isPremium} toast={showToast} theme={theme}/>}
 {activeTab==='profile' && <ProfileTab pharmacist={pharmacist} setPharmacist={setPharmacist} theme={theme} toggleTheme={toggleTheme}/>}
 </div>
 </div>
 </div>
 );
}
