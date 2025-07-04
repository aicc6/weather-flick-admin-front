import { CheckCircle } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Badge } from '../ui/badge'

export function UserInfoCard({ user }) {
  return (
    <Card>
      <CardHeader className="card-header-standard">
        <div>
          <CardTitle>사용자 정보</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </div>
        <CheckCircle className="h-6 w-6 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="form-layout text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">이름:</span>
            <span>{user?.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">권한:</span>
            <Badge variant={user?.is_superuser ? 'success' : 'outline'}>
              {user?.is_superuser ? '슈퍼유저' : '일반 관리자'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">계정 상태:</span>
            <Badge variant={user?.is_active ? 'success' : 'destructive'}>
              {user?.is_active ? '활성' : '비활성'}
            </Badge>
          </div>
          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
            {user?.is_active
              ? '계정이 정상적으로 있습니다'
              : '계정이 비활성화되어 있습니다'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
