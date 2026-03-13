import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const QUICK_SEARCHES = [
  'Paracetamol', 'Metformin', 'Amoxicillin', 'Cetirizine', 'Aspirin', 'Azithromycin'
];

const STATS = [
  { value: '500+', label: 'Pharmacies' },
  { value: '2,000+', label: 'Medicines' },
  { value: '₹340', label: 'Avg Savings' },
  { value: '4.8★', label: 'User Rating' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2E7DFF] via-blue-600 to-[#00C2A8] text-white">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Floating blobs */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 left-10 w-48 h-48 bg-[#00C2A8]/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-[#00C2A8] animate-pulse"></span>
            Real-time pharmacy prices near you
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold mb-5 leading-tight">
            Find the Most Affordable<br/>
            <span className="text-[#7FFFD4]">Medicine</span> Nearby
          </h1>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Compare prices across pharmacies, find the cheapest option, and save on every prescription.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar large />
          </div>

          {/* Upload prescription placeholder */}
          <button
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors border border-white/20 rounded-xl px-4 py-2.5 hover:bg-white/10"
            onClick={() => alert('Prescription upload coming soon!')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Prescription
          </button>

          {/* Quick searches */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-white/60 text-sm">Popular:</span>
            {QUICK_SEARCHES.map(s => (
              <button
                key={s}
                onClick={() => navigate(`/results?q=${s}`)}
                className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-all border border-white/10"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-[#2E7DFF]">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">How MediMap Works</h2>
        <p className="text-center text-gray-500 mb-10">Three steps to find the best medicine prices</p>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: '01', icon: '🔍', title: 'Search Medicine', desc: 'Type the medicine name or scan the barcode on your packaging.' },
            { step: '02', icon: '📍', title: 'Compare Nearby', desc: 'See real-time prices at pharmacies closest to your location.' },
            { step: '03', icon: '💰', title: 'Save Money', desc: 'Pick the cheapest option or get a generic recommendation.' },
          ].map(item => (
            <div key={item.step} className="card p-6 text-center hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="text-xs font-bold text-[#2E7DFF] mb-1">Step {item.step}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#2E7DFF] to-[#00C2A8] mx-4 sm:mx-6 max-w-4xl sm:mx-auto rounded-2xl p-8 text-white text-center mb-16" style={{maxWidth: '896px', margin: '0 auto 64px'}}>
        <h3 className="text-xl font-bold mb-2">Know a medicine price? Share it!</h3>
        <p className="text-white/80 text-sm mb-4">Help the community by submitting price updates from your local pharmacy.</p>
        <button
          onClick={() => navigate('/submit-price')}
          className="bg-white text-[#2E7DFF] font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
        >
          Submit a Price
        </button>
      </div>
    </div>
  );
}
