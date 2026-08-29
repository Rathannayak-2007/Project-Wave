// Mock weather data for Rangareddy / Hyderabad region
// Used for cards that go beyond the current backend API

const mockWeatherData = {
  locations: [
    {
      id: "rangareddy",
      name: "Rangareddy",
      label: "My Location",
      temp: 28,
      high: 30,
      low: 23,
      condition: "Partly Cloudy",
      conditionIcon: "⛅",
      lat: 17.3616,
      lon: 78.4747,
      active: true,
    },
    {
      id: "mangalpalle",
      name: "Mangalpalle",
      temp: 28,
      high: 31,
      low: 22,
      condition: "Mostly Sunny",
      conditionIcon: "🌤️",
      lat: 17.25,
      lon: 78.55,
    },
    {
      id: "hyderabad",
      name: "Hyderabad",
      temp: 29,
      high: 32,
      low: 24,
      condition: "Hazy",
      conditionIcon: "🌫️",
      lat: 17.385,
      lon: 78.4867,
    },
    {
      id: "vijayawada",
      name: "Vijayawada",
      temp: 31,
      high: 34,
      low: 26,
      condition: "Sunny",
      conditionIcon: "☀️",
      lat: 16.5062,
      lon: 80.6480,
    },
    {
      id: "bengaluru",
      name: "Bengaluru",
      temp: 24,
      high: 27,
      low: 20,
      condition: "Rainy",
      conditionIcon: "🌧️",
      lat: 12.9716,
      lon: 77.5946,
    },
  ],

  // Hourly forecast for the selected location (Rangareddy)
  hourlyForecast: [
    { time: "Now",   icon: "⛅", temp: 28 },
    { time: "1 PM",  icon: "🌤️", temp: 29 },
    { time: "2 PM",  icon: "☀️",  temp: 30 },
    { time: "3 PM",  icon: "☀️",  temp: 30 },
    { time: "4 PM",  icon: "🌤️", temp: 29 },
    { time: "5 PM",  icon: "⛅", temp: 28 },
    { time: "6 PM",  icon: "🌅", temp: 27, isSunset: true, sunsetTime: "6:33 PM" },
    { time: "7 PM",  icon: "🌙", temp: 26 },
    { time: "8 PM",  icon: "🌙", temp: 25 },
    { time: "9 PM",  icon: "🌙", temp: 25 },
    { time: "10 PM", icon: "🌙", temp: 24 },
    { time: "11 PM", icon: "🌙", temp: 24 },
    { time: "12 AM", icon: "🌙", temp: 23 },
    { time: "1 AM",  icon: "🌙", temp: 23 },
    { time: "2 AM",  icon: "🌙", temp: 23 },
    { time: "3 AM",  icon: "🌙", temp: 23 },
    { time: "4 AM",  icon: "🌙", temp: 23 },
    { time: "5 AM",  icon: "🌙", temp: 23 },
    { time: "6 AM",  icon: "🌅", temp: 24 },
    { time: "7 AM",  icon: "🌤️", temp: 25 },
  ],

  // 10-day forecast
  tenDayForecast: [
    { day: "Today",     icon: "⛅",  low: 23, high: 30, condition: "Partly Cloudy" },
    { day: "Sat",       icon: "🌤️", low: 22, high: 31, condition: "Mostly Sunny" },
    { day: "Sun",       icon: "☀️",  low: 23, high: 32, condition: "Sunny" },
    { day: "Mon",       icon: "⛅",  low: 24, high: 30, condition: "Partly Cloudy" },
    { day: "Tue",       icon: "🌧️", low: 22, high: 28, condition: "Scattered Rain" },
    { day: "Wed",       icon: "🌧️", low: 21, high: 27, condition: "Rainy" },
    { day: "Thu",       icon: "⛈️",  low: 21, high: 26, condition: "Thunderstorm" },
    { day: "Fri",       icon: "🌤️", low: 22, high: 29, condition: "Mostly Sunny" },
    { day: "Sat",       icon: "☀️",  low: 23, high: 31, condition: "Sunny" },
    { day: "Sun",       icon: "⛅",  low: 23, high: 30, condition: "Partly Cloudy" },
  ],

  // Metric card data
  wind: {
    speed: 17,
    unit: "km/h",
    direction: "W",
    directionDeg: 270,
    gusts: 22,
    hourlyData: [12, 14, 15, 17, 18, 16, 14, 13, 11, 12, 14, 15, 17, 19, 21, 22, 20, 18, 16, 14, 13, 12, 11, 10],
  },

  airQuality: {
    index: 54,
    label: "Satisfactory",
    category: 2, // 1-6 scale
    pollutants: {
      pm25: { value: 22, unit: "µg/m³", label: "PM2.5" },
      pm10: { value: 45, unit: "µg/m³", label: "PM10" },
      ammonia: { value: 18, unit: "ppb", label: "Ammonia" },
      co: { value: 505, unit: "ppb", label: "Carbon Monoxide" },
      no2: { value: 12, unit: "ppb", label: "NO₂" },
      no: { value: 8, unit: "ppb", label: "NO" },
      ozone: { value: 38, unit: "ppb", label: "Ozone" },
      so2: { value: 5, unit: "ppb", label: "SO₂" },
    },
    primaryPollutant: "PM2.5",
    healthAdvisory: "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.",
    hourlyData: [48, 50, 52, 54, 55, 53, 51, 50, 48, 46, 45, 47, 50, 52, 54, 56, 58, 57, 55, 53, 51, 49, 48, 47],
  },

  uvIndex: {
    value: 0,
    label: "Low",
    maxToday: 8,
    hourlyData: [0, 0, 0, 0, 0, 0, 1, 2, 4, 6, 7, 8, 8, 7, 6, 4, 2, 1, 0, 0, 0, 0, 0, 0],
    statement: "UV index will be moderate to high during midday hours tomorrow.",
  },

  sunset: {
    sunrise: "6:02 AM",
    sunset: "6:33 PM",
    firstLight: "5:40 AM",
    lastLight: "6:55 PM",
    totalDaylight: "12h 33m",
    solarNoon: "12:17 PM",
    remainingDaylight: "5h 12m",
    sunriseTimestamp: 6.03,
    sunsetTimestamp: 18.55,
  },

  moonPhase: {
    phase: "Full Moon",
    illumination: 97,
    moonrise: "6:48 PM",
    moonset: "5:52 AM",
    nextNewMoon: "Sep 7",
    age: 14.2,
  },

  humidity: {
    value: 65,
    dewPoint: 21,
    description: "The dew point is 21° right now.",
    hourlyData: [72, 70, 68, 65, 62, 60, 58, 56, 55, 54, 55, 57, 60, 62, 65, 68, 70, 72, 74, 75, 74, 73, 72, 71],
    dailySummary: "Humidity levels are comfortable, ranging from 54% to 75% throughout the day.",
  },

  visibility: {
    value: 21,
    unit: "km",
    description: "Perfectly clear view",
    hourlyData: [18, 19, 20, 21, 22, 23, 24, 24, 23, 22, 21, 21, 21, 22, 22, 21, 20, 19, 18, 17, 17, 18, 18, 19],
    comparison: "Similar to yesterday's visibility range.",
  },

  pressure: {
    value: 1009,
    unit: "hPa",
    trend: "steady",
    description: "Atmospheric pressure is normal.",
  },

  feelsLike: {
    value: 28,
    description: "Similar to the actual temperature.",
    humidity: 65,
    wind: 17,
  },

  // Calendar dates for modal header
  calendarDates: [
    { label: "Mon", date: 25, active: false },
    { label: "Tue", date: 26, active: false },
    { label: "Wed", date: 27, active: false },
    { label: "Thu", date: 28, active: false },
    { label: "Fri", date: 29, active: true },
    { label: "Sat", date: 30, active: false },
    { label: "Sun", date: 31, active: false },
    { label: "Mon", date: 1,  active: false },
  ],
};

export default mockWeatherData;
