import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAirQuality, aqiColor } from '../../services/weatherApi';

// India bounding box — locks the map to India only
const INDIA_BOUNDS = L.latLngBounds(
  L.latLng(6.5, 68.0),   // Southwest corner (Kanyakumari region)
  L.latLng(37.0, 97.5)   // Northeast corner (Kashmir/Arunachal)
);

const INDIA_CENTER = [22.5, 79.0]; // Central India

// Major Indian cities with their coordinates
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
  { name: 'Nagpur',      lat: 21.1458, lon: 79.0882 },
  { name: 'Bhopal',      lat: 23.2599, lon: 77.4126 },
  { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185 },
  { name: 'Coimbatore',  lat: 11.0168, lon: 76.9558 },
  { name: 'Indore',      lat: 22.7196, lon: 75.8577 },
  { name: 'Patna',       lat: 25.6093, lon: 85.1376 },
  { name: 'Chandigarh',  lat: 30.7333, lon: 76.7794 },
  { name: 'Guwahati',    lat: 26.1445, lon: 91.7362 },
  { name: 'Kochi',       lat: 9.9312,  lon: 76.2673 },
  { name: 'Varanasi',    lat: 25.3176, lon: 83.0064 },
  { name: 'Vijayawada',  lat: 16.5062, lon: 80.6480 },
  { name: 'Ranchi',      lat: 23.3441, lon: 85.3096 },
  { name: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366 },
];

// Wind overlay using canvas
function WindCanvas({ windSpeed, windDirection }) {
  const map = useMap();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const angleRad = (windDirection + 180) * (Math.PI / 180);
    const speed = Math.max(0.5, windSpeed / 3);

    const particles = Array.from({ length: 100 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      len: Math.random() * 15 + 5,
      opacity: Math.random() * 0.4 + 0.1,
      sv: Math.random() * 0.5 + 0.5,
    }));

    const render = () => {
      ctx.fillStyle = 'rgba(10, 22, 40, 0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';

      particles.forEach(p => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(100, 200, 255, ${p.opacity})`;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.cos(angleRad) * p.len, p.y + Math.sin(angleRad) * p.len);
        ctx.stroke();

        p.x += Math.cos(angleRad) * speed * p.sv;
        p.y += Math.sin(angleRad) * speed * p.sv;

        if (p.x < -30) p.x = canvas.width + 30;
        if (p.x > canvas.width + 30) p.x = -30;
        if (p.y < -30) p.y = canvas.height + 30;
        if (p.y > canvas.height + 30) p.y = -30;
      });

      animId = requestAnimationFrame(render);
    };

    const resize = () => {
      const s = map.getSize();
      canvas.width = s.x;
      canvas.height = s.y;
    };

    map.on('resize', resize);
    resize();
    render();

    return () => { cancelAnimationFrame(animId); map.off('resize', resize); };
  }, [map, windSpeed, windDirection]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-[400] pointer-events-none" style={{ mixBlendMode: 'screen' }} />;
}

// Lock map to India bounds
function BoundsEnforcer() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(INDIA_BOUNDS);
    map.setMinZoom(4);
    map.setMaxZoom(7);
    map.on('drag', () => { map.panInsideBounds(INDIA_BOUNDS, { animate: false }); });
  }, [map]);
  return null;
}

// Resize handler
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


export default function IndiaMapCard({ wind, airQuality, onClick }) {
  const [activeLayer, setActiveLayer] = useState('wind'); // 'wind' | 'aqi'
  const [cityAqi, setCityAqi] = useState([]);

  const windSpeed = wind?.speed ?? 0;
  const windDir   = wind?.directionDeg ?? 0;

  // Fetch AQI for all cities when AQI layer is activated
  useEffect(() => {
    if (activeLayer !== 'aqi' || cityAqi.length > 0) return;

    Promise.all(
      INDIAN_CITIES.map(async (city) => {
        try {
          const aqi = await fetchAirQuality(city.lat, city.lon);
          return { ...city, aqi: aqi.index, label: aqi.label };
        } catch {
          return { ...city, aqi: 0, label: 'N/A' };
        }
      })
    ).then(setCityAqi);
  }, [activeLayer, cityAqi.length]);

  return (
    <div className="glass-card col-span-2 overflow-hidden cursor-pointer group" onClick={onClick}>
      {/* Header with layer switcher */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <h3 className="metric-label flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
          INDIA MAP
        </h3>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setActiveLayer('wind')}
            className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all
              ${activeLayer === 'wind' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
          >
            💨 Wind
          </button>
          <button
            onClick={() => setActiveLayer('aqi')}
            className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all
              ${activeLayer === 'aqi' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
          >
            🌿 AQI
          </button>
        </div>
      </div>

      {/* India Map */}
      <div className="relative h-[220px] rounded-b-2xl overflow-hidden">
        <MapContainer
          center={INDIA_CENTER}
          zoom={4}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          zoomControl={false}
          attributionControl={false}
          className="w-full h-full"
          style={{ background: '#0a1628' }}
        >
          <MapResizer />
          <BoundsEnforcer />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          />

          {/* Wind particles */}
          {activeLayer === 'wind' && (
            <WindCanvas windSpeed={windSpeed} windDirection={windDir} />
          )}

          {/* AQI circles */}
          {activeLayer === 'aqi' && cityAqi.map(city => (
            <CircleMarker
              key={city.name}
              center={[city.lat, city.lon]}
              radius={10}
              pathOptions={{
                fillColor: aqiColor(city.aqi),
                fillOpacity: 0.7,
                color: aqiColor(city.aqi),
                weight: 1.5,
                opacity: 0.9,
              }}
            >
              <Tooltip direction="top" permanent className="aqi-tooltip">
                <span style={{ fontSize: '9px', fontWeight: 700 }}>{city.aqi}</span>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Wind speed overlay badge */}
        {activeLayer === 'wind' && (
          <div className="absolute top-3 right-3 z-[500] bg-white/10 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/15">
            <p className="text-[10px] text-white/50 font-semibold">WIND</p>
            <p className="text-lg font-semibold text-white leading-tight">{windSpeed} <span className="text-[10px] text-white/50">km/h</span></p>
            <p className="text-[10px] text-white/40">{wind?.direction ?? 'N'}</p>
          </div>
        )}

        {/* AQI legend */}
        {activeLayer === 'aqi' && (
          <div className="absolute top-3 right-3 z-[500] bg-white/10 backdrop-blur-md rounded-lg px-2.5 py-2 border border-white/15">
            <p className="text-[9px] text-white/50 font-semibold mb-1">AQI SCALE</p>
            {[
              { c: '#00e400', l: 'Good' },
              { c: '#ffff00', l: 'Moderate' },
              { c: '#ff7e00', l: 'Unhealthy S.' },
              { c: '#ff0000', l: 'Unhealthy' },
              { c: '#8f3f97', l: 'V. Unhealthy' },
            ].map(i => (
              <div key={i.l} className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 rounded-full" style={{ background: i.c }} />
                <span className="text-[8px] text-white/60">{i.l}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
