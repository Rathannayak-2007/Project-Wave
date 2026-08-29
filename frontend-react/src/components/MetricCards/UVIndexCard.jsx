export default function UVIndexCard({ data, onClick }) {
  const percentage = (data.value / 11) * 100;
  
  return (
    <div className="glass-card p-4 cursor-pointer group flex flex-col justify-between h-[150px]" onClick={onClick}>
      <div>
        <h3 className="metric-label mb-1 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
          UV INDEX
        </h3>
        <p className="text-2xl font-medium">{data.value}</p>
        <p className="text-lg">{data.label}</p>
      </div>

      <div className="mt-2 w-full h-1.5 gradient-bar relative">
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-gray-400 rounded-full shadow"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
