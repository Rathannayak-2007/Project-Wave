export default function HumidityCard({ data, onClick }) {
  return (
    <div className="glass-card p-4 cursor-pointer group flex flex-col justify-between h-[150px]" onClick={onClick}>
      <div>
        <h3 className="metric-label mb-1 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          HUMIDITY
        </h3>
        <p className="text-3xl font-medium">{data.value}%</p>
      </div>

      <div className="mt-2">
        <p className="text-[13px] text-white/80 leading-snug">{data.description}</p>
      </div>
    </div>
  );
}
