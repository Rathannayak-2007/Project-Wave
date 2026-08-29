export default function WeatherHeader({ location }) {
  return (
    <div className="text-center py-6 animate-fade-in">
      <h1 className="text-[32px] font-semibold text-white mb-1 tracking-tight">
        {location.name}
      </h1>
      <p className="temp-number text-white">
        {location.temp}°
      </p>
      <p className="text-[17px] text-white/70 font-medium mt-1">
        {location.condition}
      </p>
      <p className="text-[15px] text-white/50 mt-0.5">
        H:{location.high}°  L:{location.low}°
      </p>
    </div>
  );
}
