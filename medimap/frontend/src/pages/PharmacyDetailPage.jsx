// src/pages/PharmacyDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLang } from '../context/LanguageContext';

const MOCK_PHARMACIES = [
  { name: "Apollo Pharmacy - Sector 16", address: "Sector 16 Market, Faridabad, Haryana 121002", phone: "+91-129-4567-890", hours: "Mon-Sun: 7AM–10PM", rating: 4.5, isOpen: true },
  { name: "MedPlus Pharmacy - NIT Faridabad", address: "NIT Market, Faridabad, Haryana 121001", phone: "+91-129-4123-456", hours: "Mon-Sat: 8AM–9PM", rating: 4.3, isOpen: true },
  { name: "Jan Aushadhi Store - Sector 21", address: "Sector 21C, Faridabad, Haryana 121001", phone: "+91-129-4098-765", hours: "Mon-Sat: 9AM–8PM", rating: 4.2, isOpen: true },
  { name: "Wellness Pharmacy - Old Faridabad", address: "Old Faridabad Market, Haryana 121002", phone: "+91-129-4321-987", hours: "Mon-Sun: 8AM–10PM", rating: 4.1, isOpen: false },
  { name: "NetMeds Store - Sector 46", address: "Sector 46, Faridabad, Haryana 121003", phone: "+91-129-4567-111", hours: "Mon-Sun: 8AM–11PM", rating: 4.4, isOpen: true },
  { name: "City Medical Store - Ballabhgarh", address: "Ballabhgarh Market, Faridabad, Haryana 121004", phone: "+91-129-4222-333", hours: "Mon-Sat: 9AM–9PM", rating: 4.0, isOpen: true },
];

export default function PharmacyDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const medicineName = searchParams.get('medicine') || '';
  const currentPrice = Number(searchParams.get('price')) || 50;
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    // Try API first, fall back to mock data
    fetch(`http://localhost:5000/api/pharmacies/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.name) {
          setPharmacy(data);
        } else {
          // Use mock data based on index in ID
          const index = parseInt(id.replace('pharmacy_', '')) || 0;
          setPharmacy(MOCK_PHARMACIES[index % MOCK_PHARMACIES.length]);
        }
      })
      .catch(() => {
        const index = parseInt(id.replace('pharmacy_', '')) || 0;
        setPharmacy(MOCK_PHARMACIES[index % MOCK_PHARMACIES.length]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const priceHistory = [
    { month: 'Aug', price: Math.round(currentPrice * 1.10) },
    { month: 'Sep', price: Math.round(currentPrice * 1.05) },
    { month: 'Oct', price: Math.round(currentPrice * 1.12) },
    { month: 'Nov', price: Math.round(currentPrice * 0.98) },
    { month: 'Dec', price: Math.round(currentPrice * 1.03) },
    { month: 'Jan', price: Math.round(currentPrice * 1.01) },
    { month: 'Feb', price: Math.round(currentPrice) },
  ];

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="skeleton h-8 w-48 mb-4 rounded-xl" />
      <div className="skeleton h-40 rounded-2xl mb-4" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  if (!pharmacy) return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center">
      <p className="text-gray-500">Pharmacy not found.</p>
      <Link to="/" className="btn-primary mt-4 inline-block">{t('backToHome')}</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link to={`/results?q=${encodeURIComponent(medicineName)}`} className="text-sm text-[#2E7DFF] hover:underline flex items-center gap-1 mb-6">
        ← {t('backToResults')}
      </Link>

      {/* Pharmacy info */}
      <div className="card p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{pharmacy.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{pharmacy.address}</p>
            <p className="text-sm text-gray-400 mt-0.5">{pharmacy.phone}</p>
            <p className="text-xs text-gray-400 mt-1">{pharmacy.hours}</p>
          </div>
          <div className="text-right">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${pharmacy.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              {pharmacy.isOpen ? t('openNow') : t('closed')}
            </span>
            {pharmacy.rating && (
              <p className="text-sm font-semibold text-gray-700 mt-2">⭐ {pharmacy.rating}</p>
            )}
          </div>
        </div>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(pharmacy.address)}`}
          target="_blank"
          rel="noreferrer"
          className="btn-primary text-sm mt-4 inline-block"
        >
          {t('getDirections')}
        </a>
      </div>

      {/* Medicine price */}
      {medicineName && currentPrice && (
        <div className="card p-5 mb-4 bg-blue-50 border border-blue-100">
          <p className="text-sm text-gray-500 mb-1">{t('pharmacyDetails')}</p>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">{medicineName}</span>
            <span className="text-2xl font-bold text-[#2E7DFF]">₹{currentPrice}</span>
          </div>
        </div>
      )}

      {/* Price history chart */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-0.5">{t('priceHistory')}</h2>
        <p className="text-xs text-gray-400 mb-4">{t('priceHistorySubtitle')}</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={priceHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
            <Tooltip formatter={(v) => [`₹${v}`, medicineName]} />
            <Line type="monotone" dataKey="price" stroke="#2E7DFF" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
