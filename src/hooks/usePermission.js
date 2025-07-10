/**
 * 권한 체크를 위한 커스텀 훅
 * RBAC 시스템에서 사용자 권한을 확인하는 다양한 기능 제공
 */

import { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  hasPermission as checkPermission,
  hasRole as checkRole,
  hasAnyPermission as checkAnyPermission,
  isSuperAdmin as checkSuperAdmin,
  isAdmin as checkAdmin,
  ROLE_PERMISSIONS,
} from '../constants/permissions'

/**
 * 권한 체크 훅
 * @returns {Object} 권한 체크 관련 함수들과 사용자 정보
 */
export const usePermission = () => {
  const { user, isAuthenticated } = useAuth()

  // 사용자 역할 추출 (admin 객체의 경우 role이 없으므로 is_superuser 기반으로 판단)
  const userRole = useMemo(() => {
    if (!user) return null

    // admin 사용자인 경우
    if (user.is_superuser !== undefined) {
      return user.is_superuser ? 'SUPER_ADMIN' : 'ADMIN'
    }

    // 일반 사용자인 경우
    return user.role || 'USER'
  }, [user])

  // 사용자 권한 목록
  const userPermissions = useMemo(() => {
    if (!userRole) return []
    return ROLE_PERMISSIONS[userRole] || []
  }, [userRole])

  /**
   * 특정 권한 보유 여부 확인
   * @param {string} permission - 확인할 권한
   * @returns {boolean} 권한 보유 여부
   */
  const hasPermission = (permission) => {
    if (!isAuthenticated || !userRole) return false
    return checkPermission(userRole, permission)
  }

  /**
   * 특정 역할 보유 여부 확인
   * @param {string} role - 확인할 역할
   * @returns {boolean} 역할 보유 여부
   */
  const hasRole = (role) => {
    if (!isAuthenticated || !userRole) return false
    return checkRole(userRole, role)
  }

  /**
   * 여러 권한 중 하나라도 보유 여부 확인
   * @param {Array<string>} permissions - 확인할 권한 목록
   * @returns {boolean} 권한 보유 여부
   */
  const hasAnyPermission = (permissions) => {
    if (!isAuthenticated || !userRole) return false
    return checkAnyPermission(userRole, permissions)
  }

  /**
   * 모든 권한 보유 여부 확인
   * @param {Array<string>} permissions - 확인할 권한 목록
   * @returns {boolean} 모든 권한 보유 여부
   */
  const hasAllPermissions = (permissions) => {
    if (!isAuthenticated || !userRole || !Array.isArray(permissions))
      return false

    return permissions.every((permission) =>
      checkPermission(userRole, permission),
    )
  }

  /**
   * 슈퍼 관리자 여부 확인
   * @returns {boolean} 슈퍼 관리자 여부
   */
  const isSuperAdmin = () => {
    if (!isAuthenticated || !userRole) return false
    return checkSuperAdmin(userRole)
  }

  /**
   * 관리자 여부 확인 (관리자 또는 슈퍼 관리자)
   * @returns {boolean} 관리자 여부
   */
  const isAdmin = () => {
    if (!isAuthenticated || !userRole) return false
    return checkAdmin(userRole)
  }

  /**
   * 일반 사용자 여부 확인
   * @returns {boolean} 일반 사용자 여부
   */
  const isUser = () => {
    if (!isAuthenticated || !userRole) return false
    return userRole === 'USER'
  }

  /**
   * 권한 기반 조건부 실행
   * @param {string|Array<string>} requiredPermissions - 필요한 권한
   * @param {Function} callback - 권한이 있을 때 실행할 함수
   * @param {Function} [fallback] - 권한이 없을 때 실행할 함수
   * @returns {any} callback 또는 fallback 실행 결과
   */
  const withPermission = (requiredPermissions, callback, fallback = null) => {
    const hasRequiredPermission = Array.isArray(requiredPermissions)
      ? hasAnyPermission(requiredPermissions)
      : hasPermission(requiredPermissions)

    if (hasRequiredPermission) {
      return typeof callback === 'function' ? callback() : callback
    }

    return typeof fallback === 'function' ? fallback() : fallback
  }

  return {
    // 사용자 정보
    user,
    userRole,
    userPermissions,
    isAuthenticated,

    // 권한 체크 함수들
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    isAdmin,
    isUser,

    // 유틸리티 함수
    withPermission,
  }
}

/**
 * 특정 권한만 체크하는 간편 훅
 * @param {string|Array<string>} requiredPermissions - 필요한 권한
 * @returns {boolean} 권한 보유 여부
 */
export const useHasPermission = (requiredPermissions) => {
  const { hasPermission, hasAnyPermission } = usePermission()

  return useMemo(() => {
    if (Array.isArray(requiredPermissions)) {
      return hasAnyPermission(requiredPermissions)
    }
    return hasPermission(requiredPermissions)
  }, [requiredPermissions, hasPermission, hasAnyPermission])
}

/**
 * 특정 역할만 체크하는 간편 훅
 * @param {string} requiredRole - 필요한 역할
 * @returns {boolean} 역할 보유 여부
 */
export const useHasRole = (requiredRole) => {
  const { hasRole } = usePermission()

  return useMemo(() => {
    return hasRole(requiredRole)
  }, [requiredRole, hasRole])
}

export default usePermission
