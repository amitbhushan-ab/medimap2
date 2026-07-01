// frontend/src/components/PharmacistNotifications.jsx — v2
// POINT 3: Shows matching medicines dropdown from pharmacist's stock
// Pharmacist selects which stock item to update price for, then approves
import { useState, useEffect, useRef } from 'react';

const BACKEND = '';
const getToken = () => localStorage.getItem('pharmacist_token');

function timeAgo(d) {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function PharmacistNotifications({ pharmacistId, theme }) {
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [responding, setResponding] = useState(null);
  const [notes, setNotes] = useState({});
  // POINT 3: per-notification selected stock item
  const [selectedStock, setSelectedStock] = useState({}); // notifId → stockId
  const [stockMatches, setStockMatches] = useState({});   // notifId → [stockItem]
  const [toasts, setToasts] = useState([]);
  const ref = useRef(null);

  function addToast(msg, type = 'success') {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }

  async function loadNotifs() {
    if (!pharmacistId) return;
    try {
      const d = await fetch(`${BACKEND}/api/admin/pharmacist-notifications/${pharmacistId}`).then(r => r.json());
      const newNotifs = d.notifications || [];
      setNotifs(newNotifs);
      setUnread(d.unread || 0);

      // POINT 3: For each new pending notification, fetch matching stock
      const pending = newNotifs.filter(n => !n.pharmacistResponse && n.type === 'price_submission');
      const token = getToken();
      for (const n of pending) {
        if (stockMatches[n.id]) continue; // already loaded
        const medName = n.submissionData?.medicineName;
        if (!medName || !token) continue;
        try {
          const res = await fetch(`${BACKEND}/api/pharmacist/stock`, { headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          const allStock = data.stock || [];
          // Find matches: same name (case-insensitive, partial)
          const matches = allStock.filter(s =>
            s.medicineName.toLowerCase().includes(medName.toLowerCase().slice(0, 8)) ||
            medName.toLowerCase().includes(s.medicineName.toLowerCase().slice(0, 8))
          );
          setStockMatches(prev => ({ ...prev, [n.id]: matches }));
          // Auto-select if exactly one match
          if (matches.length === 1) {
            setSelectedStock(prev => ({ ...prev, [n.id]: matches[0]._id || matches[0].id }));
          }
        } catch {}
      }
    } catch {}
  }

  useEffect(() => {
    loadNotifs();
    const iv = setInterval(loadNotifs, 15000);
    return () => clearInterval(iv);
  }, [pharmacistId]);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // POINT 3 — Approve: updates selected stock item price OR creates new price entry
  async function respond(notifId, response) {
    setResponding(notifId);
    try {
      const stockId = selectedStock[notifId];

      const res = await fetch(`${BACKEND}/api/admin/pharmacist-notifications/${pharmacistId}/${notifId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacistId,
          response,
          note: notes[notifId] || '',
          selectedStockId: stockId || null, // POINT 3: tell backend which stock item to update
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (response === 'approved') {
        addToast('✅ Approved! Price updated in your stock & customer portal.', 'success');
      } else {
        addToast('❌ Rejected. Request deleted.', 'error');
      }
      loadNotifs();
    } catch (e) {
      addToast(e.message, 'error');
    }
    setResponding(null);
  }

  const bg = isDark ? '#0f172a' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
  const txt = isDark ? '#ffffff' : '#111827';
  const sub = isDark ? 'rgba(255,255,255,0.55)' : '#4b5563';
  const muted = isDark ? 'rgba(255,255,255,0.3)' : '#9ca3af';
  const rowBg = isDark ? 'rgba(0,0,0,0.2)' : '#f9fafb';
  const inp = { background: isDark ? 'rgba(255,255,255,0.07)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#d1d5db'}`, borderRadius: 8, padding: '7px 10px', color: txt, fontSize: 12, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'DM Sans,sans-serif' };

  return (
    <>
      {/* Toasts */}
      {toasts.map(t => (
        <div key={t.id} style={{ position: 'fixed', top: 68, right: 24, zIndex: 10001, padding: '10px 18px', borderRadius: 12, fontWeight: 600, fontSize: 13, background: t.type === 'error' ? '#fef2f2' : '#f0fdf4', color: t.type === 'error' ? '#dc2626' : '#16a34a', border: `1px solid ${t.type === 'error' ? '#fecaca' : '#bbf7d0'}`, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', pointerEvents: 'none' }}>{t.msg}</div>
      ))}

      {/* Bell button — fixed position, always top-right */}
      <div ref={ref} style={{ position: 'fixed', top: 16, right: 20, zIndex: 1100 }}>
        <button onClick={() => setOpen(!open)}
          style={{ position: 'relative', width: 40, height: 40, borderRadius: 11, border: `1px solid ${border}`, background: open ? (isDark ? 'rgba(16,185,129,0.15)' : '#f0fdf4') : (isDark ? 'rgba(255,255,255,0.04)' : '#fff'), cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: sub, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unread > 0 && (
            <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 17, height: 17, background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 800, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: `2px solid ${isDark ? '#060D1F' : '#fff'}` }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* Dropdown panel */}
        {open && (
          <div style={{ position: 'absolute', top: 48, right: 0, width: 420, maxWidth: 'calc(100vw - 30px)', background: bg, border: `1px solid ${border}`, borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.22)', zIndex: 1200, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '13px 18px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.05)' }}>
              <span style={{ color: txt, fontWeight: 700, fontFamily: 'Sora,sans-serif', fontSize: 15 }}>🔔 Price Requests</span>
              {unread > 0 && <span style={{ background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{unread} new</span>}
            </div>

            {/* List */}
            <div style={{ maxHeight: 480, overflowY: 'auto' }}>
              {!notifs.length ? (
                <div style={{ textAlign: 'center', padding: 40, color: muted }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔕</div>
                  <p style={{ fontSize: 13 }}>No price requests yet</p>
                </div>
              ) : notifs.map(n => (
                <div key={n.id} style={{ padding: '14px 18px', borderBottom: `1px solid ${border}`, background: n.isRead ? 'transparent' : (isDark ? 'rgba(27,110,243,0.04)' : 'rgba(27,110,243,0.02)') }}>

                  {/* Notif header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 9 }}>
                    <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 18 }}>💊</span>
                      <div>
                        <p style={{ color: txt, fontWeight: 600, margin: 0, fontSize: 14 }}>{n.submissionData?.medicineName}</p>
                        <p style={{ color: muted, fontSize: 11, margin: '2px 0 0' }}>{timeAgo(n.createdAt)} · by {n.submissionData?.userName || 'User'}</p>
                      </div>
                    </div>
                    {!n.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', flexShrink: 0, marginTop: 4 }} />}
                  </div>

                  {/* Price info */}
                  <div style={{ background: rowBg, borderRadius: 10, padding: '9px 13px', marginBottom: 10, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: muted }}>Reported Price</span><span style={{ color: '#10b981', fontWeight: 700 }}>₹{n.submissionData?.price}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}><span style={{ color: muted }}>Pharmacy</span><span style={{ color: sub }}>{n.submissionData?.pharmacyName}</span></div>
                  </div>

                  {/* Bill image */}
                  {n.submissionData?.imageUrl && (
                    <img src={n.submissionData.imageUrl} alt="bill"
                      onClick={() => window.open(n.submissionData.imageUrl, '_blank')}
                      onError={e => e.target.style.display = 'none'}
                      style={{ width: '100%', maxHeight: 100, objectFit: 'contain', borderRadius: 8, marginBottom: 9, cursor: 'pointer', background: rowBg, border: `1px solid ${border}` }} />
                  )}

                  {/* User note */}
                  {n.submissionData?.personalNote && (
                    <div style={{ background: isDark ? 'rgba(245,158,11,0.08)' : '#fffbeb', border: `1px solid ${isDark ? 'rgba(245,158,11,0.2)' : '#fde68a'}`, borderRadius: 9, padding: '7px 11px', marginBottom: 9 }}>
                      <p style={{ color: '#f59e0b', fontSize: 10, fontWeight: 700, margin: '0 0 2px' }}>📝 USER NOTE</p>
                      <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#92400e', fontSize: 12, margin: 0, fontStyle: 'italic' }}>"{n.submissionData.personalNote}"</p>
                    </div>
                  )}

                  {/* Already responded */}
                  {n.pharmacistResponse ? (
                    <div style={{ padding: '8px 12px', borderRadius: 9, fontSize: 12, fontWeight: 700, background: n.pharmacistResponse === 'approved' ? (isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5') : (isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2'), color: n.pharmacistResponse === 'approved' ? '#10b981' : '#ef4444' }}>
                      {n.pharmacistResponse === 'approved' ? '✅ You approved — price updated' : n.pharmacistResponse === 'already_processed' ? 'ℹ️ Already processed' : '❌ You rejected'}
                    </div>
                  ) : (
                    <div>
                      {/* POINT 3 — Medicine dropdown to select which stock item to update */}
                      <div style={{ marginBottom: 9 }}>
                        <p style={{ color: muted, fontSize: 11, fontWeight: 700, margin: '0 0 5px', letterSpacing: '0.04em' }}>
                          📦 SELECT MEDICINE TO UPDATE PRICE
                        </p>
                        {(stockMatches[n.id] || []).length > 0 ? (
                          <select
                            value={selectedStock[n.id] || ''}
                            onChange={e => setSelectedStock(prev => ({ ...prev, [n.id]: e.target.value }))}
                            style={{ ...inp, borderColor: selectedStock[n.id] ? 'rgba(16,185,129,0.4)' : inp.border, background: selectedStock[n.id] ? (isDark ? 'rgba(16,185,129,0.07)' : '#f0fdf4') : inp.background, color: selectedStock[n.id] ? '#10b981' : txt }}>
                            <option value="">— Select matching medicine —</option>
                            {(stockMatches[n.id] || []).map(s => (
                              <option key={s._id || s.id} value={s._id || s.id}>
                                {s.medicineName} · Current ₹{s.sellingPrice} · {s.units} units
                              </option>
                            ))}
                            <option value="new">+ Create as new stock entry</option>
                          </select>
                        ) : (
                          <div style={{ fontSize: 12, color: muted, background: rowBg, borderRadius: 8, padding: '7px 11px' }}>
                            No matching medicines in your stock. Approving will update the public price database.
                          </div>
                        )}
                        {selectedStock[n.id] && selectedStock[n.id] !== 'new' && (
                          <p style={{ color: '#10b981', fontSize: 11, margin: '4px 0 0', fontWeight: 600 }}>
                            ✅ Will update selling price to ₹{n.submissionData?.price}
                          </p>
                        )}
                      </div>

                      {/* Optional note */}
                      <textarea value={notes[n.id] || ''} onChange={e => setNotes(p => ({ ...p, [n.id]: e.target.value }))}
                        placeholder="Optional note..." rows={2} style={{ ...inp, resize: 'none', marginBottom: 8 }} />

                      {/* Approve / Reject */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <button onClick={() => respond(n.id, 'approved')} disabled={responding === n.id}
                          style={{ padding: '9px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 12, opacity: responding === n.id ? 0.6 : 1 }}>
                          {responding === n.id ? '...' : '✅ Approve'}
                        </button>
                        <button onClick={() => respond(n.id, 'rejected')} disabled={responding === n.id}
                          style={{ padding: '9px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 12, opacity: responding === n.id ? 0.6 : 1 }}>
                          {responding === n.id ? '...' : '❌ Reject'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ padding: '8px 16px', borderTop: `1px solid ${border}`, textAlign: 'center' }}>
              <button onClick={loadNotifs} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>🔄 Refresh</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
