/**
 * 권한 시스템 상수 정의
 * RBAC (Role-Based Access Control) 시스템을 위한 권한 및 역할 정의
 */

// 권한 상수 정의
export const PERMISSIONS = {
  // 사용자 관리 권한
  USER_READ: 'user.read',
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',

  // 관리자 관리 권한
  ADMIN_READ: 'admin.read',
  ADMIN_CREATE: 'admin.create',
  ADMIN_UPDATE: 'admin.update',
  ADMIN_DELETE: 'admin.delete',

  // 콘텐츠 관리 권한
  CONTENT_READ: 'content.read',
  CONTENT_CREATE: 'content.create',
  CONTENT_UPDATE: 'content.update',
  CONTENT_DELETE: 'content.delete',

  // 시스템 관리 권한
  SYSTEM_READ: 'system.read',
  SYSTEM_MANAGE: 'system.manage',

  // 통계 및 대시보드 권한
  DASHBOARD_READ: 'dashboard.read',
  ANALYTICS_READ: 'analytics.read',
}

// 역할 상수 정의
export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
}

// 역할별 권한 매핑
export const ROLE_PERMISSIONS = {
  [ROLES.USER]: [PERMISSIONS.DASHBOARD_READ, PERMISSIONS.CONTENT_READ],

  [ROLES.ADMIN]: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_UPDATE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.SYSTEM_READ,
  ],

  [ROLES.SUPER_ADMIN]: [
    ...Object.values(PERMISSIONS), // 모든 권한
  ],
}

// 권한 그룹 정의 (UI에서 사용)
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: {
    label: '사용자 관리',
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.USER_CREATE,
      PERMISSIONS.USER_UPDATE,
      PERMISSIONS.USER_DELETE,
    ],
  },
  ADMIN_MANAGEMENT: {
    label: '관리자 관리',
    permissions: [
      PERMISSIONS.ADMIN_READ,
      PERMISSIONS.ADMIN_CREATE,
      PERMISSIONS.ADMIN_UPDATE,
      PERMISSIONS.ADMIN_DELETE,
    ],
  },
  CONTENT_MANAGEMENT: {
    label: '콘텐츠 관리',
    permissions: [
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.CONTENT_CREATE,
      PERMISSIONS.CONTENT_UPDATE,
      PERMISSIONS.CONTENT_DELETE,
    ],
  },
  SYSTEM_MANAGEMENT: {
    label: '시스템 관리',
    permissions: [PERMISSIONS.SYSTEM_READ, PERMISSIONS.SYSTEM_MANAGE],
  },
  DASHBOARD: {
    label: '대시보드',
    permissions: [PERMISSIONS.DASHBOARD_READ, PERMISSIONS.ANALYTICS_READ],
  },
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
