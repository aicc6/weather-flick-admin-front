/**
 * 페이지 레벨 권한 체크를 위한 HOC (Higher Order Component)
 * 권한이 없는 경우 403 페이지 또는 리다이렉트 처리
 */

import { usePermission } from '../hooks/usePermission'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

/**
 * 권한 체크 HOC
 * @param {React.Component} WrappedComponent - 감싸질 컴포넌트
 * @param {Object} options - 권한 체크 옵션
 * @param {string|Array<string>} options.permission - 필요한 권한
 * @param {string} options.role - 필요한 역할
 * @param {boolean} options.requireAll - 배열 권한 시 모든 권한이 필요한지 여부
 * @param {string} options.redirectTo - 권한 없을 시 리다이렉트할 경로
 * @param {React.ReactNode} options.fallbackComponent - 권한 없을 시 표시할 컴포넌트
 * @returns {React.Component} 권한 체크가 적용된 컴포넌트
 */
export const withPermission = (WrappedComponent, options = {}) => {
  const {
    permission,
    role,
    requireAll = false,
    redirectTo = '/unauthorized',
    fallbackComponent: FallbackComponent,
  } = options

  const PermissionWrappedComponent = (props) => {
    const {
      hasPermission,
      hasRole,
      hasAnyPermission,
      hasAllPermissions,
      isAuthenticated,
    } = usePermission()
    const navigate = useNavigate()

    useEffect(() => {
      // 인증되지 않은 경우 로그인 페이지로 리다이렉트
      if (!isAuthenticated) {
        navigate('/login')
        return
      }

      // 역할 기반 체크
      if (role && !hasRole(role)) {
        navigate(redirectTo)
        return
      }

      // 권한 기반 체크
      if (permission) {
        let hasRequiredPermission = false

        if (Array.isArray(permission)) {
          hasRequiredPermission = requireAll
            ? hasAllPermissions(permission)
            : hasAnyPermission(permission)
        } else {
          hasRequiredPermission = hasPermission(permission)
        }

        if (!hasRequiredPermission) {
          navigate(redirectTo)
          return
        }
      }
    }, [
      isAuthenticated,
      hasPermission,
      hasRole,
      hasAnyPermission,
      hasAllPermissions,
      navigate,
    ])

    // 인증되지 않은 경우
    if (!isAuthenticated) {
      return FallbackComponent ? <FallbackComponent /> : null
    }

    // 역할 체크 실패
    if (role && !hasRole(role)) {
      return FallbackComponent ? <FallbackComponent /> : null
    }

    // 권한 체크 실패
    if (permission) {
      let hasRequiredPermission = false

      if (Array.isArray(permission)) {
        hasRequiredPermission = requireAll
          ? hasAllPermissions(permission)
          : hasAnyPermission(permission)
      } else {
        hasRequiredPermission = hasPermission(permission)
      }

      if (!hasRequiredPermission) {
        return FallbackComponent ? <FallbackComponent /> : null
      }
    }

    return <WrappedComponent {...props} />
  }

  // 컴포넌트 이름 설정 (디버깅용)
  PermissionWrappedComponent.displayName = `withPermission(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`

  return PermissionWrappedComponent
}

/**
 * 관리자 권한 체크 HOC
 * @param {React.Component} WrappedComponent - 감싸질 컴포넌트
 * @param {Object} options - 옵션
 * @returns {React.Component} 관리자 권한 체크가 적용된 컴포넌트
 */
export const withAdminPermission = (WrappedComponent, options = {}) => {
  return withPermission(WrappedComponent, {
    role: 'ADMIN',
    ...options,
  })
}

/**
 * 슈퍼 관리자 권한 체크 HOC
 * @param {React.Component} WrappedComponent - 감싸질 컴포넌트
 * @param {Object} options - 옵션
 * @returns {React.Component} 슈퍼 관리자 권한 체크가 적용된 컴포넌트
 */
export const withSuperAdminPermission = (WrappedComponent, options = {}) => {
  return withPermission(WrappedComponent, {
    role: 'SUPER_ADMIN',
    ...options,
  })
}

/**
 * 인증된 사용자만 접근 가능한 HOC
 * @param {React.Component} WrappedComponent - 감싸질 컴포넌트
 * @param {Object} options - 옵션
 * @returns {React.Component} 인증 체크가 적용된 컴포넌트
 */
export const withAuth = (WrappedComponent, options = {}) => {
  return withPermission(WrappedComponent, {
    ...options,
  })
}

/**
 * 기본 Unauthorized 컴포넌트
 */
export const UnauthorizedComponent = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <h1 className="mb-4 text-6xl font-bold text-red-600">403</h1>
      <h2 className="mb-2 text-2xl font-semibold">접근 권한이 없습니다</h2>
      <p className="text-muted-foreground mb-4">
        이 페이지에 접근할 수 있는 권한이 없습니다.
      </p>
      <button
        onClick={() => window.history.back()}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        이전 페이지로 돌아가기
      </button>
    </div>
  </div>
)

export default withPermission
