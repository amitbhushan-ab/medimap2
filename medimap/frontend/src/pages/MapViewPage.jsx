import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLang } from '../context/LanguageContext';
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
    html: `<div style="display:flex; flex-direction:column; align-items:center; z-index:2000;">
      <div style="position:relative; width:40px; height:46px; display:flex; flex-direction:column; align-items:center;">
        <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37,99,235,0.4); border: 2.5px solid white; z-index: 2;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 10px solid #1D4ED8; margin-top: -2px; z-index: 1; filter: drop-shadow(0 4px 2px rgba(37,99,235,0.3));"></div>
      </div>
      <div style="margin-top:-2px;font-size:11px;font-weight:800;color:#1E3A8A;text-shadow:1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;white-space:nowrap;letter-spacing:-0.2px;">
        You
      </div>
    </div>`,
    className: '',
    iconSize: [140, 60],
    iconAnchor: [70, 46],
    popupAnchor: [0, -46],
  });
}

function createPriceIcon(price, isCheapest, name) {
  const shortName = name ? (name.length > 20 ? name.substring(0,20) + '...' : name) : 'Pharmacy';
  return L.divIcon({
    html: `<div style="display:flex; flex-direction:column; align-items:center;">
      <div style="background:${isCheapest ? '#10B981' : '#2563EB'};color:white;padding:4px 10px;border-radius:20px;font-family:sans-serif;font-size:13px;font-weight:800;white-space:nowrap;box-shadow:0 4px 10px rgba(0,0,0,0.25);border:2px solid white;z-index:2;">
        ₹${price}
      </div>
      <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${isCheapest ? '#10B981' : '#2563EB'}; margin-top: -1px; z-index: 1;"></div>
      <div style="margin-top:2px;font-size:11px;font-weight:800;color:${isCheapest ? '#065F46' : '#1E3A8A'};text-shadow:1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;white-space:nowrap;letter-spacing:-0.2px;">
        ${shortName}
      </div>
    </div>`,
    className: '',
    iconSize: [140, 56],
    iconAnchor: [70, 36],
    popupAnchor: [0, -36],
  });
}

function createPharmacyIcon(name) {
  const shortName = name ? (name.length > 20 ? name.substring(0,20) + '...' : name) : 'Pharmacy';
  return L.divIcon({
    html: `<div style="display:flex; flex-direction:column; align-items:center; z-index:1000;">
      <div style="position:relative; width:40px; height:46px; display:flex; flex-direction:column; align-items:center;">
        <div style="background: linear-gradient(135deg, #10B981, #047857); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16,185,129,0.3); border: 2.5px solid white; z-index: 2;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.5 20.5l-7-7a4.95 4.95 0 1 1 7-7l7 7a4.95 4.95 0 1 1-7 7Z"/>
            <path d="m8.5 8.5 7 7"/>
          </svg>
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 10px solid #047857; margin-top: -2px; z-index: 1; filter: drop-shadow(0 4px 2px rgba(16,185,129,0.25));"></div>
      </div>
      <div style="margin-top:-2px;font-size:11px;font-weight:800;color:#064E3B;text-shadow:1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;white-space:nowrap;letter-spacing:-0.2px;">
        ${shortName}
      </div>
    </div>`,
    className: '',
    iconSize: [140, 60],
    iconAnchor: [70, 46],
    popupAnchor: [0, -46],
  });
}

function createHospitalIcon(name) {
  const shortName = name ? (name.length > 20 ? name.substring(0,20) + '...' : name) : 'Hospital';
  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;opacity:0.75;filter:grayscale(30%);">
      <div style="background:#EF4444;color:white;width:18px;height:18px;border-radius:4px;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.15);border:1.5px solid white;">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg>
      </div>
      <div style="margin-top:2px;font-size:9px;font-weight:600;color:#991B1B;text-shadow:1px 1px 0 rgba(255,255,255,0.9), -1px -1px 0 rgba(255,255,255,0.9), 1px -1px 0 rgba(255,255,255,0.9), -1px 1px 0 rgba(255,255,255,0.9);white-space:nowrap;letter-spacing:-0.2px;">
        ${shortName}
      </div>
    </div>`,
    className: '',
    iconSize: [120, 32],
    iconAnchor: [60, 18],
    popupAnchor: [0, -18],
  });
}

function FitBounds({ positions }) {
  const map = useMap();
  const hasFittedRef = useRef('');

  const validPositions = positions.filter(p => p && p[0] && p[1]);
  const serialized = JSON.stringify(validPositions);

  useEffect(() => {
    if (validPositions.length === 0) return;
    if (hasFittedRef.current === serialized) return;

    const timer = setTimeout(() => {
      try {
        const bounds = L.latLngBounds(validPositions);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
          hasFittedRef.current = serialized;
        }
      } catch(e) {}
    }, 200);
    return () => clearTimeout(timer);
  }, [serialized, map]);

  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function HospitalsLayer() {
  const map = useMap();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHospitals = async () => {
    if (map.getZoom() < 12) return;
    const bounds = map.getBounds();
    const query = `
      [out:json];
      (
        node["amenity"="hospital"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
        node["amenity"="clinic"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      );
      out 20;
    `;
    try {
      setLoading(true);
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await res.json();
      setHospitals(data.elements || []);
    } catch(e) {} finally {
      setLoading(false);
    }
  };

  useMapEvents({
    moveend: () => {
      // Debounce fetch
      setTimeout(fetchHospitals, 500);
    },
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  return hospitals.map(h => (
    <Marker key={h.id} position={[h.lat, h.lon]} icon={createHospitalIcon(h.tags?.name)} zIndexOffset={-1000}>
      <Popup>
        <div className="min-w-[150px]">
          <div className="font-bold text-gray-900 mb-1">{h.tags?.name || 'Medical Center'}</div>
          <div className="text-xs text-gray-500 mb-2">{h.tags?.amenity === 'hospital' ? 'Hospital' : 'Clinic'}</div>
          <a
            href={`https://maps.google.com/?q=${h.lat},${h.lon}`}
            target="_blank"
            rel="noreferrer"
            className="block text-center text-xs bg-red-500 text-white py-1.5 rounded font-semibold hover:bg-red-600 transition-colors"
          >
            🗺️ Directions
          </a>
        </div>
      </Popup>
    </Marker>
  ));
}

function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.lat) {
      const timer = setTimeout(() => {
        try {
          map.flyTo([coords.lat, coords.lng], 14, { animate: true, duration: 1.2 });
        } catch(e) {}
      }, 200);
      return () => clearTimeout(timer);
    }
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

  const { lang, t } = useLang();
  
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
        setLocationLabel(lang === 'hi' ? `📍 लाइव GPS` : `📍 Live GPS`);
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
      setLocationLabel(lang === 'hi' ? `📍 पिनकोड: ${name}` : `📍 Pincode: ${name}`);
      setShowPanel(false);
    } else {
      setCityError(lang === 'hi' ? 'शहर नहीं मिला। प्रयास करें: Delhi, Mumbai...' : 'City not found. Try: Delhi, Mumbai, Faridabad, Noida...');
    }
  };

  // Convex data fetching
  const rawResults = useQuery(api.medicines.search, query ? { query } : "skip");
  const rawPharmacies = useQuery(api.pharmacies.getPharmacies);

  useEffect(() => {
    if (query) {
      if (rawResults !== undefined) {
        setResults(rawResults);
        setLoading(false);
      } else {
        setLoading(true);
      }
    } else {
      if (rawPharmacies !== undefined) {
        setPharmacies(rawPharmacies);
        setLoading(false);
      }
    }
  }, [query, rawResults, rawPharmacies]);

  const mapItems = (query ? results : pharmacies.map((p, i) => ({
    _id: `pharmacy_${i}`, pharmacy: p, price: null, inStock: p.isOpen !== false, isCheapest: false,
  }))).map(item => {
    if (!userLocation || !item.pharmacy?.location?.lat || !item.pharmacy?.location?.lng) return item;
    const { lat, lng } = item.pharmacy.location;
    return { ...item, liveDistance: calcDistance(userLocation.lat, userLocation.lng, lat, lng) };
  }).sort((a, b) => (parseFloat(a.liveDistance)||999) - (parseFloat(b.liveDistance)||999));

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-gray-900">{query ? (lang === 'hi' ? `मैप: ${query}` : `Map: ${query}`) : (lang === 'hi' ? 'फार्मेसी मैप' : 'Pharmacy Map')}</h1>
          {results.length > 0 && <span className="badge-blue">{results.length} {lang === 'hi' ? 'मिले' : 'found'}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPanel(!showPanel)}
            className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 transition-colors font-medium ${
              userLocation ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-600'
            }`}
          >
            {locating ? (
              <><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> {t('locating') || 'Detecting...'}</>
            ) : userLocation ? (
              <><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{locationLabel} ✎</>
            ) : (
              <><span className="w-2 h-2 rounded-full bg-red-400"></span>{lang === 'hi' ? 'अपनी लोकेशन सेट करें' : 'Set Your Location'}</>
            )}
          </button>
          {query && <Link to={`/results?q=${encodeURIComponent(query)}`} className="btn-secondary text-sm !py-1.5">← {lang === 'hi' ? 'सूची' : 'List'}</Link>}
        </div>
      </div>

      {/* Location Panel */}
      {showPanel && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-4">
          <div className="max-w-lg mx-auto">
            <p className="text-sm font-bold text-gray-800 mb-1">📍 {lang === 'hi' ? 'अपनी लोकेशन सेट करें' : 'Set Your Location'}</p>
            <p className="text-xs text-gray-500 mb-3">{lang === 'hi' ? 'GPS ब्लॉक है? अपना शहर या पिनकोड नीचे टाइप करें।' : 'GPS blocked? Type your city or pincode below.'}</p>

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
                placeholder={lang === 'hi' ? 'शहर का नाम या 6 अंकों का पिनकोड टाइप करें...' : 'Type city name or 6-digit pincode...'}
                className="input-field flex-1 !py-2 text-sm"
                autoFocus
              />
              <button onClick={() => setCity(cityInput)} className="btn-primary text-sm !py-2 !px-4">
                {lang === 'hi' ? 'सेट करें' : 'Set'}
              </button>
            </div>
            {cityError && <p className="text-xs text-red-500 mt-1">{cityError}</p>}

            {/* Try GPS again */}
            <button onClick={tryGPS} className="mt-2 text-xs text-[#2E7DFF] hover:underline flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {lang === 'hi' ? 'फिर से GPS का प्रयास करें' : 'Try GPS again'}
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
              <p className="text-sm font-semibold text-gray-700 mb-1">{lang === 'hi' ? 'लोकेशन सेट नहीं है' : 'Location not set'}</p>
              <p className="text-xs text-gray-500 mb-3">{lang === 'hi' ? 'फार्मेसी की दूरी देखने के लिए ऊपर अपनी लोकेशन सेट करें' : 'Set your location above to see pharmacy distances'}</p>
              <button onClick={() => setShowPanel(true)} className="btn-primary text-sm !py-2">
                {lang === 'hi' ? 'लोकेशन सेट करें' : 'Set Location'}
              </button>
            </div>
          ) : loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl w-full" />)}
            </div>
          ) : mapItems.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              <div className="text-3xl mb-2">🗺️</div>
              <p>{lang === 'hi' ? 'मैप पर कीमतें देखने के लिए कोई दवा खोजें।' : 'Search a medicine to see prices on the map.'}</p>
              <Link to="/" className="btn-primary text-sm mt-3 inline-block">{lang === 'hi' ? 'दवा खोजें' : 'Search Medicine'}</Link>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {/* Your location card */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#2E7DFF] border-2 border-white shadow flex-shrink-0"></span>
                  <div>
                    <p className="text-xs font-bold text-[#2E7DFF]">{lang === 'hi' ? 'आपकी लोकेशन' : 'Your Location'}</p>
                    <p className="text-xs text-gray-500">{locationLabel}</p>
                  </div>
                  <button onClick={() => setShowPanel(true)} className="ml-auto text-xs text-gray-400 hover:text-gray-600">{lang === 'hi' ? 'बदलें' : 'Change'}</button>
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
                    <span className="font-medium text-sm text-gray-900 leading-tight">{item.pharmacy?.pharmacyName || item.pharmacy?.name}</span>
                    {item.price && (
                      <span className={`font-bold text-sm ${item.isCheapest ? 'text-[#00C2A8]' : 'text-gray-900'}`}>₹{item.price}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.pharmacy?.address}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.inStock ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
                    <span className="text-xs text-gray-500">{item.inStock ? t('inStock') || 'In Stock' : t('outOfStock') || 'Out of Stock'}</span>
                    {item.liveDistance && (
                      <span className="text-xs font-bold text-[#2E7DFF] ml-auto">📍 {item.liveDistance} {lang === 'hi' ? 'किमी' : 'km'}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 h-full w-full relative">
          <MapContainer
            key="medimap-map"
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <MapResizer />
            <HospitalsLayer />
            {userLocation && <FlyTo coords={userLocation} />}
            {mapItems.length > 0 && (
              <FitBounds positions={mapItems.map(r => r.pharmacy?.location?.lat ? [r.pharmacy.location.lat, r.pharmacy.location.lng] : null)} />
            )}

            {/* User location marker */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()} zIndexOffset={2000}>
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
              if (!item.pharmacy?.location?.lat || !item.pharmacy?.location?.lng) return null;
              const { lat, lng } = item.pharmacy.location;
              const name = item.pharmacy?.pharmacyName || item.pharmacy?.name;
              return (
                <Marker
                  key={item._id || i}
                  position={[lat, lng]}
                  icon={item.price ? createPriceIcon(item.price, item.isCheapest, name) : createPharmacyIcon(name)}
                  zIndexOffset={1000}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <div className="font-bold text-gray-900 mb-1">{item.pharmacy?.pharmacyName || item.pharmacy?.name}</div>
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
