export default function SunsetCard({ data, onClick }) {
  return (
    <div className="glass-card p-4 cursor-pointer group flex flex-col justify-between h-[150px]" onClick={onClick}>
      <div>
        <h3 className="metric-label mb-1 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
          SUNSET
        </h3>
        <p className="text-2xl font-medium">{data.sunset}</p>
      </div>

      <div className="relative h-12 w-full mt-2">
         {/* Sine wave representing sun path */}
         <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
            <path d="M 0 40 Q 50 -20 100 40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            <path d="M 0 40 Q 50 -20 100 40" fill="none" stroke="#F7A51B" strokeWidth="2" strokeDasharray="100 100" strokeDashoffset="40" />
            
            {/* Sun marker */}
            <circle cx="65" cy="12" r="4" fill="white" />
            
            {/* Horizon line */}
            <line x1="0" y1="40" x2="100" y2="40" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
         </svg>
         <p className="text-[11px] text-white/70 mt-1">Sunrise: {data.sunrise}</p>
      </div>
    </div>
  );
}
