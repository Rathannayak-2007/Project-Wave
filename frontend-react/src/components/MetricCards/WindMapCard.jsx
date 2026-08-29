export default function WindMapCard({ data, onClick }) {
  return (
    <div className="glass-card p-4 col-span-2 cursor-pointer group" onClick={onClick}>
      <h3 className="metric-label mb-3 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
        </svg>
        WIND MAP
      </h3>

      {/* Dark radar map */}
      <div className="relative rounded-xl overflow-hidden h-[200px]"
           style={{ background: 'linear-gradient(135deg, #0a1628, #132238, #1a3050)' }}>

        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          {[...Array(8)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={`${(i + 1) * 12.5}%`} x2="100%" y2={`${(i + 1) * 12.5}%`}
                  stroke="white" strokeWidth="0.5" />
          ))}
          {[...Array(8)].map((_, i) => (
            <line key={`v${i}`} x1={`${(i + 1) * 12.5}%`} y1="0" x2={`${(i + 1) * 12.5}%`} y2="100%"
                  stroke="white" strokeWidth="0.5" />
          ))}
        </svg>

        {/* Flowing wind animation lines */}
        <svg className="absolute inset-0 w-full h-full">
          <path className="wind-line" d="M 20 40 Q 80 30, 140 45 T 260 35 T 380 50"
                fill="none" stroke="rgba(76,201,240,0.4)" strokeWidth="2" />
          <path className="wind-line" d="M 10 80 Q 100 70, 180 90 T 300 75 T 400 85"
                fill="none" stroke="rgba(76,201,240,0.3)" strokeWidth="1.5"
                style={{ animationDelay: '-1s' }} />
          <path className="wind-line" d="M 30 120 Q 120 100, 200 130 T 320 110 T 420 125"
                fill="none" stroke="rgba(76,201,240,0.35)" strokeWidth="2"
                style={{ animationDelay: '-2s' }} />
          <path className="wind-line" d="M 0 160 Q 90 150, 170 170 T 280 155 T 400 165"
                fill="none" stroke="rgba(76,201,240,0.25)" strokeWidth="1.5"
                style={{ animationDelay: '-0.5s' }} />
          <path className="wind-line" d="M 40 60 Q 130 50, 220 70 T 350 55 T 450 68"
                fill="none" stroke="rgba(58,134,255,0.3)" strokeWidth="1.5"
                style={{ animationDelay: '-1.5s' }} />
        </svg>

        {/* City markers */}
        {[
          { name: 'Hyderabad', x: '40%', y: '25%' },
          { name: 'Rangareddy', x: '45%', y: '35%' },
          { name: 'Vijayawada', x: '70%', y: '45%' },
          { name: 'Bengaluru', x: '35%', y: '80%' },
        ].map(city => (
          <div key={city.name} className="absolute flex items-center gap-1"
               style={{ left: city.x, top: city.y }}>
            <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <span className="text-[9px] text-white/50 font-medium whitespace-nowrap">{city.name}</span>
          </div>
        ))}

        {/* Wind speed pin */}
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/20">
            <span className="text-[11px] font-semibold text-white">{data.speed} km/h</span>
          </div>
        </div>

        {/* Playback timeline */}
        <div className="absolute bottom-0 left-0 right-0 p-2"
             style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.3))' }}>
          <div className="flex items-center gap-2">
            <svg className="w-3 h-3 text-white/50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <div className="flex-1 h-[2px] bg-white/10 rounded-full">
              <div className="h-full w-[40%] bg-accent-cyan/50 rounded-full" />
            </div>
            <span className="text-[9px] text-white/40">12:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
