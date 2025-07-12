import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const touristAttractionsApi = createApi({
  reducerPath: 'touristAttractionsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TouristAttraction'],
  endpoints: (builder) => ({
    // 관광지 목록 조회
    getTouristAttractions: builder.query({
      query: (params = {}) => ({
        url: '/api/tourist-attractions/',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ content_id }) => ({
                type: 'TouristAttraction',
                id: content_id,
              })),
              { type: 'TouristAttraction', id: 'LIST' },
            ]
          : [{ type: 'TouristAttraction', id: 'LIST' }],
      keepUnusedDataFor: 300, // 5분 캐싱
    }),

    // 관광지 상세 조회
    getTouristAttraction: builder.query({
      query: (contentId) => `/api/tourist-attractions/${contentId}`,
      providesTags: (result, error, contentId) => [
        { type: 'TouristAttraction', id: contentId },
      ],
      keepUnusedDataFor: 600, // 10분 캐싱
    }),

    // 관광지 검색
    searchTouristAttractions: builder.query({
      query: ({ keyword }) => ({
        url: '/api/tourist-attractions/search/',
        params: { keyword },
      }),
      providesTags: ['TouristAttraction'],
      keepUnusedDataFor: 60, // 1분 캐싱
    }),

    // 관광지 생성
    createTouristAttraction: builder.mutation({
      query: (data) => ({
        url: '/api/tourist-attractions/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'TouristAttraction', id: 'LIST' }],
    }),

    // 관광지 수정
    updateTouristAttraction: builder.mutation({
      query: ({ contentId, ...data }) => ({
        url: `/api/tourist-attractions/${contentId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { contentId }) => [
        { type: 'TouristAttraction', id: contentId },
        { type: 'TouristAttraction', id: 'LIST' },
      ],
    }),

    // 관광지 삭제
    deleteTouristAttraction: builder.mutation({
      query: (contentId) => ({
        url: `/api/tourist-attractions/${contentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, contentId) => [
        { type: 'TouristAttraction', id: contentId },
        { type: 'TouristAttraction', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetTouristAttractionsQuery,
  useGetTouristAttractionQuery,
  useSearchTouristAttractionsQuery,
  useCreateTouristAttractionMutation,
  useUpdateTouristAttractionMutation,
  useDeleteTouristAttractionMutation,
} = touristAttractionsApi
