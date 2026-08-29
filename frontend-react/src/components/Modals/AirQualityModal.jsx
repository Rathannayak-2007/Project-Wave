import ModalSheet from './ModalSheet';

export default function AirQualityModal({ isOpen, onClose, data, dates }) {
  return (
    <ModalSheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title="AIR QUALITY"
      dates={dates}
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      }
    >
      <div className="mb-6">
        <p className="text-[40px] font-light">{data.index}</p>
        <p className="text-[17px] text-white/80">{data.label} — Primary Pollutant: {data.primaryPollutant}</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
        <p className="text-sm leading-relaxed">{data.healthAdvisory}</p>
      </div>

      <h4 className="text-xs font-semibold text-white/50 mb-3 tracking-wide">POLLUTANTS</h4>
      
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(data.pollutants).map(([key, p]) => (
          <div key={key} className="bg-white/5 rounded-lg p-3">
            <p className="text-white/60 text-xs font-medium mb-1">{p.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl">{p.value}</span>
              <span className="text-[10px] text-white/40">{p.unit}</span>
            </div>
            {/* Tiny progress bar */}
            <div className="w-full h-1 bg-white/10 rounded-full mt-2">
              <div className="h-full bg-accent-cyan rounded-full" style={{ width: `${Math.min(100, p.value * 2)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </ModalSheet>
  );
}
