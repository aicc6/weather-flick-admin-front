import { Cloud, Sun, CheckCircle, Clock } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { calculateWeatherStats } from '@/utils/weatherUtils.jsx'

// 날짜 포맷팅 헬퍼 함수
function formatDateTime(dateString) {
  if (!dateString) return '정보 없음'
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return `${month}/${day} ${hours}:${minutes.toString().padStart(2, '0')}`
}

export function WeatherStatsCard({ weatherData }) {
  const stats = calculateWeatherStats(weatherData)
  
  // weatherData가 배열인지 확인
  const dataArray = Array.isArray(weatherData) ? weatherData : []
  
  // 가장 최근 업데이트 시간 찾기
  const mostRecentUpdate = dataArray.reduce((latest, item) => {
    const updateTime = item.last_updated || item.forecast_date
    if (!updateTime) return latest
    if (!latest) return updateTime
    return new Date(updateTime) > new Date(latest) ? updateTime : latest
  }, null)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>날씨 통계</CardTitle>
          <CardDescription>주요 도시들의 날씨 통계 정보입니다.</CardDescription>
        </div>
        <Cloud className="h-6 w-6 text-blue-400" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm">
          {stats ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="flex flex-col items-center justify-center p-2">
                <Sun className="mb-1 h-6 w-6 text-yellow-500" />
                <span className="font-semibold">평균 기온</span>
                <span className="text-lg font-bold text-blue-700">
                  {stats.avgTemp}°C
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                <Sun className="mb-1 h-6 w-6 text-yellow-400" />
                <span className="font-semibold">최고 기온</span>
                <span className="text-lg font-bold text-red-600">
                  {stats.maxTemp}°C
                </span>
                <span className="text-muted-foreground text-xs">
                  {stats.maxTempRegion?.city_name ||
                    stats.maxTempRegion?.region_name}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                <Cloud className="mb-1 h-6 w-6 text-blue-300" />
                <span className="font-semibold">최저 기온</span>
                <span className="text-lg font-bold text-blue-400">
                  {stats.minTemp}°C
                </span>
                <span className="text-muted-foreground text-xs">
                  {stats.minTempRegion?.city_name ||
                    stats.minTempRegion?.region_name}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                <Clock className="mb-1 h-6 w-6 text-green-500" />
                <span className="font-semibold">마지막 업데이트</span>
                <span className="text-xs text-green-600">
                  {formatDateTime(mostRecentUpdate)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              데이터가 없습니다.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
