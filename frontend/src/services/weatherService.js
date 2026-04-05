const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_BASE_URL = "https://api.open-meteo.com/v1/forecast";

const weatherCodeMap = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

export const searchWeatherLocations = async (query) => {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return [];
  }

  const url = new URL(GEOCODING_BASE_URL);
  url.searchParams.set("name", trimmedQuery);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString());
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.reason || payload.message || "Unable to search locations.");
  }

  return (payload.results || []).map((item) => ({
    id: `${item.latitude}-${item.longitude}-${item.name}`,
    name: item.name,
    country: item.country,
    admin1: item.admin1,
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone,
  }));
};

export const getWeatherForecast = async ({ latitude, longitude, days = 3, locationLabel }) => {
  const url = new URL(FORECAST_BASE_URL);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "wind_speed_10m_max",
    ].join(",")
  );
  url.searchParams.set("current", ["temperature_2m", "relative_humidity_2m", "wind_speed_10m", "weather_code"].join(","));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", String(days));

  const response = await fetch(url.toString());
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.reason || payload.message || "Unable to fetch weather forecast.");
  }

  const daily = payload.daily || {};
  const current = payload.current || {};
  const items = (daily.time || []).map((date, index) => ({
    date,
    weatherCode: daily.weather_code?.[index],
    summary: weatherCodeMap[daily.weather_code?.[index]] || "Weather update",
    maxTemp: daily.temperature_2m_max?.[index],
    minTemp: daily.temperature_2m_min?.[index],
    rainChance: daily.precipitation_probability_max?.[index],
    rainfall: daily.precipitation_sum?.[index],
    windSpeed: daily.wind_speed_10m_max?.[index],
  }));

  return {
    locationLabel,
    timezone: payload.timezone,
    current: {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
      summary: weatherCodeMap[current.weather_code] || "Current weather",
    },
    forecast: items,
  };
};
