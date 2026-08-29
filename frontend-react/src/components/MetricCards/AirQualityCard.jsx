export default function AirQualityCard({ data, onClick }) {
  const markerPosition = `${(data.index / 500) * 100}%`;

  return (
    <div className="glass-card p-4 cursor-pointer group flex flex-col justify-between h-[150px]" onClick={onClick}>
      <div>
        <h3 className="metric-label mb-1 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          AIR QUALITY
        </h3>
        <p className="text-xl font-medium">{data.index} - {data.label}</p>
      </div>

      <div className="mt-4">
        <div className="h-1.5 w-full aqi-gradient relative rounded-full">
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-gray-400 rounded-full shadow"
            style={{ left: markerPosition }}
          />
        </div>
      </div>
    </div>
  );
}
