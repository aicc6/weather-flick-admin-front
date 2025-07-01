import { useState, useEffect } from 'react'
import { apiService } from '../../services/api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Button } from '../ui/button'
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { Alert, AlertDescription } from '../ui/alert'

export const WeatherPage = () => {
  const [weatherData, setWeatherData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchWeatherData = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await apiService.getCurrentWeather()
      setWeatherData(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError('날씨 데이터를 불러오는데 실패했습니다.')
      console.error('Weather data fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherData()

    // 10분마다 자동 새로고침
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = (skyCondition) => {
    switch (skyCondition) {
      case 'DB01':
        return <Sun className="h-4 w-4 text-yellow-500" />
      case 'DB02':
        return <Cloud className="h-4 w-4 text-gray-500" />
      case 'DB03':
        return <CloudRain className="h-4 w-4 text-blue-500" />
      case 'DB04':
        return <CloudSnow className="h-4 w-4 text-blue-300" />
      default:
        return <Sun className="h-4 w-4 text-yellow-500" />
    }
  }

  const getWeatherDescription = (skyCondition) => {
    switch (skyCondition) {
      case 'DB01':
        return '맑음'
      case 'DB02':
        return '구름 많음'
      case 'DB03':
        return '흐림'
      case 'DB04':
        return '눈'
      default:
        return '알 수 없음'
    }
  }

  const regions = [
    { code: '108', name: '서울' },
    { code: '159', name: '부산' },
    { code: '143', name: '대구' },
    { code: '184', name: '제주' },
  ]

  if (loading && Object.keys(weatherData).length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            실시간 날씨 정보
          </h2>
          <p className="text-muted-foreground">
            기상청 API를 통해 실시간으로 업데이트되는 날씨 정보입니다.
          </p>
        </div>

        <Button onClick={fetchWeatherData} disabled={loading}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
          />
          새로고침
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {lastUpdated && (
        <div className="text-muted-foreground text-sm">
          마지막 업데이트: {lastUpdated.toLocaleString()}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {regions.map((region) => {
          const data = weatherData[region.code]
          if (!data) return null

          return (
            <Card key={region.code}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {data.region_name}
                </CardTitle>
                {getWeatherIcon(data.sky_condition)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.temperature !== 'N/A' ? `${data.temperature}°C` : 'N/A'}
                </div>
                <p className="text-muted-foreground text-xs">
                  {getWeatherDescription(data.sky_condition)}
                </p>
                <div className="text-muted-foreground mt-2 space-y-1 text-xs">
                  <div>
                    습도:{' '}
                    {data.humidity !== 'N/A' ? `${data.humidity}%` : 'N/A'}
                  </div>
                  <div>
                    풍속:{' '}
                    {data.wind_speed !== 'N/A'
                      ? `${data.wind_speed}m/s`
                      : 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>날씨 통계</CardTitle>
            <CardDescription>
              주요 도시들의 날씨 통계 정보입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const validData = Object.values(weatherData).filter(
                  (data) => data.temperature !== 'N/A',
                )
                const temperatures = validData.map((data) =>
                  parseInt(data.temperature),
                )

                if (temperatures.length === 0) {
                  return (
                    <div className="text-muted-foreground text-sm">
                      데이터가 없습니다.
                    </div>
                  )
                }

                const avgTemp = (
                  temperatures.reduce((a, b) => a + b, 0) / temperatures.length
                ).toFixed(1)
                const maxTemp = Math.max(...temperatures)
                const minTemp = Math.min(...temperatures)
                const maxTempRegion = Object.values(weatherData).find(
                  (data) => parseInt(data.temperature) === maxTemp,
                )
                const minTempRegion = Object.values(weatherData).find(
                  (data) => parseInt(data.temperature) === minTemp,
                )

                return (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">평균 기온</span>
                      <span className="text-sm">{avgTemp}°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">최고 기온</span>
                      <span className="text-sm">
                        {maxTemp}°C ({maxTempRegion?.region_name})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">최저 기온</span>
                      <span className="text-sm">
                        {minTemp}°C ({minTempRegion?.region_name})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        데이터 업데이트
                      </span>
                      <span className="text-sm text-green-600">정상</span>
                    </div>
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>날씨 알림</CardTitle>
            <CardDescription>현재 활성화된 날씨 알림입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.values(weatherData).map((data) => {
                if (
                  data.sky_condition === 'DB03' ||
                  data.sky_condition === 'DB04'
                ) {
                  return (
                    <div key={data.region_name} className="text-sm">
                      <span className="font-medium">{data.region_name}:</span>
                      {data.sky_condition === 'DB03'
                        ? ' 흐림 주의보'
                        : ' 강설 주의보'}
                    </div>
                  )
                }
                return null
              })}
              {Object.values(weatherData).every(
                (data) =>
                  data.sky_condition !== 'DB03' &&
                  data.sky_condition !== 'DB04',
              ) && (
                  <div className="text-muted-foreground text-sm">
                    현재 활성화된 날씨 알림이 없습니다.
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>날씨 데이터 관리</CardTitle>
          <CardDescription>
            Weather Flick의 날씨 데이터를 관리할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm">
              <span className="font-medium">데이터 업데이트:</span>
              <br />
              실시간 날씨 데이터가 10분마다 자동으로 업데이트됩니다.
            </div>
            <div className="text-sm">
              <span className="font-medium">API 연동:</span>
              <br />
              기상청 API와 연동되어 정확한 날씨 정보를 제공합니다.
            </div>
            <div className="text-sm">
              <span className="font-medium">알림 시스템:</span>
              <br />
              특정 날씨 조건에서 자동으로 알림을 발송합니다.
            </div>
            <div className="text-sm">
              <span className="font-medium">데이터 백업:</span>
              <br />
              날씨 데이터는 매일 자동으로 백업됩니다.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
