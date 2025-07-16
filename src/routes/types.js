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
    title: '관리자',
    breadcrumb: ['대시보드', '관리자'],
    icon: 'Shield',
    requiredRole: 'super_admin',
  },
  PERMISSIONS: {
    path: '/permissions',
    title: '권한 관리',
    breadcrumb: ['대시보드', '권한 관리'],
    icon: 'Shield',
    requiredRole: 'super_admin',
  },
  USERS: {
    path: '/users',
    title: '사용자',
    breadcrumb: ['대시보드', '사용자'],
    icon: 'Users',
  },
  CONTENT: {
    path: '/content',
    title: '콘텐츠',
    breadcrumb: ['대시보드', '콘텐츠'],
    icon: 'FileText',
  },
  WEATHER: {
    path: '/weather',
    title: '날씨',
    breadcrumb: ['대시보드', '날씨'],
    icon: 'Cloud',
  },
  TOURIST_ATTRACTIONS: {
    path: '/attractions',
    title: '관광지',
    breadcrumb: ['대시보드', '관광지'],
    icon: 'MapPin',
  },
  BATCH_MANAGEMENT: {
    path: '/batch-management',
    title: '배치 작업',
    breadcrumb: ['대시보드', '배치 작업'],
    icon: 'Settings',
  },
  REGIONS: {
    path: '/regions',
    title: '지역',
    breadcrumb: ['대시보드', '지역'],
    icon: 'Map',
  },
  CONTACT: {
    path: '/contact',
    title: '문의',
    breadcrumb: ['대시보드', '문의'],
    icon: 'MessageSquare',
  },
}

// 네비게이션 메뉴 구성
export const NAVIGATION_ITEMS = [
  ROUTE_META.DASHBOARD,
  ROUTE_META.USERS,
  ROUTE_META.ADMINS,
  ROUTE_META.PERMISSIONS,
  ROUTE_META.CONTENT,
  ROUTE_META.WEATHER,
  ROUTE_META.REGIONS,
  ROUTE_META.CONTACT,
  ROUTE_META.BATCH_MANAGEMENT,
]
