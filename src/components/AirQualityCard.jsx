import { Activity } from 'lucide-react'

export default function AirQualityCard({ currentAQ, aqStatus }) {
  if (!currentAQ) return null

  return (
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
            {aqStatus?.status || '보통'}
          </span>
        </div>
      </div>

      <div className="air-metrics-grid">
        <div className="air-metric-box">
          <div className="air-metric-title">미세먼지 (PM10)</div>
          <div className="air-metric-number">
            {currentAQ.pm10 !== null && currentAQ.pm10 !== undefined ? Math.round(currentAQ.pm10) : '-'}
            <span className="air-unit">μg/m³</span>
          </div>
          <div className="air-metric-bar-bg">
            <div
              className="air-metric-bar-fill"
              style={{
                width: `${Math.min(100, ((currentAQ.pm10 || 0) / 160) * 100)}%`,
                backgroundColor: aqStatus?.badgeColor || '#3b82f6'
              }}
            />
          </div>
          <span className="air-standard-hint">기준: 0~30 좋음 / 31~80 보통 / 81~150 나쁨</span>
        </div>

        <div className="air-metric-box">
          <div className="air-metric-title">초미세먼지 (PM2.5)</div>
          <div className="air-metric-number">
            {currentAQ.pm2_5 !== null && currentAQ.pm2_5 !== undefined ? Math.round(currentAQ.pm2_5) : '-'}
            <span className="air-unit">μg/m³</span>
          </div>
          <div className="air-metric-bar-bg">
            <div
              className="air-metric-bar-fill"
              style={{
                width: `${Math.min(100, ((currentAQ.pm2_5 || 0) / 80) * 100)}%`,
                backgroundColor: aqStatus?.badgeColor || '#3b82f6'
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
  )
}
