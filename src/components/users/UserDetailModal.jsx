import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const UserDetailModal = ({ user, isOpen, onClose }) => {
  if (!user) return null

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일 HH:mm', {
        locale: ko,
      })
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            사용자 상세 정보
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 기본 정보 */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">이메일</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">닉네임</p>
                <p className="font-medium">{user.nickname || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">이름</p>
                <p className="font-medium">{user.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">전화번호</p>
                <p className="font-medium">{user.phone || '-'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* 계정 상태 */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">계정 상태</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">상태</p>
                <div className="mt-1">
                  <Badge variant={user.is_active ? 'success' : 'destructive'}>
                    {user.is_active ? '활성' : '비활성'}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">권한</p>
                <div className="mt-1">
                  <Badge variant={user.is_superuser ? 'success' : 'outline'}>
                    {user.is_superuser ? '슈퍼유저' : '일반'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 활동 정보 */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">활동 정보</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">가입일</p>
                <p className="font-medium">{formatDate(user.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">마지막 로그인</p>
                <p className="font-medium">
                  {formatDate(user.last_login_at)}
                </p>
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          {user.bio && (
            <>
              <Separator />
              <div>
                <h3 className="mb-3 text-lg font-semibold">소개</h3>
                <p className="text-sm">{user.bio}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}