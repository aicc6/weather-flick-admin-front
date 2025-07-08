import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './baseQuery'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    // 관리자 로그인 (v3 백엔드 구조와 일치)
    login: builder.mutation({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    // 현재 관리자 정보 조회
    getCurrentUser: builder.query({
      query: () => '/api/auth/me',
      providesTags: ['Auth'],
    }),

    // 로그아웃 (현재 백엔드에 구현되지 않음 - 클라이언트 측에서만 처리)
    logout: builder.mutation({
      queryFn: () => {
        // 클라이언트 측 로그아웃 처리
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        return { data: { success: true } }
      },
      invalidatesTags: ['Auth'],
    }),

    // 토큰 갱신 (현재 백엔드에 구현되지 않음)
    refreshToken: builder.mutation({
      query: () => ({
        url: '/api/auth/refresh',
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useRefreshTokenMutation,
} = authApi
