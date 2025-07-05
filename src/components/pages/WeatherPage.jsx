import { useEffect, useState } from 'react'
import WeatherAlert from '../components/pages/WeatherAlert'
import { http, getJsonResponse } from '../../lib/http'

export default function WeatherPage() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWeather() {
      try {
        const params = { nx: 60, ny: 127, location: '서울' }
        const resCurrent = await http.GET('/api/weather/current', {
          params: { query: params },
        })
        const current = await getJsonResponse(resCurrent)

        const resForecast = await http.GET('/api/weather/forecast', {
          params: { query: params },
        })
        const forecast = await getJsonResponse(resForecast)

        setWeather({
          ...current,
          forecast: forecast,
        })
      } catch {
        alert('날씨 데이터를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
  }, [])

  if (loading) return <div>로딩 중...</div>
  if (!weather) return <div>날씨 정보 없음</div>

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
        실시간 날씨 정보
      </h2>
      {/* 날씨 알림 섹션 */}
      <WeatherAlert weather={weather} />
      {/* 주요 수치 등 추가 UI는 필요시 여기에 */}
    </div>
  )
}
