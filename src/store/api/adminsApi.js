import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const adminsApi = createApi({
  reducerPath: 'adminsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Admin', 'Role'],
  endpoints: (builder) => ({
    getAdmins: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params.page) queryParams.append('page', params.page.toString())
        if (params.size) queryParams.append('size', params.size.toString())
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

    getRoles: builder.query({
      query: () => '/api/rbac/roles',
      providesTags: ['Role'],
    }),

    getPermissionsMatrix: builder.query({
      query: () => '/api/admins/permissions/matrix',
      providesTags: ['Role'],
    }),

    createRole: builder.mutation({
      query: (roleData) => ({
        url: '/api/rbac/roles',
        method: 'POST',
        body: roleData,
      }),
      invalidatesTags: ['Role'],
    }),

    updateRole: builder.mutation({
      query: ({ roleId, data }) => ({
        url: `/api/rbac/roles/${roleId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Role'],
    }),

    deleteRole: builder.mutation({
      query: (roleId) => ({
        url: `/api/rbac/roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),

    updateAdminRoles: builder.mutation({
      query: ({ adminId, roleData }) => ({
        url: `/api/admins/${adminId}/roles`,
        method: 'PUT',
        body: roleData,
      }),
      invalidatesTags: ['Admin'],
    }),

    getPermissions: builder.query({
      query: () => '/api/rbac/permissions',
      providesTags: ['Role'],
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
  useGetRolesQuery,
  useGetPermissionsMatrixQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useUpdateAdminRolesMutation,
  useGetPermissionsQuery,
} = adminsApi
