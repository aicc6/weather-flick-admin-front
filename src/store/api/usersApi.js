import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'UserStats'],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()
        if (params.page) queryParams.append('page', params.page.toString())
        if (params.size) queryParams.append('size', params.size.toString())
        if (params.email) queryParams.append('email', params.email)
        if (params.nickname) queryParams.append('nickname', params.nickname)
        if (
          params.is_active !== undefined &&
          params.is_active !== null &&
          params.is_active !== ''
        ) {
          queryParams.append('is_active', params.is_active)
        }
        // 필요시 추가 필드
        return `/api/users/?${queryParams.toString()}`
      },
      providesTags: ['User'],
    }),

    getUserById: builder.query({
      query: (id) => `/api/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    createUser: builder.mutation({
      query: (userData) => ({
        url: '/api/users/',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/api/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    updateUserStatus: builder.mutation({
      query: ({ id, status, reason }) => ({
        url: `/api/users/${id}/status`,
        method: 'PUT',
        body: { status, reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),

    // apiService에서 이관될 메서드들
    getUserStats: builder.query({
      query: () => '/api/users/stats',
      providesTags: ['UserStats'],
    }),

    activateUser: builder.mutation({
      query: (userId) => ({
        url: `/api/users/${userId}/activate`,
        method: 'POST',
      }),
      invalidatesTags: ['User', 'UserStats'],
    }),

    deactivateUser: builder.mutation({
      query: (userId) => ({
        url: `/api/users/${userId}/deactivate`,
        method: 'POST',
      }),
      invalidatesTags: ['User', 'UserStats'],
    }),

    resetUserPassword: builder.mutation({
      query: (userId) => ({
        url: `/api/users/${userId}/reset-password`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
      ],
    }),

    searchUsers: builder.query({
      query: (keyword, limit = 20) => ({
        url: '/api/users/search',
        params: { keyword, limit },
      }),
      providesTags: ['User'],
    }),

    getUsersByRegion: builder.query({
      query: (region) => ({
        url: '/api/users/region',
        params: { region },
      }),
      providesTags: ['User'],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  useGetUserStatsQuery,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useResetUserPasswordMutation,
  useSearchUsersQuery,
  useGetUsersByRegionQuery,
} = usersApi
