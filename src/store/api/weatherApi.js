import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './baseQuery'

export const weatherApi = createApi({
  reducerPath: 'weatherApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Weather', 'WeatherRegions'],
  endpoints: (builder) => ({
    getCurrentWeather: builder.query({
      query: () => '/weather/current',
      providesTags: ['Weather'],
      // 5분마다 자동 새로고침
      keepUnusedDataFor: 300, // 5분
    }),

    getWeatherForecast: builder.query({
      query: (regionCode) => `/weather/forecast/${regionCode}`,
      providesTags: ['Weather'],
      keepUnusedDataFor: 600, // 10분
    }),

    getWeatherSummary: builder.query({
      query: () => '/weather/summary-db',
      providesTags: ['Weather'],
      keepUnusedDataFor: 300, // 5분
    }),

    getAvailableRegions: builder.query({
      query: () => '/weather/regions',
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