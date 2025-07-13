import WeatherAlert from './WeatherAlert'

import { WeatherStatsCard } from '@/components/common/WeatherStatsCard'
import { getWeatherIcon } from '@/utils/weatherUtils'
import { useGetForecastWeatherDataQuery } from '@/store/api/weatherApi'
import { PageContainer, PageHeader, ContentSection } from '@/layouts'

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
          <WeatherAlert weather={weatherList[0]} />
        </ContentSection>
      )}

      {/* 도시별 요약 카드 (가로 스크롤) */}
      {weatherList.length > 0 && (
        <ContentSection>
          <h3 className="mb-4 text-lg font-semibold">도시별 요약</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            주요 도시의 현재 날씨를 한눈에 확인
          </p>
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
