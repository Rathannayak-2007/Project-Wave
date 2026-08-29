// ─────────────────────────────────────────────────────────────────────────────
// weatherApi.js — All Open-Meteo API calls (FREE, no API keys)
// ─────────────────────────────────────────────────────────────────────────────

const GEO_BASE    = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_BASE = 'https://api.open-meteo.com/v1/forecast';
const AQI_BASE     = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// ── 1. Geocoding Search ─────────────────────────────────────────────────────
export async function searchPlaces(query) {
  if (!query || query.trim().length < 2) return [];

  const url = `${GEO_BASE}?name=${encodeURIComponent(query)}&count=8&language=en`;
  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  if (!data.results) return [];

  return data.results.map(r => ({
    id: `geo_${r.id}`,
    name: r.name,
    admin1: r.admin1 || '',       // state/province
    country: r.country || '',
    lat: r.latitude,
    lon: r.longitude,
  }));
}


// ── 2. Weather Forecast ─────────────────────────────────────────────────────
export async function fetchWeatherForLocation(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'precipitation',
      'surface_pressure',
      'uv_index',
      'weather_code',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'wind_speed_10m',
      'wind_direction_10m',
      'precipitation',
      'surface_pressure',
      'uv_index',
      'visibility',
      'weather_code',
    ].join(','),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'weather_code',
      'precipitation_sum',
    ].join(','),
    timezone: 'auto',
    forecast_days: 10,
  });

  const res = await fetch(`${WEATHER_BASE}?${params}`);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

  const data = await res.json();
  return parseWeatherResponse(data);
}


// ── 3. Air Quality ──────────────────────────────────────────────────────────
export async function fetchAirQuality(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'us_aqi',
      'pm2_5',
      'pm10',
      'nitrogen_dioxide',
      'sulphur_dioxide',
      'ozone',
      'carbon_monoxide',
    ].join(','),
    hourly: 'us_aqi,pm2_5,pm10',
    timezone: 'auto',
    forecast_days: 1,
  });

  const res = await fetch(`${AQI_BASE}?${params}`);
  if (!res.ok) throw new Error(`AQI API error: ${res.status}`);

  const data = await res.json();
  return parseAqiResponse(data);
}


// ═══════════════════════════════════════════════════════════════════════════
//  PARSERS
// ═══════════════════════════════════════════════════════════════════════════

function parseWeatherResponse(data) {
  const c = data.current || {};
  const h = data.hourly || {};
  const d = data.daily  || {};

  // ── Current conditions ──
  const currentTemp      = Math.round(c.temperature_2m ?? 0);
  const currentHumidity  = Math.round(c.relative_humidity_2m ?? 0);
  const feelsLike        = Math.round(c.apparent_temperature ?? 0);
  const windSpeed        = Math.round(c.wind_speed_10m ?? 0);
  const windDir          = Math.round(c.wind_direction_10m ?? 0);
  const windGusts        = Math.round(c.wind_gusts_10m ?? 0);
  const precipitation    = c.precipitation ?? 0;
  const pressure         = Math.round(c.surface_pressure ?? 1013);
  const uvIndex          = Math.round(c.uv_index ?? 0);
  const weatherCode      = c.weather_code ?? 0;

  // ── Today's daily data ──
  const todayHigh   = Math.round(d.temperature_2m_max?.[0] ?? currentTemp + 2);
  const todayLow    = Math.round(d.temperature_2m_min?.[0] ?? currentTemp - 5);
  const sunrise     = d.sunrise?.[0] || '';
  const sunset      = d.sunset?.[0]  || '';

  // ── Hourly forecast (next 24 hours) ──
  const now = new Date();
  const currentHour = now.getHours();
  const hourlyTimes = h.time || [];
  
  // Find the index of the current hour
  const todayStr = now.toISOString().slice(0, 10);
  let startIdx = hourlyTimes.findIndex(t => t.startsWith(todayStr) && parseInt(t.slice(11, 13)) >= currentHour);
  if (startIdx < 0) startIdx = 0;

  const hourlyForecast = [];
  for (let i = startIdx; i < Math.min(startIdx + 24, hourlyTimes.length); i++) {
    const time = hourlyTimes[i];
    const hour = parseInt(time.slice(11, 13));
    const label = i === startIdx ? 'Now' : formatHour(hour);
    
    hourlyForecast.push({
      time: label,
      icon: weatherCodeToEmoji(h.weather_code?.[i] ?? 0),
      temp: Math.round(h.temperature_2m?.[i] ?? 0),
    });
  }

  // ── Hourly UV data (24h from now) ──
  const hourlyUV = [];
  for (let i = startIdx; i < Math.min(startIdx + 24, hourlyTimes.length); i++) {
    hourlyUV.push(Math.round((h.uv_index?.[i] ?? 0) * 10) / 10);
  }

  // ── Hourly humidity data (24h from now) ──
  const hourlyHumidity = [];
  for (let i = startIdx; i < Math.min(startIdx + 24, hourlyTimes.length); i++) {
    hourlyHumidity.push(Math.round(h.relative_humidity_2m?.[i] ?? 0));
  }

  // ── Hourly visibility data (24h from now) ──
  const hourlyVisibility = [];
  for (let i = startIdx; i < Math.min(startIdx + 24, hourlyTimes.length); i++) {
    hourlyVisibility.push(Math.round((h.visibility?.[i] ?? 10000) / 1000)); // m → km
  }

  // ── 10-day forecast ──
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const tenDayForecast = [];
  const numDays = Math.min(10, d.temperature_2m_max?.length ?? 0);
  for (let i = 0; i < numDays; i++) {
    const date = new Date(d.sunrise?.[i] || new Date());
    tenDayForecast.push({
      day: i === 0 ? 'Today' : dayNames[date.getDay()],
      icon: weatherCodeToEmoji(d.weather_code?.[i] ?? 0),
      low: Math.round(d.temperature_2m_min?.[i] ?? 0),
      high: Math.round(d.temperature_2m_max?.[i] ?? 0),
      precipChance: d.precipitation_sum?.[i] > 0 ? `${Math.round(d.precipitation_sum[i])}mm` : null,
    });
  }

  // ── Sunset/Sunrise data ──
  const sunriseTime = sunrise ? formatTime(sunrise) : '6:00 AM';
  const sunsetTime  = sunset  ? formatTime(sunset)  : '6:30 PM';
  
  // Calculate daylight
  let totalDaylight = '';
  if (sunrise && sunset) {
    const sr = new Date(sunrise);
    const ss = new Date(sunset);
    const diffMs = ss - sr;
    const hours = Math.floor(diffMs / 3600000);
    const mins  = Math.round((diffMs % 3600000) / 60000);
    totalDaylight = `${hours}h ${mins}m`;
  }

  // ── Calendar dates for modals ──
  const calendarDates = [];
  for (let i = -3; i <= 4; i++) {
    const d2 = new Date();
    d2.setDate(d2.getDate() + i);
    calendarDates.push({
      label: dayNames[d2.getDay()],
      date: d2.getDate(),
      active: i === 0,
    });
  }

  return {
    // Location header
    temp: currentTemp,
    high: todayHigh,
    low: todayLow,
    condition: weatherCodeToLabel(weatherCode),
    conditionIcon: weatherCodeToEmoji(weatherCode),

    // Forecasts
    hourlyForecast,
    tenDayForecast,

    // Wind
    wind: {
      speed: windSpeed,
      unit: 'km/h',
      direction: degreesToCompass(windDir),
      directionDeg: windDir,
      gusts: windGusts,
    },

    // UV Index
    uvIndex: {
      value: uvIndex,
      label: uvLabel(uvIndex),
      maxToday: Math.round(d.uv_index_max?.[0] ?? uvIndex),
      hourlyData: hourlyUV,
      statement: uvStatement(uvIndex),
    },

    // Sunset / Sunrise
    sunset: {
      sunrise: sunriseTime,
      sunset: sunsetTime,
      firstLight: offsetTime(sunrise, -20),
      lastLight: offsetTime(sunset, 20),
      totalDaylight,
      solarNoon: solarNoonCalc(sunrise, sunset),
    },

    // Humidity
    humidity: {
      value: currentHumidity,
      dewPoint: Math.round(currentTemp - ((100 - currentHumidity) / 5)), // approx
      description: `The dew point is ${Math.round(currentTemp - ((100 - currentHumidity) / 5))}° right now.`,
      hourlyData: hourlyHumidity,
      dailySummary: `Humidity ranges from ${Math.min(...hourlyHumidity)}% to ${Math.max(...hourlyHumidity)}% today.`,
    },

    // Visibility
    visibility: {
      value: hourlyVisibility[0] || 10,
      unit: 'km',
      description: visibilityDescription(hourlyVisibility[0] || 10),
      hourlyData: hourlyVisibility,
    },

    // Pressure
    pressure: {
      value: pressure,
      unit: 'hPa',
      trend: 'steady',
      description: pressureDescription(pressure),
    },

    // Feels Like
    feelsLike: {
      value: feelsLike,
      description: feelsLikeDescription(feelsLike, currentTemp),
      humidity: currentHumidity,
      wind: windSpeed,
    },

    // Calendar dates
    calendarDates,

    // Raw for map
    _raw: {
      windSpeed,
      windDir,
      precipitation,
    },
  };
}


function parseAqiResponse(data) {
  const c = data.current || {};
  const h = data.hourly  || {};

  const aqiValue = Math.round(c.us_aqi ?? 0);

  // Build hourly AQI (24 data points)
  const hourlyAqi = (h.us_aqi || []).slice(0, 24).map(v => Math.round(v ?? 0));

  return {
    index: aqiValue,
    label: aqiLabel(aqiValue),
    category: aqiCategory(aqiValue),
    pollutants: {
      pm25: { value: Math.round((c.pm2_5 ?? 0) * 10) / 10, unit: 'µg/m³', label: 'PM2.5' },
      pm10: { value: Math.round((c.pm10 ?? 0) * 10) / 10, unit: 'µg/m³', label: 'PM10' },
      no2:  { value: Math.round((c.nitrogen_dioxide ?? 0) * 10) / 10, unit: 'µg/m³', label: 'NO₂' },
      so2:  { value: Math.round((c.sulphur_dioxide ?? 0) * 10) / 10, unit: 'µg/m³', label: 'SO₂' },
      ozone:{ value: Math.round((c.ozone ?? 0) * 10) / 10, unit: 'µg/m³', label: 'Ozone' },
      co:   { value: Math.round((c.carbon_monoxide ?? 0) * 10) / 10, unit: 'µg/m³', label: 'CO' },
    },
    primaryPollutant: determinePrimaryPollutant(c),
    healthAdvisory: aqiAdvisory(aqiValue),
    hourlyData: hourlyAqi,
  };
}


// ═══════════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function formatHour(h) {
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

function formatTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function offsetTime(isoStr, minutes) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  d.setMinutes(d.getMinutes() + minutes);
  return formatTime(d.toISOString());
}

function solarNoonCalc(sunrise, sunset) {
  if (!sunrise || !sunset) return '12:00 PM';
  const sr = new Date(sunrise);
  const ss = new Date(sunset);
  const mid = new Date((sr.getTime() + ss.getTime()) / 2);
  return formatTime(mid.toISOString());
}

function degreesToCompass(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function weatherCodeToEmoji(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌦️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  return '⛈️';
}

function weatherCodeToLabel(code) {
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain Showers';
  if (code <= 86) return 'Snow Showers';
  return 'Thunderstorm';
}

function uvLabel(val) {
  if (val <= 2) return 'Low';
  if (val <= 5) return 'Moderate';
  if (val <= 7) return 'High';
  if (val <= 10) return 'Very High';
  return 'Extreme';
}

function uvStatement(val) {
  if (val <= 2) return 'Low UV levels. No protection needed.';
  if (val <= 5) return 'Moderate UV. Wear sunscreen if outside for extended periods.';
  if (val <= 7) return 'High UV. Seek shade during midday hours. Sunscreen recommended.';
  if (val <= 10) return 'Very high UV. Avoid sun exposure between 10 AM and 4 PM.';
  return 'Extreme UV. Stay indoors during peak hours.';
}

function visibilityDescription(km) {
  if (km >= 20) return 'Perfectly clear view';
  if (km >= 10) return 'Good visibility';
  if (km >= 5) return 'Moderate visibility';
  if (km >= 2) return 'Poor visibility';
  return 'Very poor visibility — fog or haze';
}

function pressureDescription(hpa) {
  if (hpa >= 1020) return 'High pressure — clear skies likely.';
  if (hpa >= 1010) return 'Normal atmospheric pressure.';
  if (hpa >= 1000) return 'Slightly low pressure.';
  return 'Low pressure — storms possible.';
}

function feelsLikeDescription(feels, actual) {
  const diff = feels - actual;
  if (Math.abs(diff) <= 2) return 'Similar to the actual temperature.';
  if (diff > 0) return `Humidity is making it feel warmer.`;
  return `Wind is making it feel cooler.`;
}

function aqiLabel(val) {
  if (val <= 50)  return 'Good';
  if (val <= 100) return 'Moderate';
  if (val <= 150) return 'Unhealthy for Sensitive Groups';
  if (val <= 200) return 'Unhealthy';
  if (val <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function aqiCategory(val) {
  if (val <= 50)  return 1;
  if (val <= 100) return 2;
  if (val <= 150) return 3;
  if (val <= 200) return 4;
  if (val <= 300) return 5;
  return 6;
}

function aqiAdvisory(val) {
  if (val <= 50) return 'Air quality is satisfactory and poses little or no health risk.';
  if (val <= 100) return 'Air quality is acceptable. Some pollutants may be a concern for unusually sensitive individuals.';
  if (val <= 150) return 'Members of sensitive groups may experience health effects. General public is less likely to be affected.';
  if (val <= 200) return 'Everyone may begin to experience health effects. Sensitive groups may experience more serious effects.';
  if (val <= 300) return 'Health alert: The risk of health effects is increased for everyone.';
  return 'Health warning of emergency conditions. Everyone is likely to be affected.';
}

function determinePrimaryPollutant(current) {
  const pollutants = {
    'PM2.5': current.pm2_5 ?? 0,
    'PM10': current.pm10 ?? 0,
    'NO₂': current.nitrogen_dioxide ?? 0,
    'Ozone': current.ozone ?? 0,
  };
  return Object.entries(pollutants).sort((a, b) => b[1] - a[1])[0][0];
}

// ── AQI color helper (used by map overlay) ──
export function aqiColor(val) {
  if (val <= 50)  return '#00e400'; // green
  if (val <= 100) return '#ffff00'; // yellow
  if (val <= 150) return '#ff7e00'; // orange
  if (val <= 200) return '#ff0000'; // red
  if (val <= 300) return '#8f3f97'; // purple
  return '#7e0023';                 // maroon
}
