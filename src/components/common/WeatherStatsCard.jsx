import { Cloud, Sun, CheckCircle } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { calculateWeatherStats } from '@/utils/weatherUtils.jsx'

export function WeatherStatsCard({ weatherData }) {
  const stats = calculateWeatherStats(weatherData)

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
                <CheckCircle className="mb-1 h-6 w-6 text-green-500" />
                <span className="font-semibold">데이터 업데이트</span>
                <span className="text-xs text-green-600">정상</span>
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
