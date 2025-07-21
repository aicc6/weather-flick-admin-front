import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getWeatherIcon } from '@/utils/weatherUtils'
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  Wind, 
  Droplets, 
  Thermometer,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  Zap
} from 'lucide-react'

function WeatherDetailModal({ isOpen, onClose, weatherData }) {
  if (!weatherData) return null

  const formatDate = (dateString) => {
    if (!dateString) return '정보 없음'
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}.${month}.${day} ${hours}:${minutes}`
  }

  const getTemperatureTrend = () => {
    if (!weatherData.temperatureHistory || weatherData.temperatureHistory.length < 2) {
      return { trend: 'stable', change: 0 }
    }
    const latest = weatherData.temperatureHistory[weatherData.temperatureHistory.length - 1]
    const previous = weatherData.temperatureHistory[weatherData.temperatureHistory.length - 2]
    const change = latest.temperature - previous.temperature
    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change: Math.abs(change)
    }
  }

  const temperatureTrend = getTemperatureTrend()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            {getWeatherIcon(weatherData.weather_description)}
            {weatherData.city_name} 날씨 상세 정보
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="current" className="mt-6">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="current">현재 날씨</TabsTrigger>
            <TabsTrigger value="forecast">예보</TabsTrigger>
            <TabsTrigger value="statistics">통계</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs flex items-center gap-2 text-orange-700 dark:text-orange-300">
                    <Thermometer className="h-5 w-5" />
                    온도
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-3">{weatherData.temperature}°C</div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">
                    최저 {weatherData.min_temp}° / 최고 {weatherData.max_temp}°
                  </div>
                  {temperatureTrend.trend !== 'stable' && (
                    <div className="flex items-center gap-1 mt-2">
                      {temperatureTrend.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="text-sm font-medium">{temperatureTrend.change}°</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Droplets className="h-5 w-5" />
                    습도
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3">
                    {weatherData.humidity || '-'}%
                  </div>
                  <Badge 
                    variant={weatherData.humidity > 70 ? 'destructive' : 'default'}
                    className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                  >
                    {weatherData.humidity > 70 ? '높음' : '보통'}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs flex items-center gap-2 text-green-700 dark:text-green-300">
                    <Wind className="h-5 w-5" />
                    풍속
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-xl font-bold text-green-900 dark:text-green-100 mb-3">
                    {weatherData.wind_speed || '-'} m/s
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    {weatherData.wind_direction || '정보 없음'}
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                    <CloudRain className="h-5 w-5" />
                    강수 확률
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-3">
                    {Math.round(weatherData.precipitation_prob || 0)}%
                  </div>
                  <Badge 
                    variant={weatherData.precipitation_prob > 60 ? 'destructive' : 'secondary'}
                    className={weatherData.precipitation_prob > 60 ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100'}
                  >
                    {weatherData.precipitation_prob > 60 ? '비 예상' : '맑음'}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Cloud className="h-5 w-5" />
                    하늘 상태
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {weatherData.sky_condition || weatherData.weather_description}
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs flex items-center gap-2 text-teal-700 dark:text-teal-300">
                    <Eye className="h-5 w-5" />
                    가시거리
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-xl font-bold text-teal-900 dark:text-teal-100 mb-3">
                    {weatherData.visibility ? `${weatherData.visibility}km` : '-'}
                  </div>
                  <div className="text-sm text-teal-600 dark:text-teal-400">
                    {weatherData.visibility >= 10 ? '매우 좋음' : 
                     weatherData.visibility >= 5 ? '좋음' : 
                     weatherData.visibility >= 1 ? '보통' : '나쁨'}
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                    <Zap className="h-5 w-5" />
                    UV지수
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-xl font-bold text-yellow-900 dark:text-yellow-100 mb-3">
                    {weatherData.uv_index || '-'}
                  </div>
                  <Badge variant={
                    weatherData.uv_index >= 8 ? 'destructive' : 
                    weatherData.uv_index >= 6 ? 'default' : 
                    'secondary'
                  } className={
                    weatherData.uv_index >= 8 ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                    weatherData.uv_index >= 6 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                    'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                  }>
                    {weatherData.uv_index >= 8 ? '매우 높음' : 
                     weatherData.uv_index >= 6 ? '높음' : 
                     weatherData.uv_index >= 3 ? '보통' : '낮음'}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs flex items-center gap-2 text-sky-700 dark:text-sky-300">
                    <CloudRain className="h-5 w-5" />
                    강수량
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-xl font-bold text-sky-900 dark:text-sky-100 mb-3">
                    {weatherData.precipitation ? `${weatherData.precipitation}mm` : '0mm'}
                  </div>
                  <div className="text-sm text-sky-600 dark:text-sky-400">
                    {weatherData.precipitation > 10 ? '많음' : 
                     weatherData.precipitation > 0 ? '있음' : '없음'}
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs flex items-center gap-2 text-violet-700 dark:text-violet-300">
                    <Calendar className="h-5 w-5" />
                    업데이트
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-sm font-medium text-violet-900 dark:text-violet-100">
                    {formatDate(weatherData.last_updated)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {weatherData.weather_alerts && weatherData.weather_alerts.length > 0 && (
              <Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-orange-800 dark:text-orange-200 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    날씨 특보
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weatherData.weather_alerts.map((alert, index) => (
                      <div key={index} className="bg-white dark:bg-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                        <Badge variant="destructive" className="mb-2 bg-red-500 hover:bg-red-600">{alert.type}</Badge>
                        <p className="text-sm text-orange-900 dark:text-orange-100 leading-relaxed">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="forecast" className="space-y-8">
            {weatherData.forecasts && weatherData.forecasts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {weatherData.forecasts.map((forecast, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {formatDate(forecast.date)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                            {getWeatherIcon(forecast.weather)}
                          </div>
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{forecast.weather}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-base text-blue-900 dark:text-blue-100 mb-1">
                            {forecast.min_temp}° / {forecast.max_temp}°
                          </div>
                          <div className="text-sm text-blue-600 dark:text-blue-400">
                            강수 {Math.round(forecast.precipitation_prob || 0)}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <div className="text-sm font-medium mb-2">예보 정보가 없습니다</div>
                <div className="text-sm">현재 이 지역의 예보 데이터를 불러올 수 없습니다.</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="statistics" className="space-y-8">
            <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg font-bold text-emerald-700 dark:text-emerald-300">날씨 통계</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-emerald-800/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-2">평균 온도</p>
                      <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                        {weatherData.avg_temperature || '-'}°C
                      </p>
                    </div>
                    <div className="bg-white dark:bg-emerald-800/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-2">평균 습도</p>
                      <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                        {weatherData.avg_humidity || '-'}%
                      </p>
                    </div>
                  </div>
                  
                  {weatherData.weather_patterns && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">날씨 패턴</p>
                      <div className="flex flex-wrap gap-2">
                        {weatherData.weather_patterns.map((pattern, index) => (
                          <Badge key={index} variant="outline">
                            {pattern}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white dark:bg-emerald-800/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-3 font-medium">데이터 수집 정보</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-emerald-700 dark:text-emerald-300">지역 코드:</span>
                        <span className="font-medium text-emerald-900 dark:text-emerald-100">{weatherData.region_code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-700 dark:text-emerald-300">마지막 수집:</span>
                        <span className="font-medium text-emerald-900 dark:text-emerald-100">{formatDate(weatherData.last_updated)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default WeatherDetailModal