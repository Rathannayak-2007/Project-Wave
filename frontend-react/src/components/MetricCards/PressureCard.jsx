export default function PressureCard({ data, onClick }) {
  return (
    <div className="glass-card p-4 cursor-pointer group flex flex-col justify-between h-[150px]" onClick={onClick}>
      <div>
        <h3 className="metric-label mb-1 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          PRESSURE
        </h3>
      </div>
      
      <div className="flex flex-col items-center justify-center">
         {/* Simple circular gauge */}
         <div className="relative w-16 h-16 rounded-full border-[4px] border-white/20 border-b-transparent border-l-transparent transform rotate-45 flex items-center justify-center">
            <div className="transform -rotate-45 text-center">
               <p className="text-sm font-medium leading-tight">{data.value}</p>
               <p className="text-[10px] text-white/50">{data.unit}</p>
            </div>
         </div>
      </div>
    </div>
  );
}
