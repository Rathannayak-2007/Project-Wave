export default function TenDayForecast({ data }) {
  // Find overall min/max across all days to normalize the gradient bars
  const allLows = data.map(d => d.low);
  const allHighs = data.map(d => d.high);
  const overallMin = Math.min(...allLows);
  const overallMax = Math.max(...allHighs);
  const range = overallMax - overallMin || 1;

  return (
    <div className="glass-card p-4 animate-fade-in">
      <h3 className="metric-label mb-3 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        10-DAY FORECAST
      </h3>
      <div className="space-y-0">
        {data.map((day, i) => {
          const leftPct = ((day.low - overallMin) / range) * 100;
          const widthPct = ((day.high - day.low) / range) * 100;

          return (
            <div key={i}
                 className="flex items-center py-2.5 border-b border-white/5 last:border-b-0">
              {/* Day name */}
              <span className="w-[52px] text-[13px] font-medium text-white/70 flex-shrink-0">
                {day.day}
              </span>

              {/* Weather icon */}
              <span className="w-[32px] text-center text-[18px] flex-shrink-0">
                {day.icon}
              </span>

              {/* Low temp */}
              <span className="w-[32px] text-right text-[13px] text-white/40 font-medium flex-shrink-0 mr-3">
                {day.low}°
              </span>

              {/* Gradient range bar */}
              <div className="flex-1 h-[4px] rounded-full bg-white/5 relative mx-1">
                <div
                  className="absolute top-0 h-full rounded-full"
                  style={{
                    left: `${leftPct}%`,
                    width: `${Math.max(widthPct, 8)}%`,
                    background: 'linear-gradient(90deg, #4CC9F0, #F7A51B, #F72585)',
                  }}
                />
              </div>

              {/* High temp */}
              <span className="w-[32px] text-left text-[13px] text-white font-medium flex-shrink-0 ml-3">
                {day.high}°
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
