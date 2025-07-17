import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ArrowLeft, Mail, Calendar, Activity, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { LoadingState, ErrorState } from '@/components/common'
import { PageContainer, PageHeader, ContentSection } from '@/layouts'
import { useGetUserQuery } from '@/store/api/usersApi'

export const UserDetailPage = () => {
  const { userId } = useParams()
  const navigate = useNavigate()

  const {
    data: user,
    isLoading,
    error,
  } = useGetUserQuery(userId, {
    skip: !userId,
  })

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

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState text="사용자 정보를 불러오는 중..." />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState
          message="사용자 정보를 불러오는데 실패했습니다."
          onRetry={() => window.location.reload()}
        />
      </PageContainer>
    )
  }

  if (!user) {
    return (
      <PageContainer>
        <ErrorState message="사용자를 찾을 수 없습니다." />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="사용자 상세 정보"
        description={`${user.email}의 상세 정보입니다.`}
      >
        <Button
          variant="outline"
          onClick={() => navigate('/users')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 기본 정보 카드 */}
        <ContentSection className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-sm">이메일</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="text-muted-foreground h-4 w-4" />
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">닉네임</p>
                  <p className="mt-1 font-medium">{user.nickname || '-'}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-3 font-semibold">계정 상태</h4>
                <div className="flex gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">상태</p>
                    <Badge
                      variant={user.is_active ? 'success' : 'destructive'}
                      className="mt-1"
                    >
                      {user.is_active ? '활성' : '비활성'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">권한</p>
                    <Badge
                      variant={user.is_superuser ? 'success' : 'outline'}
                      className="mt-1"
                    >
                      {user.is_superuser ? '슈퍼유저' : '일반'}
                    </Badge>
                  </div>
                </div>
              </div>

              {user.bio && (
                <>
                  <Separator />
                  <div>
                    <h4 className="mb-3 font-semibold">소개</h4>
                    <p className="text-muted-foreground text-sm">{user.bio}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </ContentSection>

        {/* 활동 정보 카드 */}
        <ContentSection>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                활동 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">가입일</p>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <p className="font-medium">{formatDate(user.created_at)}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">마지막 로그인</p>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <p className="font-medium">
                    {formatDate(user.last_login_at)}
                  </p>
                </div>
              </div>

              {user.stats && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-semibold">통계</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border p-3 text-center">
                        <p className="text-2xl font-bold">
                          {user.stats.travel_plans || 0}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          여행 계획
                        </p>
                      </div>
                      <div className="rounded-lg border p-3 text-center">
                        <p className="text-2xl font-bold">
                          {user.stats.reviews || 0}
                        </p>
                        <p className="text-muted-foreground text-xs">리뷰</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </ContentSection>
      </div>
    </PageContainer>
  )
}
