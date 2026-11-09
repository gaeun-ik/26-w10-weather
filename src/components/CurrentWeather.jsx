import { MapPin, Thermometer, Droplets, Wind, Activity } from 'lucide-react'
import WeatherIcon from './WeatherIcon'

export default function CurrentWeather({ city, currentWeather, weatherInfo }) {
  if (!currentWeather) return null

  return (
    <article className="weather-card">
      <div className="card-header">
        <div className="card-location">
          <MapPin size={18} className="pin-icon" />
          <span className="location-name">{city.name}</span>
        </div>
        {weatherInfo && (
          <span
            className="weather-status-tag"
            style={{ borderColor: weatherInfo.color, color: weatherInfo.color }}
          >
            {weatherInfo.label}
          </span>
        )}
      </div>

      <div className="weather-hero">
        <div className="weather-icon-container">
          <WeatherIcon
            name={weatherInfo?.icon}
            size={72}
            color={weatherInfo?.color || '#3b82f6'}
          />
        </div>
        <div className="temp-display">
          <span className="temp-number">
            {Math.round(currentWeather.temperature_2m)}
          </span>
          <span className="temp-unit">°C</span>
        </div>
      </div>

      <p className="weather-summary-text">
        체감온도는 <strong>{Math.round(currentWeather.apparent_temperature)}°C</strong>이며, 현재 기상 상태는{' '}
        <strong>{weatherInfo?.label || '맑음'}</strong>입니다.
      </p>

      <div className="weather-metrics-grid">
        <div className="metric-item">
          <div className="metric-label">
            <Thermometer size={16} />
            <span>체감온도</span>
          </div>
          <div className="metric-value">
            {currentWeather.apparent_temperature.toFixed(1)}°C
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">
            <Droplets size={16} />
            <span>습도</span>
          </div>
          <div className="metric-value">
            {currentWeather.relative_humidity_2m}%
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">
            <Wind size={16} />
            <span>풍속</span>
          </div>
          <div className="metric-value">
            {currentWeather.wind_speed_10m.toFixed(1)} km/h
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">
            <Activity size={16} />
            <span>강수량</span>
          </div>
          <div className="metric-value">
            {currentWeather.precipitation ?? 0} mm
          </div>
        </div>
      </div>
    </article>
  )
}

