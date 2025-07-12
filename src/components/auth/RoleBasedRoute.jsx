import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ErrorDisplay } from '@/components/common/ErrorDisplay'

export function RoleBasedRoute({
  children,
  requiredRole,
  fallbackPath = '/',
  showError = true,
}) {
  const { user, isAuthenticated, loading } = useAuth()

  // 로딩 중인 경우
  if (loading) {
    return <div>인증 확인 중...</div>
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 역할 확인
  if (requiredRole) {
    const hasRequiredRole = checkUserRole(user, requiredRole)

    if (!hasRequiredRole) {
      if (showError) {
        return (
          <ErrorDisplay
            error="이 페이지에 접근할 권한이 없습니다."
            variant="center"
            onRetry={() => window.history.back()}
            retryText="이전 페이지로"
          />
        )
      }
      return <Navigate to={fallbackPath} replace />
    }
  }

  return children
}

// 사용자 역할 확인 함수
function checkUserRole(user, requiredRole) {
  if (!user) return false

  switch (requiredRole) {
    case 'super_admin':
      return user.is_superuser === true
    case 'admin':
      return user.is_superuser === true || user.is_admin === true
    case 'user':
      return true // 인증된 모든 사용자
    default:
      return false
  }
}

// 권한 확인 훅
export function usePermissions() {
  const { user } = useAuth()

  const hasRole = (role) => checkUserRole(user, role)

  const canAccess = (routeMeta) => {
    if (!routeMeta.requiredRole) return true
    return hasRole(routeMeta.requiredRole)
  }

  return {
    hasRole,
    canAccess,
    isSuperAdmin: hasRole('super_admin'),
    isAdmin: hasRole('admin'),
  }
}
