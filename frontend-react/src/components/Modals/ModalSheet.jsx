import { useEffect } from 'react';

export default function ModalSheet({ isOpen, onClose, title, icon, dates, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer" 
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Sheet Content - Liquid Glass Effect */}
      <div className="relative w-full max-w-[400px] h-[85vh] sm:h-[700px] bg-white/10 backdrop-blur-2xl saturate-[150%] border border-white/20 shadow-2xl rounded-[24px] modal-enter flex flex-col overflow-hidden">
        
        {/* Header (Top Drag Handle area) */}
        <div className="w-full flex justify-center pt-3 pb-1 cursor-grab">
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* Title Bar */}
        <div className="flex justify-between items-center px-5 py-2">
          <h2 className="metric-label flex items-center gap-2 text-white/70">
            {icon && <span className="text-white">{icon}</span>}
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Calendar Bar */}
        {dates && (
          <div className="px-5 py-3 border-b border-white/10 flex justify-between">
            {dates.map((d, i) => (
              <div key={i} className={`flex flex-col items-center ${d.active ? 'text-white' : 'text-white/40'}`}>
                <span className="text-[10px] font-medium uppercase">{d.label}</span>
                <div className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-medium
                  ${d.active ? 'bg-white text-black' : 'transparent'}`}>
                  {d.date}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
