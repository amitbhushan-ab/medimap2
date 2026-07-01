// frontend/src/pages/AdminPage.jsx — COMPLETE WORKING VERSION
// Fixes: action buttons persist, medipoints, coupons, broadcast, featured, listed/suspended UI
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const ADMIN_KEY = 'admin123';
const API = 'https://medimap-backend-production.up.railway.app/api';

function apiCall(url, opts = {}) {
  return fetch(`${API}${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': ADMIN_KEY,
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  }).then(async r => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
    return data;
  });
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 9999, padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, background: type === 'error' ? '#fef2f2' : '#f0fdf4', color: type === 'error' ? '#dc2626' : '#16a34a', border: `1px solid ${type === 'error' ? '#fecaca' : '#bbf7d0'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', maxWidth: 360 }}>
      {msg}
    </div>
  );
}

function Badge({ children, color = 'blue' }) {
  const colors = { blue: 'bg-blue-100 text-blue-700', green: 'bg-emerald-100 text-emerald-700', red: 'bg-red-100 text-red-700', amber: 'bg-amber-100 text-amber-700', gray: 'bg-gray-100 text-gray-600', purple: 'bg-purple-100 text-purple-700' };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[color]}`}>{children}</span>;
}

// ══════════════════════════════════════════════════════════════
// ANALYTICS TAB
// ══════════════════════════════════════════════════════════════
function AnalyticsTab() {
  const [stats, setStats] = useState(null);
  useEffect(() => { apiCall('/admin/stats').then(setStats).catch(console.error); }, []);
  if (!stats) return <div className="text-center py-10 text-gray-400">Loading...</div>;
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: '📋', label: 'Pending Requests', value: stats.pending || 0, color: 'bg-amber-50' },
          { icon: '🏥', label: 'Listed Pharmacies', value: stats.pharmacists || 0, color: 'bg-blue-50' },
          { icon: '✨', label: 'Premium Pharmacists', value: stats.premiumPharmacists || 0, color: 'bg-purple-50' },
          { icon: '⚠️', label: 'New Pharmacy Requests', value: stats.newPharmacy || 0, color: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.color}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SUBMISSIONS TAB
// ══════════════════════════════════════════════════════════════
function SubmissionsTab({ toast }) {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    apiCall(`/admin/submissions?status=${filter}`)
      .then(d => setSubmissions(d.submissions || []))
      .catch(err => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function action(id, act, extra = {}) {
    setActionLoading(id + act);
    try {
      await apiCall(`/admin/submissions/${id}`, { method: 'PATCH', body: { action: act, adminKey: ADMIN_KEY, ...extra } });
      toast(act === 'approve' ? '✅ Approved! Price updated & request deleted.' : '❌ Rejected & deleted.');
      load();
    } catch (err) { toast(err.message, 'error'); }
    setActionLoading(null);
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['pending', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${filter === f ? 'bg-[#1B6EF3] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {f === 'pending' ? '⏳ Pending' : '📋 All'}
          </button>
        ))}
      </div>

      {loading ? <div className="card p-8 text-center text-gray-400">Loading...</div> :
        !submissions.length ? <div className="card p-12 text-center"><div className="text-5xl mb-3">📭</div><p className="text-gray-500">No {filter} submissions</p></div> :
        <div className="space-y-3">
          {submissions.map(sub => {
            // FIX #9: correct isListed display
            const isListedPharmacy = !sub.isNewPharmacy && sub.displayPharmacy?.isListed === true;
            return (
              <div key={sub._id || sub.id} className={`card border-l-4 ${sub.status === 'pending' ? 'border-amber-400' : 'border-emerald-400'}`}>
                <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === sub._id ? null : sub._id)}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-gray-900">{sub.medicineName}</h3>
                        <Badge color={sub.status === 'pending' ? 'amber' : 'green'}>{sub.status}</Badge>
                        {/* FIX #9: show correct listed/unlisted badge */}
                        {isListedPharmacy
                          ? <Badge color="blue">✅ Listed</Badge>
                          : sub.isNewPharmacy
                            ? <Badge color="red">🆕 New Pharmacy</Badge>
                            : <Badge color="gray">Not Listed</Badge>
                        }
                        {sub.displayPharmacy?.isSuspended && <Badge color="red">🚫 Suspended</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-gray-600">
                        <span className="font-bold text-[#1B6EF3]">₹{sub.price}</span>
                        <span>🏥 {sub.displayPharmacy?.name || sub.pharmacyNameSnapshot}</span>
                        <span>👤 {sub.submittedBy?.userName || 'User'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sub.billImage?.url && <Badge color="blue">📄 Bill</Badge>}
                      <span className="text-gray-400 text-xs">{expanded === sub._id ? '▲' : '▼'}</span>
                    </div>
                  </div>
                </div>

                {expanded === sub._id && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-3" style={{ borderColor: 'var(--border)' }}>
                    {/* Bill image */}
                    {sub.billImage?.url ? (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">📄 Bill Image</p>
                        <img src={sub.billImage.url} alt="bill" className="max-h-64 rounded-xl border object-contain bg-gray-50 cursor-pointer hover:opacity-90" onClick={() => window.open(sub.billImage.url, '_blank')}
                          onError={e => { e.target.outerHTML = `<a href="${sub.billImage.url}" target="_blank" class="text-blue-500 text-xs underline">View Bill Image</a>`; }}
                        />
                      </div>
                    ) : <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-400 text-center">No bill image</div>}

                    {/* Personal note */}
                    {sub.personalNote && (
                      <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                        <p className="text-xs font-semibold text-purple-700 mb-1">📝 User Note</p>
                        <p className="text-sm text-purple-800 italic">"{sub.personalNote}"</p>
                      </div>
                    )}

                    {/* Pharmacist response */}
                    {sub.pharmacistResponse?.status && sub.pharmacistResponse.status !== 'not_applicable' && (
                      <div className={`rounded-xl p-3 text-xs ${sub.pharmacistResponse.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        🏥 Pharmacist: {sub.pharmacistResponse.status.toUpperCase()}
                        {sub.pharmacistResponse.note && ` — "${sub.pharmacistResponse.note}"`}
                      </div>
                    )}

                    {/* New pharmacy data */}
                    {sub.isNewPharmacy && sub.newPharmacyData && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                        <p className="text-xs font-semibold text-orange-700 mb-1">🆕 New Pharmacy Info</p>
                        <p className="text-sm text-orange-800">{sub.newPharmacyData.name}</p>
                        {sub.newPharmacyData.address && <p className="text-xs text-orange-600">{sub.newPharmacyData.address}</p>}
                      </div>
                    )}

                    {/* Actions */}
                    {sub.status === 'pending' && (
                      <div className="flex gap-3">
                        <button onClick={() => action(sub._id || sub.id, 'approve')} disabled={!!actionLoading}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                          style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                          {actionLoading === (sub._id || sub.id) + 'approve' ? '...' : '✅ Approve (+20 pts)'}
                        </button>
                        <button onClick={() => action(sub._id || sub.id, 'reject')} disabled={!!actionLoading}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                          style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
                          {actionLoading === (sub._id || sub.id) + 'reject' ? '...' : '❌ Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PHARMACISTS TAB — FIX #1, #4, #9
// ══════════════════════════════════════════════════════════════
function PharmacistsTab({ toast }) {
  const [pharmacists, setPharmacists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [msgModal, setMsgModal] = useState(null);
  const [msgText, setMsgText] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    apiCall(`/admin/pharmacists?search=${search}&status=${statusFilter}&limit=50`)
      .then(d => setPharmacists(d.pharmacists || []))
      .catch(err => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  // FIX #1: Each action calls DB immediately and updates local state
  async function updatePharmacist(id, updates, successMsg) {
    setActionLoading(id + JSON.stringify(updates));
    try {
      const updated = await apiCall(`/admin/pharmacists/${id}`, { method: 'PATCH', body: updates });
      setPharmacists(prev => prev.map(p => p._id === id ? { ...p, ...updated } : p));
      toast(successMsg || '✅ Updated!');
    } catch (err) { toast(err.message, 'error'); }
    setActionLoading(null);
  }

  async function sendMessage(id) {
    if (!msgText.trim()) return;
    try {
      await apiCall(`/admin/pharmacists/${id}/message`, { method: 'POST', body: { message: msgText } });
      toast('📧 Message sent!');
      setMsgModal(null); setMsgText('');
    } catch (err) { toast(err.message, 'error'); }
  }

  return (
    <div>
      {/* Message modal */}
      {msgModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-3">📧 Send Message to {msgModal.name}</h3>
            <textarea className="input-field mb-3" rows={4} placeholder="Type your message..." value={msgText} onChange={e => setMsgText(e.target.value)}/>
            <div className="flex gap-3">
              <button onClick={() => sendMessage(msgModal._id)} className="btn-primary flex-1 !py-2.5 text-sm">Send</button>
              <button onClick={() => { setMsgModal(null); setMsgText(''); }} className="btn-secondary flex-1 !py-2.5 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input className="input-field flex-1" style={{ minWidth: 180 }} placeholder="Search pharmacy..." value={search} onChange={e => setSearch(e.target.value)}/>
        <select className="input-field" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="premium">Premium</option>
          <option value="featured">Featured</option>
          <option value="verified">Verified</option>
        </select>
      </div>

      {loading ? <div className="card p-8 text-center text-gray-400">Loading...</div> :
        <div className="space-y-3">
          {pharmacists.map(p => {
            // FIX #4: always derive boolean correctly
            const isSuspended = p.isSuspended === true;
            const isListed = p.isListed !== false;
            const isPremium = p.isPremium === true;
            const isVerified = p.isVerified === true;
            const isFeatured = p.isFeatured === true;

            return (
              <div key={p._id} className={`card p-4 ${isSuspended ? 'opacity-60 border-red-200' : ''}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                      {p.name?.[0] || 'P'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                        {/* FIX #4, #9: badges based on correct boolean */}
                        {isVerified && <Badge color="green">✅ Verified</Badge>}
                        {isFeatured && <Badge color="amber">⭐ Featured</Badge>}
                        {isPremium && <Badge color="purple">✨ Premium</Badge>}
                        {isSuspended && <Badge color="red">🚫 Suspended</Badge>}
                        {!isListed && <Badge color="gray">Unlisted</Badge>}
                      </div>
                      <p className="text-xs text-gray-400">{p.address}</p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-400">
                        <span>📦 {p.stockCount || 0} meds</span>
                        <span>⭐ {p.rating}</span>
                        <span>📧 {p.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons — FIX #1: each updates DB */}
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <button onClick={() => updatePharmacist(p._id, { isVerified: !isVerified }, `${!isVerified ? '✅ Verified' : 'Unverified'}`)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${isVerified ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isVerified ? 'Unverify' : '✅ Verify'}
                    </button>
                    <button onClick={() => updatePharmacist(p._id, { isFeatured: !isFeatured, featuredExpiry: isFeatured ? null : new Date(Date.now() + 30 * 86400000) }, `${!isFeatured ? '⭐ Featured' : 'Unfeatured'}`)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${isFeatured ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
                      {isFeatured ? 'Unfeature' : '⭐ Feature'}
                    </button>
                    <button onClick={() => updatePharmacist(p._id, { grantPremium: !isPremium, revokePremium: isPremium, premiumPlan: 'monthly' }, `${!isPremium ? '✨ Premium granted!' : 'Premium revoked'}`)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${isPremium ? 'bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-700'}`}>
                      {isPremium ? 'Revoke Premium' : '✨ Grant Premium'}
                    </button>
                    <button onClick={() => updatePharmacist(p._id, { isSuspended: !isSuspended, suspendedReason: !isSuspended ? 'Admin action' : undefined }, `${!isSuspended ? '🚫 Suspended' : '✅ Unsuspended'}`)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${isSuspended ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {isSuspended ? 'Unsuspend' : '🚫 Suspend'}
                    </button>
                    <button onClick={() => setMsgModal(p)} className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-blue-100 text-blue-700">📧 Message</button>
                  </div>
                </div>
              </div>
            );
          })}
          {!pharmacists.length && <div className="card p-10 text-center text-gray-400">No pharmacists found</div>}
        </div>
      }
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MEDIPOINTS TAB — FIX #2: Admin award persists to DB
// ══════════════════════════════════════════════════════════════
function MediaPointsTab({ toast }) {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [action, setAction] = useState('award');
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  async function lookup() {
    if (!userId.trim()) return;
    try {
      const data = await fetch(`${API}/points/${encodeURIComponent(userId)}`).then(r => r.json());
      setWallet(data);
    } catch (err) { toast(err.message, 'error'); }
  }

  async function execute() {
    if (!userId.trim() || !amount) return toast('Fill userId and amount', 'error');
    setLoading(true);
    try {
      const pts = action === 'award' ? Math.abs(parseInt(amount)) : -Math.abs(parseInt(amount));
      // FIX #2: calls admin-award endpoint which persists to MongoDB
      const data = await apiCall('/points/admin-award', {
        method: 'POST',
        body: { userId, points: pts, reason: reason || 'Admin action', adminKey: ADMIN_KEY },
      });
      toast(`✅ ${action === 'award' ? '+' : '-'}${Math.abs(pts)} pts → ${userId}. New balance: ${data.points}`);
      setHistory(prev => [{ userId, points: pts, reason: reason || 'Admin action', at: new Date().toISOString() }, ...prev]);
      setWallet(prev => prev ? { ...prev, points: data.points } : null);
      setAmount(''); setReason('');
    } catch (err) { toast(err.message, 'error'); }
    setLoading(false);
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-3">🔍 Lookup User Wallet</h3>
          <div className="flex gap-2 mb-3">
            <input className="input-field flex-1" placeholder="User email / ID" value={userId} onChange={e => setUserId(e.target.value)} onKeyDown={e => e.key === 'Enter' && lookup()}/>
            <button onClick={lookup} className="btn-primary text-sm !px-4">Lookup</button>
          </div>
          {wallet && (
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500">Balance</p>
              <p className="text-3xl font-bold text-[#1B6EF3]">{wallet.points}</p>
              <p className="text-xs text-gray-400">MediPoints</p>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-3">⚡ Award / Deduct</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              {['award', 'deduct'].map(a => (
                <button key={a} onClick={() => setAction(a)} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${action === a ? (a === 'award' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : 'bg-gray-100 text-gray-600'}`}>
                  {a === 'award' ? '+ Award' : '- Deduct'}
                </button>
              ))}
            </div>
            <input className="input-field" placeholder="User email / ID *" value={userId} onChange={e => setUserId(e.target.value)}/>
            <input className="input-field" type="number" placeholder="Points *" value={amount} onChange={e => setAmount(e.target.value)}/>
            <input className="input-field" placeholder="Reason" value={reason} onChange={e => setReason(e.target.value)}/>
            <button onClick={execute} disabled={loading} className={`btn-primary w-full !py-2.5 text-sm ${action === 'deduct' ? '!bg-red-500' : ''}`}>
              {loading ? '...' : `${action === 'award' ? '✅' : '❌'} ${action === 'award' ? 'Award' : 'Deduct'} ${amount || '?'} Points`}
            </button>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-3">📋 Session History</h3>
          {history.map((h, i) => (
            <div key={i} className={`flex justify-between py-2 border-b border-gray-50 last:border-0`}>
              <div><p className="text-sm font-medium text-gray-900">{h.userId}</p><p className="text-xs text-gray-400">{h.reason}</p></div>
              <span className={`font-bold text-sm ${h.points > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{h.points > 0 ? '+' : ''}{h.points}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COUPONS TAB — FIX #10, #11
// ══════════════════════════════════════════════════════════════
function CouponsTab({ toast }) {
  const [coupons, setCoupons] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ discount: '20', validDays: '30', code: '', forAnyUser: true });

  useEffect(() => { loadCoupons(); }, []);

  function loadCoupons() {
    apiCall('/admin/coupons').then(setCoupons).catch(() => {});
  }

  async function createCoupon() {
    try {
      const data = await apiCall('/admin/coupons', {
        method: 'POST',
        body: { ...form, adminKey: ADMIN_KEY },
      });
      toast(`🎟️ Coupon ${data.coupon?.code} created!`);
      loadCoupons(); setShowCreate(false);
      setForm({ discount: '20', validDays: '30', code: '', forAnyUser: true });
    } catch (err) { toast(err.message, 'error'); }
  }

  async function deleteCoupon(id) {
    try { await apiCall(`/admin/coupons/${id}`, { method: 'DELETE' }); toast('Deleted'); loadCoupons(); }
    catch (err) { toast(err.message, 'error'); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">🎟️ Coupon Management</h2>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm !px-4 !py-2">+ Create</button>
      </div>

      {showCreate && (
        <div className="card p-5 mb-5 border-2 border-[#1B6EF3]">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-gray-500 mb-1">Discount %</p>
              <select className="input-field" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })}>
                {['10','15','20','25','30','50','100'].map(v => <option key={v} value={v}>{v}% OFF</option>)}
              </select></div>
            <div><p className="text-xs text-gray-500 mb-1">Valid Days</p>
              <input className="input-field" type="number" value={form.validDays} onChange={e => setForm({ ...form, validDays: e.target.value })}/></div>
            <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Custom Code (optional — auto-generated if empty)</p>
              <input className="input-field" placeholder="e.g. MEDISPECIAL20" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}/></div>
          </div>
          <div className="flex gap-3 mt-3">
            <button onClick={createCoupon} className="btn-primary flex-1 !py-2.5 text-sm">🎟️ Create</button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1 !py-2.5 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {coupons.map(c => (
          <div key={c._id} className={`card p-4 ${c.isUsed ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <code className="font-bold text-[#1B6EF3] tracking-wider text-base">{c.code}</code>
                <div className="flex gap-2 mt-1">
                  <Badge color="blue">{c.discount}% OFF</Badge>
                  {c.isUsed ? <Badge color="gray">Used</Badge> : new Date(c.expiresAt) < new Date() ? <Badge color="red">Expired</Badge> : <Badge color="green">Active</Badge>}
                  {c.isAdminCoupon && <Badge color="purple">Admin</Badge>}
                </div>
                <p className="text-xs text-gray-400 mt-1">Expires: {new Date(c.expiresAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(c.code); toast('Copied!'); }} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">📋</button>
                <button onClick={() => deleteCoupon(c._id)} className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg">🗑️</button>
              </div>
            </div>
          </div>
        ))}
        {!coupons.length && <div className="card p-8 text-center text-gray-400">No coupons yet</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// BROADCAST TAB — FIX #10
// ══════════════════════════════════════════════════════════════
function BroadcastTab({ toast }) {
  const [broadcasts, setBroadcasts] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', type: 'info', target: 'all' });

  useEffect(() => { apiCall('/admin/broadcasts').then(setBroadcasts).catch(() => {}); }, []);

  async function send() {
    if (!form.title || !form.message) return toast('Fill title and message', 'error');
    try {
      const data = await apiCall('/admin/broadcast', { method: 'POST', body: form });
      toast(`📢 Broadcast sent to ${form.target}!`);
      setBroadcasts(prev => [data.broadcast, ...prev]);
      setForm({ title: '', message: '', type: 'info', target: 'all' });
    } catch (err) { toast(err.message, 'error'); }
  }

  return (
    <div>
      <div className="card p-5 mb-5">
        <h3 className="font-semibold text-gray-900 mb-3">Send Broadcast</h3>
        <div className="space-y-3">
          <input className="input-field" placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}/>
          <textarea className="input-field" rows={3} placeholder="Message *" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}/>
          <div className="grid grid-cols-2 gap-3">
            <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="info">ℹ️ Info</option><option value="feature">✨ Feature</option>
              <option value="alert">🔔 Alert</option><option value="promo">🎁 Promo</option>
            </select>
            <select className="input-field" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })}>
              <option value="all">🌐 All</option><option value="customers">👤 Customers</option>
              <option value="pharmacists">🏥 Pharmacists</option><option value="premium">✨ Premium</option>
            </select>
          </div>
          <button onClick={send} className="btn-primary w-full !py-3">📢 Send Broadcast</button>
        </div>
      </div>

      <div className="space-y-3">
        {broadcasts.map(b => (
          <div key={b.id} className="card p-4">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900 text-sm">{b.title}</p>
              <Badge color={b.type === 'alert' ? 'red' : b.type === 'promo' ? 'green' : 'blue'}>{b.type}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{b.message}</p>
            <div className="flex gap-3 text-xs text-gray-400">
              <span>👥 {b.reach} reached</span><span>🎯 {b.target}</span>
              <span>{new Date(b.sentAt).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN ADMIN PAGE
// ══════════════════════════════════════════════════════════════
export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const [activeTab, setActiveTab] = useState('analytics');
  const [toast, setToast] = useState(null);

  function showToast(msg, type = 'success') { setToast({ msg, type }); }

  if (!auth) return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg" style={{ background: 'linear-gradient(135deg,#1B6EF3,#00C2A8)' }}>🛡️</div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
          <p className="text-gray-500 text-sm">MediMap Control Center</p>
        </div>
        <div className="card p-6">
          <input type="password" className="input-field mb-3" placeholder="Admin key" value={keyInput}
            onChange={e => { setKeyInput(e.target.value); setKeyError(''); }}
            onKeyDown={e => e.key === 'Enter' && (keyInput === ADMIN_KEY ? setAuth(true) : setKeyError('Invalid key'))}/>
          {keyError && <p className="text-red-500 text-xs mb-3">{keyError}</p>}
          <button onClick={() => keyInput === ADMIN_KEY ? setAuth(true) : setKeyError('Invalid key')} className="btn-primary w-full !py-3">🔐 Login</button>
          <p className="text-center text-xs text-gray-400 mt-3">Default: <code className="bg-gray-100 px-1 rounded">admin123</code></p>
        </div>
        <div className="text-center mt-4"><Link to="/" className="text-sm text-[#1B6EF3] hover:underline">← MediMap</Link></div>
      </div>
    </div>
  );

  const TABS = [
    { id: 'analytics', icon: '📊', label: 'Analytics' },
    { id: 'submissions', icon: '📋', label: 'Submissions' },
    { id: 'pharmacists', icon: '🏥', label: 'Pharmacists' },
    { id: 'points', icon: '🏆', label: 'MediPoints' },
    { id: 'coupons', icon: '🎟️', label: 'Coupons' },
    { id: 'broadcast', icon: '📢', label: 'Broadcast' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg" style={{ background: 'linear-gradient(135deg,#1B6EF3,#00C2A8)' }}>🛡️</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">MediMap Admin</h1>
            <p className="text-sm text-gray-500">Control Center · <span className="text-emerald-500 font-semibold">● Online</span></p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/" className="btn-secondary text-sm !py-2">← MediMap</Link>
          <button onClick={() => setAuth(false)} className="text-sm text-red-500 border border-red-100 rounded-xl px-3 py-2 hover:bg-red-50">🚪 Logout</button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab.id ? 'text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1B6EF3]'}`}
            style={activeTab === tab.id ? { background: 'linear-gradient(135deg,#1B6EF3,#00C2A8)' } : {}}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'analytics'   && <AnalyticsTab/>}
      {activeTab === 'submissions' && <SubmissionsTab toast={showToast}/>}
      {activeTab === 'pharmacists' && <PharmacistsTab toast={showToast}/>}
      {activeTab === 'points'      && <MediaPointsTab toast={showToast}/>}
      {activeTab === 'coupons'     && <CouponsTab toast={showToast}/>}
      {activeTab === 'broadcast'   && <BroadcastTab toast={showToast}/>}
    </div>
  );
}
