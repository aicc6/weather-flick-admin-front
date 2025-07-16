import { usePermissions } from '@/hooks/usePermissions'

/**
 * 조건부 렌더링을 위한 권한 체크 컴포넌트
 * PermissionGuard와 달리 로딩 상태를 표시하지 않고 단순히 숨김/표시만 처리
 */
export const CanAccess = ({
  children,
  permission,
  permissions,
  resource,
  action,
  role,
  requireAll = false,
  fallback = null,
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    canAccessResource,
    loading,
  } = usePermissions()

  // 로딩 중에는 fallback 표시
  if (loading) {
    return <>{fallback}</>
  }

  let hasAccess = false

  if (role) {
    hasAccess = hasRole(role)
  } else if (resource && action) {
    hasAccess = canAccessResource(resource, action)
  } else if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  } else {
    // 조건이 지정되지 않은 경우 접근 허용
    hasAccess = true
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}
