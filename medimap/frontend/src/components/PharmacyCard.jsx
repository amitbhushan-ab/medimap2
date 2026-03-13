import { Link } from 'react-router-dom';

export default function PharmacyCard({ result, animationDelay = 0 }) {
  const { pharmacy, price, inStock, distance, isCheapest, lastUpdated } = result;

  const hoursAgo = lastUpdated
    ? Math.round((Date.now() - new Date(lastUpdated)) / 3600000)
    : null;

  return (
    <div
      className={`card p-5 animate-fade-up relative overflow-hidden ${isCheapest ? 'ring-2 ring-[#00C2A8]' : ''}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {isCheapest && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-[#00C2A8] to-teal-400 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
          🏆 BEST PRICE
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg ${
            isCheapest
              ? 'bg-gradient-to-br from-[#00C2A8] to-teal-500 text-white shadow-lg shadow-teal-500/25'
              : 'bg-blue-50 text-[#2E7DFF]'
          }`}>
            {pharmacy.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{pharmacy.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              {distance} km away
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-2xl font-bold ${isCheapest ? 'text-[#00C2A8]' : 'text-gray-900'}`}>
            ₹{price}
          </div>
          <div className="text-xs text-gray-400">per strip</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={inStock ? 'badge-green' : 'badge-red'}>
          <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          {inStock ? 'In Stock' : 'Out of Stock'}
        </span>
        <span className="badge-blue">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {pharmacy.isOpen ? 'Open Now' : 'Closed'}
        </span>
        {hoursAgo !== null && (
          <span className="text-xs text-gray-400 ml-auto">
            Updated {hoursAgo < 1 ? 'just now' : `${hoursAgo}h ago`}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link
          to={`/pharmacy/${pharmacy._id}?medicine=${encodeURIComponent(result.medicine?.name || '')}&price=${price}&inStock=${inStock}&distance=${distance}`}
          className="flex-1 btn-primary text-sm text-center !py-2.5"
        >
          View Details
        </Link>
        <a
          href={`https://maps.google.com/?q=${pharmacy.address}`}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary text-sm !py-2.5 !px-3"
          title="Get Directions"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
