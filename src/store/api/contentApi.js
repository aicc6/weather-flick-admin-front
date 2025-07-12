import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const contentApi = createApi({
  reducerPath: 'contentApi',
  baseQuery: baseQueryWithReauth,
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

        return `/api/destinations?${queryParams.toString()}`
      },
      providesTags: ['Destination'],
    }),

    getDestinationById: builder.query({
      query: (id) => `/api/destinations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Destination', id }],
    }),

    createDestination: builder.mutation({
      query: (data) => ({
        url: '/api/destinations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Destination'],
    }),

    updateDestination: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/destinations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Destination', id }],
    }),

    deleteDestination: builder.mutation({
      query: (id) => ({
        url: `/api/destinations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Destination'],
    }),

    updateRecommendationWeight: builder.mutation({
      query: ({ id, weight }) => ({
        url: `/api/destinations/${id}/weight`,
        method: 'PUT',
        body: { recommendation_weight: weight },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Destination', id }],
    }),

    getRecommendationSettings: builder.query({
      query: () => '/api/recommendation-settings',
      providesTags: ['RecommendationSettings'],
    }),

    updateRecommendationSettings: builder.mutation({
      query: (settings) => ({
        url: '/api/recommendation-settings',
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

// Travel Courses API
export const travelCoursesApi = createApi({
  reducerPath: 'travelCoursesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TravelCourse'],
  endpoints: (builder) => ({
    getTravelCourses: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params?.limit) queryParams.append('limit', params.limit)
        if (params?.offset) queryParams.append('offset', params.offset)
        if (params?.course_name)
          queryParams.append('course_name', params.course_name)
        if (params?.region) queryParams.append('region', params.region)
        return `/api/travel-courses/?${queryParams.toString()}`
      },
      providesTags: ['TravelCourse'],
    }),
    getTravelCourseById: builder.query({
      query: (content_id) => `/api/travel-courses/${content_id}`,
      providesTags: (result, error, id) => [{ type: 'TravelCourse', id }],
    }),
    createTravelCourse: builder.mutation({
      query: (data) => ({
        url: '/api/travel-courses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TravelCourse'],
    }),
    updateTravelCourse: builder.mutation({
      query: ({ content_id, data }) => ({
        url: `/api/travel-courses/${content_id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { content_id }) => [
        { type: 'TravelCourse', content_id },
      ],
    }),
    deleteTravelCourse: builder.mutation({
      query: (content_id) => ({
        url: `/api/travel-courses/${content_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TravelCourse'],
    }),
  }),
})

export const {
  useGetTravelCoursesQuery,
  useGetTravelCourseByIdQuery,
  useCreateTravelCourseMutation,
  useUpdateTravelCourseMutation,
  useDeleteTravelCourseMutation,
} = travelCoursesApi

// Festivals Events API
export const festivalsEventsApi = createApi({
  reducerPath: 'festivalsEventsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['FestivalEvent'],
  endpoints: (builder) => ({
    getFestivalEvents: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params?.skip) queryParams.append('skip', params.skip)
        if (params?.limit) queryParams.append('limit', params.limit)
        if (params?.region_code)
          queryParams.append('region_code', params.region_code)
        if (params?.event_name)
          queryParams.append('event_name', params.event_name)
        return `/api/festivals-events/?${queryParams.toString()}`
      },
      providesTags: ['FestivalEvent'],
    }),
    getFestivalEventById: builder.query({
      query: (content_id) => `/api/festivals-events/${content_id}/`,
      providesTags: (result, error, id) => [{ type: 'FestivalEvent', id }],
    }),
    createFestivalEvent: builder.mutation({
      query: (data) => ({
        url: '/api/festivals-events/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['FestivalEvent'],
    }),
    updateFestivalEvent: builder.mutation({
      query: ({ content_id, data }) => ({
        url: `/api/festivals-events/${content_id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { content_id }) => [
        { type: 'FestivalEvent', content_id },
      ],
    }),
    deleteFestivalEvent: builder.mutation({
      query: (content_id) => ({
        url: `/api/festivals-events/${content_id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FestivalEvent'],
    }),
    getFestivalEventNames: builder.query({
      query: (q) =>
        `/api/festivals-events/autocomplete/?q=${encodeURIComponent(q)}`,
    }),
  }),
})

export const {
  useGetFestivalEventsQuery,
  useGetFestivalEventByIdQuery,
  useCreateFestivalEventMutation,
  useUpdateFestivalEventMutation,
  useDeleteFestivalEventMutation,
  useGetFestivalEventNamesQuery,
} = festivalsEventsApi

// Leisure Sports API
export const leisureSportsApi = createApi({
  reducerPath: 'leisureSportsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['LeisureSport'],
  endpoints: (builder) => ({
    getLeisureSports: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params?.skip) queryParams.append('skip', params.skip)
        if (params?.limit) queryParams.append('limit', params.limit)
        if (params?.region_code)
          queryParams.append('region_code', params.region_code)
        if (params?.facility_name)
          queryParams.append('facility_name', params.facility_name)
        return `/api/leisure-sports/?${queryParams.toString()}`
      },
      providesTags: ['LeisureSport'],
    }),
    getLeisureSportById: builder.query({
      query: (content_id) => `/api/leisure-sports/${content_id}/`,
      providesTags: (result, error, id) => [{ type: 'LeisureSport', id }],
    }),
    createLeisureSport: builder.mutation({
      query: (data) => ({
        url: '/api/leisure-sports/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LeisureSport'],
    }),
    updateLeisureSport: builder.mutation({
      query: ({ content_id, data }) => ({
        url: `/api/leisure-sports/${content_id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { content_id }) => [
        { type: 'LeisureSport', content_id },
      ],
    }),
    deleteLeisureSport: builder.mutation({
      query: (content_id) => ({
        url: `/api/leisure-sports/${content_id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LeisureSport'],
    }),
    getLeisureFacilityNames: builder.query({
      query: (q) =>
        `/api/leisure-sports/autocomplete/?q=${encodeURIComponent(q)}`,
    }),
  }),
})

export const {
  useGetLeisureSportsQuery,
  useGetLeisureSportByIdQuery,
  useCreateLeisureSportMutation,
  useUpdateLeisureSportMutation,
  useDeleteLeisureSportMutation,
  useGetLeisureFacilityNamesQuery,
} = leisureSportsApi
