export default function HourlyForecast({ data }) {
  return (
    <div className="glass-card p-4 mb-4 animate-fade-in">
      <div className="hourly-scroll flex gap-0">
        {data.map((hour, i) => (
          <div key={i} className="flex flex-col items-center flex-shrink-0 px-3 py-2 min-w-[60px]">
            <span className="text-[11px] font-medium text-white/50 mb-2">
              {hour.time}
            </span>

            {hour.isSunset ? (
              <div className="flex flex-col items-center">
                <span className="text-[22px] mb-1">{hour.icon}</span>
                <span className="text-[10px] text-amber-400/70 font-medium">Sunset</span>
                <span className="text-[10px] text-white/40">{hour.sunsetTime}</span>
              </div>
            ) : (
              <>
                <span className="text-[22px] mb-2">{hour.icon}</span>
                <span className="text-[14px] font-medium text-white">{hour.temp}°</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
