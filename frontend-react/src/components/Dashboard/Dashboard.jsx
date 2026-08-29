import WeatherHeader from './WeatherHeader';
import HourlyForecast from './HourlyForecast';
import TenDayForecast from './TenDayForecast';

export default function Dashboard({ location, weather }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6">
      <WeatherHeader location={location} />
      <HourlyForecast data={weather.hourlyForecast} />
      <TenDayForecast data={weather.tenDayForecast} />
    </div>
  );
}
