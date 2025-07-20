import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    // 날씨 요약 데이터 (weather_forecasts 테이블 사용)
    getWeatherSummary: builder.query({
      query: () => '/api/weather/summary-forecast',
      // transformResponse 제거하여 원본 API 응답 구조 유지
      providesTags: ['Dashboard'],
      keepUnusedDataFor: 60, // 1분 캐싱
    }),

    // 사용자 통계
    getUserStats: builder.query({
      query: () => '/api/users/stats',
      providesTags: ['Dashboard'],
      keepUnusedDataFor: 300, // 5분 캐싱
    }),

    // 관리자 통계
    getAdminStats: builder.query({
      query: () => '/api/admins/stats',
      providesTags: ['Dashboard'],
      keepUnusedDataFor: 300, // 5분 캐싱
    }),

    // 지역 수 (여행 코스)
    getTravelCourseRegionCount: builder.query({
      query: () => '/api/travel-courses/region-count',
      providesTags: ['Dashboard'],
      keepUnusedDataFor: 600, // 10분 캐싱
    }),

    // 관광지 요약 (필요한 경우)
    getTouristAttractionsSummary: builder.query({
      query: () => ({
        url: '/api/tourist-attractions/',
        params: { limit: 1, offset: 0 }, // 총 개수만 가져오기
      }),
      transformResponse: (response) => ({
        total: response.count || response.total || 0,
        recentItem: response.results?.[0] || response.items?.[0] || null,
      }),
      providesTags: ['Dashboard'],
      keepUnusedDataFor: 300, // 5분 캐싱
    }),

    // 대시보드 종합 통계
    getDashboardStats: builder.query({
      query: () => '/api/dashboard/stats',
      providesTags: ['Dashboard'],
      keepUnusedDataFor: 60, // 1분 캐싱
    }),
  }),
})

export const {
  useGetWeatherSummaryQuery,
  useGetUserStatsQuery,
  useGetAdminStatsQuery,
  useGetTravelCourseRegionCountQuery,
  useGetTouristAttractionsSummaryQuery,
  useGetDashboardStatsQuery,
} = dashboardApi
