import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { searchMedicine, getPharmacies } from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const CITY_COORDS = {
  'delhi': { lat: 28.6139, lng: 77.2090, label: 'Delhi' },
  'mumbai': { lat: 19.0760, lng: 72.8777, label: 'Mumbai' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, label: 'Bengaluru' },
  'bangalore': { lat: 12.9716, lng: 77.5946, label: 'Bengaluru' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, label: 'Hyderabad' },
  'chennai': { lat: 13.0827, lng: 80.2707, label: 'Chennai' },
  'kolkata': { lat: 22.5726, lng: 88.3639, label: 'Kolkata' },
  'pune': { lat: 18.5204, lng: 73.8567, label: 'Pune' },
  'faridabad': { lat: 28.4089, lng: 77.3178, label: 'Faridabad' },
  'noida': { lat: 28.5355, lng: 77.3910, label: 'Noida' },
  'gurgaon': { lat: 28.4595, lng: 77.0266, label: 'Gurgaon' },
  'jaipur': { lat: 26.9124, lng: 75.7873, label: 'Jaipur' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, label: 'Ahmedabad' },
  'chandigarh': { lat: 30.7333, lng: 76.7794, label: 'Chandigarh' },
};

const QUICK_CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Faridabad', 'Noida', 'Pune', 'Chennai'];

function createUserIcon() {
  return L.divIcon({
    html: `<div style="position:relative;width:22px;height:22px;">
      <div style="position:absolute;inset:0;background:#2E7DFF;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(46,125,255,0.3);z-index:2;"></div>
    </div>`,
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

function createPriceIcon(price, isCheapest) {
  return L.divIcon({
    html: `<div style="background:${isCheapest ? '#00C2A8' : '#2E7DFF'};color:white;padding:4px 8px;border-radius:20px;font-family:sans-serif;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid white;transform:translateX(-50%);">₹${price}</div>`,
    className: '',
    iconSize: [60, 28],
    iconAnchor: [30, 28],
    popupAnchor: [0, -30],
  });
}

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(L.latLngBounds(positions.map(p => [p[1], p[0]])), { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
}

function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 13, { animate: true, duration: 1.2 });
  }, [coords, map]);
  return null;
}

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
}

export default function MapViewPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [cityError, setCityError] = useState('');
  const [locating, setLocating] = useState(false);

  // Try GPS first on load
  useEffect(() => {
    tryGPS();
  }, []);

  const tryGPS = () => {
    if (!navigator.geolocation) { setShowPanel(true); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
        setLocationLabel(`📍 Live GPS`);
        setLocating(false);
        setShowPanel(false);
      },
      () => { setLocating(false); setShowPanel(true); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const setCity = (name) => {
    const key = name.toLowerCase().trim();
    const match = CITY_COORDS[key] || CITY_COORDS[Object.keys(CITY_COORDS).find(k => k.includes(key) || key.includes(k))];
    if (match) {
      setUserLocation({ lat: match.lat, lng: match.lng });
      setLocationLabel(`📍 ${match.label}`);
      setShowPanel(false);
      setCityInput('');
      setCityError('');
    } else if (/^\d{6}$/.test(key)) {
      setUserLocation({ lat: 20.5937, lng: 78.9629 });
      setLocationLabel(`📍 Pincode: ${name}`);
      setShowPanel(false);
    } else {
      setCityError('City not found. Try: Delhi, Mumbai, Faridabad, Noida...');
    }
  };

  useEffect(() => {
    if (!userLocation) return;
    if (query) {
      setLoading(true);
      searchMedicine(query, userLocation.lat, userLocation.lng)
        .then(data => setResults(data.results || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      getPharmacies().then(setPharmacies).catch(() => {});
    }
  }, [query, userLocation]);

  const mapItems = (query ? results : pharmacies.map((p, i) => ({
    _id: `pharmacy_${i}`, pharmacy: p, price: null, inStock: p.isOpen, isCheapest: false,
  }))).map(item => {
    if (!userLocation || !item.pharmacy?.location?.coordinates) return item;
    const [lng, lat] = item.pharmacy.location.coordinates;
    return { ...item, liveDistance: calcDistance(userLocation.lat, userLocation.lng, lat, lng) };
  }).sort((a, b) => (parseFloat(a.liveDistance)||999) - (parseFloat(b.liveDistance)||999));

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-gray-900">{query ? `Map: ${query}` : 'Pharmacy Map'}</h1>
          {results.length > 0 && <span className="badge-blue">{results.length} found</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPanel(!showPanel)}
            className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 transition-colors font-medium ${
              userLocation ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-600'
            }`}
          >
            {locating ? (
              <><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Detecting...</>
            ) : userLocation ? (
              <><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{locationLabel} ✎</>
            ) : (
              <><span className="w-2 h-2 rounded-full bg-red-400"></span>Set Your Location</>
            )}
          </button>
          {query && <Link to={`/results?q=${encodeURIComponent(query)}`} className="btn-secondary text-sm !py-1.5">← List</Link>}
        </div>
      </div>

      {/* Location Panel */}
      {showPanel && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-4">
          <div className="max-w-lg mx-auto">
            <p className="text-sm font-bold text-gray-800 mb-1">📍 Set Your Location</p>
            <p className="text-xs text-gray-500 mb-3">GPS blocked? Type your city or pincode below.</p>

            {/* Quick city buttons */}
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_CITIES.map(city => (
                <button
                  key={city}
                  onClick={() => setCity(city)}
                  className="text-xs bg-white border border-blue-200 text-[#2E7DFF] px-3 py-1.5 rounded-full hover:bg-[#2E7DFF] hover:text-white transition-all font-medium"
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Manual input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={cityInput}
                onChange={e => { setCityInput(e.target.value); setCityError(''); }}
                onKeyDown={e => e.key === 'Enter' && setCity(cityInput)}
                placeholder="Type city name or 6-digit pincode..."
                className="input-field flex-1 !py-2 text-sm"
                autoFocus
              />
              <button onClick={() => setCity(cityInput)} className="btn-primary text-sm !py-2 !px-4">
                Set
              </button>
            </div>
            {cityError && <p className="text-xs text-red-500 mt-1">{cityError}</p>}

            {/* Try GPS again */}
            <button onClick={tryGPS} className="mt-2 text-xs text-[#2E7DFF] hover:underline flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try GPS again
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r border-gray-100 overflow-y-auto hidden md:block">
          {!userLocation ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">📍</div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Location not set</p>
              <p className="text-xs text-gray-500 mb-3">Set your location above to see pharmacy distances</p>
              <button onClick={() => setShowPanel(true)} className="btn-primary text-sm !py-2">
                Set Location
              </button>
            </div>
          ) : loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl w-full" />)}
            </div>
          ) : mapItems.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              <div className="text-3xl mb-2">🗺️</div>
              <p>Search a medicine to see prices on the map.</p>
              <Link to="/" className="btn-primary text-sm mt-3 inline-block">Search Medicine</Link>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {/* Your location card */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#2E7DFF] border-2 border-white shadow flex-shrink-0"></span>
                  <div>
                    <p className="text-xs font-bold text-[#2E7DFF]">Your Location</p>
                    <p className="text-xs text-gray-500">{locationLabel}</p>
                  </div>
                  <button onClick={() => setShowPanel(true)} className="ml-auto text-xs text-gray-400 hover:text-gray-600">Change</button>
                </div>
              </div>

              {mapItems.map((item, i) => (
                <button
                  key={item._id || i}
                  onClick={() => setSelected(item)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selected?._id === item._id ? 'border-[#2E7DFF] bg-blue-50' : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm text-gray-900 leading-tight">{item.pharmacy?.name}</span>
                    {item.price && (
                      <span className={`font-bold text-sm ${item.isCheapest ? 'text-[#00C2A8]' : 'text-gray-900'}`}>₹{item.price}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.pharmacy?.address}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.inStock ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
                    <span className="text-xs text-gray-500">{item.inStock ? 'In Stock' : 'Out of Stock'}</span>
                    {item.liveDistance && (
                      <span className="text-xs font-bold text-[#2E7DFF] ml-auto">📍 {item.liveDistance} km</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1">
          <MapContainer
            center={userLocation ? [userLocation.lat, userLocation.lng] : [20.5937, 78.9629]}
            zoom={userLocation ? 13 : 5}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {userLocation && <FlyTo coords={userLocation} />}
            {mapItems.length > 0 && (
              <FitBounds positions={mapItems.map(r => r.pharmacy?.location?.coordinates || [78.9629, 20.5937])} />
            )}

            {/* User location marker */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
                <Popup>
                  <div className="text-center min-w-[140px]">
                    <p className="font-bold text-[#2E7DFF] text-sm">📍 Your Location</p>
                    <p className="text-xs text-gray-500 mt-1">{locationLabel}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Pharmacy markers */}
            {mapItems.map((item, i) => {
              const coords = item.pharmacy?.location?.coordinates;
              if (!coords) return null;
              const [lng, lat] = coords;
              return (
                <Marker
                  key={item._id || i}
                  position={[lat, lng]}
                  icon={item.price ? createPriceIcon(item.price, item.isCheapest) : new L.Icon.Default()}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <div className="font-bold text-gray-900 mb-1">{item.pharmacy?.name}</div>
                      <div className="text-xs text-gray-500 mb-2">{item.pharmacy?.address}</div>
                      {item.price && (
                        <div className={`text-xl font-bold mb-1 ${item.isCheapest ? 'text-[#00C2A8]' : 'text-gray-900'}`}>
                          ₹{item.price} {item.isCheapest && '🏆 Best Price'}
                        </div>
                      )}
                      <div className={`text-xs font-medium mb-2 ${item.inStock ? 'text-emerald-600' : 'text-red-500'}`}>
                        {item.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                      </div>
                      {item.liveDistance && (
                        <div className="text-xs font-bold text-[#2E7DFF] mb-3">
                          📍 {item.liveDistance} km from your location
                        </div>
                      )}
                      <a
                        href={`https://maps.google.com/?q=${item.pharmacy?.address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-center text-xs bg-[#2E7DFF] text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                      >
                        🗺️ Get Directions
                      </a>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
