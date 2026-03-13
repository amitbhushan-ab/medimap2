// src/components/PharmacyCard.jsx
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

export default function PharmacyCard({ result }) {
  const { t } = useLang();
  const { pharmacy, price, inStock, isCheapest, distance, lastUpdated } = result;

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return t('updatedJustNow');
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 3600000);
    if (diff < 1) return t('updatedJustNow');
    return `${diff}${t('updatedHoursAgo')}`;
  };

  return (
    <div className={`card p-4 sm:p-5 transition-all hover:shadow-md ${isCheapest ? 'border-[#00C2A8] border-2' : ''}`}>
      {isCheapest && (
        <div className="flex items-center gap-1.5 text-[#00C2A8] text-xs font-bold mb-3">
          <span>🏆</span> {t('bestPrice')}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">{pharmacy?.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{pharmacy?.address}</p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            <span className={`flex items-center gap-1 text-xs font-medium ${inStock ? 'text-emerald-600' : 'text-red-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
              {inStock ? t('inStock') : t('outOfStock')}
            </span>
            <span className={`text-xs font-medium ${pharmacy?.isOpen ? 'text-blue-600' : 'text-gray-400'}`}>
              {pharmacy?.isOpen ? t('openNow') : t('closed')}
            </span>
            {distance != null && (
              <span className="text-xs text-gray-400">{distance} {t('awayKm')}</span>
            )}
            <span className="text-xs text-gray-400">{getTimeAgo(lastUpdated)}</span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className={`text-2xl font-bold ${isCheapest ? 'text-[#00C2A8]' : 'text-gray-900'}`}>
            ₹{price}
          </div>
          <div className="text-xs text-gray-400">{t('perStrip')}</div>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
        <Link
          to={`/pharmacy/${pharmacy?._id}?medicine=${encodeURIComponent(result.medicine?.name || '')}&price=${price}`}
          className="flex-1 btn-secondary text-center text-sm !py-2"
        >
          {t('viewDetails')}
        </Link>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(pharmacy?.address || '')}`}
          target="_blank"
          rel="noreferrer"
          className="btn-primary text-sm !py-2 !px-4"
        >
          {t('getDirections')}
        </a>
      </div>
    </div>
  );
}
