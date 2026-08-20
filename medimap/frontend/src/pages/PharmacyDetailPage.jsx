// src/pages/PharmacyDetailPage.jsx — Premium Details Page with Custom Price Trends Chart
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLang } from '../context/LanguageContext';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function PharmacyDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const medicineName = searchParams.get('medicine') || '';
  const currentPrice = Number(searchParams.get('price')) || 50;
  const { lang, t } = useLang();
  
  // Use Convex to fetch pharmacy safely
  const isValidId = id && id !== 'undefined' && id !== 'null' && !id.includes('_');
  const pharmacy = useQuery(api.pharmacies.getPharmacyById, isValidId ? { id: id } : "skip");
  const loading = isValidId && pharmacy === undefined;

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
    <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse">
      <div className="skeleton h-6 w-32 mb-6 rounded-lg" />
      <div className="skeleton h-44 rounded-3xl mb-5" />
      <div className="skeleton h-24 rounded-2xl mb-5" />
      <div className="skeleton h-72 rounded-3xl" />
    </div>
  );

  if (!isValidId || (!loading && !pharmacy)) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-6 text-gray-400">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 font-sora">{lang === 'hi' ? 'फार्मेसी नहीं मिली' : 'Pharmacy Not Found'}</h2>
      <p className="text-gray-500 mb-6">{lang === 'hi' ? 'अमान्य फार्मेसी आईडी या डेटा मौजूद नहीं है।' : 'Invalid pharmacy ID or record does not exist.'}</p>
      <Link to="/" className="btn-primary px-8 py-3.5 inline-block">{t('backToHome')}</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      
      {/* Back button */}
      <Link to={`/results?q=${encodeURIComponent(medicineName)}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mb-6 group">
        <span className="transform transition-transform group-hover:-translate-x-1">←</span> {t('backToResults')}
      </Link>

      {/* Premium Pharmacy Info Card */}
      <div className="card p-6 mb-5 relative overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/20 border border-gray-100 shadow-md">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-teal-500/5 rounded-bl-full pointer-events-none"/>
        
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 text-white flex items-center justify-center shadow-[0_6px_20px_rgba(27,110,243,0.25)] flex-shrink-0">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 font-sora leading-tight">{pharmacy.pharmacyName || pharmacy.name}</h1>
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {pharmacy.address}
              </p>
              {pharmacy.contact && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <a href={`tel:${pharmacy.contact}`} className="hover:underline text-blue-600 font-semibold">{pharmacy.contact}</a>
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2.5 flex items-center gap-1.5 font-medium">
                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {pharmacy.hours || (lang === 'hi' ? 'खुला है' : 'Open Mon-Sun')}
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${pharmacy.isOpen !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {pharmacy.isOpen !== false ? (lang === 'hi' ? '● खुला है' : '● Open Now') : (lang === 'hi' ? '● बंद है' : '● Closed')}
            </span>
            {pharmacy.rating && (
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className="text-xs font-extrabold text-amber-900">{pharmacy.rating}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 flex gap-3">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(pharmacy.address)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary !px-6 !py-3 text-sm flex-1 text-center shadow-lg"
          >
            {t('getDirections')}
          </a>
        </div>
      </div>

      {/* Premium Medicine Price Display */}
      {medicineName && currentPrice && (
        <div className="card p-5 mb-5 bg-gradient-to-r from-blue-600 to-teal-500 border-none text-white shadow-xl shadow-blue-500/10">
          <p className="text-xs text-white/80 font-bold tracking-wider uppercase">{t('pharmacyDetails')}</p>
          <div className="flex items-center justify-between mt-2 flex-wrap gap-3">
            <span className="font-extrabold text-lg font-sora">{medicineName}</span>
            <div className="text-right">
              <span className="text-3xl font-black font-sora">₹{currentPrice}</span>
              <span className="text-xs block text-white/80 mt-0.5">{lang === 'hi' ? 'प्रति पत्ता' : 'per strip'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Price History & Trends Chart Card */}
      <div className="card p-6 shadow-md border border-gray-100">
        <h2 className="font-extrabold text-gray-900 font-sora text-base">{t('priceHistory')}</h2>
        <p className="text-xs text-gray-400 mt-0.5 mb-6">{t('priceHistorySubtitle')}</p>
        
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={priceHistory}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B6EF3" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#1B6EF3" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f3f8" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8492A6', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#8492A6', fontWeight: 600 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ background: '#0a0f1e', border: 'none', borderRadius: 12, color: 'white', padding: '10px 14px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
              itemStyle={{ color: '#00C2A8', fontWeight: 700, fontSize: 12 }}
              labelStyle={{ color: '#8492A6', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}
              formatter={(v) => [`₹${v}`, medicineName]} 
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#1B6EF3" 
              strokeWidth={3} 
              dot={{ r: 5, fill: '#1B6EF3', stroke: '#fff', strokeWidth: 2 }} 
              activeDot={{ r: 7, fill: '#00C2A8', stroke: '#fff', strokeWidth: 2 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
