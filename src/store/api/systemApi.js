import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './baseQuery'

export const systemApi = createApi({
  reducerPath: 'systemApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['SystemStatus', 'DashboardStats', 'Logs'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/api/system/status',
      providesTags: ['DashboardStats'],
    }),

    getSystemStatus: builder.query({
      query: () => '/api/system/status',
      providesTags: ['SystemStatus'],
    }),

    getServerMetrics: builder.query({
      query: (_serverId) => `/api/system/status`,
    }),

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
