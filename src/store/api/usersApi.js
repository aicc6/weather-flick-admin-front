import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './baseQuery'

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.search) queryParams.append('search', params.search)
        if (params.status) queryParams.append('status', params.status)
        
        return `/api/v1/users?${queryParams.toString()}`
      },
      providesTags: ['User'],
    }),

    getUserById: builder.query({
      query: (id) => `/api/v1/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    createUser: builder.mutation({
      query: (userData) => ({
        url: '/api/v1/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/v1/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/api/v1/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    updateUserStatus: builder.mutation({
      query: ({ id, status, reason }) => ({
        url: `/api/v1/users/${id}/status`,
        method: 'PUT',
        body: { status, reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
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
} = usersApi
