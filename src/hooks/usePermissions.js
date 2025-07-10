import { useMemo } from 'react'
import { useGetPermissionConstantsQuery } from '../store/api/rolesApi'

/**
 * 권한 정보를 관리하는 커스텀 훅
 * 기존 하드코딩된 permissions.js의 내용을 API로 대체
 */
export function usePermissions() {
  const { data: permissionData, isLoading } = useGetPermissionConstantsQuery()

  // 기존 형태와 호환되는 권한 상수들 생성
  const permissions = useMemo(() => {
    if (!permissionData?.permissions) {
      // 로딩 중이거나 실패 시 기본값 반환
      return {
        USER_READ: 'USER_READ',
        USER_WRITE: 'USER_WRITE',
        USER_DELETE: 'USER_DELETE',
        CONTENT_READ: 'CONTENT_READ',
        CONTENT_WRITE: 'CONTENT_WRITE',
        CONTENT_DELETE: 'CONTENT_DELETE',
        ADMIN_READ: 'ADMIN_READ',
        ADMIN_WRITE: 'ADMIN_WRITE',
        ADMIN_DELETE: 'ADMIN_DELETE',
        SYSTEM_CONFIG: 'SYSTEM_CONFIG',
        SYSTEM_MONITOR: 'SYSTEM_MONITOR',
        DATA_EXPORT: 'DATA_EXPORT',
        ANALYTICS_READ: 'ANALYTICS_READ',
        LOG_READ: 'LOG_READ',
      }
    }
    
    // API에서 받은 권한을 키-값 형태로 변환
    const result = {}
    Object.keys(permissionData.permissions).forEach(key => {
      result[key] = key
    })
    return result
  }, [permissionData])

  const roles = useMemo(() => {
    if (!permissionData?.roles) {
      return {
        SUPER_ADMIN: 'SUPER_ADMIN',
        ADMIN: 'ADMIN',
        CONTENT_MANAGER: 'CONTENT_MANAGER',
        DATA_ANALYST: 'DATA_ANALYST',
        MODERATOR: 'MODERATOR',
        SUPPORT: 'SUPPORT',
      }
    }
    
    const result = {}
    Object.keys(permissionData.roles).forEach(key => {
      result[key] = key
    })
    return result
  }, [permissionData])

  const rolePermissions = useMemo(() => {
    return permissionData?.role_permissions || {
      SUPER_ADMIN: Object.keys(permissions),
      ADMIN: ['USER_READ', 'USER_WRITE', 'USER_DELETE', 'CONTENT_READ', 'CONTENT_WRITE', 'CONTENT_DELETE'],
      CONTENT_MANAGER: ['USER_READ', 'CONTENT_READ', 'CONTENT_WRITE', 'CONTENT_DELETE'],
      DATA_ANALYST: ['USER_READ', 'CONTENT_READ', 'ANALYTICS_READ', 'DATA_EXPORT'],
      MODERATOR: ['USER_READ', 'USER_WRITE', 'CONTENT_READ', 'CONTENT_WRITE'],
      SUPPORT: ['USER_READ', 'USER_WRITE', 'CONTENT_READ'],
    }
  }, [permissionData, permissions])

  const permissionGroups = useMemo(() => {
    return permissionData?.permission_groups || {
      '사용자 관리': ['USER_READ', 'USER_WRITE', 'USER_DELETE'],
      '콘텐츠 관리': ['CONTENT_READ', 'CONTENT_WRITE', 'CONTENT_DELETE'],
      '관리자 관리': ['ADMIN_READ', 'ADMIN_WRITE', 'ADMIN_DELETE'],
      '시스템 관리': ['SYSTEM_CONFIG', 'SYSTEM_MONITOR'],
      '데이터 관리': ['DATA_EXPORT', 'ANALYTICS_READ', 'LOG_READ'],
    }
  }, [permissionData])

  return {
    permissions,
    roles,
    rolePermissions,
    permissionGroups,
    permissionLabels: permissionData?.permissions || {},
    roleLabels: permissionData?.roles || {},
    isLoading,
  }
}

/**
 * 특정 권한을 가지고 있는지 확인하는 유틸리티 함수
 */
export function useHasPermission(permission, userRole = 'ADMIN') {
  const { rolePermissions } = usePermissions()
  return rolePermissions[userRole]?.includes(permission) || false
}