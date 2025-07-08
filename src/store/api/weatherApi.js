import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './baseQuery'

export const weatherApi = createApi({
  reducerPath: 'weatherApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Weather', 'WeatherRegions'],
  endpoints: (builder) => ({
    // v3 현재 날씨 정보 조회 (관리자 관점)
    getCurrentWeather: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()
        if (params.nx) queryParams.append('nx', params.nx.toString())
        if (params.ny) queryParams.append('ny', params.ny.toString())
        if (params.location) queryParams.append('location', params.location)

        return `/api/weather/current?${queryParams.toString()}`
      },
      providesTags: ['Weather'],
      keepUnusedDataFor: 300, // 5분
      retry: (failureCount, error) => {
        if (error.status === 401 || error.status === 403) {
          return false
        }
        return failureCount < 2
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
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
  }),
})

export const {
  useGetCurrentWeatherQuery,
  useGetWeatherForecastQuery,
  useGetWeatherSummaryQuery,
  useGetAvailableRegionsQuery,
} = weatherApi
