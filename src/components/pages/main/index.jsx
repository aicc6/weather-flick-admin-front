import { useAuth } from '../../../contexts/AuthContext'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import {
  LogOut,
  User,
  Users,
  Cloud,
  Settings,
  BarChart3,
  Activity,
  Database,
  Shield,
  Bell,
  Calendar,
  MapPin,
  Thermometer,
  Wind,
  Droplets,
  Sun,
  Moon,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'

/**
 * URL: '/'
 */
export function MainPage() {
  const { logout } = useAuth()
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 헤더 */}
      <header className="border-b bg-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-blue-600 p-2">
                  <Cloud className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Weather Flick
                  </h1>
                  <p className="text-sm text-gray-600">관리자 시스템</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">알림</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">{user?.name}</span>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-6 py-8">
        {/* 환영 메시지 */}
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            환영합니다, {user?.name}님!
          </h2>
          <p className="text-lg text-gray-600">
            Weather Flick 관리자 시스템에서 모든 기능을 관리하세요.
          </p>
        </div>

        {/* 주요 기능 그리드 */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 사용자 관리 */}
          <Card className="h-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-6 w-6 text-blue-600" />
                사용자 관리
              </CardTitle>
              <CardDescription>
                사용자 계정, 권한, 활동 내역을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between">
              <div className="grid h-full grid-cols-2 grid-rows-2 gap-4">
                <Button
                  variant="outline"
                  className="flex h-full min-h-0 flex-col items-center justify-center gap-2 text-base font-medium"
                  onClick={() => navigate('/users')}
                >
                  <Users className="mb-1 h-7 w-7" />
                  사용자 목록
                </Button>
                <Button
                  variant="outline"
                  className="flex h-full min-h-0 flex-col items-center justify-center gap-2 text-base font-medium"
                >
                  <Shield className="mb-1 h-7 w-7" />
                  권한 관리
                </Button>
                <Button
                  variant="outline"
                  className="flex h-full min-h-0 flex-col items-center justify-center gap-2 text-base font-medium"
                >
                  <Activity className="mb-1 h-7 w-7" />
                  활동 로그
                </Button>
                <Button
                  variant="outline"
                  className="flex h-full min-h-0 flex-col items-center justify-center gap-2 text-base font-medium"
                >
                  <AlertTriangle className="mb-1 h-7 w-7" />
                  신고 관리
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 날씨 데이터 관리 */}
          <Card className="h-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Cloud className="h-6 w-6 text-blue-600" />
                날씨 데이터 관리
              </CardTitle>
              <CardDescription>
                날씨 데이터, 예보, 센서 정보를 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-16 flex-col gap-2"
                  onClick={() => navigate('/weather')}
                >
                  <Thermometer className="h-6 w-6" />
                  <span>온도 데이터</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-2">
                  <Wind className="h-6 w-6" />
                  <span>바람 데이터</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-2">
                  <Droplets className="h-6 w-6" />
                  <span>습도 데이터</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-2">
                  <Sun className="h-6 w-6" />
                  <span>예보 관리</span>
                </Button>
              </div>
              <div className="mt-4 rounded-lg bg-blue-50 p-4">
                <h4 className="mb-2 font-semibold">현재 날씨 상태</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">서울</span>
                    <div className="font-semibold">22°C 맑음</div>
                  </div>
                  <div>
                    <span className="text-gray-600">부산</span>
                    <div className="font-semibold">25°C 흐림</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 시스템 관리 및 통계 */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* 시스템 설정 */}
          <Card className="h-80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Settings className="h-6 w-6 text-gray-600" />
                시스템 설정
              </CardTitle>
              <CardDescription>
                시스템 구성 및 환경 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between">
              <div className="grid h-full grid-cols-2 grid-rows-2 gap-4">
                <Button
                  variant="outline"
                  className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-2 text-base font-medium"
                >
                  <Database className="mr-0 mb-1 h-6 w-6" />
                  데이터베이스 설정
                </Button>
                <Button
                  variant="outline"
                  className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-2 text-base font-medium"
                >
                  <Cloud className="mr-0 mb-1 h-6 w-6" />
                  API 설정
                </Button>
                <Button
                  variant="outline"
                  className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-2 text-base font-medium"
                >
                  <Shield className="mr-0 mb-1 h-6 w-6" />
                  보안 설정
                </Button>
                <Button
                  variant="outline"
                  className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-2 text-base font-medium"
                >
                  <Bell className="mr-0 mb-1 h-6 w-6" />
                  알림 설정
                </Button>
              </div>
              <Button
                variant="outline"
                className="mt-4 flex w-full items-center justify-center gap-2 text-base font-medium"
              >
                <Clock className="mr-3 h-5 w-5" />
                백업 설정
              </Button>
            </CardContent>
          </Card>

          {/* 실시간 모니터링 */}
          <Card className="h-80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="h-6 w-6 text-green-600" />
                실시간 모니터링
              </CardTitle>
              <CardDescription>
                시스템 성능 및 상태를 실시간으로 모니터링합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">CPU 사용률</span>
                  <span className="text-sm font-semibold">45%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: '45%' }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">메모리 사용률</span>
                  <span className="text-sm font-semibold">67%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-yellow-500"
                    style={{ width: '67%' }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">디스크 사용률</span>
                  <span className="text-sm font-semibold">23%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: '23%' }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">네트워크</span>
                  <span className="text-sm font-semibold">정상</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: '100%' }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 통계 및 분석 */}
          <Card className="h-80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                통계 및 분석
              </CardTitle>
              <CardDescription>
                사용자 활동 및 시스템 성능 통계를 확인합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between">
              <div className="grid h-full grid-cols-2 grid-rows-2 gap-4">
                <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 rounded-lg bg-purple-50">
                  <BarChart3 className="mb-0.5 h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">일일 활성 사용자</span>
                  <span className="text-lg font-bold text-purple-600">
                    8,432
                  </span>
                </div>
                <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 rounded-lg bg-blue-50">
                  <Activity className="mb-0.5 h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">API 요청 수</span>
                  <span className="text-lg font-bold text-blue-600">156K</span>
                </div>
                <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 rounded-lg bg-green-50">
                  <CheckCircle className="mb-0.5 h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">성공률</span>
                  <span className="text-lg font-bold text-green-600">
                    99.7%
                  </span>
                </div>
                <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 rounded-lg bg-orange-50">
                  <Clock className="mb-0.5 h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">평균 응답시간</span>
                  <span className="text-lg font-bold text-orange-600">
                    45ms
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 최근 활동 및 알림 */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                최근 활동
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">새 사용자 등록</p>
                    <p className="text-sm text-gray-600">
                      user@example.com이 가입했습니다.
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">2분 전</span>
                </div>

                <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Cloud className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">날씨 데이터 업데이트</p>
                    <p className="text-sm text-gray-600">
                      서울 지역 날씨 데이터가 업데이트되었습니다.
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">15분 전</span>
                </div>

                <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                  <div className="rounded-full bg-yellow-100 p-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">시스템 경고</p>
                    <p className="text-sm text-gray-600">
                      메모리 사용률이 80%를 초과했습니다.
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">1시간 전</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                알림 및 공지사항
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-r-lg border-l-4 border-blue-500 bg-blue-50 p-4">
                  <h4 className="font-semibold text-blue-900">
                    시스템 업데이트 예정
                  </h4>
                  <p className="mt-1 text-sm text-blue-700">
                    내일 오전 2시부터 4시까지 시스템 점검이 예정되어 있습니다.
                  </p>
                </div>

                <div className="rounded-r-lg border-l-4 border-green-500 bg-green-50 p-4">
                  <h4 className="font-semibold text-green-900">
                    새로운 기능 출시
                  </h4>
                  <p className="mt-1 text-sm text-green-700">
                    실시간 날씨 알림 기능이 추가되었습니다.
                  </p>
                </div>

                <div className="rounded-r-lg border-l-4 border-orange-500 bg-orange-50 p-4">
                  <h4 className="font-semibold text-orange-900">
                    API 사용량 증가
                  </h4>
                  <p className="mt-1 text-sm text-orange-700">
                    API 호출량이 평소보다 20% 증가했습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
