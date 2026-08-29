import ModalSheet from './ModalSheet';

export default function WindModal({ isOpen, onClose, data, dates }) {
  return (
    <ModalSheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title="WIND"
      dates={dates}
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
        </svg>
      }
    >
      <div className="flex gap-8 mb-8">
        <div>
          <p className="text-[40px] font-light leading-none">{data.speed}</p>
          <p className="text-[15px] font-medium text-white/60 mt-1">{data.unit} {data.direction}</p>
          <p className="text-[13px] text-white/50 mt-1">Wind</p>
        </div>
        <div className="w-[1px] bg-white/10" />
        <div>
          <p className="text-[40px] font-light leading-none">{data.gusts}</p>
          <p className="text-[15px] font-medium text-white/60 mt-1">{data.unit}</p>
          <p className="text-[13px] text-white/50 mt-1">Gusts</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-6 flex justify-center items-center h-[240px] mb-6">
        {/* Compass Needle */}
        <div className="relative w-40 h-40 rounded-full border-2 border-white/10 flex items-center justify-center">
          <span className="absolute top-2 text-[10px] font-bold text-white/50">N</span>
          <span className="absolute bottom-2 text-[10px] font-bold text-white/50">S</span>
          <span className="absolute right-2 text-[10px] font-bold text-white/50">E</span>
          <span className="absolute left-2 text-[10px] font-bold text-white/50">W</span>
          
          <div 
            className="w-1 h-32 bg-gradient-to-t from-transparent via-white/20 to-white rounded-full relative shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-transform duration-1000"
            style={{ transform: `rotate(${data.directionDeg}deg)` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
          </div>
        </div>
      </div>
    </ModalSheet>
  );
}
