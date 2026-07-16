// frontend/src/pages/ResultsPage.jsx — Premium Split-View Results
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import PharmacyCard, { PharmacyCardSkeleton } from '../components/PharmacyCard';

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [newQuery, setNewQuery] = useState(query);
  const [results, setResults] = useState([]);
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [sortBy, setSortBy] = useState('distance'); // distance | price
  const [filterInStock, setFilterInStock] = useState(false);
  const [view, setView] = useState('list'); // list | split
  const [userLat, setUserLat] = useState(28.4089);
  const [userLng, setUserLng] = useState(77.3178);

  // Get user location
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
      () => {}
    );
  }, []);

  // Fetch results
  useEffect(() => {
    if (!query) return;
    setLoading(true); setError('');
    fetch(`https://medimap-backend-ygqj.onrender.com/api/medicines/search?q=${encodeURIComponent(query)}&lat=${userLat}&lng=${userLng}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setResults([]); }
        else {
          setMedicine(data.medicine);
          setResults(data.results || []);
          try {
            const history = JSON.parse(localStorage.getItem('medimap_search_history') || '[]');
            const updated = [{ query, date: new Date().toISOString() }, ...history.filter(h => h.query !== query)].slice(0, 10);
            localStorage.setItem('medimap_search_history', JSON.stringify(updated));
          } catch(e) {
            localStorage.setItem('medimap_search_history', '[]'); // Reset on corruption
          }
        }
      })
      .catch(() => setError('Failed to load results. Please try again.'))
      .finally(() => setLoading(false));
  }, [query, userLat, userLng]);

  // Sorted + filtered
  const processed = [...results]
    .filter(r => !filterInStock || r.inStock)
    .sort((a, b) => sortBy === 'price' ? a.price - b.price : (a.distance || 99) - (b.distance || 99));

  const cheapestPrice = processed.filter(r => r.inStock).reduce((min, r) => Math.min(min, r.price), Infinity);

  function handleSearch() {
    if (!newQuery.trim()) return;
    navigate(`/results?q=${encodeURIComponent(newQuery.trim())}`);
  }

  function saveSavings(result) {
    if (!result.isCheapest) return;
    const savings = JSON.parse(localStorage.getItem('medimap_saved_money') || '{"total":0,"thisMonth":0,"transactions":[]}');
    const saved = Math.max(0, Math.round(cheapestPrice * 0.3));
    if (saved > 0) {
      savings.total += saved; savings.thisMonth += saved;
      savings.transactions.unshift({ medicine: query, saved, date: new Date().toISOString(), cheapest: cheapestPrice, avg: Math.round(cheapestPrice * 1.3) });
      localStorage.setItem('medimap_saved_money', JSON.stringify(savings));
    }
  }

  const selectedResult = processed[selectedIdx];

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* ── Search header ── */}
      <div className="sticky top-16 z-40 border-b" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="btn-icon flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </Link>

            {/* Inline search */}
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: 'var(--bg-subtle)', border: '1.5px solid var(--border)' }}>
              <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                className="flex-1 text-sm bg-transparent outline-none font-medium"
                style={{ color: 'var(--text-primary)' }}
                value={newQuery}
                onChange={e => setNewQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search another medicine..."
              />
              {newQuery && newQuery !== query && (
                <button onClick={handleSearch} className="btn-primary !px-3 !py-1.5 !text-xs flex-shrink-0">Go</button>
              )}
            </div>

            {/* View toggle */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
              {[{ id:'list', icon:'☰' }, { id:'split', icon:'⊞' }].map(v => (
                <button key={v.id} onClick={() => setView(v.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view===v.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                  {v.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* Medicine info banner */}
        {medicine && !loading && (
          <div className="card p-4 mb-5 flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'rgba(27,110,243,0.08)' }}>💊</div>
            <div className="flex-1">
              <h1 className="font-bold text-lg" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>{medicine.name || query}</h1>
              <div className="flex flex-wrap gap-3 text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {medicine.genericName && <span>Generic: <strong style={{ color: 'var(--text-secondary)' }}>{medicine.genericName}</strong></span>}
                {medicine.category && <span className="badge badge-instock">{medicine.category}</span>}
                {medicine.requiresPrescription && <span className="badge badge-outstock">Rx Required</span>}
              </div>
            </div>
            {cheapestPrice < Infinity && (
              <div className="text-right flex-shrink-0">
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Starting from</div>
                <div className="text-2xl font-bold text-emerald-500" style={{ fontFamily: 'Sora, sans-serif' }}>₹{cheapestPrice}</div>
              </div>
            )}
          </div>
        )}

        {/* Filters + sort */}
        {!loading && results.length > 0 && (
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{processed.length}</strong> pharmacies found
              </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`relative w-9 h-5 rounded-full transition-colors ${filterInStock ? 'bg-emerald-500' : 'bg-gray-200'}`}
                  onClick={() => setFilterInStock(!filterInStock)}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${filterInStock ? 'translate-x-4' : ''}`}/>
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>In-stock only</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sort:</span>
              {['distance', 'price'].map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${sortBy===s ? 'text-white' : 'border'}`}
                  style={sortBy===s ? { background: 'var(--grad-primary)' } : { borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
                  {s === 'distance' ? '📍 Distance' : '💰 Price'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[...Array(4)].map((_, i) => <PharmacyCardSkeleton key={i}/>)}
          </div>
        ) : error ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No results found</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{error}</p>
            <Link to="/"><button className="btn-primary">← Search Again</button></Link>
          </div>
        ) : (
          <div className={`${view === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-5' : 'flex flex-col gap-3'}`}>
            {/* List */}
            <div className={`${view === 'split' ? 'flex flex-col gap-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1' : 'grid grid-cols-1 gap-3'}`}>
              {processed.map((result, i) => (
                <PharmacyCard
                  key={result._id || i}
                  result={result}
                  rank={i + 1}
                  isSelected={view === 'split' && selectedIdx === i}
                  onClick={() => { setSelectedIdx(i); saveSavings(result); }}
                />
              ))}
            </div>

            {/* Map panel (split view) */}
            {view === 'split' && (
              <div className="hidden lg:block sticky top-36 h-[calc(100vh-220px)]">
                <div className="card h-full p-5 flex items-center justify-center" style={{ borderRadius: 'var(--r-2xl)' }}>
                  {selectedResult ? (
                    <div className="text-center">
                      <div className="text-4xl mb-4">🗺️</div>
                      <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
                        {selectedResult.pharmacy?.name}
                      </h3>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{selectedResult.pharmacy?.address}</p>
                      <div className="flex items-center justify-center gap-3 mb-4 text-sm">
                        <span className="font-bold text-emerald-500" style={{ fontFamily: 'Sora, sans-serif' }}>₹{selectedResult.price}</span>
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        <span style={{ color: 'var(--text-muted)' }}>{selectedResult.distance} km</span>
                      </div>
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(selectedResult.pharmacy?.address || '')}`}
                        target="_blank" rel="noreferrer">
                        <button className="btn-primary !px-6 !py-2.5 text-sm">🗺️ Open in Maps</button>
                      </a>
                      <div className="mt-4">
                        <Link to="/map">
                          <button className="btn-secondary !px-6 !py-2.5 text-sm w-full">View Full Map →</button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-3">🗺️</div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a pharmacy to see its location</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
