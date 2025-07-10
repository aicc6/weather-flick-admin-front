/**
 * 권한 기반 조건부 렌더링 컴포넌트
 * 사용자의 권한에 따라 컨텐츠를 표시하거나 숨김
 */

import { usePermission } from '../../hooks/usePermission'

/**
 * PermissionGuard 컴포넌트
 * @param {Object} props
 * @param {string|Array<string>} props.permission - 필요한 권한 (단일 또는 배열)
 * @param {string} props.role - 필요한 역할
 * @param {boolean} props.requireAll - 배열 권한 시 모든 권한이 필요한지 여부 (기본: false)
 * @param {React.ReactNode} props.children - 권한이 있을 때 표시할 컨텐츠
 * @param {React.ReactNode} props.fallback - 권한이 없을 때 표시할 컨텐츠
 * @param {boolean} props.hideOnFail - 권한이 없을 때 아무것도 렌더링하지 않을지 여부 (기본: false)
 * @returns {React.ReactNode} 조건부 렌더링된 컨텐츠
 */
export const PermissionGuard = ({
  permission,
  role,
  requireAll = false,
  children,
  fallback = null,
  hideOnFail = false,
}) => {
  const {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    isAuthenticated,
  } = usePermission()

  // 인증되지 않은 경우 처리
  if (!isAuthenticated) {
    return hideOnFail ? null : fallback
  }

  // 역할 기반 체크
  if (role) {
    if (!hasRole(role)) {
      return hideOnFail ? null : fallback
    }
    return children
  }

  // 권한 기반 체크
  if (permission) {
    let hasRequiredPermission = false

    if (Array.isArray(permission)) {
      // 배열인 경우 requireAll 플래그에 따라 처리
      hasRequiredPermission = requireAll
        ? hasAllPermissions(permission)
        : hasAnyPermission(permission)
    } else {
      // 단일 권한인 경우
      hasRequiredPermission = hasPermission(permission)
    }

    if (!hasRequiredPermission) {
      return hideOnFail ? null : fallback
    }
  }

  return children
}

/**
 * 관리자 권한만 체크하는 간편 컴포넌트
 */
export const AdminGuard = ({
  children,
  fallback = null,
  hideOnFail = false,
}) => {
  const { isAdmin } = usePermission()

  if (!isAdmin()) {
    return hideOnFail ? null : fallback
  }

  return children
}

/**
 * 슈퍼 관리자 권한만 체크하는 간편 컴포넌트
 */
export const SuperAdminGuard = ({
  children,
  fallback = null,
  hideOnFail = false,
}) => {
  const { isSuperAdmin } = usePermission()

  if (!isSuperAdmin()) {
    return hideOnFail ? null : fallback
  }

  return children
}

/**
 * 일반 사용자 권한만 체크하는 간편 컴포넌트
 */
export const UserGuard = ({
  children,
  fallback = null,
  hideOnFail = false,
}) => {
  const { isUser } = usePermission()

  if (!isUser()) {
    return hideOnFail ? null : fallback
  }

  return children
}

export default PermissionGuard
