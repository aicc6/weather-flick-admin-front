import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './baseQuery'

export const contentApi = createApi({
  reducerPath: 'contentApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Destination', 'RecommendationSettings'],
  endpoints: (builder) => ({
    getDestinations: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.search) queryParams.append('search', params.search)
        if (params.category) queryParams.append('category', params.category)
        if (params.region) queryParams.append('region', params.region)
        
        return `/api/v1/destinations?${queryParams.toString()}`
      },
      providesTags: ['Destination'],
    }),

    getDestinationById: builder.query({
      query: (id) => `/api/v1/destinations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Destination', id }],
    }),

    createDestination: builder.mutation({
      query: (data) => ({
        url: '/api/v1/destinations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Destination'],
    }),

    updateDestination: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/v1/destinations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Destination', id }],
    }),

    deleteDestination: builder.mutation({
      query: (id) => ({
        url: `/api/v1/destinations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Destination'],
    }),

    updateRecommendationWeight: builder.mutation({
      query: ({ id, weight }) => ({
        url: `/api/v1/destinations/${id}/weight`,
        method: 'PUT',
        body: { recommendation_weight: weight },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Destination', id }],
    }),

    getRecommendationSettings: builder.query({
      query: () => '/api/v1/admin/recommendation-settings',
      providesTags: ['RecommendationSettings'],
    }),

    updateRecommendationSettings: builder.mutation({
      query: (settings) => ({
        url: '/api/v1/admin/recommendation-settings',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['RecommendationSettings'],
    }),
  }),
})

export const {
  useGetDestinationsQuery,
  useGetDestinationByIdQuery,
  useCreateDestinationMutation,
  useUpdateDestinationMutation,
  useDeleteDestinationMutation,
  useUpdateRecommendationWeightMutation,
  useGetRecommendationSettingsQuery,
  useUpdateRecommendationSettingsMutation,
} = contentApi
