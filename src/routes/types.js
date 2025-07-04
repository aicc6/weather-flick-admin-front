// 라우트 메타데이터 타입 정의
export const ROUTE_META = {
  DASHBOARD: {
    path: '/',
    title: '대시보드',
    breadcrumb: ['대시보드'],
    icon: 'LayoutDashboard',
  },
  ADMINS: {
    path: '/admins',
    title: '관리자 관리',
    breadcrumb: ['대시보드', '관리자 관리'],
    icon: 'Shield',
    requiredRole: 'super_admin',
  },
  USERS: {
    path: '/users',
    title: '사용자 관리',
    breadcrumb: ['대시보드', '사용자 관리'],
    icon: 'Users',
  },
  CONTENT: {
    path: '/content',
    title: '콘텐츠 관리',
    breadcrumb: ['대시보드', '콘텐츠 관리'],
    icon: 'FileText',
  },
  SYSTEM: {
    path: '/system',
    title: '시스템 관리',
    breadcrumb: ['대시보드', '시스템 관리'],
    icon: 'Settings',
  },
  WEATHER: {
    path: '/weather',
    title: '날씨 관리',
    breadcrumb: ['대시보드', '날씨 관리'],
    icon: 'Cloud',
  },
  TOURIST_ATTRACTIONS: {
    path: '/admin/tourist-attractions',
    title: '관광지 관리',
    breadcrumb: ['대시보드', '관광지 관리'],
    icon: 'MapPin',
  },
}

// 네비게이션 메뉴 구성
export const NAVIGATION_ITEMS = [
  ROUTE_META.DASHBOARD,
  ROUTE_META.USERS,
  ROUTE_META.ADMINS,
  ROUTE_META.CONTENT,
  ROUTE_META.WEATHER,
  ROUTE_META.TOURIST_ATTRACTIONS,
  ROUTE_META.SYSTEM,
]
