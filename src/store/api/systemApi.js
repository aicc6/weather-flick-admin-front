import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './baseQuery'

export const systemApi = createApi({
  reducerPath: 'systemApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['SystemStatus', 'DashboardStats', 'Logs'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/api/v1/admin/dashboard/stats',
      providesTags: ['DashboardStats'],
    }),

    getSystemStatus: builder.query({
      query: () => '/api/v1/admin/system/status',
      providesTags: ['SystemStatus'],
    }),

    getServerMetrics: builder.query({
      query: (serverId) => `/api/v1/admin/system/servers/${serverId}/metrics`,
    }),

    getLogs: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString())
          }
        })
        return `/api/v1/admin/logs?${queryParams.toString()}`
      },
      providesTags: ['Logs'],
    }),

    getApiHealth: builder.query({
      query: () => '/api/v1/admin/health/external-apis',
    }),

    performHealthCheck: builder.mutation({
      query: () => ({
        url: '/api/v1/admin/health/check',
        method: 'POST',
      }),
      invalidatesTags: ['SystemStatus'],
    }),

    restartService: builder.mutation({
      query: (serviceId) => ({
        url: `/api/v1/admin/system/services/${serviceId}/restart`,
        method: 'POST',
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
