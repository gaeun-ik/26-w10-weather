import { useState, useEffect, useCallback } from 'react'
import {
  MapPin,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  History,
  Trash2,
  Sun,
  Moon
} from 'lucide-react'
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

// 기상 상태별 고화질 배경 이미지 및 듀얼 그라데이션 매핑 테이블
const WEATHER_VISUAL_THEMES = {
  'clear-day': {
    name: '맑은 낮',
    bgImage: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=1920&q=80',
    lightGradient: 'linear-gradient(135deg, rgba(239, 246, 255, 0.82) 0%, rgba(254, 243, 199, 0.5) 50%, rgba(224, 242, 254, 0.84) 100%)',
    darkGradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.84) 0%, rgba(26, 32, 53, 0.88) 50%, rgba(10, 15, 29, 0.93) 100%)'
  },
  'clear-night': {
    name: '맑은 밤',
    bgImage: 'https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?auto=format&fit=crop&w=1920&q=80',
    lightGradient: 'linear-gradient(135deg, rgba(241, 245, 249, 0.82) 0%, rgba(224, 231, 255, 0.6) 50%, rgba(238, 242, 255, 0.85) 100%)',
    darkGradient: 'linear-gradient(135deg, rgba(9, 13, 22, 0.88) 0%, rgba(21, 26, 46, 0.9) 50%, rgba(10, 13, 24, 0.95) 100%)'
  },
  'cloudy-day': {
    name: '흐린 낮',
    bgImage: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=80',
    lightGradient: 'linear-gradient(135deg, rgba(241, 245, 249, 0.82) 0%, rgba(226, 232, 240, 0.6) 50%, rgba(248, 250, 252, 0.85) 100%)',
    darkGradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.86) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(15, 23, 42, 0.93) 100%)'
  },
  'cloudy-night': {
    name: '흐린 밤',
    bgImage: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=1920&q=80',
    lightGradient: 'linear-gradient(135deg, rgba(226, 232, 240, 0.82) 0%, rgba(203, 213, 225, 0.6) 50%, rgba(241, 245, 249, 0.85) 100%)',
    darkGradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(24, 30, 46, 0.92) 50%, rgba(10, 14, 26, 0.95) 100%)'
  },
  'rain': {
    name: '비 / 소나기',
    bgImage: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1920&q=80',
    lightGradient: 'linear-gradient(135deg, rgba(241, 245, 249, 0.8) 0%, rgba(207, 250, 254, 0.58) 50%, rgba(224, 242, 254, 0.84) 100%)',
    darkGradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.87) 0%, rgba(19, 39, 58, 0.9) 50%, rgba(11, 20, 34, 0.94) 100%)'
  },
  'snow': {
    name: '눈 / 설경',
    bgImage: 'https://images.unsplash.com/photo-1517299321929-e42dd74d67ec?auto=format&fit=crop&w=1920&q=80',
    lightGradient: 'linear-gradient(135deg, rgba(248, 250, 252, 0.82) 0%, rgba(224, 231, 255, 0.55) 50%, rgba(241, 245, 249, 0.85) 100%)',
    darkGradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.86) 0%, rgba(28, 35, 56, 0.9) 50%, rgba(13, 17, 30, 0.93) 100%)'
  },
  'thunder': {
    name: '뇌우',
    bgImage: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=1920&q=80',
    lightGradient: 'linear-gradient(135deg, rgba(243, 232, 255, 0.8) 0%, rgba(224, 231, 255, 0.6) 50%, rgba(241, 245, 249, 0.85) 100%)',
    darkGradient: 'linear-gradient(135deg, rgba(19, 14, 30, 0.9) 0%, rgba(41, 16, 62, 0.92) 50%, rgba(13, 11, 22, 0.95) 100%)'
  },
  'fog': {
    name: '안개',
    bgImage: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=1920&q=80',
    lightGradient: 'linear-gradient(135deg, rgba(241, 245, 249, 0.82) 0%, rgba(226, 232, 240, 0.6) 50%, rgba(248, 250, 252, 0.85) 100%)',
    darkGradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.86) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(15, 23, 42, 0.93) 100%)'
  }
}

// 기상 코드 및 주야간(is_day) 기반 테마 키 추출 함수
function getVisualThemeKey(isDay, weatherCode) {
  if (weatherCode === 95) return 'thunder'
  if ([71, 73, 75, 77].includes(weatherCode)) return 'snow'
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) return 'rain'
  if ([45, 48].includes(weatherCode)) return 'fog'
  if ([2, 3].includes(weatherCode)) return isDay === 0 ? 'cloudy-night' : 'cloudy-day'
  return isDay === 0 ? 'clear-night' : 'clear-day'
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weather, setWeather] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 테마 모드: 기본값은 'light' (라이트 모드)
  const [colorMode, setColorMode] = useState(() => {
    try {
      return localStorage.getItem('theme_mode') || 'light'
    } catch {
      return 'light'
    }
  })

  // 최근 본 도시 저장 (localStorage 연동)
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem('recent_cities')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // 라이트/다크 모드 토글 핸들러
  const toggleColorMode = () => {
    const nextMode = colorMode === 'light' ? 'dark' : 'light'
    setColorMode(nextMode)
    try {
      localStorage.setItem('theme_mode', nextMode)
    } catch (e) {
      console.error('테마 모드 저장 실패:', e)
    }
  }

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

      // 최근 본 도시 목록 갱신 (최대 5개 저장)
      setRecentCities((prev) => {
        const filtered = prev.filter((c) => c.name !== city.name)
        const updated = [city, ...filtered].slice(0, 5)
        try {
          localStorage.setItem('recent_cities', JSON.stringify(updated))
        } catch (e) {
          console.error('localStorage 저장 실패:', e)
        }
        return updated
      })
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

  // 최근 본 도시 기록 전체 삭제
  const handleClearRecent = () => {
    setRecentCities([])
    try {
      localStorage.removeItem('recent_cities')
    } catch (e) {
      console.error(e)
    }
  }

  // 현재 날씨 및 대기질 상태 계산
  const currentWeather = weather?.current
  const currentAQ = airQuality?.current
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null
  const aqStatus = currentAQ ? getAirQualityStatus(currentAQ.pm10, currentAQ.pm2_5) : null

  // 기상 상태 및 주야간 기반 비주얼 테마 산출
  const isDay = currentWeather?.is_day ?? 1
  const weatherCode = currentWeather?.weather_code ?? 0
  const themeKey = getVisualThemeKey(isDay, weatherCode)
  const visualTheme = WEATHER_VISUAL_THEMES[themeKey] || WEATHER_VISUAL_THEMES['clear-day']

  // 현재 모드(라이트/다크)에 부합하는 그라데이션 및 배경 이미지 스타일
  const overlayGradient = colorMode === 'dark' ? visualTheme.darkGradient : visualTheme.lightGradient
  const wrapperStyle = {
    backgroundImage: `${overlayGradient}, url("${visualTheme.bgImage}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat'
  }

  return (
    <div
      className={`dashboard-wrapper mode-${colorMode} theme-${themeKey}`}
      style={wrapperStyle}
      data-theme={colorMode}
    >
      <div className="dashboard-container">
        {/* 헤더 섹션 (상단 테마 토글 버튼 탑재) */}
        <header className="dashboard-header">
          <div className="header-top-row">
            <div className="header-title-wrap">
              <span className="badge-live">LIVE</span>
              <h1>실시간 날씨 & 미세먼지</h1>
            </div>

            {/* 라이트/다크 모드 전환 버튼 (기본: 라이트 모드) */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleColorMode}
              title={colorMode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
              aria-label="화면 테마 모드 전환"
            >
              {colorMode === 'light' ? (
                <>
                  <Moon size={17} className="theme-toggle-icon" />
                  <span>다크 모드</span>
                </>
              ) : (
                <>
                  <Sun size={17} className="theme-toggle-icon" />
                  <span>라이트 모드</span>
                </>
              )}
            </button>
          </div>

          <p className="dashboard-subtitle">
            Open-Meteo 외부 공개 API를 연동한 실시간 기상 관측, 시간별 기온 차트 및 7일 예보
          </p>
        </header>

        {/* 도시 검색 & 프리셋 섹션 */}
        <section className="search-and-presets-section">
          {/* 도시 검색 입력창 (400ms 디바운스) */}
          <CitySearch onSelectCity={(city) => setSelectedCity(city)} />

          {/* 최근 본 도시 뱃지 바 */}
          {recentCities.length > 0 && (
            <div className="recent-cities-bar" aria-label="최근 조회 도시">
              <div className="recent-title">
                <History size={14} />
                <span>최근 조회</span>
              </div>
              <div className="recent-chips-list">
                {recentCities.map((city) => (
                  <button
                    key={`${city.name}-${city.lat}`}
                    type="button"
                    className={`recent-chip ${city.name === selectedCity.name ? 'active' : ''}`}
                    onClick={() => setSelectedCity(city)}
                  >
                    <span>{city.name.split(' (')[0]}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className="recent-clear-btn"
                  onClick={handleClearRecent}
                  title="최근 기록 지우기"
                >
                  <Trash2 size={12} />
                  <span>비우기</span>
                </button>
              </div>
            </div>
          )}

          {/* 주요 도시 빠른 선택 버튼 바 */}
          <div className="city-selector-section" aria-label="주요 도시 빠른 선택">
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
    </div>
  )
}
