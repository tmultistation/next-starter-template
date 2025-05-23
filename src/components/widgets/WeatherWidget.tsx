'use client';

import React, { useState, useEffect } from 'react';
import { Widget } from '../../types/dashboard';

interface WeatherWidgetProps {
  widget: Widget;
  isEditing?: boolean;
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
  error?: string;
}

export default function WeatherWidget({ widget, isEditing = false }: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Get location from widget config, default to Warwick, RI zip code
  const location = widget.config.location || '02889';

  useEffect(() => {
    if (isEditing) {
      // Show static data in editing mode
      setWeatherData({
        location: { lat: 41.7001, lon: -71.4162, name: 'Warwick, RI' },
        current: {
          time: new Date().toISOString(),
          temperature: 20, // 68°F
          temperatureApparent: 22, // 72°F
          humidity: 72,
          windSpeed: 3.8,
          windDirection: 180,
          weatherCode: 1101,
          weatherDescription: 'Partly Cloudy',
          visibility: 14.5,
          uvIndex: 4,
          precipitationProbability: 15,
          cloudCover: 35
        }
      });
      setLoading(false);
      return;
    }

    fetchWeatherData();
    
    // Refresh weather data every 10 minutes
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [location, isEditing]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}&forecast=false`);
      const data: WeatherData = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch weather data');
      }
      
      if (data.error) {
        throw new Error(data.error || 'Weather data unavailable');
      }
      
      setWeatherData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code: number, description: string): string => {
    // Map weather codes to appropriate emoji icons
    if (code === 1000) return '☀️'; // Clear
    if (code >= 1100 && code <= 1102) return '⛅'; // Partly cloudy variations
    if (code === 1001) return '☁️'; // Cloudy
    if (code >= 2000 && code <= 2100) return '🌫️'; // Fog
    if (code >= 3000 && code <= 3002) return '💨'; // Wind
    if (code >= 4000 && code <= 4001) return '🌧️'; // Rain
    if (code >= 4200 && code <= 4201) return '🌦️'; // Light/Heavy rain
    if (code >= 5000 && code <= 5101) return '❄️'; // Snow
    if (code >= 6000 && code <= 6201) return '🧊'; // Freezing rain
    if (code >= 7000 && code <= 7102) return '🧊'; // Ice pellets
    if (code === 8000) return '⛈️'; // Thunderstorm
    
    // Fallback based on description
    if (description.toLowerCase().includes('clear')) return '☀️';
    if (description.toLowerCase().includes('cloud')) return '☁️';
    if (description.toLowerCase().includes('rain')) return '🌧️';
    if (description.toLowerCase().includes('snow')) return '❄️';
    if (description.toLowerCase().includes('storm')) return '⛈️';
    
    return '🌤️'; // Default
  };

  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const formatTime = (timeString: string): string => {
    try {
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Unknown';
    }
  };

  const getUVIndexColor = (uvIndex: number): string => {
    if (uvIndex <= 2) return 'text-green-400';
    if (uvIndex <= 5) return 'text-yellow-400';
    if (uvIndex <= 7) return 'text-orange-400';
    if (uvIndex <= 10) return 'text-red-400';
    return 'text-purple-400';
  };

  const getHumidityColor = (humidity: number): string => {
    if (humidity < 30) return 'text-orange-400';
    if (humidity > 70) return 'text-blue-400';
    return 'text-green-400';
  };

  // Convert Celsius to Fahrenheit
  const celsiusToFahrenheit = (celsius: number): number => {
    return Math.round((celsius * 9/5) + 32);
  };

  // Format temperature display with both F and C
  const formatTemperature = (celsius: number, showBoth: boolean = true): string => {
    const fahrenheit = celsiusToFahrenheit(celsius);
    if (showBoth) {
      return `${fahrenheit}°F (${celsius}°C)`;
    }
    return `${fahrenheit}°F`;
  };

  // Shorten location name for display
  const shortenLocation = (fullLocation: string): string => {
    // If it's too long, try to extract the main city/state
    if (fullLocation.length > 25) {
      // Split by commas and take first two parts (city, state)
      const parts = fullLocation.split(',').map(part => part.trim());
      if (parts.length >= 2) {
        // Replace "Rhode Island" with "RI" for brevity
        const state = parts[1].replace('Rhode Island', 'RI');
        return `${parts[0]}, ${state}`;
      }
    }
    return fullLocation;
  };

  if (loading) {
    return (
      <div 
        className={`p-4 bg-gray-800/50 rounded-lg border border-gray-700 ${widget.config.showBorder ? 'border-2' : ''} min-h-[200px] flex flex-col items-center justify-center`}
        style={{ 
          backgroundColor: widget.config.backgroundColor,
          color: widget.config.textColor
        }}
      >
        <div className="animate-spin text-2xl mb-2">🌀</div>
        <div className="text-gray-400 text-sm">Loading weather...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`p-4 bg-gray-800/50 rounded-lg border border-red-500 ${widget.config.showBorder ? 'border-2' : ''} min-h-[200px] flex flex-col items-center justify-center`}
        style={{ 
          backgroundColor: widget.config.backgroundColor,
          color: widget.config.textColor
        }}
      >
        <div className="text-2xl mb-2">⚠️</div>
        <h3 className="text-lg font-semibold mb-2 text-red-400">{widget.title}</h3>
        <div className="text-red-400 text-sm text-center">
          {error}
        </div>
        <button 
          onClick={fetchWeatherData}
          className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div 
        className={`p-4 bg-gray-800/50 rounded-lg border border-gray-700 ${widget.config.showBorder ? 'border-2' : ''} min-h-[200px] flex flex-col items-center justify-center`}
        style={{ 
          backgroundColor: widget.config.backgroundColor,
          color: widget.config.textColor
        }}
      >
        <div className="text-2xl mb-2">📭</div>
        <div className="text-gray-400 text-sm">No weather data available</div>
      </div>
    );
  }

  return (
    <div 
      className={`p-4 bg-gray-800/50 rounded-lg border border-gray-700 ${widget.config.showBorder ? 'border-2' : ''} relative`}
      style={{ 
        backgroundColor: widget.config.backgroundColor,
        color: widget.config.textColor
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-blue-400 flex items-center">
          🌤️ {widget.title}
        </h3>
        {lastUpdated && (
          <div className="text-xs text-gray-500">
            {formatTime(lastUpdated.toISOString())}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="text-sm text-gray-400 mb-3 truncate">
        📍 {shortenLocation(weatherData.location.name)}
      </div>

      {/* Main Weather Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-4xl mr-3">
            {getWeatherIcon(weatherData.current.weatherCode, weatherData.current.weatherDescription)}
          </span>
          <div>
            <div className="text-3xl font-bold text-white">
              {celsiusToFahrenheit(weatherData.current.temperature)}°F
            </div>
            <div className="text-sm text-gray-400">
              {weatherData.current.temperature}°C
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Feels like {formatTemperature(weatherData.current.temperatureApparent)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-300">
            {weatherData.current.weatherDescription}
          </div>
          <div className="text-xs text-gray-500">
            {weatherData.current.precipitationProbability}% chance rain
          </div>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center justify-between bg-gray-700/30 rounded px-2 py-1">
          <span className="text-gray-400">💨 Wind</span>
          <span className="text-white">
            {weatherData.current.windSpeed.toFixed(1)} m/s {getWindDirection(weatherData.current.windDirection)}
          </span>
        </div>
        
        <div className="flex items-center justify-between bg-gray-700/30 rounded px-2 py-1">
          <span className="text-gray-400">💧 Humidity</span>
          <span className={getHumidityColor(weatherData.current.humidity)}>
            {weatherData.current.humidity}%
          </span>
        </div>
        
        <div className="flex items-center justify-between bg-gray-700/30 rounded px-2 py-1">
          <span className="text-gray-400">☀️ UV Index</span>
          <span className={getUVIndexColor(weatherData.current.uvIndex)}>
            {weatherData.current.uvIndex}
          </span>
        </div>
        
        <div className="flex items-center justify-between bg-gray-700/30 rounded px-2 py-1">
          <span className="text-gray-400">👁️ Visibility</span>
          <span className="text-white">
            {weatherData.current.visibility.toFixed(1)} km
          </span>
        </div>
      </div>

      {/* Cache indicator */}
      {!isEditing && (
        <div className="absolute top-1 right-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" title="Data cached for efficiency"></div>
        </div>
      )}
    </div>
  );
} 