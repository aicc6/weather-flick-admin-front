import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { DefaultLayout } from '../components/layouts/default-layout'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorBoundary } from '../components/common'

// 레이지 로딩으로 페이지 컴포넌트들 import
const LoginPage = lazy(() =>
  import('../components/pages/login').then((module) => ({
    default: module.LoginPage,
  })),
)
const MainPage = lazy(() =>
  import('../components/pages/main').then((module) => ({
    default: module.MainPage,
  })),
)
const AdminsPage = lazy(() =>
  import('../components/pages/admins').then((module) => ({
    default: module.AdminsPage,
  })),
)
const UsersPage = lazy(() =>
  import('../components/pages/users').then((module) => ({
    default: module.UsersPage,
  })),
)
const ContentPage = lazy(() =>
  import('../components/pages/content').then((module) => ({
    default: module.ContentPage,
  })),
)
const WeatherPage = lazy(() =>
  import('../components/pages/weather').then((module) => ({
    default: module.WeatherPage,
  })),
)
const TouristAttractionAdminPage = lazy(
  () => import('../components/pages/TouristAttractionAdminPage'),
)
const TouristAttractionDetailWrapper = lazy(
  () => import('../components/pages/TouristAttractionDetailWrapper'),
)

// Suspense 래퍼 컴포넌트
const SuspenseWrapper = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingSpinner text="페이지를 불러오는 중..." />}>
      {children}
    </Suspense>
  </ErrorBoundary>
)

// 보호된 레이아웃 컴포넌트
const ProtectedLayout = ({ children }) => (
  <ProtectedRoute>
    <DefaultLayout>
      <SuspenseWrapper>{children}</SuspenseWrapper>
    </DefaultLayout>
  </ProtectedRoute>
)

// 라우터 설정
export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
    meta: {
      title: '로그인',
      public: true,
    },
  },
  {
    path: '/',
    element: (
      <ProtectedLayout>
        <MainPage />
      </ProtectedLayout>
    ),
    meta: {
      title: '대시보드',
      breadcrumb: ['대시보드'],
    },
  },
  {
    path: '/admins',
    element: (
      <ProtectedLayout>
        <AdminsPage />
      </ProtectedLayout>
    ),
    meta: {
      title: '관리자 관리',
      breadcrumb: ['대시보드', '관리자 관리'],
      requiredRole: 'super_admin',
    },
  },
  {
    path: '/users',
    element: (
      <ProtectedLayout>
        <UsersPage />
      </ProtectedLayout>
    ),
    meta: {
      title: '사용자 관리',
      breadcrumb: ['대시보드', '사용자 관리'],
    },
  },
  {
    path: '/content',
    element: (
      <ProtectedLayout>
        <ContentPage />
      </ProtectedLayout>
    ),
    meta: {
      title: '콘텐츠 관리',
      breadcrumb: ['대시보드', '콘텐츠 관리'],
    },
  },
  {
    path: '/weather',
    element: (
      <ProtectedLayout>
        <WeatherPage />
      </ProtectedLayout>
    ),
    meta: {
      title: '날씨 관리',
      breadcrumb: ['대시보드', '날씨 관리'],
    },
  },
  {
    path: '/tourist-attractions',
    element: (
      <ProtectedLayout>
        <TouristAttractionAdminPage />
      </ProtectedLayout>
    ),
    meta: {
      title: '관광지 관리',
      breadcrumb: ['대시보드', '관광지 관리'],
    },
  },
  {
    path: '/tourist-attractions/:contentId',
    element: (
      <ProtectedLayout>
        <TouristAttractionDetailWrapper />
      </ProtectedLayout>
    ),
    meta: {
      title: '관광지 상세',
      breadcrumb: ['대시보드', '관광지 관리', '상세'],
    },
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
    meta: {
      title: '페이지를 찾을 수 없음',
    },
  },
])
