import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  useGetUserStatsQuery,
  useGetUsersQuery,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useHardDeleteUserMutation,
} from '@/store/api/usersApi'
// Card is imported as StyledCard from common components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Users,
  MoreHorizontal,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  KeyRound,
  Lock,
  Unlock,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LoadingState,
  EmptyState,
  ErrorState,
  StyledCard,
} from '@/components/common'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { PageContainer, PageHeader, ContentSection } from '@/layouts'
import { Skeleton } from '@/components/ui/skeleton'

// 헬퍼 함수 선언
const isDeletedUser = (user) => user.email?.startsWith('deleted_')

export const UsersPage = () => {
  const { user: _user } = useAuth()
  const navigate = useNavigate()

  // 로컬 상태 (UI 전용) - 먼저 선언
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'active', 'inactive', 'deleted'
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [actionUser, setActionUser] = useState(null)
  const [isHardDeleteDialogOpen, setIsHardDeleteDialogOpen] = useState(false)

  // RTK Query 훅들
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useGetUserStatsQuery()

  // API 쿼리 파라미터 구성
  const queryParams = {
    page: currentPage,
    size: pageSize,
    include_deleted: true,
  }

  // 검색어가 있을 때만 추가
  if (searchTerm) {
    queryParams.email = searchTerm
    queryParams.nickname = searchTerm
  }

  // 상태 필터 적용
  if (statusFilter === 'active') {
    queryParams.is_active = true
  } else if (statusFilter === 'inactive') {
    queryParams.is_active = false
  } else if (statusFilter === 'deleted') {
    queryParams.only_deleted = true
  }

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useGetUsersQuery(queryParams)

  // Mutation 훅들
  const [deleteUser] = useDeleteUserMutation()
  const [resetUserPassword] = useResetUserPasswordMutation()
  const [activateUser] = useActivateUserMutation()
  const [deactivateUser] = useDeactivateUserMutation()
  const [hardDeleteUser] = useHardDeleteUserMutation()

  // 파생 상태
  const users = usersData?.users || []
  const totalCount = usersData?.total || 0
  const totalPages = usersData?.total_pages || Math.ceil(totalCount / pageSize)
  const loading = statsLoading || usersLoading
  const error = statsError || usersError

  // 탈퇴한 사용자 필터링
  const deletedUsers = users.filter(isDeletedUser)
  const activeUsers = users.filter((user) => !isDeletedUser(user))

  // 통계 데이터가 없으면 사용자 목록에서 계산
  const calculatedStats = {
    total: activeUsers.length,
    active: activeUsers.filter((user) => user.is_active).length,
    inactive: activeUsers.filter((user) => !user.is_active).length,
    deleted: deletedUsers.length,
  }

  // API 응답의 필드명을 맞춰줌
  const displayStats = stats
    ? {
        total: stats.total_users || 0,
        active: stats.active_users || 0,
        inactive: (stats.total_users || 0) - (stats.active_users || 0),
        deleted: deletedUsers.length, // API 통계에는 없으므로 직접 계산
      }
    : calculatedStats

  // 디버깅용
  console.log('Stats:', stats)
  console.log('Users:', users)
  console.log('Display Stats:', displayStats)

  // 에러 로깅
  useEffect(() => {
    if (error) {
      console.error('Failed to load data:', error)
    }
  }, [error])

  // 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchTerm])

  // 데이터 새로고침
  const handleRefreshData = () => {
    refetchStats()
    refetchUsers()
  }

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (newSize) => {
    setPageSize(parseInt(newSize))
    setCurrentPage(1) // 페이지 크기 변경 시 첫 페이지로
  }

  // 서버 사이드 필터링을 사용하므로 클라이언트 필터링은 제거
  const filteredUsers = users

  // 사용자 삭제
  const handleDeleteItem = async () => {
    if (!actionUser) return

    try {
      await deleteUser(actionUser.user_id).unwrap()
      setIsDeleteDialogOpen(false)
      setActionUser(null)
      toast.success(`${actionUser.email} 사용자가 삭제되었습니다.`)
    } catch (error) {
      console.error('Failed to delete:', error)
      const errorMsg =
        error.data?.detail || error.message || '삭제에 실패했습니다.'
      toast.error(errorMsg)
    }
  }

  // 사용자 비밀번호 초기화
  const handleResetUserPassword = async () => {
    if (!actionUser) return

    try {
      const response = await resetUserPassword(actionUser.user_id).unwrap()

      if (response.email_sent) {
        toast.success(
          `사용자 '${response.email}'로 임시 비밀번호가 이메일로 전송되었습니다.`,
        )
      } else {
        toast.error(
          `이메일 전송에 실패했습니다. 임시 비밀번호: ${response.temporary_password || 'N/A'}`,
        )
      }

      setIsResetPasswordDialogOpen(false)
      setActionUser(null)
    } catch (error) {
      console.error('Failed to reset password:', error)
      const errorMsg =
        error.data?.detail || error.message || '비밀번호 초기화에 실패했습니다.'
      toast.error(errorMsg)
    }
  }

  // 사용자 상태 변경
  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      if (isActive) {
        await deactivateUser(userId).unwrap()
        toast.success('사용자가 비활성화되었습니다.')
      } else {
        await activateUser(userId).unwrap()
        toast.success('사용자가 활성화되었습니다.')
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error)
      const errorMsg =
        error.data?.detail ||
        error.message ||
        '사용자 상태 변경에 실패했습니다.'
      toast.error(errorMsg)
    }
  }

  const handleHardDeleteItem = async () => {
    if (!actionUser) return
    console.log('영구 삭제 시도:', actionUser)
    try {
      await hardDeleteUser(actionUser.user_id).unwrap()
      setIsHardDeleteDialogOpen(false)
      setActionUser(null)
      refetchStats()
      refetchUsers()
      toast.success(`${actionUser.email} 사용자가 영구 삭제되었습니다.`)
    } catch (error) {
      console.error('Failed to hard delete:', error)
      const errorMsg =
        error.data?.detail || error.message || '영구 삭제에 실패했습니다.'
      toast.error(errorMsg)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  // 에러가 있거나 데이터가 없는 경우 처리
  if (!displayStats && !users) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-lg text-red-600">
            데이터를 불러올 수 없습니다
          </div>
          <Button onClick={handleRefreshData}>다시 시도</Button>
        </div>
      </div>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="사용자 관리"
        description="전체 사용자를 효율적으로 관리할 수 있습니다."
      />

      {/* 상단 요약 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          // 로딩 스켈레톤
          <>
            {[...Array(4)].map((_, index) => (
              <StyledCard
                key={index}
                className="flex flex-col items-center justify-center p-4"
              >
                <Skeleton className="mb-2 h-8 w-8 rounded-full" />
                <Skeleton className="mb-1 h-4 w-16" />
                <Skeleton className="h-8 w-20" />
              </StyledCard>
            ))}
          </>
        ) : (
          // 실제 데이터
          <>
            <StyledCard
              className={`flex cursor-pointer flex-col items-center justify-center p-4 transition-all hover:shadow-md ${
                statusFilter === 'all' ? 'ring-primary ring-2' : ''
              }`}
              onClick={() => setStatusFilter('all')}
            >
              <Users className="text-primary mb-2 h-8 w-8" />
              <span className="text-muted-foreground text-sm font-medium">
                총 사용자
              </span>
              <span className="text-foreground text-2xl font-bold">
                {displayStats?.total || 0}명
              </span>
            </StyledCard>
            <StyledCard
              className={`flex cursor-pointer flex-col items-center justify-center p-4 transition-all hover:shadow-md ${
                statusFilter === 'active' ? 'ring-2 ring-green-600' : ''
              }`}
              onClick={() => setStatusFilter('active')}
            >
              <UserCheck className="mb-2 h-8 w-8 text-green-600" />
              <span className="text-muted-foreground text-sm font-medium">
                활성 사용자
              </span>
              <span className="text-2xl font-bold text-green-600">
                {displayStats?.active || 0}명
              </span>
            </StyledCard>
            <StyledCard
              className={`flex cursor-pointer flex-col items-center justify-center p-4 transition-all hover:shadow-md ${
                statusFilter === 'inactive' ? 'ring-2 ring-gray-600' : ''
              }`}
              onClick={() => setStatusFilter('inactive')}
            >
              <UserX className="text-muted-foreground mb-2 h-8 w-8" />
              <span className="text-muted-foreground text-sm font-medium">
                비활성 사용자
              </span>
              <span className="text-muted-foreground text-2xl font-bold">
                {displayStats?.inactive || 0}명
              </span>
            </StyledCard>
            <StyledCard
              className={`flex cursor-pointer flex-col items-center justify-center p-4 transition-all hover:shadow-md ${
                statusFilter === 'deleted' ? 'ring-2 ring-red-600' : ''
              }`}
              onClick={() => setStatusFilter('deleted')}
            >
              <Trash2 className="mb-2 h-8 w-8 text-red-600" />
              <span className="text-muted-foreground text-sm font-medium">
                탈퇴 사용자
              </span>
              <span className="text-2xl font-bold text-red-600">
                {displayStats?.deleted || 0}명
              </span>
            </StyledCard>
          </>
        )}
      </div>

      {/* 검색 영역 */}
      <ContentSection transparent>
        <div className="flex items-center gap-4">
          <Input
            placeholder="이메일 또는 닉네임으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm"
          />
          {statusFilter !== 'all' && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setStatusFilter('all')}
            >
              {statusFilter === 'active'
                ? '활성 사용자'
                : statusFilter === 'inactive'
                  ? '비활성 사용자'
                  : '탈퇴 사용자'}{' '}
              필터
              <span className="ml-1">✕</span>
            </Badge>
          )}
        </div>
      </ContentSection>

      {/* 사용자 테이블 */}
      <ContentSection noPadding>
        {loading ? (
          <LoadingState message="사용자 목록을 불러오는 중..." />
        ) : error ? (
          <ErrorState
            error={error}
            onRetry={() => {
              refetchStats()
              refetchUsers()
            }}
            message="사용자 목록을 불러올 수 없습니다"
          />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            type="search"
            message={
              searchTerm || statusFilter !== 'all'
                ? '검색 결과가 없습니다'
                : '등록된 사용자가 없습니다'
            }
            description={
              searchTerm || statusFilter !== 'all'
                ? '다른 검색어나 필터로 시도해보세요'
                : '새로운 사용자가 가입하면 여기에 표시됩니다'
            }
          />
        ) : (
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>이메일</TableHead>
                <TableHead>닉네임</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>권한</TableHead>
                <TableHead className="text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((item) => {
                const isDeleted = isDeletedUser(item)
                return (
                  <TableRow
                    key={item.user_id}
                    className={`transition hover:bg-gray-50 ${isDeleted ? 'opacity-60' : 'cursor-pointer'}`}
                    onClick={() =>
                      !isDeleted && navigate(`/users/${item.user_id}`)
                    }
                  >
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.nickname || '-'}</TableCell>
                    <TableCell>
                      {isDeleted ? (
                        <Badge variant="destructive">탈퇴</Badge>
                      ) : (
                        <Badge
                          variant={item.is_active ? 'success' : 'destructive'}
                        >
                          {item.is_active ? '활성' : '비활성'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.is_superuser ? 'success' : 'outline'}
                      >
                        {item.is_superuser ? '슈퍼유저' : '일반'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isDeleted ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="ml-2 text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('영구 삭제 버튼 클릭:', item)
                            setActionUser(item)
                            setIsHardDeleteDialogOpen(true)
                          }}
                        >
                          영구 삭제
                        </Button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                            >
                              <span className="sr-only">메뉴 열기</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                console.log('상세보기 클릭됨', item)
                                e.stopPropagation()
                                navigate(`/users/${item.user_id}`)
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              상세보기
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={(e) => {
                                console.log(
                                  '사용자 비밀번호 초기화 클릭됨',
                                  item,
                                )
                                e.stopPropagation()
                                setActionUser(item)
                                setTimeout(
                                  () => setIsResetPasswordDialogOpen(true),
                                  0,
                                )
                              }}
                            >
                              <KeyRound className="mr-2 h-4 w-4" />
                              비밀번호 초기화
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                console.log('사용자 상태 변경 클릭됨', item)
                                e.stopPropagation()
                                handleToggleUserStatus(
                                  item.user_id,
                                  item.is_active,
                                )
                              }}
                            >
                              {item.is_active ? (
                                <>
                                  <Lock className="mr-2 h-4 w-4" />
                                  비활성화
                                </>
                              ) : (
                                <>
                                  <Unlock className="mr-2 h-4 w-4" />
                                  활성화
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                console.log('사용자 삭제 클릭됨', item)
                                e.stopPropagation()
                                setActionUser(item)
                                setTimeout(() => setIsDeleteDialogOpen(true), 0)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        {/* 페이지네이션 */}
        {!loading && !error && filteredUsers.length > 0 && (
          <div className="flex flex-col gap-4 px-2 py-4">
            {/* 페이지 크기 선택 및 현재 표시 정보 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  페이지당 표시:
                </span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-muted-foreground text-sm">
                총 {totalCount}명 중 {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, totalCount)}명 표시
              </div>
            </div>

            {/* 페이지 네비게이션 */}
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={
                        currentPage === 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>

                  {/* 페이지 번호 표시 */}
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    if (pageNum > totalPages) return null

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(totalPages)}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={
                        currentPage === totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </ContentSection>

      {/* 비밀번호 초기화 확인 다이얼로그 */}
      <AlertDialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>사용자 비밀번호 초기화</AlertDialogTitle>
            <AlertDialogDescription>
              사용자 &apos;${actionUser?.nickname || actionUser?.email}&apos;의
              비밀번호를 초기화하시겠습니까?\n\n임시 비밀번호가 사용자의 이메일
              주소로 전송됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActionUser(null)}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleResetUserPassword}>
              초기화
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>사용자 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              사용자 &apos;${actionUser?.nickname || actionUser?.email}&apos;를
              정말 삭제하시겠습니까?
              <br />
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActionUser(null)}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 영구 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={isHardDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsHardDeleteDialogOpen(open)
          if (!open) setActionUser(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>탈퇴 회원 영구 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              사용자 &apos;{actionUser?.nickname || actionUser?.email}&apos;를
              <br />
              <b>DB에서 완전히 삭제</b>하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActionUser(null)}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHardDeleteItem}
              className="bg-red-700 hover:bg-red-800"
            >
              영구 삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
