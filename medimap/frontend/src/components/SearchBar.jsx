import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SUGGESTIONS = [
  'Paracetamol 500mg', 'Amoxicillin 250mg', 'Metformin 500mg',
  'Atorvastatin 10mg', 'Pantoprazole 40mg', 'Cetirizine 10mg',
  'Aspirin 75mg', 'Azithromycin 500mg'
];

// Common Indian cities with coordinates
const CITY_COORDS = {
  'delhi': { lat: 28.6139, lng: 77.2090, label: 'Delhi' },
  'new delhi': { lat: 28.6139, lng: 77.2090, label: 'New Delhi' },
  'mumbai': { lat: 19.0760, lng: 72.8777, label: 'Mumbai' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, label: 'Bengaluru' },
  'bangalore': { lat: 12.9716, lng: 77.5946, label: 'Bengaluru' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, label: 'Hyderabad' },
  'chennai': { lat: 13.0827, lng: 80.2707, label: 'Chennai' },
  'kolkata': { lat: 22.5726, lng: 88.3639, label: 'Kolkata' },
  'pune': { lat: 18.5204, lng: 73.8567, label: 'Pune' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, label: 'Ahmedabad' },
  'jaipur': { lat: 26.9124, lng: 75.7873, label: 'Jaipur' },
  'lucknow': { lat: 26.8467, lng: 80.9462, label: 'Lucknow' },
  'surat': { lat: 21.1702, lng: 72.8311, label: 'Surat' },
  'chandigarh': { lat: 30.7333, lng: 76.7794, label: 'Chandigarh' },
  'bhopal': { lat: 23.2599, lng: 77.4126, label: 'Bhopal' },
  'patna': { lat: 25.5941, lng: 85.1376, label: 'Patna' },
  'indore': { lat: 22.7196, lng: 75.8577, label: 'Indore' },
  'nagpur': { lat: 21.1458, lng: 79.0882, label: 'Nagpur' },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185, label: 'Visakhapatnam' },
  'kochi': { lat: 9.9312, lng: 76.2673, label: 'Kochi' },
};

export default function SearchBar({ large = false, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [cityError, setCityError] = useState('');
  const navigate = useNavigate();

  const filtered = SUGGESTIONS.filter(s =>
    query.length > 1 && s.toLowerCase().includes(query.toLowerCase())
  );

  // GPS detection
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setShowLocationInput(true);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocationLabel(`📍 GPS Location Detected`);
        setLocating(false);
        setShowLocationInput(false);
      },
      () => {
        setLocating(false);
        setShowLocationInput(true); // auto show manual fallback
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Manual city/pincode submit
  const handleCitySubmit = () => {
    setCityError('');
    const input = cityInput.trim().toLowerCase();

    if (/^\d{6}$/.test(input)) {
      setCoords({ lat: 20.5937, lng: 78.9629 });
      setLocationLabel(`📍 Pincode: ${cityInput.trim()}`);
      setShowLocationInput(false);
      return;
    }

    const match = CITY_COORDS[input];
    if (match) {
      setCoords({ lat: match.lat, lng: match.lng });
      setLocationLabel(`📍 ${match.label}`);
      setShowLocationInput(false);
      setCityInput('');
      return;
    }

    const partialKey = Object.keys(CITY_COORDS).find(k => k.includes(input) || input.includes(k));
    if (partialKey) {
      const match2 = CITY_COORDS[partialKey];
      setCoords({ lat: match2.lat, lng: match2.lng });
      setLocationLabel(`📍 ${match2.label}`);
      setShowLocationInput(false);
      setCityInput('');
      return;
    }

    setCityError('City not found. Try a major city name or 6-digit pincode.');
  };

  const handleSearch = (q = query) => {
    if (!q.trim()) return;
    if (!coords) {
      setShowLocationInput(true);
      return;
    }
    setShowSuggestions(false);
    navigate(`/results?q=${encodeURIComponent(q.trim())}&lat=${coords.lat}&lng=${coords.lng}`);
  };

  return (
    <div className="relative w-full">

      {/* Location bar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs">
          {locationLabel
            ? <span className="text-emerald-600 font-medium">{locationLabel}</span>
            : <span className="text-gray-400">📍 No location set</span>
          }
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={detectLocation}
            disabled={locating}
            className="text-xs text-[#2E7DFF] font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            {locating ? (
              <>
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Detecting...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use My Location
              </>
            )}
          </button>
          <span className="text-gray-300 text-xs">|</span>
          <button
            onClick={() => setShowLocationInput(!showLocationInput)}
            className="text-xs text-gray-500 hover:text-gray-800 font-medium hover:underline"
          >
            Enter City / Pincode
          </button>
        </div>
      </div>

      {/* Manual location input panel */}
      {showLocationInput && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-3 animate-fade-up">
          <p className="text-sm font-semibold text-gray-700 mb-1">📍 Enter your location</p>
          <p className="text-xs text-gray-500 mb-3">
            Type your city (e.g. <span className="font-medium">Mumbai, Delhi, Pune</span>) or 6-digit pincode
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={cityInput}
              onChange={e => { setCityInput(e.target.value); setCityError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleCitySubmit()}
              placeholder="e.g. Mumbai or 400001"
              className="input-field flex-1 !py-2 text-sm"
              autoFocus
            />
            <button
              onClick={handleCitySubmit}
              className="btn-primary text-sm !py-2 !px-4 whitespace-nowrap"
            >
              Set Location
            </button>
          </div>
          {cityError && (
            <p className="text-xs text-red-500 mt-2">{cityError}</p>
          )}

          {/* Quick city buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {['Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune'].map(city => (
              <button
                key={city}
                onClick={() => {
                  const match = CITY_COORDS[city.toLowerCase()];
                  if (match) {
                    setCoords({ lat: match.lat, lng: match.lng });
                    setLocationLabel(`📍 ${match.label}`);
                    setShowLocationInput(false);
                    setCityInput('');
                  }
                }}
                className="text-xs bg-white border border-blue-200 text-[#2E7DFF] px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search input */}
      <div className={`flex gap-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-2 ${large ? 'shadow-xl shadow-blue-500/10' : ''}`}>
        <div className="flex-1 flex items-center gap-3 px-3">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search medicines, e.g. Paracetamol..."
            className={`w-full focus:outline-none text-gray-900 placeholder-gray-400 bg-transparent ${large ? 'text-lg py-2' : 'py-1'}`}
          />
        </div>

        {/* Barcode button */}
        <button
          className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
          title="Scan Barcode (Coming Soon)"
          onClick={() => alert('Barcode scanning coming soon!')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 4v1M12 19v1M4 12h1M19 12h1M6.34 6.34l.71.71M16.95 16.95l.71.71M6.34 17.66l.71-.71M16.95 7.05l.71-.71" />
            <rect x="7" y="7" width="10" height="10" rx="1" strokeWidth={1.5}/>
          </svg>
        </button>

        <button
          onClick={() => handleSearch()}
          className="btn-primary !rounded-xl text-sm whitespace-nowrap"
        >
          Search
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {filtered.map(s => (
            <button
              key={s}
              className="w-full text-left px-5 py-3 hover:bg-blue-50 text-sm text-gray-700 flex items-center gap-3 transition-colors"
              onMouseDown={() => handleSearch(s)}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
