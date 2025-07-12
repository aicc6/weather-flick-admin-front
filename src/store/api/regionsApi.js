import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const regionsApi = createApi({
  reducerPath: 'regionsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Region'],
  endpoints: (builder) => ({
    // 지역 목록 조회
    getRegions: builder.query({
      query: ({ page = 1, size = 50, search, parent_region_code, region_level }) => ({
        url: '/api/regions',
        params: {
          page,
          size,
          search,
          parent_region_code,
          region_level,
        },
      }),
      providesTags: ['Region'],
    }),

    // 특정 지역 조회
    getRegion: builder.query({
      query: (regionCode) => `/api/regions/${regionCode}`,
      providesTags: (result, error, regionCode) => [{ type: 'Region', id: regionCode }],
    }),

    // 지역 생성
    createRegion: builder.mutation({
      query: (regionData) => ({
        url: '/api/regions',
        method: 'POST',
        body: regionData,
      }),
      invalidatesTags: ['Region'],
    }),

    // 지역 수정
    updateRegion: builder.mutation({
      query: ({ regionCode, ...regionData }) => ({
        url: `/api/regions/${regionCode}`,
        method: 'PUT',
        body: regionData,
      }),
      invalidatesTags: (result, error, { regionCode }) => [
        { type: 'Region', id: regionCode },
        'Region',
      ],
    }),

    // 지역 삭제
    deleteRegion: builder.mutation({
      query: (regionCode) => ({
        url: `/api/regions/${regionCode}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Region'],
    }),

    // 지역 계층 구조 조회
    getRegionTree: builder.query({
      query: () => '/api/regions/tree/hierarchy',
      providesTags: ['Region'],
    }),

    // 좌표 업데이트
    updateCoordinates: builder.mutation({
      query: () => ({
        url: '/api/regions/update-coordinates',
        method: 'POST',
      }),
      invalidatesTags: ['Region'],
    }),

    // 좌표 누락 지역 조회
    getMissingCoordinates: builder.query({
      query: () => '/api/regions/missing-coordinates',
      providesTags: ['Region'],
    }),
  }),
})

export const {
  useGetRegionsQuery,
  useGetRegionQuery,
  useCreateRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation,
  useGetRegionTreeQuery,
  useUpdateCoordinatesMutation,
  useGetMissingCoordinatesQuery,
} = regionsApi