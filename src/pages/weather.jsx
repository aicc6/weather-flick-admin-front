import WeatherAlert from './WeatherAlert'

import { WeatherStatsCard } from '@/components/common/WeatherStatsCard'
import { getWeatherIcon } from '@/utils/weatherUtils'
import { useGetForecastWeatherDataQuery } from '@/store/api/weatherApi'
import { PageContainer, PageHeader, ContentSection } from '@/layouts'

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

function WeatherRealtimePage() {
  // RTK Query로 weather_forecasts 테이블에서 데이터 가져오기 (1분마다 자동 갱신)
  const {
    data: weatherList = [],
    isLoading: loading,
    error,
  } = useGetForecastWeatherDataQuery(20, {
    pollingInterval: 60000, // 60초마다 자동 새로고침
  })

  return (
    <PageContainer>
      <PageHeader
        title="날씨 정보 관리"
        description="주요 도시의 실시간 날씨 정보를 확인하고 관리합니다."
      />

      {/* 요약 통계 카드 (대시보드 스타일) */}
      <ContentSection transparent>
        <WeatherStatsCard weatherData={weatherList} />
      </ContentSection>

      {/* 날씨 알림 카드 */}
      {weatherList.length > 0 && (
        <ContentSection>
          <div className="relative">
            <WeatherAlert weather={weatherList[0]} />
            {weatherList[0].last_updated && (
              <div className="absolute right-4 top-4 text-sm text-muted-foreground">
                업데이트: {formatDateTime(weatherList[0].last_updated)}
              </div>
            )}
          </div>
        </ContentSection>
      )}

      {/* 도시별 요약 카드 (가로 스크롤) */}
      {weatherList.length > 0 && (
        <ContentSection>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">도시별 요약</h3>
              <p className="text-muted-foreground text-sm">
                주요 도시의 현재 날씨를 한눈에 확인
              </p>
            </div>
            {weatherList.length > 0 && weatherList[0].last_updated && (
              <div className="text-sm text-muted-foreground">
                수집: {formatDateTime(weatherList[0].last_updated)}
              </div>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto py-2">
            {weatherList.map((item) => (
              <div
                key={item.id}
                className="bg-muted flex min-w-[160px] flex-col items-center rounded-lg border px-3 py-3"
                style={{ flex: '0 0 160px' }}
              >
                <div className="mb-1 text-sm font-semibold text-blue-900">
                  {item.city_name}
                </div>
                <div className="mb-1 text-2xl font-bold text-blue-600">
                  {item.temperature}°
                </div>
                <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{item.min_temp}°</span>
                  <span>/</span>
                  <span>{item.max_temp}°</span>
                </div>
                <div className="mb-1">
                  {getWeatherIcon(item.weather_description)}
                </div>
                <div className="text-muted-foreground min-h-[18px] text-center text-xs">
                  {item.weather_description}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {item.forecast_date && (
                    <div>예보: {formatDateTime(item.forecast_date)}</div>
                  )}
                  {item.last_updated && (
                    <div>수집: {formatDateTime(item.last_updated)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ContentSection>
      )}

      {loading && (
        <div className="text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      )}
      {error && (
        <div className="text-center">
          <p className="text-red-500">
            {error.data?.message || '날씨 데이터를 불러오지 못했습니다.'}
          </p>
        </div>
      )}
    </PageContainer>
  )
}

export default WeatherRealtimePage
export const WeatherPage = WeatherRealtimePage

// 최신 도시별 날씨 데이터를 가져오는 함수는 더 이상 필요하지 않음 (RTK Query로 대체)
