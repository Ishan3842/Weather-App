import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { WeatherData, ForecastData, AirQualityData } from './types';
import { 
  Search, 
  Wind, 
  Droplets, 
  Thermometer, 
  Gauge, 
  Sunrise, 
  Sunset, 
  Eye, 
  Navigation,
  CloudRain,
  Sun,
  Cloud,
  CloudSnow,
  CloudLightning,
  Cloudy,
  Leaf,
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

function App() {
  const [city, setCity] = useState('London');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hourlyView, setHourlyView] = useState(false);
  const [hourlyIndex, setHourlyIndex] = useState(0);

  const API_KEY = 'xxxxxxxxx'; // Put API key from openweathermap here

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-12 h-12 text-blue-500" />;
      case 'clear':
        return <Sun className="w-12 h-12 text-yellow-500" />;
      case 'clouds':
        return <Cloud className="w-12 h-12 text-gray-500" />;
      case 'snow':
        return <CloudSnow className="w-12 h-12 text-blue-300" />;
      case 'thunderstorm':
        return <CloudLightning className="w-12 h-12 text-yellow-600" />;
      default:
        return <Cloudy className="w-12 h-12 text-gray-400" />;
    }
  };

  const getAQIDescription = (aqi: number) => {
    switch (aqi) {
      case 1: return { text: 'Good', color: 'text-green-500' };
      case 2: return { text: 'Fair', color: 'text-yellow-500' };
      case 3: return { text: 'Moderate', color: 'text-orange-500' };
      case 4: return { text: 'Poor', color: 'text-red-500' };
      case 5: return { text: 'Very Poor', color: 'text-purple-500' };
      default: return { text: 'Unknown', color: 'text-gray-500' };
    }
  };

  const getBackgroundImage = (condition: string) => {
    const timeOfDay = new Date().getHours() >= 6 && new Date().getHours() < 18 ? 'day' : 'night';
    const images = {
      clear: {
        day: 'photo-1601297183305-6df142704ea2',
        night: 'photo-1532978379970-46e6205a0d48'
      },
      clouds: {
        day: 'photo-1534088568595-a066f410bcda',
        night: 'photo-1534088568595-a066f410bcda'
      },
      rain: {
        day: 'photo-1519692933481-e162a57d6721',
        night: 'photo-1519692933481-e162a57d6721'
      },
      snow: {
        day: 'photo-1491002052546-bf38f186af56',
        night: 'photo-1491002052546-bf38f186af56'
      },
      default: {
        day: 'photo-1534088568595-a066f410bcda',
        night: 'photo-1532978379970-46e6205a0d48'
      }
    };

    const weatherType = condition.toLowerCase();
    const imageSet = images[weatherType as keyof typeof images] || images.default;
    return `https://images.unsplash.com/${imageSet[timeOfDay]}?auto=format&fit=crop&w=2000&q=80`;
  };

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError('');

      // First, get the weather data to get coordinates
      const weatherResponse = await axios.get<WeatherData>(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      // Then get forecast and air quality using the coordinates
      const [forecastResponse, airQualityResponse] = await Promise.all([
        axios.get<ForecastData>(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        ),
        axios.get<AirQualityData>(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherResponse.data.coord.lat}&lon=${weatherResponse.data.coord.lon}&appid=${API_KEY}`
        )
      ]);

      setWeather(weatherResponse.data);
      setForecast(forecastResponse.data);
      setAirQuality(airQualityResponse.data);
    } catch (err) {
      setError('City not found. Please try again.');
      setWeather(null);
      setForecast(null);
      setAirQuality(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDay = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatHour = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit' });
  };

  const nextHourlySet = () => {
    setHourlyIndex(prev => Math.min(prev + 8, 32));
  };

  const prevHourlySet = () => {
    setHourlyIndex(prev => Math.max(prev - 8, 0));
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center p-4 transition-all duration-500"
      style={{
        backgroundImage: weather ? `url('${getBackgroundImage(weather.weather[0].main)}')` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 w-full max-w-4xl shadow-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Weather Dashboard</h1>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
              className="w-full px-4 py-3 rounded-lg bg-white/50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 pl-10"
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          </div>
        </form>

        {error && (
          <div className="text-red-500 text-center mb-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : weather ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-800">
                {weather.name}, {weather.sys.country}
              </h2>
              <div className="flex items-center justify-center gap-4 my-4">
                <div className="text-7xl font-bold text-gray-800">
                  {Math.round(weather.main.temp)}°C
                </div>
                <div className="flex flex-col items-center">
                  {getWeatherIcon(weather.weather[0].main)}
                  <p className="text-xl text-gray-600 capitalize mt-2">
                    {weather.weather[0].description}
                  </p>
                </div>
              </div>
              <div className="flex justify-center gap-4 text-gray-600">
                <span>H: {Math.round(weather.main.temp_max)}°C</span>
                <span>L: {Math.round(weather.main.temp_min)}°C</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/50 p-4 rounded-xl flex items-center gap-3">
                <Thermometer className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Feels Like</p>
                  <p className="text-lg font-semibold">{Math.round(weather.main.feels_like)}°C</p>
                </div>
              </div>

              <div className="bg-white/50 p-4 rounded-xl flex items-center gap-3">
                <Droplets className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Humidity</p>
                  <p className="text-lg font-semibold">{weather.main.humidity}%</p>
                </div>
              </div>

              <div className="bg-white/50 p-4 rounded-xl flex items-center gap-3">
                <Wind className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Wind</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">{weather.wind.speed} m/s</p>
                    <Navigation 
                      className="text-gray-600" 
                      size={16} 
                      style={{ transform: `rotate(${weather.wind.deg}deg)` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/50 p-4 rounded-xl flex items-center gap-3">
                <Gauge className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Pressure</p>
                  <p className="text-lg font-semibold">{weather.main.pressure} hPa</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/50 p-4 rounded-xl flex items-center gap-3">
                <Sunrise className="text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Sunrise</p>
                  <p className="text-lg font-semibold">{formatTime(weather.sys.sunrise)}</p>
                </div>
              </div>

              <div className="bg-white/50 p-4 rounded-xl flex items-center gap-3">
                <Sunset className="text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Sunset</p>
                  <p className="text-lg font-semibold">{formatTime(weather.sys.sunset)}</p>
                </div>
              </div>

              <div className="bg-white/50 p-4 rounded-xl flex items-center gap-3">
                <Eye className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Visibility</p>
                  <p className="text-lg font-semibold">{weather.visibility / 1000} km</p>
                </div>
              </div>

              {airQuality && (
                <div className="bg-white/50 p-4 rounded-xl flex items-center gap-3">
                  <Leaf className="text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Air Quality</p>
                    <p className={`text-lg font-semibold ${getAQIDescription(airQuality.list[0].main.aqi).color}`}>
                      {getAQIDescription(airQuality.list[0].main.aqi).text}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {airQuality && (
              <div className="bg-white/50 p-4 rounded-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Air Quality Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">PM2.5</p>
                    <p className="text-lg font-semibold">{airQuality.list[0].components.pm2_5} µg/m³</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">PM10</p>
                    <p className="text-lg font-semibold">{airQuality.list[0].components.pm10} µg/m³</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">O₃</p>
                    <p className="text-lg font-semibold">{airQuality.list[0].components.o3} µg/m³</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">NO₂</p>
                    <p className="text-lg font-semibold">{airQuality.list[0].components.no2} µg/m³</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CO</p>
                    <p className="text-lg font-semibold">{airQuality.list[0].components.co} µg/m³</p>
                  </div>
                </div>
              </div>
            )}

            {forecast && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {hourlyView ? 'Hourly Forecast' : '5-Day Forecast'}
                  </h3>
                  <button
                    onClick={() => setHourlyView(!hourlyView)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Clock size={16} />
                    {hourlyView ? 'Show Daily' : 'Show Hourly'}
                  </button>
                </div>

                {hourlyView ? (
                  <div className="relative">
                    <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
                      {forecast.list
                        .slice(hourlyIndex, hourlyIndex + 8)
                        .map((item, index) => (
                          <div key={index} className="bg-white/50 p-4 rounded-xl text-center">
                            <p className="font-semibold text-gray-700">{formatHour(item.dt_txt)}</p>
                            {getWeatherIcon(item.weather[0].main)}
                            <p className="text-lg font-bold text-gray-800 mt-2">
                              {Math.round(item.main.temp)}°C
                            </p>
                          </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={prevHourlySet}
                        disabled={hourlyIndex === 0}
                        className={`p-2 rounded-full ${
                          hourlyIndex === 0 ? 'text-gray-400' : 'text-gray-800 hover:bg-white/50'
                        }`}
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={nextHourlySet}
                        disabled={hourlyIndex >= 32}
                        className={`p-2 rounded-full ${
                          hourlyIndex >= 32 ? 'text-gray-400' : 'text-gray-800 hover:bg-white/50'
                        }`}
                      >
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {forecast.list
                      .filter((_, index) => index % 8 === 0)
                      .slice(0, 5)
                      .map((item, index) => (
                        <div key={index} className="bg-white/50 p-4 rounded-xl text-center">
                          <p className="font-semibold text-gray-700">{formatDay(item.dt_txt)}</p>
                          {getWeatherIcon(item.weather[0].main)}
                          <p className="text-lg font-bold text-gray-800 mt-2">
                            {Math.round(item.main.temp)}°C
                          </p>
                          <p className="text-sm text-gray-600">{item.weather[0].main}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {forecast && forecast.list.some(item => 
              item.weather[0].main === 'Thunderstorm' || 
              item.weather[0].main === 'Rain' && (item.rain?.['3h'] ?? 0) > 10
            ) && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl mt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-yellow-400" />
                  <div>
                    <p className="font-semibold text-yellow-700">Weather Alert</p>
                    <p className="text-yellow-600">Severe weather conditions expected in the next few days.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;