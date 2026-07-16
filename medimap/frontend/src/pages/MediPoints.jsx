// frontend/src/pages/MediPoints.jsx
// User MediPoints wallet — earn, redeem coupons
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TIERS = [
  { tier: 1, points: 500,  discount: 20, code: 'MEDI20', icon: '🥉', color: 'from-amber-400 to-orange-500',  desc: '20% OFF on medicines' },
  { tier: 2, points: 1000, discount: 30, code: 'MEDI30', icon: '🥈', color: 'from-gray-400 to-gray-600',     desc: '30% OFF on medicines' },
  { tier: 3, points: 2000, discount: 50, code: 'MEDI50', icon: '🥇', color: 'from-yellow-400 to-amber-500',  desc: '50% OFF — Premium Reward' },
];

function ProgressBar({ current, target }) {
  const pct = Math.min(100, (current / target) * 100);
  return (
    <div style={{ background: '#e5e7eb', borderRadius: 999, height: 8, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#2E7DFF,#00C2A8)', height: '100%', borderRadius: 999, transition: 'width 0.5s' }} />
    </div>
  );
}

export default function MediPoints() {
  const user = JSON.parse(localStorage.getItem('medimap_user') || 'null');
  const userId = user?.email || 'anonymous';
  const [data, setData] = useState({ points: 0, transactions: [], coupons: [] });
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchPoints() {
    try {
      const res = await fetch(`https://medimap-backend-ygqj.onrender.com/api/points/${encodeURIComponent(userId)}`);
      const d = await res.json();
      setData(d);
    } catch { /* use mock */ }
    setLoading(false);
  }

  useEffect(() => { fetchPoints(); }, []);

  async function redeem(tier) {
    setRedeeming(tier);
    try {
      const res = await fetch('https://medimap-backend-ygqj.onrender.com/api/points/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tier }),
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      setData(prev => ({ ...prev, points: d.remainingPoints, coupons: [...prev.coupons, d.coupon] }));
      showToast(`🎉 Coupon ${d.coupon.code} generated!`);
    } catch (err) { showToast(err.message, 'error'); }
    setRedeeming(null);
  }

  if (!user) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">🏆</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">MediPoints</h2>
      <p className="text-gray-500 mb-6">Login to earn and redeem MediPoints!</p>
      <Link to="/login" className="btn-primary">Login to Continue</Link>
    </div>
  );

  const nextTier = TIERS.find(t => data.points < t.points);
  const pointsToNext = nextTier ? nextTier.points - data.points : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {toast && (
        <div style={{ position:'fixed', top:80, right:24, zIndex:9999, padding:'12px 20px', borderRadius:12, fontWeight:600, fontSize:14, background: toast.type==='error'?'#fef2f2':'#f0fdf4', color: toast.type==='error'?'#dc2626':'#16a34a', border:`1px solid ${toast.type==='error'?'#fecaca':'#bbf7d0'}`, boxShadow:'0 4px 16px rgba(0,0,0,0.1)' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2E7DFF] to-[#00C2A8] flex items-center justify-center mx-auto mb-4 text-4xl shadow-lg shadow-blue-500/20">🏆</div>
        <h1 className="text-3xl font-bold text-gray-900">MediPoints</h1>
        <p className="text-gray-500 text-sm mt-1">Earn points, save money on medicines</p>
      </div>

      {/* Points Card */}
      <div className="rounded-2xl p-6 mb-6 text-white text-center" style={{ background: 'linear-gradient(135deg,#2E7DFF,#00C2A8)' }}>
        <p className="text-white/70 text-sm mb-1">Your Balance</p>
        <p className="text-5xl font-bold mb-1">{loading ? '...' : data.points}</p>
        <p className="text-white/80 text-sm">MediPoints</p>
        {nextTier && (
          <div className="mt-4">
            <div style={{ background:'rgba(255,255,255,0.2)', borderRadius:999, height:8, overflow:'hidden' }}>
              <div style={{ width:`${Math.min(100,(data.points/nextTier.points)*100)}%`, background:'white', height:'100%', borderRadius:999, transition:'width 0.5s' }} />
            </div>
            <p className="text-white/70 text-xs mt-2">{pointsToNext} more points for next reward</p>
          </div>
        )}
      </div>

      {/* How to earn */}
      <div className="card p-5 mb-6">
        <h2 className="font-bold text-gray-900 mb-3">💡 How to Earn Points</h2>
        <div className="space-y-3">
          {[
            { icon: '📸', text: 'Submit medicine price update', points: '+20 pts', desc: 'When your submission is approved by admin' },
            { icon: '⭐', text: 'Rate a pharmacy', points: '+5 pts', desc: 'After leaving a review' },
            { icon: '👤', text: 'Complete your profile', points: '+10 pts', desc: 'One-time bonus' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1"><p className="text-sm font-semibold text-gray-900">{item.text}</p><p className="text-xs text-gray-400">{item.desc}</p></div>
              <span className="text-sm font-bold text-emerald-600 whitespace-nowrap">{item.points}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <Link to="/submit-price" className="btn-primary text-sm !py-2">📸 Submit Price & Earn Points</Link>
        </div>
      </div>

      {/* Redeem Rewards */}
      <div className="card p-5 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">🎁 Redeem Rewards</h2>
        <div className="space-y-3">
          {TIERS.map(tier => {
            const canRedeem = data.points >= tier.points;
            return (
              <div key={tier.tier} className={`rounded-2xl p-4 border-2 transition-all ${canRedeem ? 'border-[#2E7DFF] bg-blue-50' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-2xl flex-shrink-0`}>{tier.icon}</div>
                    <div>
                      <p className="font-bold text-gray-900">{tier.discount}% OFF Coupon</p>
                      <p className="text-xs text-gray-500">{tier.desc}</p>
                      <p className="text-xs font-semibold text-[#2E7DFF] mt-0.5">{tier.points} points required</p>
                    </div>
                  </div>
                  <button
                    onClick={() => canRedeem && redeem(tier.tier)}
                    disabled={!canRedeem || redeeming === tier.tier}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex-shrink-0 ${canRedeem ? 'bg-[#2E7DFF] text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    {redeeming === tier.tier ? '...' : canRedeem ? 'Redeem' : `Need ${tier.points - data.points} more`}
                  </button>
                </div>
                {canRedeem && <ProgressBar current={data.points} target={tier.points} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* My Coupons */}
      {data.coupons?.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="font-bold text-gray-900 mb-3">🎟️ My Coupons</h2>
          <div className="space-y-2">
            {data.coupons.map(c => (
              <div key={c.id} className={`rounded-xl p-4 border-2 ${c.isUsed ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-dashed border-[#2E7DFF] bg-blue-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{c.discount}% OFF</p>
                    <p className="text-xs text-gray-400">Expires: {new Date(c.expiresAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <code className="bg-white border border-[#2E7DFF] text-[#2E7DFF] px-3 py-1.5 rounded-lg font-bold text-sm tracking-wider">{c.code}</code>
                    {c.isUsed && <p className="text-xs text-gray-400 mt-1">Used</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction History */}
      {data.transactions?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-3">📋 History</h2>
          <div className="space-y-2">
            {data.transactions.slice(0, 10).map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm text-gray-700">{tx.reason}</p>
                  <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <span className={`font-bold text-sm ${tx.points > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.points > 0 ? '+' : ''}{tx.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
