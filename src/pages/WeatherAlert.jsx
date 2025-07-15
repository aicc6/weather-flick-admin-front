import styles from './WeatherAlert.module.css'

// 체감온도 계산 함수 (간단 예시)
function calcFeelsLike(temp, humidity, wind) {
  // 실제 공식은 더 복잡, 여기선 단순화
  return Math.round(temp + 0.33 * humidity - 0.7 * wind - 4.0)
}

// 불쾌지수 계산 함수 (간단 예시)
function calcDiscomfortIndex(temp, humidity) {
  return Math.round(0.81 * temp + 0.01 * humidity * (0.99 * temp - 14.3) + 46.3)
}

// 풍향(deg) → 8방위 텍스트
function getWindDirText(deg) {
  if (typeof deg !== 'number') return null
  const dirs = ['북', '북동', '동', '남동', '남', '남서', '서', '북서']
  return dirs[Math.round((deg % 360) / 45) % 8] + '풍'
}

// 시간대별/내일 변화 예고 추출 (forecast는 현재 미사용)
function _getForecastSummary(forecast) {
  if (!forecast || forecast.length === 0) return '예보 정보 없음'
  const now = new Date()
  const tonight = forecast.find((f) => {
    const t = new Date(f.forecast_time)
    return t.getHours() >= 21 && t.getDate() === now.getDate()
  })
  const tomorrowMorning = forecast.find((f) => {
    const t = new Date(f.forecast_time)
    return t.getHours() <= 9 && t.getDate() > now.getDate()
  })
  let summary = []
  if (tonight)
    summary.push(
      `🌙 오늘 밤 최저 ${tonight.temperature}°C, ${tonight.precipitation_type}`,
    )
  if (tomorrowMorning)
    summary.push(
      `☀️ 내일 오전 ${tomorrowMorning.temperature}°C, ${tomorrowMorning.precipitation_type}`,
    )
  return summary.length > 0 ? summary.join(' | ') : '예보 정보 없음'
}

export default function WeatherAlert({ weather }) {
  if (!weather) return null
  const {
    temperature,
    humidity,
    wind_speed,
    wind_direction,
    precipitation,
    precipitation_type,
    sky_condition,
    weather_description,
  } = weather

  // 체감온도/불쾌지수
  const feelsLike = calcFeelsLike(temperature, humidity, wind_speed)
  const discomfortIndex = calcDiscomfortIndex(temperature, humidity)

  // 특보/경보
  const alerts = []
  if (temperature >= 33) alerts.push({ icon: '🔥', text: '폭염 주의보' })
  if (temperature <= -10) alerts.push({ icon: '❄️', text: '한파 주의보' })
  if (wind_speed >= 14) alerts.push({ icon: '💨', text: '강풍 경보' })
  if (precipitation >= 30) alerts.push({ icon: '🌧️', text: '호우 경보' })

  // 강수/강풍
  const _isHeavyRain = precipitation_type !== '없음' && precipitation > 5
  const _isStrongWind = wind_speed > 10

  // 생활 팁
  const tips = []
  if (precipitation_type && precipitation_type !== '없음')
    tips.push('우산을 챙기세요')
  if (feelsLike <= 0) tips.push('외투를 꼭 챙기세요')
  if (discomfortIndex >= 75) tips.push('실내 환기 필요')
  if (wind_speed >= 10) tips.push('시설물 관리 주의')
  if (temperature >= 33) tips.push('수분 섭취, 야외활동 자제')
  if (temperature <= -10) tips.push('동상 주의, 보온 유지')

  return (
    <div className={styles.weatherAlertCard}>
      <h3 className={styles.weatherAlertTitle}>날씨 알림</h3>
      <ul className={styles.weatherAlertList}>
        {/* 특보/경보 */}
        {alerts.map((a, i) => (
          <li key={i} className={styles.weatherAlertItem}>
            <span className={styles.icon}>{a.icon}</span>
            <span style={{ color: '#e53e3e', fontWeight: 700 }}>{a.text}</span>
          </li>
        ))}
        {/* 체감온도/불쾌지수 */}
        <li className={styles.weatherAlertItem}>
          <span className={styles.icon}>🌡️</span>
          <span>
            체감온도: <b>{feelsLike}°C</b>, 불쾌지수: <b>{discomfortIndex}</b>
            {discomfortIndex >= 75 && (
              <span className={styles.discomfortHigh}> (불쾌지수 높음)</span>
            )}
          </span>
        </li>
        {/* 강수/강풍/풍향 */}
        <li className={styles.weatherAlertItem}>
          <span className={styles.icon}>💧</span>
          <span>
            강수: <b>{precipitation}mm</b> ({precipitation_type || '없음'})
            {wind_speed !== undefined && (
              <>
                {' / '}풍속: <b>{wind_speed}m/s</b>
                {wind_direction !== undefined && (
                  <> ({getWindDirText(wind_direction)})</>
                )}
              </>
            )}
          </span>
        </li>
        {/* 하늘상태/날씨설명 */}
        <li className={styles.weatherAlertItem}>
          <span className={styles.icon}>☁️</span>
          <span>
            하늘상태: <b>{sky_condition}</b> / {weather_description}
          </span>
        </li>
        {/* 생활 팁 */}
        {tips.length > 0 && (
          <li className={styles.weatherAlertItem}>
            <span className={styles.icon}>💡</span>
            <span style={{ color: '#0d9488' }}>{tips.join(', ')}</span>
          </li>
        )}
      </ul>
    </div>
  )
}
