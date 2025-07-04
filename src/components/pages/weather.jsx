import { useState, useEffect } from 'react'
import {
  useGetCurrentWeatherQuery,
  useGetWeatherSummaryQuery,
} from '../../store/api/weatherApi'
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
import { Badge } from '../ui/badge'

export const WeatherPage = () => {
  // RTK Query 훅들 - 실시간 날씨는 선택적으로 사용
  const {
    data: weatherData = {},
    isLoading: loading,
    error,
    refetch: refetchWeather,
  } = useGetCurrentWeatherQuery(undefined, {
    // 실시간 날씨 API 오류 시에도 페이지가 로드되도록 설정
    skip: false,
  })

  const {
    data: weatherSummaryData = {},
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useGetWeatherSummaryQuery()

  const [lastUpdated, setLastUpdated] = useState(null)
  const [showRealTimeWeather, setShowRealTimeWeather] = useState(true)

  useEffect(() => {
    setLastUpdated(new Date())

    // 실시간 날씨 API 오류 발생 시 자동으로 비활성화
    if (error && showRealTimeWeather) {
      console.warn('실시간 날씨 API 오류로 인해 DB 데이터만 표시합니다:', error)
      setShowRealTimeWeather(false)
    }

    // 10분마다 자동 새로고침 (DB 요약 데이터만)
    const interval = setInterval(
      () => {
        if (showRealTimeWeather && !error) {
          refetchWeather()
        }
        refetchSummary()
        setLastUpdated(new Date())
      },
      10 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [error, showRealTimeWeather, refetchWeather, refetchSummary])

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

  // 페이지네이션 상태
  const [dbWeatherPage, setDbWeatherPage] = useState(1)
  const dbWeatherPageSize = 4

  // DB 날씨 데이터는 weatherSummaryData에서 가져오기
  const dbWeatherData = weatherSummaryData.regions
    ? weatherSummaryData.regions.reduce((acc, region) => {
        acc[region.city_code || region.city_name] = {
          ...region,
          region_name: region.city_name,
          temperature: region.temperature,
          humidity: region.humidity,
          wind_speed: region.wind_speed,
          sky_condition: region.sky_condition,
        }
        return acc
      }, {})
    : {}

  const dbWeatherLastUpdated = weatherSummaryData.summary?.last_updated
    ? new Date(weatherSummaryData.summary.last_updated)
    : new Date()

  // 실시간 날씨 데이터가 없으면 DB 데이터를 대체 사용
  const displayWeatherData =
    error || Object.keys(weatherData).length === 0
      ? Object.fromEntries(
          regions.map((region) => [
            region.code,
            dbWeatherData[region.name] || {
              region_name: region.name,
              temperature: 'N/A',
              humidity: 'N/A',
              wind_speed: 'N/A',
              sky_condition: null,
            },
          ]),
        )
      : weatherData

  // 페이지 로딩 조건 수정 - DB 데이터도 없을 때만 로딩 표시
  if (summaryLoading && Object.keys(dbWeatherData).length === 0) {
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
        <div className="flex gap-2">
          {error && (
            <Button
              onClick={() => {
                setShowRealTimeWeather(true)
                refetchWeather()
              }}
              variant="outline"
              className="rounded-lg"
            >
              실시간 날씨 재시도
            </Button>
          )}
          <Button
            onClick={() => {
              if (showRealTimeWeather && !error) {
                refetchWeather()
              }
              refetchSummary()
              setLastUpdated(new Date())
            }}
            disabled={loading || summaryLoading}
            className="rounded-lg"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading || summaryLoading ? 'animate-spin' : ''}`}
            />
            새로고침
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            실시간 날씨 정보를 불러올 수 없습니다. DB 저장 데이터로 표시됩니다.
            {error.data?.detail && ` (${error.data.detail})`}
          </AlertDescription>
        </Alert>
      )}

      {summaryError && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            DB 날씨 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
          </AlertDescription>
        </Alert>
      )}

      {lastUpdated && (
        <div className="text-muted-foreground mb-2 text-sm">
          마지막 업데이트: {lastUpdated.toLocaleString()}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {regions.map((region) => {
          const data = displayWeatherData[region.code]
          if (!data) return null

          const isFromDB = error || Object.keys(weatherData).length === 0

          return (
            <Card
              key={region.code}
              className={`flex flex-col items-center justify-center p-4 ${
                isFromDB
                  ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
                  : ''
              }`}
            >
              <CardHeader className="flex w-full flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {data.region_name}
                  {isFromDB && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      DB
                    </Badge>
                  )}
                </CardTitle>
                {getWeatherIcon(data.sky_condition)}
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <span className="mb-1 text-3xl font-bold">
                  {data.temperature !== 'N/A' ? `${data.temperature}°C` : 'N/A'}
                </span>
                <Badge variant="outline" className="mb-2">
                  {getWeatherDescription(data.sky_condition)}
                </Badge>
                <div className="text-muted-foreground mt-2 w-full space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span>습도</span>
                    <span>
                      {data.humidity !== 'N/A' ? `${data.humidity}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>풍속</span>
                    <span>
                      {data.wind_speed !== 'N/A'
                        ? `${data.wind_speed} m/s`
                        : 'N/A'}
                    </span>
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
                const validData = Object.values(dbWeatherData).filter(
                  (data) =>
                    data.temperature !== undefined && data.temperature !== null,
                )
                const temperatures = validData.map((data) =>
                  parseInt(data.temperature),
                )
                if (temperatures.length === 0) {
                  return (
                    <div className="text-muted-foreground text-sm">
                      DB 데이터가 없습니다.
                    </div>
                  )
                }
                const avgTemp = (
                  temperatures.reduce((a, b) => a + b, 0) / temperatures.length
                ).toFixed(1)
                const maxTemp = Math.max(...temperatures)
                const minTemp = Math.min(...temperatures)
                const maxTempRegion = validData.find(
                  (data) => parseInt(data.temperature) === maxTemp,
                )
                const minTempRegion = validData.find(
                  (data) => parseInt(data.temperature) === minTemp,
                )
                return (
                  <>
                    <div className="mb-2 flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="font-medium">평균:</span> {avgTemp}°C
                      </div>
                      <div>
                        <span className="font-medium">최고:</span> {maxTemp}°C{' '}
                        <span className="text-xs text-gray-500">
                          ({maxTempRegion?.region_name})
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">최저:</span> {minTemp}°C{' '}
                        <span className="text-xs text-gray-500">
                          ({minTempRegion?.region_name})
                        </span>
                      </div>
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
              {Object.values(displayWeatherData).map((data) => {
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
              {Object.values(displayWeatherData).every(
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
            DB에 저장된 주요 도시의 최신 날씨 통계와 관리 정보를 한눈에 확인할
            수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground mb-4 text-sm">
            DB에 저장된 주요 도시의 최신 날씨 통계와 상태를 한눈에 확인할 수
            있습니다. <br />
            실시간 데이터와 다를 수 있으며, 관리/분석용으로 활용하세요.
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-4 rounded-md bg-gray-50 px-4 py-3 text-sm dark:bg-gray-900/40">
            <div>
              <span className="font-semibold">도시 수:</span>{' '}
              {Object.keys(dbWeatherData).length}
            </div>
            {dbWeatherLastUpdated && (
              <div className="text-xs text-gray-500">
                업데이트: {dbWeatherLastUpdated.toLocaleString()}
              </div>
            )}
            <Button
              onClick={() => refetchSummary()}
              disabled={summaryLoading}
              size="sm"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${summaryLoading ? 'animate-spin' : ''}`}
              />
              새로고침
            </Button>
          </div>
          {summaryError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                DB 날씨 데이터를 불러오는데 실패했습니다.
              </AlertDescription>
            </Alert>
          )}
          <div className="mb-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {summaryLoading && Object.keys(dbWeatherData).length === 0 ? (
                <div className="col-span-4 flex h-32 items-center justify-center">
                  <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-gray-900"></div>
                </div>
              ) : (
                Object.values(dbWeatherData)
                  .slice(
                    (dbWeatherPage - 1) * dbWeatherPageSize,
                    dbWeatherPage * dbWeatherPageSize,
                  )
                  .map((data) => (
                    <Card
                      key={data.region_name}
                      className="border border-gray-200 shadow-none dark:border-gray-700"
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {data.region_name}
                        </CardTitle>
                        {(() => {
                          if (!data.sky_condition)
                            return <Cloud className="h-4 w-4 text-gray-400" />
                          if (data.sky_condition.includes('맑'))
                            return <Sun className="h-4 w-4 text-yellow-500" />
                          if (data.sky_condition.includes('구름'))
                            return <Cloud className="h-4 w-4 text-gray-500" />
                          if (data.sky_condition.includes('비'))
                            return (
                              <CloudRain className="h-4 w-4 text-blue-500" />
                            )
                          if (data.sky_condition.includes('눈'))
                            return (
                              <CloudSnow className="h-4 w-4 text-blue-300" />
                            )
                          return <Cloud className="h-4 w-4 text-gray-400" />
                        })()}
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {data.temperature !== undefined
                            ? `${data.temperature}°C`
                            : 'N/A'}
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {(() => {
                            if (!data.sky_condition) return '알 수 없음'
                            if (data.sky_condition.includes('맑')) return '맑음'
                            if (data.sky_condition.includes('구름'))
                              return '구름 많음'
                            if (data.sky_condition.includes('비')) return '비'
                            if (data.sky_condition.includes('눈')) return '눈'
                            return data.sky_condition
                          })()}
                        </p>
                        <div className="text-muted-foreground mt-2 space-y-1 text-xs">
                          <div>
                            습도:{' '}
                            {data.humidity !== undefined
                              ? `${data.humidity}%`
                              : 'N/A'}
                          </div>
                          <div>
                            풍속:{' '}
                            {data.wind_speed !== undefined
                              ? `${data.wind_speed}m/s`
                              : 'N/A'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
            {/* 페이지네이션 버튼 */}
            {Object.keys(dbWeatherData).length > dbWeatherPageSize && (
              <div className="flex max-w-full justify-center overflow-x-auto pt-2 pb-1">
                <div className="flex flex-wrap gap-1">
                  {(() => {
                    const totalPages = Math.ceil(
                      Object.keys(dbWeatherData).length / dbWeatherPageSize,
                    )
                    const maxPages = 10
                    const [pageGroup, _setPageGroup] = [
                      Math.floor((dbWeatherPage - 1) / maxPages),
                      (v) => setDbWeatherPage(v * maxPages + 1),
                    ]
                    const startPage = pageGroup * maxPages + 1
                    const endPage = Math.min(
                      startPage + maxPages - 1,
                      totalPages,
                    )
                    const pageButtons = []
                    if (pageGroup > 0) {
                      pageButtons.push(
                        <button
                          key="prev-group"
                          onClick={() => setDbWeatherPage(startPage - maxPages)}
                          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                          style={{ minWidth: 28 }}
                        >
                          {'<'}
                        </button>,
                      )
                    }
                    for (let i = startPage; i <= endPage; i++) {
                      pageButtons.push(
                        <button
                          key={i}
                          onClick={() => setDbWeatherPage(i)}
                          className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors duration-100 outline-none focus:ring-2 focus:ring-blue-400 ${
                            dbWeatherPage === i
                              ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                              : 'border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700'
                          } `}
                          style={{ minWidth: 28 }}
                          aria-current={
                            dbWeatherPage === i ? 'page' : undefined
                          }
                        >
                          {i}
                        </button>,
                      )
                    }
                    if (endPage < totalPages) {
                      pageButtons.push(
                        <button
                          key="more"
                          onClick={() => setDbWeatherPage(endPage + 1)}
                          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                          style={{ minWidth: 28 }}
                        >
                          더보기
                        </button>,
                      )
                    }
                    return pageButtons
                  })()}
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 space-y-2 border-t pt-4 text-xs text-gray-500 dark:text-gray-400">
            <div>
              • DB 요약 데이터는 주기적으로 갱신되며, 실시간 데이터와 다를 수
              있습니다.
            </div>
            <div>
              • 데이터는 매일 자동 백업되며, 관리자가 직접 수동 갱신/복구할 수
              있습니다.
            </div>
            <div>
              • 기상청 API 장애 시, DB 데이터가 최신이 아닐 수 있습니다.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
