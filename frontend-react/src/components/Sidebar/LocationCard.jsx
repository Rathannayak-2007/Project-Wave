export default function LocationCard({ location, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(location.id)}
      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border
                  ${isActive
                    ? 'glass-card-active bg-white/[0.14]'
                    : 'glass-card bg-white/[0.06] hover:bg-white/[0.1]'
                  }`}
      style={{
        borderColor: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-white truncate">
              {location.name}
            </h3>
          </div>
          {location.label && (
            <p className="text-[11px] text-white/40 mt-0.5 font-medium">{location.label}</p>
          )}
          <p className="text-[12px] text-white/50 mt-1">{location.condition}</p>
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          <p className="text-[28px] font-light text-white leading-none">{location.temp}°</p>
        </div>
      </div>
    </button>
  );
}
