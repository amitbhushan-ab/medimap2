import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { searchMedicine, getPharmacies } from '../services/api';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createPriceIcon(price, isCheapest) {
  return L.divIcon({
    html: `
      <div style="
        background: ${isCheapest ? '#00C2A8' : '#2E7DFF'};
        color: white;
        padding: 4px 8px;
        border-radius: 20px;
        font-family: DM Sans, sans-serif;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        border: 2px solid white;
        transform: translateX(-50%);
      ">₹${price}</div>
    `,
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
      const bounds = L.latLngBounds(positions.map(p => [p[1], p[0]]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
}

export default function MapViewPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchMedicine(query)
        .then(data => setResults(data.results || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      getPharmacies().then(setPharmacies).catch(() => {});
    }
  }, [query]);

  const mapItems = query ? results : pharmacies.map((p, i) => ({
    _id: `pharmacy_${i}`,
    pharmacy: p,
    price: null,
    inStock: p.isOpen,
    isCheapest: false,
  }));

  const CENTER = [12.9716, 77.6101];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-gray-900">
            {query ? `Map: ${query}` : 'Pharmacy Map'}
          </h1>
          {results.length > 0 && (
            <span className="badge-blue">{results.length} found</span>
          )}
        </div>
        {query && (
          <Link to={`/results?q=${encodeURIComponent(query)}`} className="btn-secondary text-sm !py-2">
            ← List View
          </Link>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r border-gray-100 overflow-y-auto hidden md:block">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="skeleton h-20 rounded-xl w-full" />
              ))}
            </div>
          ) : mapItems.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              <div className="text-3xl mb-2">🗺️</div>
              <p>Search for a medicine to see prices on the map.</p>
              <Link to="/" className="btn-primary text-sm mt-3 inline-block">Search Medicine</Link>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {mapItems.map((item, i) => (
                <button
                  key={item._id || i}
                  onClick={() => setSelected(item)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selected?._id === item._id
                      ? 'border-[#2E7DFF] bg-blue-50'
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm text-gray-900 leading-tight">{item.pharmacy?.name}</span>
                    {item.price && (
                      <span className={`font-bold text-sm ${item.isCheapest ? 'text-[#00C2A8]' : 'text-gray-900'}`}>
                        ₹{item.price}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.pharmacy?.address}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.inStock ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
                    <span className="text-xs text-gray-500">{item.inStock ? 'In Stock' : 'Out of Stock'}</span>
                    {item.isCheapest && <span className="badge-green ml-auto !text-[10px]">Best Price</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1">
          <MapContainer
            center={CENTER}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mapItems.length > 0 && (
              <FitBounds positions={mapItems.map(r => r.pharmacy?.location?.coordinates || [77.6101, 12.9716])} />
            )}
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
                    <div className="min-w-[180px]">
                      <div className="font-bold text-gray-900 mb-1">{item.pharmacy?.name}</div>
                      <div className="text-xs text-gray-500 mb-2">{item.pharmacy?.address}</div>
                      {item.price && (
                        <div className={`text-lg font-bold mb-1 ${item.isCheapest ? 'text-[#00C2A8]' : 'text-gray-900'}`}>
                          ₹{item.price} {item.isCheapest && '🏆'}
                        </div>
                      )}
                      <div className={`text-xs font-medium ${item.inStock ? 'text-emerald-600' : 'text-red-500'}`}>
                        {item.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                      </div>
                      <a
                        href={`https://maps.google.com/?q=${item.pharmacy?.address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block text-center text-xs bg-[#2E7DFF] text-white py-1.5 rounded-lg font-medium"
                      >
                        Get Directions
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
