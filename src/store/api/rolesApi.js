import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseQuery'

export const rolesApi = createApi({
  reducerPath: 'rolesApi',
  baseQuery,
  tagTypes: ['Role', 'Permission'],
  endpoints: (builder) => ({
    // 역할 목록 조회
    getRoles: builder.query({
      query: ({ active_only = true } = {}) =>
        `/roles?active_only=${active_only}`,
      providesTags: ['Role'],
    }),

    // 특정 역할 정보 조회
    getRole: builder.query({
      query: (roleId) => `/roles/${roleId}`,
      providesTags: ['Role'],
    }),

    // 특정 관리자의 역할 목록 조회
    getAdminRoles: builder.query({
      query: (adminId) => `/roles/admin/${adminId}`,
      providesTags: ['Role'],
    }),

    // 권한 상수 정보 조회 (기존 하드코딩 대체)
    getPermissionConstants: builder.query({
      query: () => '/roles/constants/permissions',
      providesTags: ['Permission'],
    }),
  }),
})

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useGetAdminRolesQuery,
  useGetPermissionConstantsQuery,
} = rolesApi
