import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const travelPlansApi = createApi({
  reducerPath: 'travelPlansApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TravelPlan'],
  endpoints: (builder) => ({
    getTravelPlans: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()
        if (params.skip) queryParams.append('skip', params.skip)
        if (params.limit) queryParams.append('limit', params.limit)
        return `/api/travel-plans/?${queryParams.toString()}`
      },
      providesTags: ['TravelPlan'],
    }),
    getTravelPlanById: builder.query({
      query: (plan_id) => `/api/travel-plans/${plan_id}`,
      providesTags: (result, error, id) => [{ type: 'TravelPlan', id }],
    }),
    createTravelPlan: builder.mutation({
      query: (data) => ({
        url: '/api/travel-plans',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TravelPlan'],
    }),
    updateTravelPlan: builder.mutation({
      query: ({ plan_id, data }) => ({
        url: `/api/travel-plans/${plan_id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { plan_id }) => [
        { type: 'TravelPlan', plan_id },
      ],
    }),
    deleteTravelPlan: builder.mutation({
      query: (plan_id) => ({
        url: `/api/travel-plans/${plan_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TravelPlan'],
    }),
  }),
})

export const {
  useGetTravelPlansQuery,
  useGetTravelPlanByIdQuery,
  useCreateTravelPlanMutation,
  useUpdateTravelPlanMutation,
  useDeleteTravelPlanMutation,
} = travelPlansApi
