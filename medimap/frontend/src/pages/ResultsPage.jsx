// src/pages/ResultsPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchMedicine } from '../services/api';
import PharmacyCard from '../components/PharmacyCard';
import GenericRecommendation from '../components/GenericRecommendation';
import LoadingCards from '../components/ui/LoadingCards';
import { useLang } from '../context/LanguageContext';

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError('');
    searchMedicine(query)
      .then(data => setResults(data.results || []))
      .catch(() => setError('Failed to fetch results. Please try again.'))
      .finally(() => setLoading(false));
  }, [query]);

  const filtered = inStockOnly ? results.filter(r => r.inStock) : results;
  const minPrice = filtered.length ? Math.min(...filtered.filter(r => r.inStock).map(r => r.price)) : 0;
  const maxPrice = filtered.length ? Math.max(...filtered.map(r => r.price)) : 0;
  const avgPrice = filtered.length ? Math.round(filtered.reduce((s, r) => s + r.price, 0) / filtered.length) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            "{query}"
          </h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} {t('pharmaciesFound')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={e => setInStockOnly(e.target.checked)}
              className="w-4 h-4 accent-[#2E7DFF]"
            />
            <span className="text-gray-600">{t('inStockOnly')}</span>
          </label>
          <Link to={`/map?q=${encodeURIComponent(query)}`} className="btn-secondary text-sm !py-2">
            🗺️ {t('mapView')}
          </Link>
        </div>
      </div>

      {/* Price Summary */}
      {!loading && filtered.length > 0 && (
        <div className="card p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">{t('lowestPrice')}</p>
            <p className="text-lg font-bold text-[#00C2A8]">₹{minPrice}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t('averagePrice')}</p>
            <p className="text-lg font-bold text-gray-900">₹{avgPrice}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t('highestPrice')}</p>
            <p className="text-lg font-bold text-gray-900">₹{maxPrice}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t('potentialSavings')}</p>
            <p className="text-lg font-bold text-orange-500">₹{maxPrice - minPrice}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingCards />}

      {/* Error */}
      {error && (
        <div className="card p-6 text-center text-red-500">{error}</div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          <GenericRecommendation medicineName={query} />
          <div className="space-y-3">
            {filtered.map((result, i) => (
              <PharmacyCard key={result._id || i} result={result} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-600 font-medium">No results found for "{query}"</p>
              <Link to="/" className="btn-primary mt-4 inline-block text-sm">
                ← {t('backToHome')}
              </Link>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-8 card p-5 bg-blue-50 border border-blue-100 text-center">
              <p className="font-semibold text-gray-800 mb-1">{t('knowBetterPrice')}</p>
              <p className="text-sm text-gray-500 mb-3">{t('helpCommunity')}</p>
              <Link to="/submit-price" className="btn-primary text-sm inline-block">
                {t('submitPriceUpdate')}
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
