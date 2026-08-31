import IndiaMapCard from './IndiaMapCard';
import HeatAlertCard from './HeatAlertCard';
import AdminReportCard from './AdminReportCard';
import AirQualityCard from './AirQualityCard';
import UVIndexCard from './UVIndexCard';
import SunsetCard from './SunsetCard';
import MoonPhaseCard from './MoonPhaseCard';
import HumidityCard from './HumidityCard';
import VisibilityCard from './VisibilityCard';
import PressureCard from './PressureCard';
import FeelsLikeCard from './FeelsLikeCard';

export default function MetricGrid({ weather, onOpenModal }) {
  return (
    <div className="h-full overflow-y-auto px-4 pb-6 pr-6 w-[420px] min-w-[420px]">
      <div className="grid grid-cols-2 gap-4 auto-rows-min">
        {/* Heat Alert System — always visible, full width */}
        <HeatAlertCard weather={weather} />

        {/* India Map takes full width */}
        <IndiaMapCard wind={weather.wind} airQuality={weather.airQuality} onClick={() => onOpenModal('wind')} />
        
        {/* Rest are 2-col grid */}
        <AirQualityCard data={weather.airQuality} onClick={() => onOpenModal('aqi')} />
        <UVIndexCard data={weather.uvIndex} onClick={() => onOpenModal('uv')} />
        <SunsetCard data={weather.sunset} onClick={() => onOpenModal('sunset')} />
        <MoonPhaseCard data={weather.moonPhase} onClick={() => onOpenModal('moon')} />
        <HumidityCard data={weather.humidity} onClick={() => onOpenModal('humidity')} />
        <VisibilityCard data={weather.visibility} onClick={() => onOpenModal('visibility')} />
        <PressureCard data={weather.pressure} onClick={() => onOpenModal('pressure')} />
        <FeelsLikeCard data={weather.feelsLike} onClick={() => onOpenModal('feelsLike')} />

        {/* Admin Weather Reports — always visible, full width */}
        <AdminReportCard />
      </div>
    </div>
  );
}

