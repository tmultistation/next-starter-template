import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Tomorrow.io API configuration
const TOMORROW_API_KEY = '6Vs7zLtXnWDAiDkMFRA6WQgTrz12ziNc';
const TOMORROW_BASE_URL = 'https://api.tomorrow.io/v4/weather';

// Cache configuration to respect rate limits:
// Free plan: 500/day, 25/hour, 3/second
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache
const CACHE_FILE_PATH = path.join(process.cwd(), 'data', 'weather-cache.json');

// Tomorrow.io API response types
interface TomorrowRealtimeResponse {
  data: {
    time: string;
    values: {
      temperature: number;
      temperatureApparent: number;
      humidity: number;
      windSpeed: number;
      windDirection: number;
      weatherCode: number;
      visibility: number;
      uvIndex: number;
      precipitationProbability?: number;
      cloudCover: number;
    };
  };
  location: {
    lat: number;
    lon: number;
    name: string;
  };
}

interface TomorrowForecastResponse {
  timelines?: {
    daily?: Array<{
      time: string;
      values: {
        temperatureMin: number;
        temperatureMax: number;
        weatherCodeDay: number;
        precipitationProbabilityAvg?: number;
      };
    }>;
  };
}

interface WeatherData {
  location: {
    lat: number;
    lon: number;
    name: string;
  };
  current: {
    time: string;
    temperature: number;
    temperatureApparent: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    weatherCode: number;
    weatherDescription: string;
    visibility: number;
    uvIndex: number;
    precipitationProbability: number;
    cloudCover: number;
  };
  forecast?: Array<{
    time: string;
    temperature: number;
    temperatureMin?: number;
    temperatureMax?: number;
    weatherCode: number;
    weatherDescription: string;
    precipitationProbability: number;
  }>;
}

interface CacheEntry {
  data: WeatherData;
  timestamp: number;
  location: string;
}

interface WeatherCache {
  [locationKey: string]: CacheEntry;
}

// Weather code mappings from Tomorrow.io documentation
const getWeatherDescription = (code: number): string => {
  const weatherCodes: { [key: number]: string } = {
    0: 'Unknown',
    1000: 'Clear',
    1001: 'Cloudy',
    1100: 'Mostly Clear',
    1101: 'Partly Cloudy',
    1102: 'Mostly Cloudy',
    2000: 'Fog',
    2100: 'Light Fog',
    3000: 'Light Wind',
    3001: 'Wind',
    3002: 'Strong Wind',
    4000: 'Drizzle',
    4001: 'Rain',
    4200: 'Light Rain',
    4201: 'Heavy Rain',
    5000: 'Snow',
    5001: 'Flurries',
    5100: 'Light Snow',
    5101: 'Heavy Snow',
    6000: 'Freezing Drizzle',
    6001: 'Freezing Rain',
    6200: 'Light Freezing Rain',
    6201: 'Heavy Freezing Rain',
    7000: 'Ice Pellets',
    7101: 'Heavy Ice Pellets',
    7102: 'Light Ice Pellets',
    8000: 'Thunderstorm'
  };
  return weatherCodes[code] || 'Unknown';
};

const ensureDataDirectory = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const loadCache = (): WeatherCache => {
  try {
    ensureDataDirectory();
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const cacheData = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
      return JSON.parse(cacheData);
    }
  } catch (error) {
    console.error('Error loading weather cache:', error);
  }
  return {};
};

const saveCache = (cache: WeatherCache) => {
  try {
    ensureDataDirectory();
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error('Error saving weather cache:', error);
  }
};

const getCachedData = (location: string): WeatherData | null => {
  const cache = loadCache();
  const locationKey = location.toLowerCase().replace(/\s+/g, '-');
  const entry = cache[locationKey];
  
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    console.log(`Using cached weather data for ${location}`);
    return entry.data;
  }
  
  return null;
};

const setCachedData = (location: string, data: WeatherData) => {
  const cache = loadCache();
  const locationKey = location.toLowerCase().replace(/\s+/g, '-');
  
  cache[locationKey] = {
    data,
    timestamp: Date.now(),
    location
  };
  
  saveCache(cache);
  console.log(`Cached weather data for ${location}`);
};

// Helper function to try different location formats
const tryLocationFormats = async (originalLocation: string, includeForecast: boolean = false): Promise<WeatherData> => {
  const locationVariants = [];
  
  // If it's Warwick, try different formats
  if (originalLocation.toLowerCase().includes('warwick')) {
    locationVariants.push(
      '02889', // Warwick, RI zip code
      '41.7001,-71.4162', // Coordinates for Warwick, RI
      'Warwick, Rhode Island, USA',
      'Warwick, RI, USA', 
      'Warwick, Rhode Island',
      'Warwick, RI',
      originalLocation
    );
  } else {
    locationVariants.push(originalLocation);
  }
  
  let lastError = null;
  
  for (const locationVariant of locationVariants) {
    try {
      console.log(`Trying location format: ${locationVariant}`);
      return await fetchFromTomorrowAPI(locationVariant, includeForecast);
    } catch (error) {
      console.log(`Failed with location format "${locationVariant}":`, error);
      lastError = error;
      continue;
    }
  }
  
  // If all variants failed, throw the last error
  throw lastError || new Error('All location formats failed');
};

const fetchFromTomorrowAPI = async (location: string, includeForecast: boolean = false): Promise<WeatherData> => {
  console.log(`Fetching fresh weather data for ${location} from Tomorrow.io API`);
  
  // Fetch current weather
  const realtimeUrl = `${TOMORROW_BASE_URL}/realtime?location=${encodeURIComponent(location)}&apikey=${TOMORROW_API_KEY}&units=metric`;
  console.log(`API URL: ${realtimeUrl}`);
  
  const realtimeResponse = await fetch(realtimeUrl);
  
  if (!realtimeResponse.ok) {
    // Get the error response body for better debugging
    let errorBody = '';
    try {
      const errorData = await realtimeResponse.json();
      errorBody = JSON.stringify(errorData);
      console.error('API Error Response:', errorData);
    } catch (e) {
      errorBody = await realtimeResponse.text();
      console.error('API Error Text:', errorBody);
    }
    throw new Error(`Tomorrow.io API error: ${realtimeResponse.status} - ${realtimeResponse.statusText}. Response: ${errorBody}`);
  }
  
  const realtimeData: TomorrowRealtimeResponse = await realtimeResponse.json();
  
  let forecastData: TomorrowForecastResponse | null = null;
  if (includeForecast) {
    try {
      // Fetch 5-day forecast (additional API call)
      const forecastUrl = `${TOMORROW_BASE_URL}/forecast?location=${encodeURIComponent(location)}&apikey=${TOMORROW_API_KEY}&timesteps=1d&units=metric`;
      const forecastResponse = await fetch(forecastUrl);
      
      if (forecastResponse.ok) {
        forecastData = await forecastResponse.json();
      }
    } catch (error) {
      console.log('Forecast data unavailable:', error);
      // Continue without forecast data
    }
  }
  
  // Transform the data to our format
  const weatherData: WeatherData = {
    location: {
      lat: realtimeData.location.lat,
      lon: realtimeData.location.lon,
      name: realtimeData.location.name
    },
    current: {
      time: realtimeData.data.time,
      temperature: Math.round(realtimeData.data.values.temperature),
      temperatureApparent: Math.round(realtimeData.data.values.temperatureApparent),
      humidity: realtimeData.data.values.humidity,
      windSpeed: realtimeData.data.values.windSpeed,
      windDirection: realtimeData.data.values.windDirection,
      weatherCode: realtimeData.data.values.weatherCode,
      weatherDescription: getWeatherDescription(realtimeData.data.values.weatherCode),
      visibility: realtimeData.data.values.visibility,
      uvIndex: realtimeData.data.values.uvIndex,
      precipitationProbability: realtimeData.data.values.precipitationProbability || 0,
      cloudCover: realtimeData.data.values.cloudCover
    }
  };
  
  // Add forecast data if available
  if (forecastData && forecastData.timelines?.daily) {
    weatherData.forecast = forecastData.timelines.daily.slice(0, 5).map((day) => ({
      time: day.time,
      temperature: Math.round((day.values.temperatureMin + day.values.temperatureMax) / 2),
      temperatureMin: Math.round(day.values.temperatureMin),
      temperatureMax: Math.round(day.values.temperatureMax),
      weatherCode: day.values.weatherCodeDay,
      weatherDescription: getWeatherDescription(day.values.weatherCodeDay),
      precipitationProbability: day.values.precipitationProbabilityAvg || 0
    }));
  }
  
  return weatherData;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'New York';
    const includeForecast = searchParams.get('forecast') === 'true';
    
    // Check cache first
    const cachedData = getCachedData(location);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // Try different location formats to find one that works
    const weatherData = await tryLocationFormats(location, includeForecast);
    
    // Cache the data
    setCachedData(location, weatherData);
    
    return NextResponse.json(weatherData);
    
  } catch (error) {
    console.error('Weather API error:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch weather data',
        message: error instanceof Error ? error.message : 'Unknown error',
        // Provide fallback data structure
        location: { lat: 0, lon: 0, name: 'Unknown' },
        current: {
          time: new Date().toISOString(),
          temperature: 0,
          temperatureApparent: 0,
          humidity: 0,
          windSpeed: 0,
          windDirection: 0,
          weatherCode: 0,
          weatherDescription: 'Data unavailable',
          visibility: 0,
          uvIndex: 0,
          precipitationProbability: 0,
          cloudCover: 0
        }
      },
      { status: 500 }
    );
  }
} 