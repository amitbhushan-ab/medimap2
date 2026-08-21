// frontend/src/pages/ResultsPage.jsx — Premium Split-View Results with Interactive Leaflet Map
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PharmacyCard, { PharmacyCardSkeleton } from '../components/PharmacyCard';
import { useLang } from '../context/LanguageContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Helper component for panning the map
function MapFlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.lat && coords.lng) {
      map.flyTo([coords.lat, coords.lng], 15, { animate: true, duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

export default function ResultsPage() {
  const { lang, t } = useLang();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [newQuery, setNewQuery] = useState(query);
  const [results, setResults] = useState([]);
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  // Real packaging image mapping for seeded demo medicines
  const BRAND_IMAGES = {
    'paracetamol': { 
      f: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop', 
      b: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Cold_Form_Foil_blister_pack2.jpg' 
    },
    'amoxicillin': { 
      f: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=300&h=300&fit=crop', 
      b: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Cold_Form_Foil_blister_pack2.jpg' 
    },
    'metformin': { 
      f: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=300&h=300&fit=crop', 
      b: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Cold_Form_Foil_blister_pack2.jpg' 
    },
    'cetirizine': { 
      f: 'https://images.unsplash.com/photo-1550572017-edb30263f350?w=300&h=300&fit=crop', 
      b: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Cold_Form_Foil_blister_pack2.jpg' 
    },
    'azithromycin': { 
      f: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=300&fit=crop', 
      b: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Cold_Form_Foil_blister_pack2.jpg' 
    }
  };

  const searchKey = Object.keys(BRAND_IMAGES).find(k => (medicine?.name || query)?.toLowerCase().includes(k));
  const fallbackImages = { f: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Blister_Pack.jpg', b: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Cold_Form_Foil_blister_pack2.jpg' };
  const frontImg = searchKey ? BRAND_IMAGES[searchKey].f : fallbackImages.f;
  const backImg = searchKey ? BRAND_IMAGES[searchKey].b : fallbackImages.b;
  const [error, setError] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [sortBy, setSortBy] = useState('distance'); // distance | price
  const [filterInStock, setFilterInStock] = useState(false);
  const [view, setView] = useState('split'); // list | split
  const [userLat, setUserLat] = useState(28.4089);
  const [userLng, setUserLng] = useState(77.3178);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  function toggleListening() {
    // If already listening, stop
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'hi' ? 'आपका ब्राउज़र वॉयस सर्च का समर्थन नहीं करता है।' : 'Your browser does not support Speech Recognition.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognition.onerror = (e) => {
      console.warn('Voice recognition error:', e.error);
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const cleaned = transcript.replace(/[.।]$/g, '').trim();
      const text = cleaned.toLowerCase().trim();

      console.log('Voice heard:', text);

      // --- Navigation Commands ---
      if (
        text.includes('scan') ||
        text.includes('prescription') ||
        text.includes('पर्ची') ||
        text.includes('पर्चा') ||
        text.includes('स्कैन')
      ) {
        navigate('/scan');
        return;
      }

      if (
        text.includes('map') ||
        text.includes('location') ||
        text.includes('dikhao') ||
        text.includes('नक्शा') ||
        text.includes('मैप') ||
        text.includes('लोकेशन')
      ) {
        navigate('/map');
        return;
      }

      // --- Regular Medicine Search ---
      setNewQuery(cleaned);
      setTimeout(() => {
        navigate(`/results?q=${encodeURIComponent(cleaned)}`);
      }, 550);
    };

    recognition.start();
  }

  // Get user location
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
      () => {}
    );
  }, []);

  // Fetch results via Convex
  const rawResults = useQuery(api.medicines.search, query ? { query } : "skip");

  useEffect(() => {
    if (!query) return;
    
    if (rawResults === undefined) {
      setLoading(true);
      setError('');
    } else {
      setLoading(false);
      
      if (rawResults.length === 0) {
        setError(lang === 'hi' ? 'कोई परिणाम नहीं मिला।' : 'No results found.');
        setResults([]);
        setMedicine(null);
      } else {
        setError('');
        // Map Convex format to UI format
        const mappedResults = rawResults.map(r => {
          const lat = r.pharmacy.location.lat;
          const lng = r.pharmacy.location.lng;
          
          // Calculate distance using haversine
          const R = 6371;
          const dLat = (lat - userLat) * Math.PI / 180;
          const dLon = (lng - userLng) * Math.PI / 180;
          const a = Math.sin(dLat/2)**2 + Math.cos(userLat*Math.PI/180)*Math.cos(lat*Math.PI/180)*Math.sin(dLon/2)**2;
          const distance = parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1));

          return {
            _id: r._id,
            pharmacy: {
              ...r.pharmacy,
              name: r.pharmacy.pharmacyName || r.pharmacy.name
            },
            medicine: r.medicine,
            price: r.price,
            inStock: r.inStock,
            isCheapest: r.isCheapest,
            distance: distance
          };
        });
        
        setResults(mappedResults);
        setMedicine(rawResults[0].medicine);
        
        try {
          const history = JSON.parse(localStorage.getItem('medimap_search_history') || '[]');
          const updated = [{ query, date: new Date().toISOString() }, ...history.filter(h => h.query !== query)].slice(0, 10);
          localStorage.setItem('medimap_search_history', JSON.stringify(updated));
        } catch(e) {
          localStorage.setItem('medimap_search_history', '[]'); // Reset on corruption
        }
      }
    }
  }, [query, rawResults, userLat, userLng, lang]);

  // Sorted + filtered
  const processed = [...results]
    .filter(r => !filterInStock || r.inStock)
    .sort((a, b) => sortBy === 'price' ? a.price - b.price : (a.distance || 99) - (b.distance || 99));

  const cheapestPrice = processed.filter(r => r.inStock).reduce((min, r) => Math.min(min, r.price), Infinity);

  function handleSearch() {
    if (!newQuery.trim()) return;
    navigate(`/results?q=${encodeURIComponent(newQuery.trim())}`);
  }

  function saveSavings(result) {
    if (!result.isCheapest) return;
    const savings = JSON.parse(localStorage.getItem('medimap_saved_money') || '{"total":0,"thisMonth":0,"transactions":[]}');
    const saved = Math.max(0, Math.round(cheapestPrice * 0.3));
    if (saved > 0) {
      savings.total += saved; savings.thisMonth += saved;
      savings.transactions.unshift({ medicine: query, saved, date: new Date().toISOString(), cheapest: cheapestPrice, avg: Math.round(cheapestPrice * 1.3) });
      localStorage.setItem('medimap_saved_money', JSON.stringify(savings));
    }
  }

  const selectedResult = processed[selectedIdx];

  return (
    <div className="min-h-screen pt-16 animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* ── Search header ── */}
      <div className="sticky top-16 z-40 border-b" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="btn-icon flex-shrink-0" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
              </svg>
            </Link>

            {/* Inline search */}
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-500/30"
              style={{ background: 'var(--bg-subtle)', border: '1.5px solid var(--border)' }}>
              <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                className="flex-1 text-sm bg-transparent outline-none font-medium"
                style={{ color: 'var(--text-primary)' }}
                value={newQuery}
                onChange={e => setNewQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={isListening ? (lang === 'hi' ? 'सुन रहा हूँ...' : 'Listening...') : (lang === 'hi' ? 'दूसरी दवा खोजें...' : 'Search another medicine...')}
                disabled={isListening}
              />
              <button
                onClick={toggleListening}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center flex-shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-405 hover:text-gray-600 hover:bg-gray-105'}`}
                title={lang === 'hi' ? 'आवाज से खोजें' : 'Voice Search'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                </svg>
              </button>
              {newQuery && newQuery !== query && !isListening && (
                <button onClick={handleSearch} className="btn-primary !px-4 !py-1.5 !text-xs flex-shrink-0">{lang === 'hi' ? 'खोजें' : 'Go'}</button>
              )}
            </div>

            {/* View toggle */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
              {[{ id:'list', icon:'☰' }, { id:'split', icon:'⊞' }].map(v => (
                <button key={v.id} onClick={() => setView(v.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${view===v.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}>
                  {v.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* Medicine info banner */}
        {medicine && !loading && (
          <div className="card p-5 mb-5 flex items-center gap-4 flex-wrap bg-gradient-to-r from-blue-50/50 via-teal-50/20 to-white border-l-4 border-l-blue-500 shadow-sm">
                                        <div className="flex flex-shrink-0 gap-2">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border border-gray-100 relative group">
                  <img src={frontImg} alt="Front" className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] font-bold text-white text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">FRONT</div>
                </div>
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border border-gray-100 relative group">
                  <img src={backImg} alt="Back" className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] font-bold text-white text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">BACK</div>
                </div>
              </div>
            <div className="flex-1 min-w-[200px]">
              <h1 className="font-extrabold text-xl text-gray-900 font-sora">{medicine.name || query}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm mt-1">
                {medicine.genericName && (
                  <span className="text-gray-500">
                    {lang === 'hi' ? 'जेनेरिक' : 'Generic'}: <strong className="text-blue-600 font-semibold">{medicine.genericName}</strong>
                  </span>
                )}
                {medicine.category && (
                  <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-md bg-teal-50 text-teal-700 border border-teal-100">{medicine.category}</span>
                )}
                {medicine.requiresPrescription && (
                  <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-md bg-red-50 text-red-700 border border-red-100">{lang === 'hi' ? 'पर्ची आवश्यक' : 'Rx Required'}</span>
                )}
              </div>
            </div>
            {cheapestPrice < Infinity && (
              <div className="text-right flex-shrink-0 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold">{lang === 'hi' ? 'न्यूनतम कीमत' : 'Lowest Price'}</div>
                <div className="text-2xl font-black text-emerald-600 font-sora mt-0.5">₹{cheapestPrice}</div>
              </div>
            )}
          </div>
        )}

        {/* Filters + sort */}
        {!loading && results.length > 0 && (
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                <span className="text-blue-600 text-base font-bold">{processed.length}</span> {t('pharmaciesFound') || 'pharmacies found'}
              </p>
              <div className="w-px h-4 bg-gray-200" />
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${filterInStock ? 'bg-emerald-500' : 'bg-gray-200'}`}
                  onClick={() => setFilterInStock(!filterInStock)}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${filterInStock ? 'translate-x-4' : ''}`}/>
                </div>
                <span className="text-xs font-bold text-gray-500">{t('inStockOnly') || 'In-stock only'}</span>
              </label>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-100 p-0.5 rounded-xl border border-gray-200/50">
              {['distance', 'price'].map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy===s ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  {s === 'distance' ? (lang === 'hi' ? 'दूरी' : 'Distance') : (lang === 'hi' ? 'कीमत' : 'Price')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[...Array(4)].map((_, i) => <PharmacyCardSkeleton key={i}/>)}
          </div>
        ) : error ? (
          <div className="card p-12 text-center max-w-md mx-auto my-10 shadow-lg">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-4 text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900 font-sora">{t('noResults') || 'No results found'}</h2>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <Link to="/"><button className="btn-primary w-full py-3.5">← {lang === 'hi' ? 'फिर से खोजें' : 'Search Again'}</button></Link>
          </div>
        ) : (
          <div className={`${view === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-5' : 'flex flex-col gap-3'}`}>
            {/* List */}
            <div className={`${view === 'split' ? 'flex flex-col gap-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-1' : 'grid grid-cols-1 gap-3'}`}>
              {processed.map((result, i) => (
                <PharmacyCard
                  key={result._id || i}
                  result={result}
                  rank={i + 1}
                  isSelected={view === 'split' && selectedIdx === i}
                  onClick={() => { setSelectedIdx(i); saveSavings(result); }}
                />
              ))}
            </div>

            {/* Premium Interactive Map (split view) */}
            {view === 'split' && (
              <div className="hidden lg:block sticky top-[240px] h-[calc(100vh-280px)]">
                <div className="card h-full relative overflow-hidden shadow-lg border border-gray-200/50" style={{ borderRadius: '24px' }}>
                  
                  {/* Map Container */}
                  <MapContainer center={[userLat, userLng]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }} key="split-map">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Render Markers for all matching stores */}
                    {processed.map((r, idx) => {
                      if (!r.pharmacy?.location?.lat || !r.pharmacy?.location?.lng) return null;
                      return (
                        <Marker 
                          key={r._id || idx} 
                          position={[r.pharmacy.location.lat, r.pharmacy.location.lng]}
                          eventHandlers={{ click: () => setSelectedIdx(idx) }}
                        >
                          <Popup>
                            <div style={{ minWidth: 140, padding: '2px 0' }}>
                              <h4 style={{ margin: '0 0 3px 0', fontSize: 13, fontWeight: 700 }}>{r.pharmacy.name}</h4>
                              <p style={{ margin: '0 0 6px 0', fontSize: 10, color: '#666' }}>{r.pharmacy.address}</p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 850, color: '#10b981', fontSize: 12 }}>₹{r.price}</span>
                                <span style={{ fontSize: 10, color: '#888' }}>{r.distance} km</span>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}

                    {/* FlyTo element dynamically centers map when selected pharmacist changes */}
                    {selectedResult?.pharmacy?.location && (
                      <MapFlyTo coords={selectedResult.pharmacy.location} />
                    )}
                  </MapContainer>

                  {/* Interactive Details Overlay Card */}
                  {selectedResult && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-2xl p-4 rounded-2xl border border-gray-100 dark:border-gray-800 z-[1000] flex justify-between items-center transition-all animate-slide-up duration-300">
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm truncate text-gray-900 dark:text-white font-sora">{selectedResult.pharmacy?.name}</h4>
                          {selectedResult.pharmacy?.isPremium && <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-black">PRO</span>}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-450" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          {selectedResult.pharmacy?.address}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs">
                          <span className="font-black text-emerald-600 font-sora">₹{selectedResult.price}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500 dark:text-gray-400 font-bold">{selectedResult.distance} km away</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(selectedResult.pharmacy?.address || '')}`}
                          target="_blank" rel="noreferrer" className="btn-primary !px-4 !py-2 text-[11px] text-center font-bold">
                          {lang === 'hi' ? 'रास्ता' : 'Directions'}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
