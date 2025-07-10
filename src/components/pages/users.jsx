import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { PermissionGuard } from '../common/PermissionGuard'
import { PERMISSIONS } from '../../constants/permissions'
import {
  useGetUserStatsQuery,
  useGetUsersQuery,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from '../../store/api/usersApi'
import { Card } from '../ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
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
} from '../ui/dropdown-menu'

export const UsersPage = () => {
  const { user: _user } = useAuth()

  // RTK Query 훅들
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useGetUserStatsQuery()
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useGetUsersQuery({ page: 1, size: 50 })

  // Mutation 훅들
  const [deleteUser] = useDeleteUserMutation()
  const [resetUserPassword] = useResetUserPasswordMutation()
  const [activateUser] = useActivateUserMutation()
  const [deactivateUser] = useDeactivateUserMutation()

  // 로컬 상태 (UI 전용)
  const [searchTerm, setSearchTerm] = useState('')
  const [_selectedUser, _setSelectedUser] = useState(null)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [actionUser, setActionUser] = useState(null)

  // 파생 상태
  const users = usersData?.users || []
  const loading = statsLoading || usersLoading
  const error = statsError || usersError

  // 에러 로깅
  useEffect(() => {
    if (error) {
      console.error('Failed to load data:', error)
    }
  }, [error])

  // 데이터 새로고침
  const handleRefreshData = () => {
    refetchStats()
    refetchUsers()
  }

  // 검색 필터링
  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 사용자 삭제
  const handleDeleteItem = async () => {
    if (!actionUser) return

    try {
      await deleteUser(actionUser.user_id).unwrap()
      setIsDeleteDialogOpen(false)
      setActionUser(null)
    } catch (error) {
      console.error('Failed to delete:', error)
      const errorMsg =
        error.data?.detail || error.message || '삭제에 실패했습니다.'
      alert(errorMsg)
    }
  }

  // 사용자 비밀번호 초기화
  const handleResetUserPassword = async () => {
    if (!actionUser) return

    try {
      const response = await resetUserPassword(actionUser.user_id).unwrap()

      if (response.email_sent) {
        alert(
          `사용자 '${response.email}'로 임시 비밀번호가 이메일로 전송되었습니다.\n\n${response.note || ''}`,
        )
      } else {
        alert(
          `이메일 전송에 실패했습니다.\n임시 비밀번호: ${response.temporary_password || 'N/A'}\n\n관리자가 직접 사용자에게 전달해주세요.`,
        )
      }

      setIsResetPasswordDialogOpen(false)
      setActionUser(null)
    } catch (error) {
      console.error('Failed to reset password:', error)
      const errorMsg =
        error.data?.detail || error.message || '비밀번호 초기화에 실패했습니다.'
      alert(errorMsg)
    }
  }

  // 사용자 상태 변경
  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      if (isActive) {
        await deactivateUser(userId).unwrap()
      } else {
        await activateUser(userId).unwrap()
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error)
      const errorMsg =
        error.data?.detail ||
        error.message ||
        '사용자 상태 변경에 실패했습니다.'
      alert(errorMsg)
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
  if (!stats && !users) {
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
    <PermissionGuard
      permission={PERMISSIONS.USER_READ}
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-2 text-lg text-red-600">
              접근 권한이 없습니다
            </div>
            <p className="text-muted-foreground">
              이 페이지는 사용자 관리 권한이 필요합니다.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight">사용자 관리</h2>
          <p className="text-muted-foreground">
            전체 사용자를 효율적으로 관리할 수 있습니다.
          </p>
        </div>
        {/* 상단 요약 카드 */}
        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="flex flex-col items-center justify-center p-4">
              <Users className="mb-1 h-7 w-7 text-blue-500" />
              <span className="font-semibold">총 사용자</span>
              <span className="text-lg font-bold text-blue-700">
                {stats.total}
              </span>
            </Card>
            <Card className="flex flex-col items-center justify-center p-4">
              <UserCheck className="mb-1 h-7 w-7 text-green-500" />
              <span className="font-semibold">활성 사용자</span>
              <span className="text-lg font-bold text-green-700">
                {stats.active}
              </span>
            </Card>
            <Card className="flex flex-col items-center justify-center p-4">
              <UserX className="mb-1 h-7 w-7 text-gray-400" />
              <span className="font-semibold">비활성 사용자</span>
              <span className="text-lg font-bold text-gray-500">
                {stats.inactive}
              </span>
            </Card>
          </div>
        )}
        <div className="mb-4 flex items-center justify-between">
          <Input
            placeholder={t('users.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 rounded-lg shadow-sm"
          />
        </div>
        {/* 테이블 modern 스타일 */}
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>이메일</TableHead>
                <TableHead>닉네임/이름</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>권한</TableHead>
                <TableHead className="text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((item) => (
                <TableRow
                  key={item.user_id}
                  className="transition hover:bg-gray-50"
                >
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.nickname || item.name}</TableCell>
                  <TableCell>
                    <Badge variant={item.is_active ? 'success' : 'destructive'}>
                      {item.is_active ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.is_superuser ? 'success' : 'outline'}>
                      {item.is_superuser ? '슈퍼유저' : '일반'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            console.log('드롭다운 버튼 클릭됨', item)
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
                            _setSelectedUser(item)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          상세보기
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={(e) => {
                            console.log('사용자 비밀번호 초기화 클릭됨', item)
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
                            handleToggleUserStatus(item.user_id, item.is_active)
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 비밀번호 초기화 확인 다이얼로그 */}
        <AlertDialog
          open={isResetPasswordDialogOpen}
          onOpenChange={setIsResetPasswordDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>사용자 비밀번호 초기화</AlertDialogTitle>
              <AlertDialogDescription>
                사용자 &apos;${actionUser?.nickname || actionUser?.email}
                &apos;의 비밀번호를 초기화하시겠습니까?\n\n임시 비밀번호가
                사용자의 이메일 주소로 전송됩니다.
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
                사용자 &apos;${actionUser?.nickname || actionUser?.email}
                &apos;를 정말 삭제하시겠습니까?
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
      </div>
    </PermissionGuard>
  )
}
