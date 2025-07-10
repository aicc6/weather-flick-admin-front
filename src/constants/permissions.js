/**
 * 권한 시스템 상수 정의 (API 기반)
 * RBAC (Role-Based Access Control) 시스템을 위한 권한 및 역할 정의
 * 
 * 주의: 이 파일은 레거시 호환성을 위해 유지됩니다.
 * 새로운 개발에서는 usePermissions() 훅을 사용하여 API에서 동적으로 권한 정보를 가져오세요.
 * import { usePermissions } from '../hooks/usePermissions'
 */

// 권한 상수 정의 (API와 동기화됨)
export const PERMISSIONS = {
  // 사용자 관리 권한
  USER_READ: 'USER_READ',
  USER_WRITE: 'USER_WRITE', 
  USER_DELETE: 'USER_DELETE',

  // 관리자 관리 권한
  ADMIN_READ: 'ADMIN_READ',
  ADMIN_WRITE: 'ADMIN_WRITE',
  ADMIN_DELETE: 'ADMIN_DELETE',

  // 콘텐츠 관리 권한
  CONTENT_READ: 'CONTENT_READ',
  CONTENT_WRITE: 'CONTENT_WRITE',
  CONTENT_DELETE: 'CONTENT_DELETE',

  // 시스템 관리 권한
  SYSTEM_CONFIG: 'SYSTEM_CONFIG',
  SYSTEM_MONITOR: 'SYSTEM_MONITOR',

  // 데이터 관리 권한
  DATA_EXPORT: 'DATA_EXPORT',
  ANALYTICS_READ: 'ANALYTICS_READ',
  LOG_READ: 'LOG_READ',
}

// 역할 상수 정의 (API와 동기화됨)
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  CONTENT_MANAGER: 'CONTENT_MANAGER',
  DATA_ANALYST: 'DATA_ANALYST',
  MODERATOR: 'MODERATOR',
  SUPPORT: 'SUPPORT',
}

// 역할별 권한 매핑 (API와 동기화됨)
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    ...Object.values(PERMISSIONS), // 모든 권한
  ],

  [ROLES.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_WRITE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.ADMIN_READ,
    PERMISSIONS.ADMIN_WRITE,
    PERMISSIONS.SYSTEM_MONITOR,
    PERMISSIONS.DATA_EXPORT,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.LOG_READ,
  ],

  [ROLES.CONTENT_MANAGER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_WRITE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.LOG_READ,
  ],

  [ROLES.DATA_ANALYST]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.DATA_EXPORT,
    PERMISSIONS.LOG_READ,
  ],

  [ROLES.MODERATOR]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_WRITE,
    PERMISSIONS.LOG_READ,
  ],

  [ROLES.SUPPORT]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.LOG_READ,
  ],
}

// 권한 그룹 정의 (UI에서 사용, API와 동기화됨)
export const PERMISSION_GROUPS = {
  '사용자 관리': [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.USER_DELETE,
  ],
  '콘텐츠 관리': [
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_WRITE,
    PERMISSIONS.CONTENT_DELETE,
  ],
  '관리자 관리': [
    PERMISSIONS.ADMIN_READ,
    PERMISSIONS.ADMIN_WRITE,
    PERMISSIONS.ADMIN_DELETE,
  ],
  '시스템 관리': [
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.SYSTEM_MONITOR,
  ],
  '데이터 관리': [
    PERMISSIONS.DATA_EXPORT,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.LOG_READ,
  ],
}

// 권한 체크 헬퍼 함수
export const hasPermission = (userRole, requiredPermission) => {
  if (!userRole || !requiredPermission) return false

  const userPermissions = ROLE_PERMISSIONS[userRole] || []
  return userPermissions.includes(requiredPermission)
}

export const hasRole = (userRole, requiredRole) => {
  if (!userRole || !requiredRole) return false
  return userRole === requiredRole
}

export const hasAnyPermission = (userRole, requiredPermissions) => {
  if (!userRole || !Array.isArray(requiredPermissions)) return false

  return requiredPermissions.some((permission) =>
    hasPermission(userRole, permission),
  )
}

export const isSuperAdmin = (userRole) => {
  return userRole === ROLES.SUPER_ADMIN
}

export const isAdmin = (userRole) => {
  return userRole === ROLES.ADMIN || userRole === ROLES.SUPER_ADMIN
}
