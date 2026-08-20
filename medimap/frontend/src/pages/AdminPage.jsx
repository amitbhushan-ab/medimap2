import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const ADMIN_KEY = 'admin123';

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
  const stats = useQuery(api.admin.getStats);
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
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const submissions = useQuery(api.admin.getSubmissions, { status: filter });
  const updateSubmission = useMutation(api.admin.updateSubmission);

  async function action(id, act) {
    setActionLoading(id + act);
    try {
      await updateSubmission({ id, action: act });
      toast(act === 'approve' ? '✅ Approved! Price updated.' : '❌ Rejected.');
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

      {submissions === undefined ? <div className="card p-8 text-center text-gray-400">Loading...</div> :
        !submissions.length ? <div className="card p-12 text-center"><div className="text-5xl mb-3">📭</div><p className="text-gray-500">No {filter} submissions</p></div> :
        <div className="space-y-3">
          {submissions.map(sub => {
            const isListedPharmacy = !sub.isNewPharmacy && sub.displayPharmacy?.isListed === true;
            return (
              <div key={sub._id} className={`card border-l-4 ${sub.status === 'pending' ? 'border-amber-400' : 'border-emerald-400'}`}>
                <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === sub._id ? null : sub._id)}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-gray-900">{sub.medicineName}</h3>
                        <Badge color={sub.status === 'pending' ? 'amber' : 'green'}>{sub.status}</Badge>
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
                    {sub.billImage?.url ? (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">📄 Bill Image</p>
                        <img src={sub.billImage.url} alt="bill" className="max-h-64 rounded-xl border object-contain bg-gray-50 cursor-pointer hover:opacity-90" onClick={() => window.open(sub.billImage.url, '_blank')}
                          onError={e => { e.target.outerHTML = `<a href="${sub.billImage.url}" target="_blank" class="text-blue-500 text-xs underline">View Bill Image</a>`; }}
                        />
                      </div>
                    ) : <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-400 text-center">No bill image</div>}

                    {sub.personalNote && (
                      <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                        <p className="text-xs font-semibold text-purple-700 mb-1">📝 User Note</p>
                        <p className="text-sm text-purple-800 italic">"{sub.personalNote}"</p>
                      </div>
                    )}

                    {sub.isNewPharmacy && sub.newPharmacyData && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                        <p className="text-xs font-semibold text-orange-700 mb-1">🆕 New Pharmacy Info</p>
                        <p className="text-sm text-orange-800">{sub.newPharmacyData.name}</p>
                        {sub.newPharmacyData.address && <p className="text-xs text-orange-600">{sub.newPharmacyData.address}</p>}
                      </div>
                    )}

                    {sub.status === 'pending' && (
                      <div className="flex gap-3">
                        <button onClick={() => action(sub._id, 'approve')} disabled={!!actionLoading}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                          style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                          {actionLoading === sub._id + 'approve' ? '...' : '✅ Approve (+20 pts)'}
                        </button>
                        <button onClick={() => action(sub._id, 'reject')} disabled={!!actionLoading}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                          style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
                          {actionLoading === sub._id + 'reject' ? '...' : '❌ Reject'}
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
// PHARMACISTS TAB
// ══════════════════════════════════════════════════════════════
function PharmacistsTab({ toast }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [msgModal, setMsgModal] = useState(null);
  const [msgText, setMsgText] = useState('');

  const pharmacists = useQuery(api.admin.getPharmacists, { search, status: statusFilter });
  const updatePharmacist = useMutation(api.admin.updatePharmacist);
  const sendMsg = useMutation(api.admin.sendMessageToPharmacist);

  async function handleUpdate(id, updates, successMsg) {
    setActionLoading(id + JSON.stringify(updates));
    try {
      await updatePharmacist({ id, ...updates });
      toast(successMsg || '✅ Updated!');
    } catch (err) { toast(err.message, 'error'); }
    setActionLoading(null);
  }

  async function sendMessage(id) {
    if (!msgText.trim()) return;
    try {
      await sendMsg({ pharmacistId: id, message: msgText });
      toast('📧 Message sent!');
      setMsgModal(null); setMsgText('');
    } catch (err) { toast(err.message, 'error'); }
  }

  return (
    <div>
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

      <div className="flex gap-3 mb-4 flex-wrap">
        <input className="input-field flex-1" style={{ minWidth: 180 }} placeholder="Search pharmacy..." value={search} onChange={e => setSearch(e.target.value)}/>
        <select className="input-field" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="listed">Listed</option>
          <option value="suspended">Suspended</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {pharmacists === undefined ? <div className="card p-8 text-center text-gray-400">Loading...</div> :
        <div className="space-y-3">
          {pharmacists.map(p => {
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
                        {isVerified && <Badge color="green">✅ Verified</Badge>}
                        {isFeatured && <Badge color="amber">⭐ Featured</Badge>}
                        {isPremium && <Badge color="purple">✨ Premium</Badge>}
                        {isSuspended && <Badge color="red">🚫 Suspended</Badge>}
                        {!isListed && <Badge color="gray">Unlisted</Badge>}
                      </div>
                      <p className="text-xs text-gray-400">{p.address}</p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-400">
                        <span>📧 {p.email || p.contact}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <button onClick={() => handleUpdate(p._id, { isListed: !isListed }, `${!isListed ? '✅ Listed' : 'Unlisted'}`)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${isListed ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isListed ? 'Unlist' : '✅ List'}
                    </button>
                    <button onClick={() => handleUpdate(p._id, { isVerified: !isVerified }, `${!isVerified ? '✅ Verified' : 'Unverified'}`)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${isVerified ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isVerified ? 'Unverify' : '✅ Verify'}
                    </button>
                    <button onClick={() => handleUpdate(p._id, { isFeatured: !isFeatured }, `${!isFeatured ? '⭐ Featured' : 'Unfeatured'}`)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${isFeatured ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
                      {isFeatured ? 'Unfeature' : '⭐ Feature'}
                    </button>
                    <button onClick={() => handleUpdate(p._id, { isPremium: !isPremium }, `${!isPremium ? '✨ Premium granted!' : 'Premium revoked'}`)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${isPremium ? 'bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-700'}`}>
                      {isPremium ? 'Revoke Premium' : '✨ Grant Premium'}
                    </button>
                    <button onClick={() => handleUpdate(p._id, { isSuspended: !isSuspended }, `${!isSuspended ? '🚫 Suspended' : '✅ Unsuspended'}`)}
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
// MEDIPOINTS TAB
// ══════════════════════════════════════════════════════════════
function MediaPointsTab({ toast }) {
  const [search, setSearch] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [action, setAction] = useState('award');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const users = useQuery(api.admin.getUsers, { search });
  const selectedUser = users && users.length > 0 ? users[0] : null;
  const updateUsr = useMutation(api.admin.updateUser);

  async function execute() {
    if (!selectedUser || !amount) return toast('User not found or amount missing', 'error');
    setLoading(true);
    try {
      const pts = action === 'award' ? Math.abs(parseInt(amount)) : -Math.abs(parseInt(amount));
      const newBalance = (selectedUser.medipoints || 0) + pts;
      await updateUsr({ id: selectedUser._id, medipoints: newBalance });
      toast(`✅ ${action === 'award' ? '+' : '-'}${Math.abs(pts)} pts → ${selectedUser.email}. New balance: ${newBalance}`);
      setHistory(prev => [{ userId: selectedUser.email, points: pts, reason: reason || 'Admin action', at: new Date().toISOString() }, ...prev]);
      setAmount(''); setReason('');
    } catch (err) { toast(err.message, 'error'); }
    setLoading(false);
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-3">🔍 Lookup User</h3>
          <div className="flex gap-2 mb-3">
            <input className="input-field flex-1" placeholder="Search User email / name" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          {selectedUser ? (
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-gray-700">{selectedUser.name}</p>
              <p className="text-xs text-gray-500 mb-2">{selectedUser.email}</p>
              <p className="text-xs text-gray-500">Balance</p>
              <p className="text-3xl font-bold text-[#1B6EF3]">{selectedUser.medipoints || 0}</p>
              <p className="text-xs text-gray-400">MediPoints</p>
            </div>
          ) : search && users && users.length === 0 ? (
            <div className="bg-red-50 rounded-xl p-4 text-center text-red-600">No user found</div>
          ) : null}
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
            <input className="input-field" type="number" placeholder="Points *" value={amount} onChange={e => setAmount(e.target.value)}/>
            <input className="input-field" placeholder="Reason" value={reason} onChange={e => setReason(e.target.value)}/>
            <button onClick={execute} disabled={loading || !selectedUser} className={`btn-primary w-full !py-2.5 text-sm ${action === 'deduct' ? '!bg-red-500' : ''}`}>
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
// COUPONS TAB
// ══════════════════════════════════════════════════════════════
function CouponsTab({ toast }) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ discount: '20', validDays: '30', code: '', forAnyUser: true });
  
  const coupons = useQuery(api.admin.getCoupons) || [];
  const createCou = useMutation(api.admin.createCoupon);
  const deleteCou = useMutation(api.admin.deleteCoupon);

  async function createCoupon() {
    try {
      const finalCode = form.code || 'MEDI' + Math.floor(Math.random()*10000);
      await createCou({ ...form, code: finalCode });
      toast(`🎟️ Coupon ${finalCode} created!`);
      setShowCreate(false);
      setForm({ discount: '20', validDays: '30', code: '', forAnyUser: true });
    } catch (err) { toast(err.message, 'error'); }
  }

  async function removeCoupon(id) {
    try { await deleteCou({ id }); toast('Deleted'); }
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
            <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Custom Code (optional)</p>
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
                <button onClick={() => removeCoupon(c._id)} className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg">🗑️</button>
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
// BROADCAST TAB
// ══════════════════════════════════════════════════════════════
function BroadcastTab({ toast }) {
  const [form, setForm] = useState({ title: '', message: '', type: 'info', target: 'all' });
  const broadcasts = useQuery(api.admin.getAdminMessages) || [];
  const bcast = useMutation(api.admin.broadcastMessage);

  async function send() {
    if (!form.message) return toast('Fill message', 'error');
    try {
      await bcast(form);
      toast(`📢 Broadcast sent to ${form.target}!`);
      setForm({ title: '', message: '', type: 'info', target: 'all' });
    } catch (err) { toast(err.message, 'error'); }
  }

  return (
    <div>
      <div className="card p-5 mb-5">
        <h3 className="font-semibold text-gray-900 mb-3">Send Broadcast</h3>
        <div className="space-y-3">
          <input className="input-field" placeholder="Title (optional)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}/>
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
          <div key={b._id} className="card p-4">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900 text-sm">{b.title || 'Broadcast'}</p>
              <Badge color={b.type === 'alert' ? 'red' : b.type === 'promo' ? 'green' : 'blue'}>{b.type || 'info'}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{b.message}</p>
            <div className="flex gap-3 text-xs text-gray-400">
              <span>🎯 {b.target}</span>
              <span>{new Date(b.createdAt).toLocaleDateString('en-IN')}</span>
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
    <div className="min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden" style={{ backgroundColor: '#F8FAFD' }}>
      {/* Aurora Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse-glow" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-pulse-glow" style={{ background: 'radial-gradient(circle, #ec4899, transparent)', animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-slide-up mt-8 mb-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-[0_10px_30px_rgba(139,92,246,0.3)] bg-gradient-to-br from-purple-600 to-pink-500">🛡️</div>
          <h1 className="text-3xl font-extrabold text-gray-900 font-sora">Super Admin</h1>
          <p className="text-gray-500 font-medium mt-1">MediMap Control Center</p>
        </div>
        
        <div className="glass-panel bg-white/70 rounded-3xl p-8 shadow-2xl border border-white">
          <input type="password" 
            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder-gray-400 font-medium mb-4" 
            placeholder="Admin Secret Key" value={keyInput}
            onChange={e => { setKeyInput(e.target.value); setKeyError(''); }}
            onKeyDown={e => e.key === 'Enter' && (keyInput === ADMIN_KEY ? setAuth(true) : setKeyError('Invalid key'))}/>
          
          {keyError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2">
              <span className="text-red-500 text-sm">⚠️</span>
              <p className="text-sm font-semibold text-red-600">{keyError}</p>
            </div>
          )}
          
          <button onClick={() => keyInput === ADMIN_KEY ? setAuth(true) : setKeyError('Invalid key')} 
            className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 transform transition-transform hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-purple-600 to-pink-500">
            🔐 Authenticate
          </button>
          
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-gray-500 text-sm font-medium">
              Return to <Link to="/" className="text-purple-600 font-bold hover:underline">MediMap Home</Link>
            </p>
            <p className="text-center text-xs text-gray-400 mt-3">Default: <code className="bg-gray-100 px-1 py-0.5 rounded">admin123</code></p>
          </div>
        </div>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
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
