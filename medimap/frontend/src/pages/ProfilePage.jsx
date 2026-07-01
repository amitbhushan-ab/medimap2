// frontend/src/pages/ProfilePage.jsx
// Customer Dashboard with MediPoints integrated
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}
function Stars({ rating }) {
  return <span>{[1,2,3,4,5].map(s => <span key={s} style={{color: s<=rating?'#f59e0b':'#e5e7eb'}}>★</span>)}</span>;
}

const DEFAULT_SAVED = [
  { id:'p1', name:'Apollo Pharmacy - Sector 16', address:'Sector 16, Faridabad', rating:4.5, isOpen:true, savedAt: new Date(Date.now()-86400000).toISOString() },
  { id:'p2', name:'MedPlus - NIT Faridabad', address:'NIT Market, Faridabad', rating:4.3, isOpen:true, savedAt: new Date(Date.now()-172800000).toISOString() },
];
const DEFAULT_REVIEWS = [
  { id:'r1', pharmacyName:'Apollo Pharmacy', rating:5, review:'Great service!', date: new Date(Date.now()-604800000).toISOString() },
];
const DEFAULT_ALERTS = [
  { id:'a1', medicine:'Paracetamol 500mg', targetPrice:15, currentPrice:18, pharmacy:'Apollo', active:true },
  { id:'a2', medicine:'Metformin 500mg', targetPrice:38, currentPrice:45, pharmacy:'MedPlus', active:true },
];
const DEFAULT_SAVINGS = {
  total:1240, thisMonth:340,
  transactions:[
    { medicine:'Paracetamol 500mg', saved:8, date:new Date(Date.now()-86400000).toISOString(), cheapest:15, avg:23 },
    { medicine:'Azithromycin 500mg', saved:35, date:new Date(Date.now()-345600000).toISOString(), cheapest:145, avg:180 },
  ]
};

const POINT_TIERS = [
  { tier:1, points:500,  discount:20, icon:'🥉', color:'from-amber-400 to-orange-500' },
  { tier:2, points:1000, discount:30, icon:'🥈', color:'from-gray-400 to-gray-500' },
  { tier:3, points:2000, discount:50, icon:'🥇', color:'from-yellow-400 to-amber-500' },
];

function TabBtn({ active, onClick, icon, label, badge }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${active ? 'bg-[#2E7DFF] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
      {badge > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>{badge}</span>}
    </button>
  );
}

// ── MediPoints Tab ────────────────────────────────────────────
function PointsTab({ userId }) {
  const [pts, setPts] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [redeeming, setRedeeming] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch(`https://medimap-backend-production.up.railway.app/api/points/${encodeURIComponent(userId)}`)
      .then(r => r.json()).then(d => { setPts(d.points||0); setTransactions(d.transactions||[]); setCoupons(d.coupons||[]); })
      .catch(() => {});
  }, []);

  async function redeem(tier) {
    setRedeeming(tier);
    try {
      const res = await fetch('https://medimap-backend-production.up.railway.app/api/points/redeem', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ userId, tier }),
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      setPts(d.remainingPoints);
      setCoupons(prev => [...prev, d.coupon]);
      setToast(`🎉 Coupon ${d.coupon.code} generated!`);
      setTimeout(() => setToast(''), 3000);
    } catch (err) { setToast(err.message); setTimeout(() => setToast(''), 3000); }
    setRedeeming(null);
  }

  const nextTier = POINT_TIERS.find(t => pts < t.points);

  return (
    <div>
      {toast && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">{toast}</div>}

      {/* Points Card */}
      <div className="rounded-2xl p-6 mb-5 text-white text-center" style={{background:'linear-gradient(135deg,#2E7DFF,#00C2A8)'}}>
        <p className="text-white/70 text-sm">Your Balance</p>
        <p className="text-5xl font-bold my-1">{pts}</p>
        <p className="text-white/80 text-sm">MediPoints</p>
        {nextTier && (
          <div className="mt-3">
            <div style={{background:'rgba(255,255,255,0.2)',borderRadius:999,height:6,overflow:'hidden'}}>
              <div style={{width:`${Math.min(100,(pts/nextTier.points)*100)}%`,background:'white',height:'100%',borderRadius:999,transition:'width 0.5s'}} />
            </div>
            <p className="text-white/70 text-xs mt-1">{nextTier.points - pts} more points for {nextTier.discount}% OFF</p>
          </div>
        )}
      </div>

      {/* How to earn */}
      <div className="card p-4 mb-4">
        <p className="font-semibold text-gray-900 mb-3">💡 How to Earn</p>
        <div className="space-y-2">
          {[
            { icon:'📸', label:'Submit price (approved)', pts:'+20' },
            { icon:'⭐', label:'Rate a pharmacy', pts:'+5' },
            { icon:'👤', label:'Complete profile', pts:'+10' },
          ].map((item,i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
              <span className="text-lg">{item.icon}</span>
              <span className="flex-1 text-sm text-gray-700">{item.label}</span>
              <span className="text-sm font-bold text-emerald-600">{item.pts} pts</span>
            </div>
          ))}
        </div>
        <Link to="/submit-price" className="btn-primary w-full text-center text-sm !py-2 mt-3 block">📸 Submit Price & Earn</Link>
      </div>

      {/* Redeem */}
      <div className="card p-4 mb-4">
        <p className="font-semibold text-gray-900 mb-3">🎁 Redeem Rewards</p>
        <div className="space-y-3">
          {POINT_TIERS.map(tier => {
            const canRedeem = pts >= tier.points;
            return (
              <div key={tier.tier} className={`rounded-xl p-3 border-2 ${canRedeem ? 'border-[#2E7DFF] bg-blue-50' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-xl flex-shrink-0`}>{tier.icon}</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{tier.discount}% OFF Coupon</p>
                    <p className="text-xs text-[#2E7DFF]">{tier.points} points</p>
                  </div>
                  <button onClick={() => canRedeem && redeem(tier.tier)} disabled={!canRedeem || redeeming===tier.tier}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${canRedeem ? 'bg-[#2E7DFF] text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                    {redeeming===tier.tier ? '...' : canRedeem ? 'Redeem' : `${tier.points-pts} more`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coupons */}
      {coupons.length > 0 && (
        <div className="card p-4 mb-4">
          <p className="font-semibold text-gray-900 mb-3">🎟️ My Coupons</p>
          {coupons.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 border-2 border-dashed border-[#2E7DFF] bg-blue-50 rounded-xl mb-2">
              <div><p className="font-bold text-gray-900">{c.discount}% OFF</p><p className="text-xs text-gray-400">Expires {new Date(c.expiresAt).toLocaleDateString('en-IN')}</p></div>
              <code className="bg-white border border-[#2E7DFF] text-[#2E7DFF] px-3 py-1 rounded-lg font-bold text-sm">{c.code}</code>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {transactions.length > 0 && (
        <div className="card p-4">
          <p className="font-semibold text-gray-900 mb-3">📋 Points History</p>
          {transactions.slice(0,8).map(tx => (
            <div key={tx.id} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
              <div><p className="text-sm text-gray-700">{tx.reason}</p><p className="text-xs text-gray-400">{timeAgo(tx.createdAt)}</p></div>
              <span className={`font-bold text-sm ${tx.points>0?'text-emerald-600':'text-red-500'}`}>{tx.points>0?'+':''}{tx.points} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Search History Tab ────────────────────────────────────────
function HistoryTab({ navigate }) {
  const history = JSON.parse(localStorage.getItem('medimap_search_history')||'[]');
  if (!history.length) return (
    <div className="card p-10 text-center">
      <div className="text-4xl mb-3">🔍</div>
      <p className="text-gray-500 font-medium">No search history yet</p>
      <Link to="/" className="btn-primary mt-4 inline-block text-sm">Search Now</Link>
    </div>
  );
  return (
    <div className="space-y-2">
      {history.map((item,i) => (
        <div key={i} className="card p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">🔍</div>
            <div><p className="font-medium text-gray-900 text-sm">{item.query}</p><p className="text-xs text-gray-400">{timeAgo(item.date)}</p></div>
          </div>
          <button onClick={() => navigate(`/results?q=${encodeURIComponent(item.query)}`)} className="btn-secondary text-xs !py-1.5 !px-3">Search Again →</button>
        </div>
      ))}
      <button onClick={() => { localStorage.removeItem('medimap_search_history'); window.location.reload(); }} className="text-xs text-red-400 hover:text-red-600 mt-2 block text-center w-full">Clear History</button>
    </div>
  );
}

// ── Saved Pharmacies Tab ──────────────────────────────────────
function SavedTab() {
  const [pharmacies, setPharmacies] = useState(JSON.parse(localStorage.getItem('medimap_saved_pharmacies')||JSON.stringify(DEFAULT_SAVED)));
  const remove = (id) => { const u=pharmacies.filter(p=>p.id!==id); setPharmacies(u); localStorage.setItem('medimap_saved_pharmacies',JSON.stringify(u)); };
  if (!pharmacies.length) return <div className="card p-10 text-center"><div className="text-4xl mb-3">🏥</div><p className="text-gray-500">No saved pharmacies</p></div>;
  return (
    <div className="space-y-3">
      {pharmacies.map(p => (
        <div key={p.id} className="card p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">🏥</div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
              <p className="text-xs text-gray-400">{p.address}</p>
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-yellow-500">⭐ {p.rating}</span>
                <span className={`text-xs ${p.isOpen?'text-emerald-600':'text-red-400'}`}>{p.isOpen?'● Open':'● Closed'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <a href={`https://maps.google.com/?q=${encodeURIComponent(p.address)}`} target="_blank" rel="noreferrer" className="btn-primary text-xs !py-1.5 !px-3">🗺️ Directions</a>
            <button onClick={()=>remove(p.id)} className="text-xs text-red-400 text-center">Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Reviews Tab ───────────────────────────────────────────────
function ReviewsTab() {
  const [reviews, setReviews] = useState(JSON.parse(localStorage.getItem('medimap_my_reviews')||JSON.stringify(DEFAULT_REVIEWS)));
  const remove = (id) => { const u=reviews.filter(r=>r.id!==id); setReviews(u); localStorage.setItem('medimap_my_reviews',JSON.stringify(u)); };
  if (!reviews.length) return <div className="card p-10 text-center"><div className="text-4xl mb-3">⭐</div><p className="text-gray-500">No reviews yet</p></div>;
  return (
    <div className="space-y-3">
      {reviews.map(r => (
        <div key={r.id} className="card p-4">
          <div className="flex justify-between mb-2">
            <div><p className="font-semibold text-gray-900 text-sm">{r.pharmacyName}</p><Stars rating={r.rating} /></div>
            <button onClick={()=>remove(r.id)} className="text-xs text-red-400">Delete</button>
          </div>
          {r.review && <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 italic">"{r.review}"</p>}
        </div>
      ))}
    </div>
  );
}

// ── Alerts Tab ────────────────────────────────────────────────
function AlertsTab() {
  const [alerts, setAlerts] = useState(JSON.parse(localStorage.getItem('medimap_price_alerts')||JSON.stringify(DEFAULT_ALERTS)));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({medicine:'',targetPrice:'',pharmacy:''});

  const toggle = (id) => { const u=alerts.map(a=>a.id===id?{...a,active:!a.active}:a); setAlerts(u); localStorage.setItem('medimap_price_alerts',JSON.stringify(u)); };
  const remove = (id) => { const u=alerts.filter(a=>a.id!==id); setAlerts(u); localStorage.setItem('medimap_price_alerts',JSON.stringify(u)); };
  const add = () => {
    if (!form.medicine||!form.targetPrice) return;
    const a={id:`a${Date.now()}`,medicine:form.medicine,targetPrice:Number(form.targetPrice),currentPrice:Number(form.targetPrice)+Math.floor(Math.random()*20)+5,pharmacy:form.pharmacy||'Any',active:true};
    const u=[a,...alerts]; setAlerts(u); localStorage.setItem('medimap_price_alerts',JSON.stringify(u));
    setForm({medicine:'',targetPrice:'',pharmacy:''}); setShowAdd(false);
  };

  return (
    <div>
      <button onClick={()=>setShowAdd(!showAdd)} className="btn-primary w-full !py-2.5 text-sm mb-4">
        {showAdd?'✕ Cancel':'+ Add Price Alert'}
      </button>
      {showAdd && (
        <div className="card p-4 mb-4 border-2 border-[#2E7DFF]">
          <div className="space-y-2">
            <input className="input-field" placeholder="Medicine name" value={form.medicine} onChange={e=>setForm({...form,medicine:e.target.value})} />
            <input className="input-field" type="number" placeholder="Target price (₹)" value={form.targetPrice} onChange={e=>setForm({...form,targetPrice:e.target.value})} />
            <input className="input-field" placeholder="Pharmacy (optional)" value={form.pharmacy} onChange={e=>setForm({...form,pharmacy:e.target.value})} />
            <button onClick={add} className="btn-primary w-full text-sm !py-2">Set Alert 🔔</button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {alerts.map(a => {
          const reached = a.currentPrice <= a.targetPrice;
          return (
            <div key={a.id} className={`card p-4 border-l-4 ${reached?'border-emerald-500':a.active?'border-[#2E7DFF]':'border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{a.medicine}</p>
                  <p className="text-xs text-gray-400">{a.pharmacy}</p>
                  <div className="flex gap-4 mt-2">
                    <div><p className="text-xs text-gray-400">Target</p><p className="font-bold text-[#2E7DFF] text-sm">₹{a.targetPrice}</p></div>
                    <div><p className="text-xs text-gray-400">Current</p><p className={`font-bold text-sm ${reached?'text-emerald-600':'text-gray-900'}`}>₹{a.currentPrice}</p></div>
                    {!reached && <div><p className="text-xs text-gray-400">Gap</p><p className="font-bold text-orange-500 text-sm">₹{a.currentPrice-a.targetPrice}</p></div>}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  <button onClick={()=>toggle(a.id)} className={`text-xs px-2.5 py-1 rounded-full font-medium ${a.active?'bg-blue-100 text-[#2E7DFF]':'bg-gray-100 text-gray-400'}`}>
                    {a.active?'🔔 Active':'🔕 Paused'}
                  </button>
                  <button onClick={()=>remove(a.id)} className="text-xs text-red-400">Remove</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Savings Tab ───────────────────────────────────────────────
function SavingsTab() {
  const savings = JSON.parse(localStorage.getItem('medimap_saved_money')||JSON.stringify(DEFAULT_SAVINGS));
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card p-4 text-center bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
          <p className="text-xs text-emerald-600 font-medium mb-1">Total Saved</p>
          <p className="text-3xl font-bold text-emerald-600">₹{savings.total}</p>
        </div>
        <div className="card p-4 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <p className="text-xs text-[#2E7DFF] font-medium mb-1">This Month</p>
          <p className="text-3xl font-bold text-[#2E7DFF]">₹{savings.thisMonth}</p>
        </div>
      </div>
      <div className="card p-4">
        <p className="font-semibold text-gray-900 mb-3">Recent Savings</p>
        {savings.transactions.map((t,i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-900">{t.medicine}</p>
              <p className="text-xs text-gray-400">Paid ₹{t.cheapest} · Avg ₹{t.avg} · {timeAgo(t.date)}</p>
            </div>
            <p className="font-bold text-emerald-600 text-sm">-₹{t.saved}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ProfilePage ──────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('points');
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('medimap_user');
    if (!stored) { navigate('/login'); return; }
    const u = JSON.parse(stored);
    setUser(u); setEditName(u.name||'');
  }, []);

  function logout() { localStorage.removeItem('medimap_user'); navigate('/'); }
  function saveEdit() {
    const updated = {...user, name: editName};
    localStorage.setItem('medimap_user', JSON.stringify(updated));
    setUser(updated); setEditMode(false);
  }

  const initials = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'?';
  const searchHistory = JSON.parse(localStorage.getItem('medimap_search_history')||'[]');
  const pendingAlerts = JSON.parse(localStorage.getItem('medimap_price_alerts')||JSON.stringify(DEFAULT_ALERTS)).filter(a=>a.active).length;

  if (!user) return null;

  const TABS = [
    { id:'points',    icon:'🏆', label:'MediPoints' },
    { id:'history',   icon:'🔍', label:'History',   badge: searchHistory.length },
    { id:'saved',     icon:'🏥', label:'Saved' },
    { id:'reviews',   icon:'⭐', label:'Reviews' },
    { id:'alerts',    icon:'🔔', label:'Alerts',    badge: pendingAlerts },
    { id:'savings',   icon:'💰', label:'Savings' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <div className="card p-6 mb-5">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="relative flex-shrink-0">
            {user.picture
              ? <img src={user.picture} className="w-20 h-20 rounded-2xl object-cover shadow-md" alt={user.name}/>
              : <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2E7DFF] to-[#00C2A8] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">{initials}</div>
            }
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            {editMode ? (
              <div className="flex items-center gap-2 mb-1">
                <input className="input-field !py-1.5 text-base font-bold max-w-xs" value={editName} onChange={e=>setEditName(e.target.value)} autoFocus/>
                <button onClick={saveEdit} className="btn-primary text-xs !py-1.5 !px-3">Save</button>
                <button onClick={()=>setEditMode(false)} className="btn-secondary text-xs !py-1.5 !px-3">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                <button onClick={()=>setEditMode(true)} className="text-gray-400 hover:text-[#2E7DFF]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
              </div>
            )}
            <p className="text-sm text-gray-400">{user.email}</p>
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-[#2E7DFF] px-2 py-0.5 rounded-full mt-1 font-medium">👤 Customer</span>
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-500 border border-red-100 hover:bg-red-50 transition-all">
            🚪 Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-gray-100">
          {[
            { icon:'🔍', label:'Searches', value: searchHistory.length||0 },
            { icon:'🏥', label:'Saved', value: JSON.parse(localStorage.getItem('medimap_saved_pharmacies')||'[]').length||2 },
            { icon:'🏆', label:'Points', value: '—' },
            { icon:'💰', label:'Saved', value: `₹${DEFAULT_SAVINGS.total}` },
          ].map(s => (
            <div key={s.label} className="text-center p-2 rounded-xl bg-gray-50">
              <div className="text-xl">{s.icon}</div>
              <p className="text-sm font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {TABS.map(tab => (
          <TabBtn key={tab.id} active={activeTab===tab.id} onClick={()=>setActiveTab(tab.id)} icon={tab.icon} label={tab.label} badge={tab.badge} />
        ))}
      </div>

      {/* Content */}
      {activeTab==='points'   && <PointsTab userId={user.email} />}
      {activeTab==='history'  && <HistoryTab navigate={navigate} />}
      {activeTab==='saved'    && <SavedTab />}
      {activeTab==='reviews'  && <ReviewsTab />}
      {activeTab==='alerts'   && <AlertsTab />}
      {activeTab==='savings'  && <SavingsTab />}
    </div>
  );
}
