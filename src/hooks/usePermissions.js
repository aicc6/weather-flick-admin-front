import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/lib/api'

export const usePermissions = () => {
  const [permissions, setPermissions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      setPermissions(null)
      setLoading(false)
      return
    }

    const fetchPermissions = async () => {
      try {
        setLoading(true)
        const response = await api.get('/api/rbac/my-permissions')
        setPermissions(response.data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch permissions:', err)
        setError('권한 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [isAuthenticated])

  const hasPermission = (permissionName) => {
    if (!permissions) return false
    if (permissions.is_superuser) return true

    return permissions.permissions.some((p) => p.name === permissionName)
  }

  const hasAnyPermission = (permissionNames) => {
    if (!permissions) return false
    if (permissions.is_superuser) return true

    return permissionNames.some((name) => hasPermission(name))
  }

  const hasAllPermissions = (permissionNames) => {
    if (!permissions) return false
    if (permissions.is_superuser) return true

    return permissionNames.every((name) => hasPermission(name))
  }

  const hasRole = (roleName) => {
    if (!permissions) return false
    return permissions.roles.some((r) => r.name === roleName)
  }

  const canAccessResource = (resource, action) => {
    return hasPermission(`${resource}.${action}`)
  }

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    canAccessResource,
    isSuperuser: permissions?.is_superuser || false,
  }
}
