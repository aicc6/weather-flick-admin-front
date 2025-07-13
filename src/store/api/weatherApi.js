import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const weatherApi = createApi({
  reducerPath: 'weatherApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Weather', 'WeatherRegions'],
  endpoints: (builder) => ({
    getCurrentWeather: builder.query({
      query: () => '/api/weather/current',
      providesTags: ['Weather'],
      // 5분마다 자동 새로고침
      keepUnusedDataFor: 300, // 5분
      // 실패 시 재시도 설정
      retry: (failureCount, error) => {
        // 401, 403 등 인증 관련 오류는 재시도하지 않음
        if (error.status === 401 || error.status === 403) {
          return false
        }
        // 최대 2회 재시도
        return failureCount < 2
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // 지수 백오프
    }),

    getWeatherForecast: builder.query({
      query: (regionCode) => `/api/weather/forecast/${regionCode}`,
      providesTags: ['Weather'],
      keepUnusedDataFor: 600, // 10분
    }),

    getWeatherSummary: builder.query({
      query: () => '/api/weather/summary-db',
      providesTags: ['Weather'],
      keepUnusedDataFor: 300, // 5분
      // 실패 시 재시도 설정
      retry: (failureCount, error) => {
        if (error.status === 401 || error.status === 403) {
          return false
        }
        return failureCount < 2
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    }),

    getAvailableRegions: builder.query({
      query: () => '/api/weather/cities',
      providesTags: ['WeatherRegions'],
      // 지역 정보는 자주 변경되지 않으므로 더 오래 캐시
      keepUnusedDataFor: 3600, // 1시간
    }),

    // 데이터베이스에서 최신 날씨 데이터 조회 (기존 city_weather_data 테이블)
    getLatestWeatherData: builder.query({
      query: (limit = 20) => `/api/weather/database/data?limit=${limit}`,
      transformResponse: (response) => response.data || [],
      providesTags: ['Weather'],
      keepUnusedDataFor: 60, // 1분
    }),

    // weather_forecasts 테이블에서 예보 데이터 조회
    getForecastWeatherData: builder.query({
      query: (limit = 20) =>
        `/api/weather/database/forecast-data?limit=${limit}`,
      transformResponse: (response) => {
        // 백엔드에서 배열로 직접 반환하므로 response.data가 아닌 response 자체를 사용
        return response.data || response || []
      },
      providesTags: ['Weather'],
      keepUnusedDataFor: 60, // 1분
    }),
  }),
})

export const {
  useGetCurrentWeatherQuery,
  useGetWeatherForecastQuery,
  useGetWeatherSummaryQuery,
  useGetAvailableRegionsQuery,
  useGetLatestWeatherDataQuery,
  useGetForecastWeatherDataQuery,
} = weatherApi
