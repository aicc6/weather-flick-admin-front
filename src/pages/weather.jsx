
import { useState } from 'react'
import { WeatherStatsCard } from '@/components/common/WeatherStatsCard'
import WeatherDetailModal from '@/components/weather/WeatherDetailModal'
import { getWeatherIcon } from '@/utils/weatherUtils'
import { useGetForecastWeatherDataQuery, useGetCurrentWeatherDataQuery } from '@/store/api/weatherApi'
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
    data: forecastData = [],
    isLoading: forecastLoading,
    error: forecastError,
  } = useGetForecastWeatherDataQuery(50, {
    pollingInterval: 60000, // 60초마다 자동 새로고침
  })

  // RTK Query로 weather_current 테이블에서 실시간 데이터 가져오기
  const {
    data: currentData = [],
    isLoading: currentLoading,
    error: currentError,
  } = useGetCurrentWeatherDataQuery(50, {
    pollingInterval: 60000, // 60초마다 자동 새로고침
  })

  // 예보 데이터와 현재 데이터를 병합
  const weatherList = forecastData.map(forecastItem => {
    // 같은 지역의 현재 날씨 데이터 찾기
    const currentItem = currentData.find(current => current.region_code === forecastItem.region_code)
    
    // 현재 데이터가 있으면 병합, 없으면 예보 데이터만 사용
    return currentItem ? {
      ...forecastItem,
      // 현재 데이터에서 가져올 추가 정보들
      humidity: currentItem.humidity,
      wind_speed: currentItem.wind_speed,
      visibility: currentItem.visibility,
      uv_index: currentItem.uv_index,
      precipitation: currentItem.precipitation,
      // 더 최신 데이터 사용
      last_updated: currentItem.last_updated || forecastItem.last_updated,
      data_source: currentItem.data_source ? `${forecastItem.data_source} + ${currentItem.data_source}` : forecastItem.data_source
    } : forecastItem
  })

  const loading = forecastLoading || currentLoading
  const error = forecastError || currentError

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
              <h3 className="text-base font-semibold">도시별 상세 날씨</h3>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {weatherList.map((item) => (
              <Card
                key={item.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden"
                onClick={() => handleWeatherClick(item)}
              >
                <div className="p-6 relative">
                  {/* 배경 그라데이션 요소 */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full -mr-12 -mt-12 opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  
                  {/* 헤더 영역 */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div>
                      <h4 className="font-bold text-base text-gray-900 dark:text-white truncate">
                        {item.city_name}
                      </h4>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.weather_description}
                      </div>
                    </div>
                    <div className="text-4xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                      {getWeatherIcon(item.weather_description)}
                    </div>
                  </div>

                  {/* 메인 온도 */}
                  <div className="mb-4 relative z-10">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {item.temperature}°
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="flex items-center text-blue-600 dark:text-blue-400">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        {item.min_temp}°
                      </span>
                      <span className="flex items-center text-red-500 dark:text-red-400">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        {item.max_temp}°
                      </span>
                    </div>
                  </div>

                  {/* 강수확률 (있는 경우) */}
                  {item.precipitation_prob > 0 && (
                    <div className="mb-4 relative z-10">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6s.792.193 1.264.979c.284.473.736 1.121.736 1.821 0 1.357-1.124 2.6-2 2.6s-2-1.243-2-2.6c0-.7.452-1.348.736-1.821z" clipRule="evenodd" />
                        </svg>
                        {Math.round(item.precipitation_prob)}%
                      </div>
                    </div>
                  )}

                  {/* 하단 정보 */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 relative z-10">
                    {item.humidity && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">{item.humidity}%</span>
                      </div>
                    )}
                    {item.wind_speed && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm5.707 8.707a1 1 0 010-1.414L11 8h-1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V9.414l-1.293 1.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">{item.wind_speed}m/s</span>
                      </div>
                    )}
                  </div>
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
