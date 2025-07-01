import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './baseQuery'

export const adminsApi = createApi({
  reducerPath: 'adminsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Admin'],
  endpoints: (builder) => ({
    getAdmins: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.search) queryParams.append('search', params.search)
        
        return `/auth/admins?${queryParams.toString()}`
      },
      providesTags: ['Admin'],
    }),

    getAdminById: builder.query({
      query: (id) => `/auth/admins/${id}`,
      providesTags: (result, error, id) => [{ type: 'Admin', id }],
    }),

    createAdmin: builder.mutation({
      query: (adminData) => ({
        url: '/auth/admins',
        method: 'POST',
        body: adminData,
      }),
      invalidatesTags: ['Admin'],
    }),

    updateAdmin: builder.mutation({
      query: ({ id, data }) => ({
        url: `/auth/admins/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Admin', id }],
    }),

    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/auth/admins/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admin'],
    }),

    activateAdmin: builder.mutation({
      query: (id) => ({
        url: `/auth/admins/${id}/activate`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Admin', id }],
    }),

    deactivateAdmin: builder.mutation({
      query: (id) => ({
        url: `/auth/admins/${id}/deactivate`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Admin', id }],
    }),
  }),
})

export const {
  useGetAdminsQuery,
  useGetAdminByIdQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useActivateAdminMutation,
  useDeactivateAdminMutation,
} = adminsApi
