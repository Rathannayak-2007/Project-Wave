import { useState, useEffect, useCallback } from 'react';
import { fetchWeatherForLocation, fetchAirQuality, searchPlaces } from '../services/weatherApi';

// Default locations (shown on first load)
const DEFAULT_LOCATIONS = [
  { id: 'rangareddy',  name: 'Rangareddy',  lat: 17.3616, lon: 78.4747, admin1: 'Telangana' },
  { id: 'mangalpalle', name: 'Mangalpalle', lat: 17.25,   lon: 78.55,   admin1: 'Telangana' },
  { id: 'hyderabad',   name: 'Hyderabad',   lat: 17.385,  lon: 78.4867, admin1: 'Telangana' },
  { id: 'vijayawada',  name: 'Vijayawada',  lat: 16.5062, lon: 80.6480, admin1: 'Andhra Pradesh' },
  { id: 'bengaluru',   name: 'Bengaluru',   lat: 12.9716, lon: 77.5946, admin1: 'Karnataka' },
];

export function useWeatherData() {
  const [locations, setLocations]             = useState(DEFAULT_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_LOCATIONS[0]);
  const [weather, setWeather]                 = useState(null);
  const [airQuality, setAirQuality]           = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);

  // ── Fetch live data whenever the selected location changes ──
  const fetchDataForLocation = useCallback(async (loc) => {
    try {
      setRefreshing(true);

      // Fetch weather and air quality in parallel
      const [weatherData, aqiData] = await Promise.all([
        fetchWeatherForLocation(loc.lat, loc.lon),
        fetchAirQuality(loc.lat, loc.lon),
      ]);

      setWeather(weatherData);
      setAirQuality(aqiData);

      // Update the location card with live temp/condition
      setLocations(prev =>
        prev.map(l =>
          l.id === loc.id
            ? { ...l, temp: weatherData.temp, condition: weatherData.condition, conditionIcon: weatherData.conditionIcon }
            : l
        )
      );
    } catch (err) {
      console.error('Failed to fetch weather data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ── On mount: fetch data for the default location ──
  useEffect(() => {
    fetchDataForLocation(selectedLocation);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Select a location ──
  const selectLocation = useCallback((id) => {
    const loc = locations.find(l => l.id === id);
    if (loc) {
      setSelectedLocation(loc);
      fetchDataForLocation(loc);
    }
  }, [locations, fetchDataForLocation]);

  // ── Add a new location (from search) ──
  const addLocation = useCallback((place) => {
    // Avoid duplicates
    const exists = locations.find(l => l.id === place.id);
    if (!exists) {
      setLocations(prev => [...prev, place]);
    }
    setSelectedLocation(place);
    fetchDataForLocation(place);
  }, [locations, fetchDataForLocation]);

  // ── Build the combined weather object that components consume ──
  const combinedWeather = weather ? {
    ...weather,
    airQuality: airQuality || {
      index: 0, label: 'Loading...', category: 0,
      pollutants: {}, primaryPollutant: '-',
      healthAdvisory: '', hourlyData: [],
    },
    // Moon phase (computed from date — no API needed)
    moonPhase: computeMoonPhase(),
  } : null;

  return {
    selectedLocation: {
      ...selectedLocation,
      temp: weather?.temp ?? selectedLocation.temp ?? '--',
      condition: weather?.condition ?? 'Loading...',
      conditionIcon: weather?.conditionIcon ?? '⏳',
      high: weather?.high ?? '--',
      low: weather?.low ?? '--',
    },
    locations,
    selectLocation,
    addLocation,
    searchPlaces,      // expose the API function directly
    weather: combinedWeather,
    loading,
    refreshing,
  };
}

// ── Simple moon phase calculator (no API needed) ──
function computeMoonPhase() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Conway's moon phase approximation
  let r = year % 100;
  r %= 19;
  if (r > 9) r -= 19;
  r = ((r * 11) % 30) + month + day;
  if (month < 3) r += 2;
  r -= ((year < 2000) ? 4 : 8.3);
  r = Math.floor(r + 0.5) % 30;
  if (r < 0) r += 30;

  const illumination = Math.round(Math.abs((r - 15) / 15) * 100);

  let phase;
  if (r === 0) phase = 'New Moon';
  else if (r < 7) phase = 'Waxing Crescent';
  else if (r === 7) phase = 'First Quarter';
  else if (r < 15) phase = 'Waxing Gibbous';
  else if (r === 15) phase = 'Full Moon';
  else if (r < 22) phase = 'Waning Gibbous';
  else if (r === 22) phase = 'Last Quarter';
  else phase = 'Waning Crescent';

  return {
    phase,
    illumination: r <= 15 ? Math.round((r / 15) * 100) : Math.round((1 - (r - 15) / 15) * 100),
    moonrise: '6:48 PM', // Would need a separate API for precise values
    moonset: '5:52 AM',
  };
}
