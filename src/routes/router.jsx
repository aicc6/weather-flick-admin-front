import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorBoundary } from '@/components/common'
import { AdminLayout } from '@/layouts/admin-layout'

// 레이지 로딩으로 페이지 컴포넌트들 import
const LoginPage = lazy(() =>
  import('../pages/login').then((module) => ({
    default: module.LoginPage,
  })),
)
const MainPage = lazy(() =>
  import('../pages/main').then((module) => ({
    default: module.MainPage,
  })),
)
const AdminsPage = lazy(() =>
  import('../pages/admins').then((module) => ({
    default: module.AdminsPage,
  })),
)
const PermissionsPage = lazy(() =>
  import('../pages/permissions').then((module) => ({
    default: module.PermissionsPage,
  })),
)
const UsersPage = lazy(() =>
  import('../pages/users').then((module) => ({
    default: module.UsersPage,
  })),
)
const UserDetailPage = lazy(() =>
  import('../pages/UserDetail').then((module) => ({
    default: module.UserDetailPage,
  })),
)
const ContentPage = lazy(() =>
  import('../pages/content').then((module) => ({
    default: module.ContentPage,
  })),
)
const WeatherPage = lazy(() =>
  import('../pages/weather').then((module) => ({
    default: module.WeatherPage,
  })),
)
const ContentDetailPage = lazy(() => import('../pages/ContentDetailPage'))
const BatchManagementPage = lazy(() =>
  import('../pages/batch-management').then((module) => ({
    default: module.default,
  })),
)
const RegionsPage = lazy(() =>
  import('../pages/regions').then((module) => ({
    default: module.default,
  })),
)
const FestivalEventDetailPage = lazy(() =>
  import('../pages/FestivalEventDetailPage').then((module) => ({
    default: module.default,
  })),
)
const ContactList = lazy(() => import('../pages/Contact/ContactList'))
const ContactDetail = lazy(() => import('../pages/Contact/ContactDetail'))
const LeisureSportDetailPage = lazy(
  () => import('../pages/LeisureSportDetailPage'),
)
const TouristAttractionDetailWrapper = lazy(
  () => import('../pages/TouristAttractionDetailWrapper'),
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
    <AdminLayout>
      <SuspenseWrapper>{children}</SuspenseWrapper>
    </AdminLayout>
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
    path: '/permissions',
    element: (
      <ProtectedLayout>
        <PermissionsPage />
      </ProtectedLayout>
    ),
    meta: {
      title: '권한 관리',
      breadcrumb: ['대시보드', '권한 관리'],
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
    path: '/users/:userId',
    element: (
      <ProtectedLayout>
        <UserDetailPage />
      </ProtectedLayout>
    ),
    meta: {
      title: '사용자 상세',
      breadcrumb: ['대시보드', '사용자 관리', '상세'],
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
    path: '/attractions',
    element: <Navigate to="/content" replace />,
  },
  {
    path: '/attractions/:contentId',
    element: <Navigate to="/content" replace />,
  },
  {
    path: '/content/:contentId',
    element: (
      <ProtectedLayout>
        <ContentDetailPage />
      </ProtectedLayout>
    ),
    meta: {
      title: '코스 상세',
      breadcrumb: ['대시보드', '콘텐츠 관리', '상세'],
    },
  },
  {
    path: '/content/festival/:contentId',
    element: (
      <ProtectedLayout>
        <SuspenseWrapper>
          <FestivalEventDetailPage />
        </SuspenseWrapper>
      </ProtectedLayout>
    ),
    meta: {
      title: '축제 이벤트 상세',
      breadcrumb: ['대시보드', '콘텐츠 관리', '축제 이벤트 상세'],
    },
  },
  {
    path: '/batch-management',
    element: (
      <ProtectedLayout>
        <BatchManagementPage />
      </ProtectedLayout>
    ),
    meta: {
      title: '배치 관리',
      breadcrumb: ['대시보드', '배치 관리'],
    },
  },
  {
    path: '/regions',
    element: (
      <ProtectedLayout>
        <RegionsPage />
      </ProtectedLayout>
    ),
    meta: {
      title: '지역 관리',
      breadcrumb: ['대시보드', '지역 관리'],
    },
  },
  {
    path: '/contact',
    element: (
      <ProtectedLayout>
        <ContactList />
      </ProtectedLayout>
    ),
    meta: {
      title: '문의',
      breadcrumb: ['대시보드', '문의'],
    },
  },
  {
    path: '/contact/:id',
    element: (
      <ProtectedLayout>
        <ContactDetail />
      </ProtectedLayout>
    ),
    meta: {
      title: '문의 상세',
      breadcrumb: ['대시보드', '문의', '상세'],
    },
  },
  {
    path: '/leisure-sports/:contentId',
    element: (
      <ProtectedLayout>
        <LeisureSportDetailPage />
      </ProtectedLayout>
    ),
    meta: {
      title: '레저스포츠 상세',
      breadcrumb: ['대시보드', '레저스포츠 관리', '상세'],
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
      breadcrumb: ['대시보드', '콘텐츠 관리', '관광지 상세'],
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
