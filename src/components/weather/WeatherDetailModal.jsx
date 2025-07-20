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
  TrendingDown
} from 'lucide-react'

function WeatherDetailModal({ isOpen, onClose, weatherData }) {
  if (!weatherData) return null

  const formatDate = (dateString) => {
    if (!dateString) return '정보 없음'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
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
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {getWeatherIcon(weatherData.weather_description)}
            {weatherData.city_name} 날씨 상세 정보
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="current" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">현재 날씨</TabsTrigger>
            <TabsTrigger value="forecast">예보</TabsTrigger>
            <TabsTrigger value="statistics">통계</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    온도
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{weatherData.temperature}°C</div>
                  <div className="text-sm text-muted-foreground">
                    최저 {weatherData.min_temp}° / 최고 {weatherData.max_temp}°
                  </div>
                  {temperatureTrend.trend !== 'stable' && (
                    <div className="flex items-center gap-1 mt-1">
                      {temperatureTrend.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="text-sm">{temperatureTrend.change}°</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Droplets className="h-4 w-4" />
                    습도
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {weatherData.humidity || '-'}%
                  </div>
                  <Badge variant={weatherData.humidity > 70 ? 'destructive' : 'default'}>
                    {weatherData.humidity > 70 ? '높음' : '보통'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wind className="h-4 w-4" />
                    풍속
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {weatherData.wind_speed || '-'} m/s
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {weatherData.wind_direction || '정보 없음'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CloudRain className="h-4 w-4" />
                    강수 확률
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {weatherData.precipitation_prob || 0}%
                  </div>
                  <Badge variant={weatherData.precipitation_prob > 60 ? 'destructive' : 'secondary'}>
                    {weatherData.precipitation_prob > 60 ? '비 예상' : '맑음'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    하늘 상태
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">
                    {weatherData.sky_condition || weatherData.weather_description}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    업데이트
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {formatDate(weatherData.last_updated)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {weatherData.weather_alerts && weatherData.weather_alerts.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-800">날씨 특보</CardTitle>
                </CardHeader>
                <CardContent>
                  {weatherData.weather_alerts.map((alert, index) => (
                    <div key={index} className="mb-2">
                      <Badge variant="destructive">{alert.type}</Badge>
                      <p className="mt-1 text-sm">{alert.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4">
            {weatherData.forecasts && weatherData.forecasts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weatherData.forecasts.map((forecast, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        {formatDate(forecast.date)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getWeatherIcon(forecast.weather)}
                          <span>{forecast.weather}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {forecast.min_temp}° / {forecast.max_temp}°
                          </div>
                          <div className="text-sm text-muted-foreground">
                            강수 {forecast.precipitation_prob}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                예보 정보가 없습니다
              </div>
            )}
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>날씨 통계</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">평균 온도</p>
                      <p className="text-xl font-bold">
                        {weatherData.avg_temperature || '-'}°C
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">평균 습도</p>
                      <p className="text-xl font-bold">
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

                  <div>
                    <p className="text-sm text-muted-foreground">데이터 수집 정보</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>지역 코드: {weatherData.region_code}</p>
                      <p>데이터 소스: {weatherData.data_source || 'weather_forecast'}</p>
                      <p>마지막 수집: {formatDate(weatherData.last_updated)}</p>
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