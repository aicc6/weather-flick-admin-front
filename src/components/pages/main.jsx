import { useAuth } from '../../contexts/AuthContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Users, Shield, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'

export const MainPage = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">대시보드</h2>
        <p className="text-muted-foreground">
          Weather Flick 관리자 대시보드에 오신 것을 환영합니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">사용자 정보</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.username}</div>
            <p className="text-muted-foreground text-xs">{user?.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">권한</CardTitle>
            <Shield className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.is_superuser ? '슈퍼유저' : '일반 관리자'}
            </div>
            <p className="text-muted-foreground text-xs">
              {user?.is_active ? '활성 계정' : '비활성 계정'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">계정 상태</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.is_active ? '활성' : '비활성'}
            </div>
            <p className="text-muted-foreground text-xs">
              계정이 {user?.is_active ? '정상적으로' : '비활성화되어'} 있습니다
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>시스템 정보</CardTitle>
            <CardDescription>
              Weather Flick 관리자 시스템의 현재 상태입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">데이터베이스 연결</span>
                <span className="text-sm text-green-600">정상</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API 서버</span>
                <span className="text-sm text-green-600">정상</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">인증 시스템</span>
                <span className="text-sm text-green-600">정상</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>빠른 액션</CardTitle>
            <CardDescription>
              자주 사용하는 기능에 빠르게 접근하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user?.is_superuser && (
                <div className="text-sm">
                  <span className="font-medium">관리자 목록:</span>
                  <br />
                  시스템의 모든 관리자를 확인하고 관리할 수 있습니다.
                  <br />
                  <Link
                    to="/users"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    관리자 관리 페이지로 이동 →
                  </Link>
                </div>
              )}
              <div className="text-sm">
                <span className="font-medium">계정 관리:</span>
                <br />
                {user?.is_superuser
                  ? '관리자 계정을 생성, 수정, 삭제할 수 있습니다.'
                  : '슈퍼유저만 관리자 계정을 관리할 수 있습니다.'}
              </div>
              <div className="text-sm">
                <span className="font-medium">권한 관리:</span>
                <br />
                {user?.is_superuser
                  ? '슈퍼유저 권한으로 다른 관리자의 권한을 관리할 수 있습니다.'
                  : '슈퍼유저만 권한을 관리할 수 있습니다.'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
