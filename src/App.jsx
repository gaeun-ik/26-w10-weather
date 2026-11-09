import { useState, useEffect, useCallback } from 'react'
import { MapPin, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react'
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData
} from './api/weather'
import CitySearch from './components/CitySearch'
import CurrentWeather from './components/CurrentWeather'
import AirQualityCard from './components/AirQualityCard'
import HourlyChart from './components/HourlyChart'
import WeeklyForecast from './components/WeeklyForecast'
import './App.css'

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
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null
  const aqStatus = currentAQ ? getAirQualityStatus(currentAQ.pm10, currentAQ.pm2_5) : null

  return (
    <div className="dashboard-container">
      {/* 헤더 섹션 */}
      <header className="dashboard-header">
        <div className="header-title-wrap">
          <span className="badge-live">LIVE</span>
          <h1>실시간 날씨 & 미세먼지</h1>
        </div>
        <p className="dashboard-subtitle">
          Open-Meteo 외부 공개 API를 연동한 실시간 기상 관측, 시간별 기온 차트 및 7일 예보
        </p>
      </header>

      {/* 도시 검색 & 빠른 선택 바 */}
      <section className="search-and-presets-section">
        {/* 도시 검색 입력창 (400ms 디바운스) */}
        <CitySearch onSelectCity={(city) => setSelectedCity(city)} />

        {/* 주요 도시 빠른 선택 버튼 바 */}
        <div className="city-selector-section" aria-label="도시 빠른 선택">
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
        </div>
      </section>

      {/* 본문 콘텐츠 */}
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
          <div className={`dashboard-content-flow ${loading ? 'updating' : ''}`}>
            {/* 1. 상단 현재 상태 그리드 (현재 날씨 + 대기질) */}
            <div className="cards-grid">
              <CurrentWeather
                city={selectedCity}
                currentWeather={currentWeather}
                weatherInfo={weatherInfo}
              />
              <AirQualityCard
                currentAQ={currentAQ}
                aqStatus={aqStatus}
              />
            </div>

            {/* 2. 24시간 기온 SVG 차트 */}
            {weather.hourly && (
              <HourlyChart hourly={weather.hourly} />
            )}

            {/* 3. 7일간 주간 예보 */}
            {weather.daily && (
              <WeeklyForecast daily={weather.daily} />
            )}
          </div>
        )}
      </main>

      {/* 푸터 & 보안 안내 */}
      <footer className="dashboard-footer">
        <div className="security-notice">
          <ShieldCheck size={16} />
          <span>보안 아키텍처: HTTPS 암호화 통신 & 400ms 디바운스 DoS 방지 적용</span>
        </div>
        <p className="copyright">
          Data provided by <strong>Open-Meteo</strong> &copy; 2026
        </p>
      </footer>
    </div>
  )
}
