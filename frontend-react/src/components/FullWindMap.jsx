import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAirQuality, aqiColor } from '../services/weatherApi';

// ── Major Indian cities for AQI overlay ──
const INDIAN_CITIES = [
  { name: 'Delhi',       lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai',      lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru',   lat: 12.9716, lon: 77.5946 },
  { name: 'Chennai',     lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata',     lat: 22.5726, lon: 88.3639 },
  { name: 'Hyderabad',   lat: 17.3850, lon: 78.4867 },
  { name: 'Pune',        lat: 18.5204, lon: 73.8567 },
  { name: 'Ahmedabad',   lat: 23.0225, lon: 72.5714 },
  { name: 'Jaipur',      lat: 26.9124, lon: 75.7873 },
  { name: 'Lucknow',     lat: 26.8467, lon: 80.9462 },
  { name: 'Bhopal',      lat: 23.2599, lon: 77.4126 },
  { name: 'Nagpur',      lat: 21.1458, lon: 79.0882 },
  { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185 },
  { name: 'Coimbatore',  lat: 11.0168, lon: 76.9558 },
  { name: 'Indore',      lat: 22.7196, lon: 75.8577 },
  { name: 'Patna',       lat: 25.6093, lon: 85.1376 },
  { name: 'Chandigarh',  lat: 30.7333, lon: 76.7794 },
  { name: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366 },
  { name: 'Guwahati',    lat: 26.1445, lon: 91.7362 },
  { name: 'Ranchi',      lat: 23.3441, lon: 85.3096 },
  { name: 'Varanasi',    lat: 25.3176, lon: 83.0064 },
  { name: 'Vijayawada',  lat: 16.5062, lon: 80.6480 },
  { name: 'Kochi',       lat: 9.9312,  lon: 76.2673 },
];

// ── Wind Particle Overlay — Realistic Swirly Wind ──
function WindOverlay({ windSpeed }) {
  const map = useMap();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const speed = Math.max(0.5, windSpeed / 8);

    const particles = Array.from({ length: 600 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      len: Math.random() * 20 + 5,
      opacity: Math.random() * 0.6 + 0.1,
      speedVar: Math.random() * 0.5 + 0.5,
    }));

    const render = () => {
      ctx.fillStyle = 'rgba(4, 16, 36, 0.18)'; // Trail effect color matching blue map
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1.0;
      ctx.lineCap = 'round';

      particles.forEach(p => {
        // Procedural vector field for swirly wind
        const nx = p.x / 200;
        const ny = p.y / 200;
        // Base angle for Northwest flow (approx -3/4 PI or 225 degrees)
        // Adding perlin noise for swirly effect
        const baseAngle = Math.PI * 1.25; 
        const noise = (Math.sin(nx) + Math.cos(ny)) * 0.4;
        const angle = baseAngle + noise;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - Math.cos(angle) * p.len * 0.5, p.y - Math.sin(angle) * p.len * 0.5);
        ctx.stroke();

        // Move particle along the flow
        p.x += Math.cos(angle) * speed * p.speedVar;
        p.y += Math.sin(angle) * speed * p.speedVar;

        // Wrap around smoothly
        if (p.x > canvas.width + 50) p.x = -50;
        else if (p.x < -50) p.x = canvas.width + 50;
        if (p.y > canvas.height + 50) p.y = -50;
        else if (p.y < -50) p.y = canvas.height + 50;
      });

      animId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
    };

    map.on('resize', handleResize);
    handleResize();
    render();

    return () => {
      cancelAnimationFrame(animId);
      map.off('resize', handleResize);
    };
  }, [map, windSpeed]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 z-[400] pointer-events-none"
            style={{ mixBlendMode: 'screen' }} />
  );
}

// ── Map Helpers ──
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const ro = new ResizeObserver(() => map.invalidateSize());
    const c = map.getContainer();
    if (c) ro.observe(c);
    return () => { if (c) ro.unobserve(c); ro.disconnect(); };
  }, [map]);
  return null;
}


// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT — Half-screen expanded India map
// ═══════════════════════════════════════════════════════════════════════════

export default function FullWindMap({ location, weather, onClose }) {
  const [activeLayer, setActiveLayer] = useState('wind'); // 'wind' | 'aqi'
  const [cityAqi, setCityAqi] = useState([]);
  const [aqiLoading, setAqiLoading] = useState(false);

  const windSpeed = weather?._raw?.windSpeed ?? 0;

  // Fetch AQI for all cities immediately on mount
  useEffect(() => {
    if (cityAqi.length > 0) return; // already fetched

    setAqiLoading(true);
    Promise.all(
      INDIAN_CITIES.map(async (city) => {
        try {
          const aqi = await fetchAirQuality(city.lat, city.lon);
          return { ...city, aqi: aqi.index, label: aqi.label };
        } catch {
          return { ...city, aqi: 0, label: 'N/A' };
        }
      })
    ).then(results => {
      setCityAqi(results);
      setAqiLoading(false);
    });
  }, [cityAqi.length]);

  // Marker icon
  const markerIcon = L.divIcon({
    className: 'custom-wind-marker',
    html: `
      <div class="relative flex items-center justify-center w-14 h-14 bg-blue-500/20 rounded-full border border-blue-400/50 backdrop-blur-sm shadow-[0_0_15px_rgba(59,130,246,0.5)]">
        <div class="text-center">
          <div class="text-[10px] font-bold text-white leading-none mb-0.5">WIND</div>
          <div class="text-[16px] font-semibold text-white leading-none">${windSpeed}</div>
        </div>
        <div class="absolute inset-0 rounded-full border border-dashed border-white/40" style="transform: rotate(270deg)">
          <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
  });

  return (
    <div className="w-full h-full relative bg-[#0a1628] flex flex-col overflow-hidden animate-fade-in rounded-l-3xl shadow-2xl">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[500] p-4 flex justify-between items-center bg-gradient-to-b from-[#0a1628]/80 to-transparent">
        <h2 className="text-white font-medium text-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
          {activeLayer === 'wind' ? 'Wind Speed' : 'Air Quality'} Map
        </h2>
        <button onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Layer Switcher (top-left below header) */}
      <div className="absolute top-16 left-4 z-[500] flex gap-2">
        <button
          onClick={() => setActiveLayer('wind')}
          className={`px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md border transition-all
            ${activeLayer === 'wind'
              ? 'bg-white/20 border-white/30 text-white'
              : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
        >
          💨 Wind Speed
        </button>
        <button
          onClick={() => setActiveLayer('aqi')}
          className={`px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md border transition-all
            ${activeLayer === 'aqi'
              ? 'bg-white/20 border-white/30 text-white'
              : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
        >
          🌿 Air Quality
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer center={[22.5, 79.0]} zoom={4.5} scrollWheelZoom={true}
          className="w-full h-full bg-[#0a1628]" zoomControl={false} minZoom={4} maxZoom={8}>
          <MapResizer />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri"
          />
          <Marker position={[location.lat, location.lon]} icon={markerIcon} />

          {/* Wind particles layer — always West to East */}
          {activeLayer === 'wind' && (
            <WindOverlay windSpeed={windSpeed} />
          )}

          {/* AQI colored region circles — large radius to color regions */}
          {activeLayer === 'aqi' && cityAqi.map((city) => (
            <CircleMarker
              key={city.name}
              center={[city.lat, city.lon]}
              radius={35}
              pathOptions={{
                fillColor: aqiColor(city.aqi),
                fillOpacity: 0.5,
                color: aqiColor(city.aqi),
                weight: 2,
                opacity: 0.7,
              }}
            >
              <Tooltip direction="top" permanent className="aqi-tooltip">
                <span className="text-[11px] font-bold">{city.name}: {city.aqi}</span>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Legend */}
        {activeLayer === 'wind' ? (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 z-[500] bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 flex flex-col items-center">
            <span className="text-[10px] text-white/70 font-semibold mb-2">km/h</span>
            <div className="h-48 w-3 rounded-full bg-gradient-to-t from-blue-500 via-green-400 to-red-500 relative">
              <span className="absolute -right-8 top-0 text-[10px] text-white">120</span>
              <span className="absolute -right-6 top-1/4 text-[10px] text-white">80</span>
              <span className="absolute -right-6 top-1/2 text-[10px] text-white">40</span>
              <span className="absolute -right-4 bottom-0 text-[10px] text-white">0</span>
            </div>
            <p className="text-[9px] text-white/50 mt-3 text-center">W → E</p>
          </div>
        ) : (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 z-[500] bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-white/70 font-semibold mb-2 block">AQI</span>
            {[
              { color: '#00e400', label: 'Good (0-50)' },
              { color: '#ffff00', label: 'Moderate (51-100)' },
              { color: '#ff7e00', label: 'Unhealthy S. (101-150)' },
              { color: '#ff0000', label: 'Unhealthy (151-200)' },
              { color: '#8f3f97', label: 'Very Unhealthy (201+)' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 mt-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                <span className="text-[9px] text-white/70">{item.label}</span>
              </div>
            ))}
            {aqiLoading && <p className="text-[9px] text-white/40 mt-2 animate-pulse">Loading data...</p>}
          </div>
        )}

        {/* Bottom Info Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10">
          <div className="text-center text-sm text-white/80 font-medium">
            {activeLayer === 'wind' ? `Wind: ${windSpeed} km/h • Direction: West → East` : 'Air Quality Index'} • Real-time Live Data
          </div>
        </div>
      </div>
    </div>
  );
}
