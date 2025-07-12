import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const adminsApi = createApi({
  reducerPath: 'adminsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Admin'],
  endpoints: (builder) => ({
    getAdmins: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.search) queryParams.append('search', params.search)

        return `/api/admins/?${queryParams.toString()}`
      },
      providesTags: ['Admin'],
    }),

    getAdminById: builder.query({
      query: (id) => `/api/admins/${id}`,
      providesTags: (result, error, id) => [{ type: 'Admin', id }],
    }),

    createAdmin: builder.mutation({
      query: (adminData) => ({
        url: '/api/admins/',
        method: 'POST',
        body: adminData,
      }),
      invalidatesTags: ['Admin'],
    }),

    updateAdmin: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/admins/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Admin', id }],
    }),

    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/api/admins/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admin'],
    }),

    activateAdmin: builder.mutation({
      query: (id) => ({
        url: `/api/admins/${id}/activate`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Admin', id }],
    }),

    deactivateAdmin: builder.mutation({
      query: (id) => ({
        url: `/api/admins/${id}/deactivate`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Admin', id }],
    }),

    // apiService에서 이관될 메서드들
    deleteAdminPermanently: builder.mutation({
      query: (adminId) => ({
        url: `/api/admins/${adminId}/permanent`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admin'],
    }),

    resetAdminPassword: builder.mutation({
      query: (adminId) => ({
        url: `/api/admins/${adminId}/reset-password`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, adminId) => [
        { type: 'Admin', id: adminId },
      ],
    }),

    updateAdminStatus: builder.mutation({
      query: ({ adminId, status }) => ({
        url: `/api/admins/${adminId}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { adminId }) => [
        { type: 'Admin', id: adminId },
      ],
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
  useDeleteAdminPermanentlyMutation,
  useResetAdminPasswordMutation,
  useUpdateAdminStatusMutation,
} = adminsApi
