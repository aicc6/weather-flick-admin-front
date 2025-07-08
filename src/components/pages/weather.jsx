import { useEffect, useState } from 'react'
import WeatherAlert from './WeatherAlert'
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '../ui/card'
import { WeatherStatsCard } from '../common/WeatherStatsCard'
import { getWeatherIcon } from '../../utils/weatherUtils'

// 최신 도시별 날씨 데이터를 가져오는 함수 (재사용 가능)
export async function fetchLatestWeatherData(limit = 20) {
  const res = await fetch(
    `http://localhost:9000/api/weather/database/data?limit=${limit}`,
  )
  if (!res.ok) throw new Error('서버 응답 오류')
  const data = await res.json()
  return data.data || []
}

// 간단한 날씨 아이콘 함수
function getWeatherEmoji(desc) {
  if (!desc) return '❓'
  if (desc.includes('맑')) return '☀️'
  if (desc.includes('구름')) return '⛅'
  if (desc.includes('비')) return '🌧️'
  if (desc.includes('눈')) return '❄️'
  if (desc.includes('흐림')) return '🌫️'
  return '🌡️'
}

function WeatherRealtimePage() {
  const [weatherList, setWeatherList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // DB 최신 데이터
  const loadWeather = () => {
    setLoading(true)
    fetchLatestWeatherData()
      .then((data) => {
        setWeatherList(data)
        setError('')
      })
      .catch(() => setError('날씨 데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadWeather()
    const interval = setInterval(() => {
      loadWeather()
    }, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="page-layout mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      {/* 요약 통계 카드 (대시보드 스타일) */}
      <WeatherStatsCard
        weatherData={weatherList.reduce((acc, cur) => {
          acc[cur.city_name] = cur
          return acc
        }, {})}
      />

      {/* 날씨 알림 카드 */}
      {weatherList.length > 0 && (
        <Card className="mx-auto w-full">
          <CardHeader></CardHeader>
          <CardContent>
            <WeatherAlert weather={weatherList[0]} />
          </CardContent>
        </Card>
      )}

      {/* 도시별 요약 카드 (가로 스크롤) */}
      {weatherList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>도시별 요약</CardTitle>
            <CardDescription>
              주요 도시의 현재 날씨를 한눈에 확인
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto py-2">
              {weatherList.map((item) => (
                <div
                  key={item.id}
                  className="bg-muted flex min-w-[110px] flex-col items-center rounded-lg border px-2 py-2"
                  style={{ flex: '0 0 110px' }}
                >
                  <div className="mb-1 text-sm font-semibold text-blue-900">
                    {item.city_name}
                  </div>
                  <div className="mb-1 text-2xl font-bold text-blue-600">
                    {item.temperature}°
                  </div>
                  <div className="mb-1">
                    {getWeatherIcon(item.weather_description)}
                  </div>
                  <div className="text-muted-foreground min-h-[18px] text-center text-xs">
                    {item.weather_description}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <p className="text-muted-foreground text-center">로딩 중...</p>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}
    </div>
  )
}

export default WeatherRealtimePage
export const WeatherPage = WeatherRealtimePage
