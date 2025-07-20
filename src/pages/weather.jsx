
import { useState } from 'react'
import { WeatherStatsCard } from '@/components/common/WeatherStatsCard'
import WeatherDetailModal from '@/components/weather/WeatherDetailModal'
import { getWeatherIcon } from '@/utils/weatherUtils'
import { useGetForecastWeatherDataQuery } from '@/store/api/weatherApi'
import { PageContainer, PageHeader, ContentSection } from '@/layouts'
import { Card } from '@/components/ui/card'

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
  const [selectedWeather, setSelectedWeather] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // RTK Query로 weather_forecasts 테이블에서 데이터 가져오기 (1분마다 자동 갱신)
  const {
    data: weatherList = [],
    isLoading: loading,
    error,
  } = useGetForecastWeatherDataQuery(50, {
    pollingInterval: 60000, // 60초마다 자동 새로고침
  })

  const handleWeatherClick = (weather) => {
    setSelectedWeather(weather)
    setIsDetailModalOpen(true)
  }

  return (
    <PageContainer>
      <PageHeader
        title="날씨 정보 관리"
        description="주요 도시의 실시간 날씨 정보를 확인하고 관리합니다."
      />

      {/* 요약 통계 카드 (대시보드 스타일) */}
      <ContentSection transparent className="mt-6">
        <WeatherStatsCard weatherData={weatherList} />
      </ContentSection>

      {/* 도시별 요약 카드 (가로 스크롤) */}
      {weatherList.length > 0 && (
        <ContentSection>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">도시별 상세 날씨</h3>
              <p className="text-muted-foreground text-sm">
                클릭하여 상세 정보를 확인하세요
              </p>
            </div>
            {weatherList.length > 0 && weatherList[0].last_updated && (
              <div className="text-sm text-muted-foreground">
                수집: {formatDateTime(weatherList[0].last_updated)}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {weatherList.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleWeatherClick(item)}
              >
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{item.city_name}</h4>
                    {getWeatherIcon(item.weather_description)}
                  </div>
                  <div className="text-3xl font-bold">
                    {item.temperature}°
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>최저 {item.min_temp}°</span>
                    <span>최고 {item.max_temp}°</span>
                  </div>
                  <div className="text-sm">
                    {item.weather_description}
                  </div>
                  {item.precipitation_prob > 0 && (
                    <div className="text-sm text-blue-600">
                      강수확률 {item.precipitation_prob}%
                    </div>
                  )}
                </div>
              </Card>
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

      {/* 날씨 상세 정보 모달 */}
      <WeatherDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        weatherData={selectedWeather}
      />
    </PageContainer>
  )
}

export default WeatherRealtimePage
export const WeatherPage = WeatherRealtimePage
