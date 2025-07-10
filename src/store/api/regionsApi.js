import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseQuery'

export const regionsApi = createApi({
  reducerPath: 'regionsApi',
  baseQuery,
  tagTypes: ['Region'],
  endpoints: (builder) => ({
    // 지역 목록 조회
    getRegions: builder.query({
      query: ({ level, parent_code } = {}) => {
        const params = new URLSearchParams()
        if (level) params.append('level', level)
        if (parent_code) params.append('parent_code', parent_code)
        return `/regions?${params.toString()}`
      },
      providesTags: ['Region'],
    }),

    // 시도 목록 조회
    getProvinces: builder.query({
      query: () => '/regions/provinces',
      providesTags: ['Region'],
    }),

    // 특정 시도의 시군구 목록 조회
    getSigunguByProvince: builder.query({
      query: (provinceCode) => `/regions/sigungu/${provinceCode}`,
      providesTags: ['Region'],
    }),

    // 지역 코드 매핑 정보 조회 (기존 하드코딩 대체)
    getRegionMap: builder.query({
      query: () => '/regions/map',
      providesTags: ['Region'],
    }),

    // 특정 지역 정보 조회
    getRegion: builder.query({
      query: (regionCode) => `/regions/${regionCode}`,
      providesTags: ['Region'],
    }),

    // 지역명으로 검색
    searchRegions: builder.query({
      query: (name) => `/regions/search/?name=${encodeURIComponent(name)}`,
      providesTags: ['Region'],
    }),
  }),
})

export const {
  useGetRegionsQuery,
  useGetProvincesQuery,
  useGetSigunguByProvinceQuery,
  useGetRegionMapQuery,
  useGetRegionQuery,
  useSearchRegionsQuery,
} = regionsApi
