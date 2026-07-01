// frontend/src/components/PharmacyCard.jsx — Premium Redesign
// Reusable card for search results

export default function PharmacyCard({ result, isSelected, onClick, rank }) {
  const { pharmacy, medicine, price, inStock, distance, isCheapest, lastUpdated, fromPharmacist } = result;

  const timeSince = (d) => {
    if (!d) return '';
    const h = Math.floor((Date.now() - new Date(d)) / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer transition-all duration-250 ${
        isSelected
          ? 'ring-2 ring-blue-500 shadow-lg scale-[1.01]'
          : 'hover:-translate-y-0.5 hover:shadow-md'
      }`}
      style={{
        background: isSelected ? 'linear-gradient(135deg, rgba(27,110,243,0.04), rgba(0,194,168,0.03))' : 'var(--bg-card)',
        border: isSelected ? '1.5px solid rgba(27,110,243,0.4)' : '1px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        boxShadow: isSelected ? 'var(--shadow-blue)' : 'var(--shadow-sm)',
      }}>

      {/* Cheapest ribbon */}
      {isCheapest && (
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'var(--grad-cheapest)' }}/>
      )}

      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Rank badge */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              rank === 1 ? 'bg-amber-100 text-amber-700' : rank === 2 ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-600'
            }`} style={{ fontFamily: 'Sora, sans-serif' }}>
              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : `#${rank}`}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm leading-tight truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
                {pharmacy?.name}
              </h3>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                📍 {pharmacy?.address}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <div className={`text-xl font-bold ${isCheapest ? 'text-emerald-500' : ''}`}
              style={{ fontFamily: 'Sora, sans-serif', color: isCheapest ? '#12B76A' : 'var(--text-primary)' }}>
              ₹{price}
            </div>
            {isCheapest && (
              <div className="text-xs font-semibold text-emerald-500 flex items-center justify-end gap-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
                Lowest
              </div>
            )}
          </div>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {isCheapest && <span className="badge badge-cheapest">🏆 Cheapest</span>}
          {inStock
            ? <span className="badge badge-instock">● In Stock</span>
            : <span className="badge badge-outstock">● Out of Stock</span>}
          {fromPharmacist && <span className="badge badge-verified">✅ Verified</span>}
          {pharmacy?.isPremium && <span className="badge scale-105 shadow-sm" style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', color: '#92400E', border: '1px solid #FCD34D', fontWeight: 'bold' }}>✨ Premium Partner</span>}
          {pharmacy?.chain && <span className="badge" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{pharmacy.chain}</span>}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Distance */}
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span className="font-medium">{distance} km</span>
            </div>

            {/* Rating */}
            {pharmacy?.rating && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-amber-400">★</span>
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{pharmacy.rating}</span>
                {pharmacy.reviewCount > 0 && <span style={{ color: 'var(--text-muted)' }}>({pharmacy.reviewCount})</span>}
              </div>
            )}

            {/* Updated */}
            {lastUpdated && (
              <div className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                {timeSince(lastUpdated)}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a href={`https://maps.google.com/?q=${encodeURIComponent(pharmacy?.address || '')}`}
              target="_blank" rel="noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105"
              style={{ background: 'var(--bg-subtle)', color: 'var(--brand-blue)', border: '1px solid var(--border)' }}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
              Directions
            </a>
            {inStock && (
              <button className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'var(--grad-primary)' }}>
                Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Loading Card ──────────────────────────────────────
export function PharmacyCardSkeleton() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="skeleton w-8 h-8 rounded-xl flex-shrink-0"/>
        <div className="flex-1">
          <div className="skeleton h-4 w-3/4 mb-2 rounded"/>
          <div className="skeleton h-3 w-1/2 rounded"/>
        </div>
        <div className="skeleton h-7 w-14 rounded"/>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="skeleton h-5 w-20 rounded-full"/>
        <div className="skeleton h-5 w-16 rounded-full"/>
      </div>
      <div className="flex justify-between">
        <div className="flex gap-3">
          <div className="skeleton h-3 w-12 rounded"/>
          <div className="skeleton h-3 w-10 rounded"/>
        </div>
        <div className="skeleton h-7 w-24 rounded-xl"/>
      </div>
    </div>
  );
}
