import { Calendar, Umbrella } from 'lucide-react'
import { getWeatherInfo } from '../api/weather'
import WeatherIcon from './WeatherIcon'

export default function WeeklyForecast({ daily }) {
  if (!daily || !daily.time || daily.time.length === 0) return null

  // 주간 최저/최고 기온 (범위 바 비율 계산용)
  const maxTemps = daily.temperature_2m_max
  const minTemps = daily.temperature_2m_min
  const overallMin = Math.min(...minTemps)
  const overallMax = Math.max(...maxTemps)
  const overallRange = Math.max(1, overallMax - overallMin)

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토']

  const forecastDays = daily.time.map((timeStr, idx) => {
    const dateObj = new Date(timeStr)
    let dayLabel = `${daysOfWeek[dateObj.getDay()]}요일`
    if (idx === 0) dayLabel = '오늘'
    else if (idx === 1) dayLabel = '내일'

    const weatherCode = daily.weather_code[idx]
    const weather = getWeatherInfo(weatherCode)
    const maxT = Math.round(daily.temperature_2m_max[idx])
    const minT = Math.round(daily.temperature_2m_min[idx])
    const rainProb = daily.precipitation_probability_max?.[idx] ?? 0

    // 기온 바 위치 계산 (%)
    const leftPercent = Math.max(0, ((minT - overallMin) / overallRange) * 100)
    const widthPercent = Math.min(100 - leftPercent, Math.max(12, ((maxT - minT) / overallRange) * 100))

    return {
      dateStr: timeStr.slice(5).replace('-', '.'),
      dayLabel,
      weather,
      minT,
      maxT,
      rainProb,
      leftPercent,
      widthPercent
    }
  })

  return (
    <article className="weekly-forecast-card">
      <div className="card-header">
        <div className="card-location">
          <Calendar size={18} className="pin-icon" />
          <span className="location-name">7일간 주간 예보</span>
        </div>
        <span className="forecast-range-hint">
          {forecastDays[0]?.dateStr} ~ {forecastDays[forecastDays.length - 1]?.dateStr}
        </span>
      </div>

      <div className="weekly-days-list">
        {forecastDays.map((day, idx) => (
          <div key={idx} className="weekly-day-row">
            <div className="day-name-col">
              <span className={`day-label ${idx === 0 ? 'today-label' : ''}`}>
                {day.dayLabel}
              </span>
              <span className="day-date">{day.dateStr}</span>
            </div>

            <div className="day-weather-col">
              <WeatherIcon
                name={day.weather.icon}
                size={24}
                color={day.weather.color}
              />
              <span className="day-weather-desc">{day.weather.label}</span>
            </div>

            <div className="day-rain-col">
              {day.rainProb > 0 ? (
                <span className="rain-prob-badge">
                  <Umbrella size={13} />
                  <span>{day.rainProb}%</span>
                </span>
              ) : (
                <span className="rain-prob-zero">-</span>
              )}
            </div>

            <div className="day-temp-col">
              <span className="day-min-temp">{day.minT}°</span>
              <div className="temp-bar-track">
                <div
                  className="temp-bar-fill"
                  style={{
                    left: `${day.leftPercent}%`,
                    width: `${day.widthPercent}%`
                  }}
                />
              </div>
              <span className="day-max-temp">{day.maxT}°</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

