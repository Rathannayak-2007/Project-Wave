import { useState } from 'react';
import { useWeatherData } from './hooks/useWeatherData';
import { useHeatAlerts } from './hooks/useHeatAlerts';

import SkyBackground from './components/SkyBackground';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import MetricGrid from './components/MetricCards/MetricGrid';
import FullWindMap from './components/FullWindMap';
import HeatAlertBanner from './components/HeatAlertBanner';

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
  const [showWindMap, setShowWindMap] = useState(false);

  // ── Heat alert system ──
  const { alertActive, severity, message, temp, dismiss } = useHeatAlerts(
    weather,
    selectedLocation?.name || 'your area'
  );

  // Handle modal open — special case for 'wind' to open the half-screen map
  const handleOpenModal = (modalName) => {
    if (modalName === 'wind') {
      setShowWindMap(true);
    } else {
      setActiveModal(modalName);
    }
  };

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
      {/* Heat Alert Banner — slides down from top when temp ≥ 45°C */}
      <HeatAlertBanner
        alertActive={alertActive}
        severity={severity}
        message={message}
        temp={temp}
        onDismiss={dismiss}
      />

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
          onOpenModal={handleOpenModal} 
        />
      </div>

      {/* Half-screen India Map Panel */}
      {showWindMap && (
        <div className="fixed inset-0 z-50 flex">
          {/* Left backdrop — click to close */}
          <div 
            className="w-1/2 bg-black/40 backdrop-blur-sm cursor-pointer"
            onClick={() => setShowWindMap(false)} 
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          />
          {/* Right half — expanded map */}
          <div className="w-1/2 h-full" style={{ animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <FullWindMap 
              location={selectedLocation} 
              weather={weather} 
              onClose={() => setShowWindMap(false)} 
            />
          </div>
        </div>
      )}

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

