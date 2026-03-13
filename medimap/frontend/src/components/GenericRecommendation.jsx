import { useState, useEffect } from 'react';
import { getGenericRecommendation } from '../services/api';

export default function GenericRecommendation({ medicineName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!medicineName) return;
    setLoading(true);
    getGenericRecommendation(medicineName)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [medicineName]);

  if (loading) {
    return (
      <div className="card p-4 border-l-4 border-[#2E7DFF]">
        <div className="flex items-center gap-2 mb-2">
          <div className="skeleton w-5 h-5 rounded" />
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="skeleton h-3 w-full mb-1" />
        <div className="skeleton h-3 w-3/4" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="card p-4 border-l-4 border-[#2E7DFF] bg-gradient-to-r from-blue-50/50 to-white">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-[#2E7DFF] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm">💊 Generic Alternatives</span>
          {data.savings && (
            <span className="badge-green ml-auto">{data.savings}</span>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Generic: <span className="font-medium text-gray-700">{data.generic}</span>
      </p>

      <div className="space-y-1.5 mb-3">
        {data.alternatives?.map((alt, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-5 h-5 rounded-full bg-[#2E7DFF] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
              {i + 1}
            </span>
            <span className="text-gray-700">{alt}</span>
          </div>
        ))}
      </div>

      {data.note && (
        <button
          className="text-xs text-[#2E7DFF] flex items-center gap-1"
          onClick={() => setExpanded(!expanded)}
        >
          <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {expanded ? 'Hide note' : 'Important note'}
        </button>
      )}
      {expanded && data.note && (
        <p className="text-xs text-gray-500 mt-2 italic">{data.note}</p>
      )}
    </div>
  );
}
