import { useState } from 'react';
import { useWeatherData } from './hooks/useWeatherData';

import SkyBackground from './components/SkyBackground';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import MetricGrid from './components/MetricCards/MetricGrid';

// Modals
import HumidityModal from './components/Modals/HumidityModal';
import AirQualityModal from './components/Modals/AirQualityModal';
import SunsetModal from './components/Modals/SunsetModal';
import VisibilityModal from './components/Modals/VisibilityModal';
import UVModal from './components/Modals/UVModal';

export default function App() {
  const { 
    selectedLocation, 
    locations, 
    selectLocation, 
    addLocation,
    searchPlaces,
    weather,
    loading,
    refreshing,
  } = useWeatherData();

  const [activeModal, setActiveModal] = useState(null);

  if (loading || !weather) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white/60 rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Fetching live weather data...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative flex">
      {/* Background layer */}
      <SkyBackground />

      {/* Refreshing indicator */}
      {refreshing && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/70 text-xs font-medium flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          Updating...
        </div>
      )}

      {/* Main Content Layer */}
      <div className="relative z-10 w-full h-full flex">
        
        {/* Left Sidebar */}
        <Sidebar 
          locations={locations} 
          selectedId={selectedLocation.id} 
          onSelectLocation={selectLocation}
          onAddLocation={addLocation}
          searchPlaces={searchPlaces}
        />

        {/* Center Dashboard */}
        <div className="flex-1 overflow-hidden">
          <Dashboard 
            location={selectedLocation} 
            weather={weather} 
          />
        </div>

        {/* Right: Metric Grid (always visible, India map is embedded inside) */}
        <MetricGrid 
          weather={weather} 
          onOpenModal={setActiveModal} 
        />
      </div>

      {/* Modals */}
      <HumidityModal 
        isOpen={activeModal === 'humidity'} 
        onClose={() => setActiveModal(null)}
        data={weather.humidity}
        dates={weather.calendarDates}
      />
      <AirQualityModal 
        isOpen={activeModal === 'aqi'} 
        onClose={() => setActiveModal(null)}
        data={weather.airQuality}
        dates={weather.calendarDates}
      />
      <SunsetModal 
        isOpen={activeModal === 'sunset'} 
        onClose={() => setActiveModal(null)}
        data={weather.sunset}
        dates={weather.calendarDates}
      />
      <VisibilityModal 
        isOpen={activeModal === 'visibility'} 
        onClose={() => setActiveModal(null)}
        data={weather.visibility}
        dates={weather.calendarDates}
      />
      <UVModal 
        isOpen={activeModal === 'uv'} 
        onClose={() => setActiveModal(null)}
        data={weather.uvIndex}
        dates={weather.calendarDates}
      />
    </div>
  );
}
