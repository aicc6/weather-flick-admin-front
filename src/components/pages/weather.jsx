import { useMemo } from 'react'
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
import { useGetLatestWeatherDataQuery } from '../../store/api/weatherApi'

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
  // RTK Query로 데이터 가져오기 (1분마다 자동 갱신)
  const {
    data: weatherList = [],
    isLoading: loading,
    error,
  } = useGetLatestWeatherDataQuery(20, {
    pollingInterval: 60000, // 60초마다 자동 새로고침
  })

  // weatherData 형식으로 변환
  const weatherDataMap = useMemo(() => {
    return weatherList.reduce((acc, cur) => {
      acc[cur.city_name] = cur
      return acc
    }, {})
  }, [weatherList])

  return (
    <div className="page-layout mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      {/* 요약 통계 카드 (대시보드 스타일) */}
      <WeatherStatsCard weatherData={weatherDataMap} />

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
      {error && (
        <p className="text-center text-red-500">
          {error.data?.message || '날씨 데이터를 불러오지 못했습니다.'}
        </p>
      )}
    </div>
  )
}

export default WeatherRealtimePage
export const WeatherPage = WeatherRealtimePage

// 최신 도시별 날씨 데이터를 가져오는 함수는 더 이상 필요하지 않음 (RTK Query로 대체)
