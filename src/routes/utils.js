import { ROUTE_META } from './types'

// 현재 라우트 정보 가져오기
export function getCurrentRoute(pathname) {
  return Object.values(ROUTE_META).find((route) => route.path === pathname)
}

// 페이지 제목 설정
export function setPageTitle(title, suffix = 'Weather Flick Admin') {
  document.title = title ? `${title} - ${suffix}` : suffix
}

// 권한 기반 라우트 필터링
export function getAccessibleRoutes(userRole) {
  return Object.values(ROUTE_META).filter((route) => {
    if (!route.requiredRole) return true

    switch (route.requiredRole) {
      case 'super_admin':
        return userRole === 'super_admin'
      case 'admin':
        return userRole === 'super_admin' || userRole === 'admin'
      default:
        return true
    }
  })
}

// 다음/이전 라우트 찾기 (네비게이션용)
export function getAdjacentRoutes(currentPath, accessibleRoutes) {
  const currentIndex = accessibleRoutes.findIndex(
    (route) => route.path === currentPath,
  )

  return {
    previous: currentIndex > 0 ? accessibleRoutes[currentIndex - 1] : null,
    next:
      currentIndex < accessibleRoutes.length - 1
        ? accessibleRoutes[currentIndex + 1]
        : null,
  }
}

// URL 파라미터 파싱
export function parseSearchParams(searchString) {
  const params = new URLSearchParams(searchString)
  const result = {}

  for (const [key, value] of params.entries()) {
    result[key] = value
  }

  return result
}

// 쿼리 문자열 생성
export function buildSearchParams(params) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.set(key, value.toString())
    }
  })

  return searchParams.toString()
}
