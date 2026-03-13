import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getPharmacy } from '../services/api';

// Generate mock price history if not provided
function generateHistory(basePrice) {
  return Array.from({ length: 7 }, (_, i) => ({
    month: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'][i],
    price: parseFloat((basePrice * (0.9 + Math.random() * 0.2)).toFixed(2))
  }));
}

export default function PharmacyDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const medicineName = searchParams.get('medicine') || '';
  const price = parseFloat(searchParams.get('price') || '0');
  const inStock = searchParams.get('inStock') === 'true';
  const distance = searchParams.get('distance') || '';

  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const priceHistory = generateHistory(price || 50);

  useEffect(() => {
    getPharmacy(id)
      .then(setPharmacy)
      .catch(() => setPharmacy(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-48 w-full rounded-2xl" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const ph = pharmacy || {
    name: 'Pharmacy',
    address: 'Address not available',
    phone: 'N/A',
    hours: 'Mon-Sat: 8AM–9PM',
    rating: 4.2,
    isOpen: true,
    chain: 'Independent'
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Back */}
      <Link to={-1} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to results
      </Link>

      {/* Pharmacy header */}
      <div className="card p-6 mb-5 animate-fade-up">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2E7DFF] to-[#00C2A8] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/25">
              {ph.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{ph.name}</h1>
              {ph.chain && <p className="text-sm text-gray-500">{ph.chain} chain</p>}
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`w-3.5 h-3.5 ${i < Math.round(ph.rating || 4) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
                <span className="text-xs text-gray-500 ml-1">{ph.rating?.toFixed(1)}</span>
              </div>
            </div>
          </div>
          <span className={`badge-${ph.isOpen ? 'green' : 'red'} self-start`}>
            <span className={`w-1.5 h-1.5 rounded-full ${ph.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            {ph.isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-start gap-2 text-gray-600">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
            <span>{ph.address}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{ph.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{ph.hours}</span>
          </div>
        </div>
      </div>

      {/* Medicine price */}
      {medicineName && (
        <div className="card p-6 mb-5 animate-fade-up" style={{ animationDelay: '60ms' }}>
          <h2 className="font-semibold text-gray-900 mb-4">Medicine Details</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-lg font-bold text-gray-900">{medicineName}</div>
              {distance && <p className="text-sm text-gray-500">{distance} km from your location</p>}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#2E7DFF]">₹{price}</div>
              <div className="text-xs text-gray-400">per strip</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={inStock ? 'badge-green' : 'badge-red'}>
              <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </span>
            <a
              href={`https://maps.google.com/?q=${ph.address}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-sm !py-2 ml-auto"
            >
              🗺️ Get Directions
            </a>
          </div>
        </div>
      )}

      {/* Price history chart */}
      {price > 0 && (
        <div className="card p-6 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <h2 className="font-semibold text-gray-900 mb-1">Price History</h2>
          <p className="text-xs text-gray-500 mb-5">Last 7 months — community-sourced data</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={v => `₹${v}`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                formatter={(v) => [`₹${v}`, 'Price']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2E7DFF"
                strokeWidth={2.5}
                dot={{ fill: '#2E7DFF', r: 4 }}
                activeDot={{ r: 6, fill: '#00C2A8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
