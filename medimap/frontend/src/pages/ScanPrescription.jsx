// src/pages/ScanPrescription.jsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PrescriptionScanner from '../components/PrescriptionScanner';
import { useLang } from '../context/LanguageContext';

export default function ScanPrescription() {
  const navigate = useNavigate();
  const { t } = useLang();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E7DFF] to-[#00C2A8] mb-4 shadow-lg shadow-blue-500/30">
          <span className="text-2xl">📋</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('scanTitle')}</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">{t('scanSubtitle')}</p>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: '💡', label: t('tip1') },
          { icon: '📄', label: t('tip2') },
          { icon: '🔍', label: t('tip3') },
        ].map((tip, i) => (
          <div key={i} className="card p-3 text-center">
            <div className="text-xl mb-1">{tip.icon}</div>
            <p className="text-xs text-gray-600 font-medium">{tip.label}</p>
          </div>
        ))}
      </div>

      {/* Privacy */}
      <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 text-xs text-green-700 mb-6 text-center">
        {t('privacy')}
      </div>

      {/* Scanner component */}
      <PrescriptionScanner />
    </div>
  );
}
