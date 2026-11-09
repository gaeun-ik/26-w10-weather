import { useState, useEffect, useCallback } from 'react'
import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Thermometer,
  Droplets,
  Wind,
  RefreshCw,
  AlertCircle,
  MapPin,
  Activity,
  ShieldCheck
} from 'lucide-react'
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData
} from './api/weather'
import './App.css'

// 날씨 아이콘 매핑 테이블
const ICON_MAP = {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning
}

function WeatherIcon({ name, size = 56, color }) {
  const IconComponent = ICON_MAP[name] || Cloud
  return <IconComponent size={size} color={color} className="weather-icon-svg" />
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weather, setWeather] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 데이터 조회 함수
  const loadCityData = useCallback(async (city) => {
    setLoading(true)
    setError(null)

    try {
      const [weatherRes, airQualityRes] = await Promise.all([
        fetchWeatherData(city.lat, city.lon),
        fetchAirQualityData(city.lat, city.lon)
      ])

      setWeather(weatherRes)
      setAirQuality(airQualityRes)
    } catch (err) {
      console.error('기상 데이터 로드 실패:', err)
      setError(err.message || '데이터를 불러오는 중 문제가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }, [])

  // 도시 선택 변경 시 데이터 로드
  useEffect(() => {
    loadCityData(selectedCity)
  }, [selectedCity, loadCityData])

  // 현재 날씨 및 대기질 상태 계산
  const currentWeather = weather?.current
  const currentAQ = airQuality?.current

  const weatherInfo = currentWeather
    ? getWeatherInfo(currentWeather.weather_code)
    : null

  const aqStatus = currentAQ
    ? getAirQualityStatus(currentAQ.pm10, currentAQ.pm2_5)
    : null

  return (
    <div className="dashboard-container">
      {/* 헤더 섹션 */}
      <header className="dashboard-header">
        <div className="header-title-wrap">
          <span className="badge-live">LIVE</span>
          <h1>실시간 날씨 & 미세먼지</h1>
        </div>
        <p className="dashboard-subtitle">
          Open-Meteo 외부 공개 API를 연동한 실시간 기상 관측 및 공기질 모니터링
        </p>
      </header>

      {/* 주요 도시 빠른 선택 바 */}
      <section className="city-selector-section" aria-label="도시 빠른 선택">
        <div className="city-buttons-wrapper">
          {DEFAULT_CITIES.map((city) => {
            const isSelected = city.name === selectedCity.name
            return (
              <button
                key={city.name}
                type="button"
                className={`city-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
                disabled={loading && isSelected}
              >
                <MapPin size={15} />
                <span>{city.name}</span>
              </button>
            )
          })}
        </div>
        <button
          type="button"
          className="refresh-btn"
          onClick={() => loadCityData(selectedCity)}
          disabled={loading}
          title="데이터 새로고침"
          aria-label="데이터 새로고침"
        >
          <RefreshCw size={17} className={loading ? 'spin' : ''} />
          <span>새로고침</span>
        </button>
      </section>

      {/* 본문 콘텐츠 (로딩 / 에러 / 데이터 카드) */}
      <main className="dashboard-main">
        {loading && !weather && (
          <div className="status-box loading-box">
            <RefreshCw size={40} className="spin accent-icon" />
            <p className="status-text">{selectedCity.name} 기상 데이터를 불러오는 중입니다...</p>
          </div>
        )}

        {error && !weather && (
          <div className="status-box error-box">
            <AlertCircle size={44} className="error-icon" />
            <h3>기상 데이터를 불러오지 못했습니다</h3>
            <p className="status-text">{error}</p>
            <button
              type="button"
              className="retry-btn"
              onClick={() => loadCityData(selectedCity)}
            >
              다시 시도하기
            </button>
          </div>
        )}

        {weather && currentWeather && airQuality && currentAQ && (
          <div className={`cards-grid ${loading ? 'updating' : ''}`}>
            {/* 현재 날씨 카드 */}
            <article className="weather-card">
              <div className="card-header">
                <div className="card-location">
                  <MapPin size={18} className="pin-icon" />
                  <span className="location-name">{selectedCity.name}</span>
                </div>
                <span className="weather-status-tag" style={{ borderColor: weatherInfo?.color, color: weatherInfo?.color }}>
                  {weatherInfo?.label}
                </span>
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
                체감온도는 <strong>{Math.round(currentWeather.apparent_temperature)}°C</strong>이며, 현재 상태는{' '}
                <strong>{weatherInfo?.label}</strong>입니다.
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

            {/* 미세먼지 카드 */}
            <article className="air-card">
              <div className="card-header">
                <div className="card-location">
                  <Activity size={18} className="pin-icon" />
                  <span className="location-name">대기질 (미세먼지)</span>
                </div>
                {aqStatus && (
                  <span
                    className="aq-badge"
                    style={{ backgroundColor: aqStatus.badgeColor }}
                  >
                    {aqStatus.status}
                  </span>
                )}
              </div>

              <div className="air-hero">
                <div className="aq-main-status">
                  <span className="aq-status-title">통합 대기질</span>
                  <span className="aq-status-grade" style={{ color: aqStatus?.badgeColor }}>
                    {aqStatus?.status}
                  </span>
                </div>
              </div>

              <div className="air-metrics-grid">
                <div className="air-metric-box">
                  <div className="air-metric-title">미세먼지 (PM10)</div>
                  <div className="air-metric-number">
                    {currentAQ.pm10 !== null ? Math.round(currentAQ.pm10) : '-'}
                    <span className="air-unit">μg/m³</span>
                  </div>
                  <div className="air-metric-bar-bg">
                    <div
                      className="air-metric-bar-fill"
                      style={{
                        width: `${Math.min(100, ((currentAQ.pm10 || 0) / 160) * 100)}%`,
                        backgroundColor: aqStatus?.badgeColor
                      }}
                    />
                  </div>
                  <span className="air-standard-hint">기준: 0~30 좋음 / 31~80 보통 / 81~150 나쁨</span>
                </div>

                <div className="air-metric-box">
                  <div className="air-metric-title">초미세먼지 (PM2.5)</div>
                  <div className="air-metric-number">
                    {currentAQ.pm2_5 !== null ? Math.round(currentAQ.pm2_5) : '-'}
                    <span className="air-unit">μg/m³</span>
                  </div>
                  <div className="air-metric-bar-bg">
                    <div
                      className="air-metric-bar-fill"
                      style={{
                        width: `${Math.min(100, ((currentAQ.pm2_5 || 0) / 80) * 100)}%`,
                        backgroundColor: aqStatus?.badgeColor
                      }}
                    />
                  </div>
                  <span className="air-standard-hint">기준: 0~15 좋음 / 16~35 보통 / 36~75 나쁨</span>
                </div>
              </div>

              <div className="air-standards-footer">
                <p>💡 환경부 대기환경기준 4단계 지표를 적용하여 실시간 표시됩니다.</p>
              </div>
            </article>
          </div>
        )}
      </main>

      {/* 푸터 & 보안 아키텍처 안내 */}
      <footer className="dashboard-footer">
        <div className="security-notice">
          <ShieldCheck size={16} />
          <span>보안 아키텍처: HTTPS 암호화 통신 & 공개 API 안전 분리 적용</span>
        </div>
        <p className="copyright">
          Data provided by <strong>Open-Meteo</strong> &copy; 2026
        </p>
      </footer>
    </div>
  )
}
