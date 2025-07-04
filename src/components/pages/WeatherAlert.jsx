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

// 시간대별/내일 변화 예고 추출
function getForecastSummary(forecast) {
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
    precipitation,
    precipitation_type,
    forecast,
  } = weather

  // 2번: 체감온도/불쾌지수
  const feelsLike = calcFeelsLike(temperature, humidity, wind_speed)
  const discomfortIndex = calcDiscomfortIndex(temperature, humidity)

  // 3번: 강수/강풍
  const isHeavyRain = precipitation_type !== '없음' && precipitation > 5
  const isStrongWind = wind_speed > 10

  // 6번: 시간대별/내일 변화
  const forecastSummary = getForecastSummary(forecast)

  return (
    <div className={styles.weatherAlertCard}>
      <h3 className={styles.weatherAlertTitle}>날씨 알림</h3>
      <ul className={styles.weatherAlertList}>
        {/* 2번 */}
        <li className={styles.weatherAlertItem}>
          <span className={styles.icon}>🌡️</span>
          <span>
            체감온도: <b>{feelsLike}°C</b>, 불쾌지수: <b>{discomfortIndex}</b>
            {discomfortIndex >= 75 && (
              <span className={styles.discomfortHigh}> (불쾌지수 높음)</span>
            )}
          </span>
        </li>
        {/* 3번 */}
        {isHeavyRain && (
          <li className={styles.weatherAlertItem}>
            <span className={styles.icon}>💧</span>
            <span className={styles.rainAlert}>
              강수: <b>{precipitation}mm</b> ({precipitation_type}) - 우산을
              챙기세요!
            </span>
          </li>
        )}
        {isStrongWind && (
          <li className={styles.weatherAlertItem}>
            <span className={styles.icon}>💨</span>
            <span className={styles.windAlert}>
              강풍: <b>{wind_speed}m/s</b> - 시설물 관리 주의
            </span>
          </li>
        )}
        {/* 6번 */}
        <li className={styles.weatherAlertItem}>
          <span className={styles.icon}>⏰</span>
          <span>{forecastSummary}</span>
        </li>
      </ul>
    </div>
  )
}
