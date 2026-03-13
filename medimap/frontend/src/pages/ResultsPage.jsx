import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import PharmacyCard from '../components/PharmacyCard';
import GenericRecommendation from '../components/GenericRecommendation';
import LoadingCards from '../components/ui/LoadingCards';
import { searchMedicine } from '../services/api';

const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rated' },
];

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('distance');
  const [filterInStock, setFilterInStock] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError(null);
    searchMedicine(query)
      .then(setData)
      .catch(err => setError(err.response?.data?.error || 'Could not find medicine. Try another name.'))
      .finally(() => setLoading(false));
  }, [query]);

  const sorted = (() => {
    if (!data?.results) return [];
    let results = [...data.results];
    if (filterInStock) results = results.filter(r => r.inStock);
    switch (sort) {
      case 'price_asc': return results.sort((a, b) => a.price - b.price);
      case 'price_desc': return results.sort((a, b) => b.price - a.price);
      case 'rating': return results.sort((a, b) => (b.pharmacy.rating || 0) - (a.pharmacy.rating || 0));
      default: return results.sort((a, b) => a.distance - b.distance);
    }
  })();

  const cheapest = data?.results?.filter(r => r.inStock).sort((a, b) => a.price - b.price)[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar initialValue={query} />
      </div>

      {/* Medicine info header */}
      {data?.medicine && !loading && (
        <div className="card p-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{data.medicine.name}</h1>
              {data.medicine.requiresPrescription && (
                <span className="badge-blue">Rx Required</span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {data.medicine.category} · Generic: {data.medicine.genericName}
              {data.medicine.manufacturer && ` · ${data.medicine.manufacturer}`}
            </p>
          </div>
          {cheapest && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-center">
              <div className="text-xs text-emerald-600 font-medium mb-0.5">Best Price Available</div>
              <div className="text-2xl font-bold text-emerald-700">₹{cheapest.price}</div>
              <div className="text-xs text-emerald-600">{cheapest.pharmacy.name}</div>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Main results column */}
        <div>
          {/* Filters */}
          {!loading && data?.results && (
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <span className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{sorted.length}</span> pharmacies found
              </span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterInStock}
                    onChange={e => setFilterInStock(e.target.checked)}
                    className="rounded"
                  />
                  In stock only
                </label>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2E7DFF]/30"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <Link
                  to={`/map?q=${encodeURIComponent(query)}`}
                  className="btn-secondary text-sm !py-1.5 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Map
                </Link>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && <LoadingCards count={4} />}

          {/* Error state */}
          {error && !loading && (
            <div className="card p-8 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-semibold text-gray-900 mb-1">{error}</h3>
              <p className="text-sm text-gray-500 mb-4">Try searching for: Paracetamol, Metformin, or Cetirizine</p>
              <Link to="/" className="btn-primary text-sm">Back to Search</Link>
            </div>
          )}

          {/* Results */}
          {!loading && sorted.length > 0 && (
            <div className="space-y-4">
              {sorted.map((result, i) => (
                <PharmacyCard
                  key={result._id || i}
                  result={result}
                  animationDelay={i * 60}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* AI Generic Recommendation */}
          {query && <GenericRecommendation medicineName={query} />}

          {/* Price summary card */}
          {data?.results && !loading && (
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Price Summary</h3>
              <div className="space-y-2">
                {[
                  { label: 'Lowest Price', value: `₹${Math.min(...data.results.map(r => r.price))}`, color: 'text-emerald-600' },
                  { label: 'Average Price', value: `₹${Math.round(data.results.reduce((s, r) => s + r.price, 0) / data.results.length)}`, color: 'text-gray-900' },
                  { label: 'Highest Price', value: `₹${Math.max(...data.results.map(r => r.price))}`, color: 'text-red-500' },
                  { label: 'Potential Savings', value: `₹${Math.max(...data.results.map(r => r.price)) - Math.min(...data.results.map(r => r.price))}`, color: 'text-[#2E7DFF]' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className={`font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit price CTA */}
          <div className="card p-4 bg-gradient-to-br from-blue-50 to-teal-50 border-[#00C2A8]/20">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Know a better price?</h3>
            <p className="text-xs text-gray-500 mb-3">Help the community by updating prices at your local pharmacy.</p>
            <Link to="/submit-price" className="btn-primary text-xs !py-2 w-full text-center block">
              Submit Price Update
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
