import ModalSheet from './ModalSheet';

export default function UVModal({ isOpen, onClose, data, dates }) {
  // Build SVG path from hourly UV data
  const hourlyData = data?.hourlyData || [];
  const maxVal = Math.max(...hourlyData, 1);
  const width = 320;
  const height = 140;
  const padding = 10;

  const points = hourlyData.map((val, i) => {
    const x = padding + (i / (hourlyData.length - 1)) * (width - 2 * padding);
    const y = height - padding - (val / maxVal) * (height - 2 * padding);
    return `${x},${y}`;
  });
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <ModalSheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title="UV INDEX"
      dates={dates}
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      }
    >
      <div className="mb-6">
        <p className="text-[40px] font-light">{data?.value ?? 0}</p>
        <p className="text-[17px] text-white/80">{data?.label ?? 'Loading...'}</p>
      </div>

      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <p className="text-sm">{data?.statement ?? ''}</p>
      </div>

      {/* UV Graph */}
      {hourlyData.length > 0 && (
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-[11px] font-semibold text-white/50 mb-3">24-HOUR UV FORECAST</p>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36">
            <defs>
              <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F7A51B" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#F7A51B" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
              <line key={i}
                x1={padding} y1={height - padding - pct * (height - 2*padding)}
                x2={width - padding} y2={height - padding - pct * (height - 2*padding)}
                stroke="rgba(255,255,255,0.08)" strokeWidth="1"
              />
            ))}

            {/* Filled area */}
            <path d={areaPath} fill="url(#uvGradient)" />

            {/* Line */}
            <path d={linePath} fill="none" stroke="#F7A51B" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" />

            {/* Current point */}
            <circle cx={padding} cy={height - padding - (hourlyData[0] / maxVal) * (height - 2*padding)}
                    r="4" fill="#F7A51B" stroke="white" strokeWidth="2" />

            {/* Time labels */}
            {[0, 6, 12, 18, 23].map(i => {
              if (i >= hourlyData.length) return null;
              const x = padding + (i / (hourlyData.length - 1)) * (width - 2*padding);
              return (
                <text key={i} x={x} y={height} fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">
                  {i === 0 ? 'Now' : `+${i}h`}
                </text>
              );
            })}
          </svg>
        </div>
      )}
    </ModalSheet>
  );
}
