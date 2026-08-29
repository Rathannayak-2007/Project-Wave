export default function MoonPhaseCard({ data, onClick }) {
  return (
    <div className="glass-card p-4 cursor-pointer group flex flex-col justify-between h-[150px]" onClick={onClick}>
      <div>
        <h3 className="metric-label mb-1 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
          MOON PHASE
        </h3>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div>
          <p className="text-xl font-medium">{data.phase}</p>
          <p className="text-sm text-white/70">Illumination: {data.illumination}%</p>
        </div>
        
        {/* CSS Moon */}
        <div className="w-16 h-16 rounded-full relative overflow-hidden bg-gray-200 moon-glow"
             style={{
               boxShadow: 'inset -8px 0 12px rgba(0,0,0,0.5)',
             }}>
           {/* Shadow to create phases */}
           <div className="absolute inset-0 bg-black/60 rounded-full transition-all" 
                style={{ transform: `translateX(${data.illumination}%)` }} />
        </div>
      </div>
    </div>
  );
}
