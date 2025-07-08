import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './baseQuery'

export const systemApi = createApi({
  reducerPath: 'systemApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['SystemStatus', 'DashboardStats', 'Logs'],
  endpoints: (builder) => ({
    // v3 대시보드 통계 정보 조회
    getDashboardStats: builder.query({
      query: () => '/api/dashboard/stats',
      providesTags: ['DashboardStats'],
    }),

    // v3 시스템 상태 정보 조회
    getSystemStatus: builder.query({
      query: () => '/api/system/status',
      providesTags: ['SystemStatus'],
    }),

    getServerMetrics: builder.query({
      query: (_serverId) => `/api/system/status`,
    }),

    // v3 시스템 로그 조회 (백엔드 라우터 구조와 일치)
    getLogs: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()
        const allowed = ['page', 'size', 'level', 'source', 'message']
        Object.entries(params).forEach(([key, value]) => {
          if (
            allowed.includes(key) &&
            value !== undefined &&
            value !== null &&
            value !== ''
          ) {
            queryParams.append(key, value.toString())
          }
        })
        return `/api/system/logs?${queryParams.toString()}`
      },
      providesTags: ['Logs'],
    }),

    getApiHealth: builder.query({
      query: () => '/api/system/status',
    }),

    performHealthCheck: builder.mutation({
      query: () => ({
        url: '/api/system/status',
        method: 'GET',
      }),
      invalidatesTags: ['SystemStatus'],
    }),

    restartService: builder.mutation({
      query: (_serviceId) => ({
        url: `/api/system/status`,
        method: 'GET',
      }),
      invalidatesTags: ['SystemStatus'],
    }),
  }),
})

export const {
  useGetDashboardStatsQuery,
  useGetSystemStatusQuery,
  useGetServerMetricsQuery,
  useGetLogsQuery,
  useGetApiHealthQuery,
  usePerformHealthCheckMutation,
  useRestartServiceMutation,
} = systemApi
