import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { getWeatherInfo } from '../api/weather'
import WeatherIcon from './WeatherIcon'

export default function HourlyChart({ hourly }) {
  const chartData = useMemo(() => {
    if (!hourly || !hourly.time || hourly.time.length === 0) return null

    // 현재 KST 시각 기준 시작점 찾기
    const now = new Date()
    const kstHour = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}`

    let startIndex = hourly.time.findIndex((t) => t.startsWith(kstHour))
    if (startIndex === -1) {
      startIndex = 0
    }

    // 24시간 데이터 슬라이스
    const items = []
    const endIndex = Math.min(hourly.time.length, startIndex + 24)
    for (let i = startIndex; i < endIndex; i++) {
      const rawTime = hourly.time[i]
      const hourNum = parseInt(rawTime.slice(11, 13), 10)
      items.push({
        time: rawTime,
        hourLabel: i === startIndex ? '지금' : `${hourNum}시`,
        isNow: i === startIndex,
        temp: hourly.temperature_2m[i],
        weatherCode: hourly.weather_code?.[i]
      })
    }

    if (items.length === 0) return null

    const temps = items.map((item) => item.temp)
    const minTemp = Math.floor(Math.min(...temps)) - 1
    const maxTemp = Math.ceil(Math.max(...temps)) + 1
    const tempRange = Math.max(1, maxTemp - minTemp)

    // SVG 좌표 계산 (너비 740, 높이 150)
    const width = 740
    const height = 150
    const paddingLeft = 32
    const paddingRight = 32
    const paddingTop = 28
    const paddingBottom = 34
    const chartWidth = width - paddingLeft - paddingRight
    const chartHeight = height - paddingTop - paddingBottom

    const points = items.map((item, idx) => {
      const x = paddingLeft + (idx / Math.max(1, items.length - 1)) * chartWidth
      const y = paddingTop + ((maxTemp - item.temp) / tempRange) * chartHeight
      return {
        ...item,
        x,
        y
      }
    })

    const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    const areaPath = `M ${points[0].x},${height - paddingBottom} L ` +
      points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ') +
      ` L ${points[points.length - 1].x},${height - paddingBottom} Z`

    return {
      items,
      points,
      polylinePoints,
      areaPath,
      width,
      height,
      paddingBottom,
      minTemp: Math.min(...temps),
      maxTemp: Math.max(...temps)
    }
  }, [hourly])

  if (!chartData) return null

  const { points, polylinePoints, areaPath, width, height, paddingBottom } = chartData

  return (
    <article className="hourly-chart-card">
      <div className="card-header">
        <div className="card-location">
          <Clock size={18} className="pin-icon" />
          <span className="location-name">24시간 기온 예보</span>
        </div>
        <span className="chart-temp-range-badge">
          최저 {chartData.minTemp.toFixed(1)}°C / 최고 {chartData.maxTemp.toFixed(1)}°C
        </span>
      </div>

      <div className="hourly-chart-scroll-wrapper">
        <svg
          className="hourly-svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          role="img"
          aria-label="24시간 기온 변화 꺾은선 차트"
        >
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 차트 배경 영역 */}
          <path d={areaPath} fill="url(#tempGradient)" />

          {/* 꺾은선 */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 데이터 포인트 및 라벨 */}
          {points.map((pt, idx) => {
            const isKeyPoint = idx % 3 === 0 || pt.isNow || idx === points.length - 1
            const weather = getWeatherInfo(pt.weatherCode)

            return (
              <g key={pt.time} className="chart-point-group">
                {/* 점 표시 */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={pt.isNow ? 5 : 3.5}
                  className={`chart-dot ${pt.isNow ? 'now-dot' : ''}`}
                />

                {/* 기온 수치 라벨 (주요 포인트만) */}
                {isKeyPoint && (
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    className="chart-temp-text"
                  >
                    {Math.round(pt.temp)}°
                  </text>
                )}

                {/* 시간 라벨 */}
                {isKeyPoint && (
                  <text
                    x={pt.x}
                    y={height - paddingBottom + 20}
                    textAnchor="middle"
                    className={`chart-time-text ${pt.isNow ? 'now-label' : ''}`}
                  >
                    {pt.hourLabel}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="hourly-summary-footer">
        <p>💡 실시간 관측 시점 기준 향후 24시간 동안의 기온 추이를 나타냅니다.</p>
      </div>
    </article>
  )
}
