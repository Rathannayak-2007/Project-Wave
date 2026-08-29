import ModalSheet from './ModalSheet';

export default function SunsetModal({ isOpen, onClose, data, dates }) {
  return (
    <ModalSheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title="SUNSET"
      dates={dates}
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      }
    >
      <div className="mb-8">
        <p className="text-[40px] font-light">{data.sunset}</p>
        <p className="text-[17px] text-white/80">Sunset</p>
      </div>

      <div className="bg-white/5 rounded-xl p-5 mb-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <span className="text-white/60">First Light</span>
            <span className="font-medium">{data.firstLight}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <span className="text-white/60">Sunrise</span>
            <span className="font-medium">{data.sunrise}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <span className="text-white/60">Sunset</span>
            <span className="font-medium">{data.sunset}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60">Last Light</span>
            <span className="font-medium">{data.lastLight}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-[11px] font-semibold text-white/50 mb-1">TOTAL DAYLIGHT</p>
          <p className="text-xl font-medium">{data.totalDaylight}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-[11px] font-semibold text-white/50 mb-1">SOLAR NOON</p>
          <p className="text-xl font-medium">{data.solarNoon}</p>
        </div>
      </div>
    </ModalSheet>
  );
}
