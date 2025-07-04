import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  useGetUserStatsQuery,
  useGetUsersQuery,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from '../../store/api/usersApi'
import {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useDeleteAdminPermanentlyMutation,
  useResetAdminPasswordMutation,
  useActivateAdminMutation,
  useDeactivateAdminMutation,
} from '../../store/api/adminsApi'
import { Card } from '../ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ErrorDisplay } from '../common/ErrorDisplay'
import { PageHeader } from '../common/PageHeader'
import { StatusBadge } from '../common/StatusBadge'
import { SearchInput } from '../common/SearchInput'
import { ConfirmDialog } from '../common/ConfirmDialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
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
  UserPlus,
  Shield,
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
  const { user } = useAuth()
  
  // RTK Query 훅들
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useGetUserStatsQuery()
  const { data: usersData, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useGetUsersQuery({ page: 1, size: 50 })
  const { data: adminsData, isLoading: adminsLoading, error: adminsError, refetch: refetchAdmins } = useGetAdminsQuery({ page: 1, limit: 50 })
  
  // Mutation 훅들
  const [createAdmin] = useCreateAdminMutation()
  const [deleteUser] = useDeleteUserMutation()
  const [deleteAdminPermanently] = useDeleteAdminPermanentlyMutation()
  const [resetUserPassword] = useResetUserPasswordMutation()
  const [resetAdminPassword] = useResetAdminPasswordMutation()
  const [activateUser] = useActivateUserMutation()
  const [deactivateUser] = useDeactivateUserMutation()
  const [activateAdmin] = useActivateAdminMutation()
  const [deactivateAdmin] = useDeactivateAdminMutation()
  
  // 로컬 상태 (UI 전용)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('users')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isCreateAdminDialogOpen, setIsCreateAdminDialogOpen] = useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [actionUser, setActionUser] = useState(null)
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    name: '',
    password: '',
    phone: '',
  })

  // 파생 상태
  const users = usersData?.users || []
  const admins = adminsData?.admins || []
  const loading = statsLoading || usersLoading || adminsLoading
  const error = statsError || usersError || adminsError

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
    refetchAdmins()
  }

  // 검색 필터링
  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 관리자 생성
  const handleCreateAdmin = async () => {
    try {
      await createAdmin(newAdmin).unwrap()
      setIsCreateAdminDialogOpen(false)
      setNewAdmin({ email: '', name: '', password: '', phone: '' })
      // RTK Query가 자동으로 캐시를 무효화하므로 수동 리로딩 불필요
    } catch (error) {
      console.error('Failed to create admin:', error)
      alert('관리자 생성에 실패했습니다.')
    }
  }

  // 사용자/관리자 삭제
  const handleDeleteItem = async () => {
    if (!actionUser) return

    try {
      if (activeTab === 'users') {
        await deleteUser(actionUser.user_id).unwrap()
      } else {
        await deleteAdminPermanently(actionUser.admin_id).unwrap()
      }

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
      const userId =
        activeTab === 'users' ? actionUser.user_id : actionUser.admin_id
      let response

      if (activeTab === 'users') {
        response = await resetUserPassword(userId).unwrap()

        if (response.email_sent) {
          alert(
            `사용자 '${response.email}'로 임시 비밀번호가 이메일로 전송되었습니다.\n\n${response.note || ''}`,
          )
        } else {
          alert(
            `이메일 전송에 실패했습니다.\n임시 비밀번호: ${response.temporary_password || 'N/A'}\n\n관리자가 직접 사용자에게 전달해주세요.`,
          )
        }
      } else {
        response = await resetAdminPassword(userId).unwrap()
        alert(
          `관리자 비밀번호가 초기화되었습니다.\n\n임시 비밀번호: ${response.temporary_password}\n\n안전한 곳에 기록한 후 관리자에게 전달해주세요.`,
        )
      }

      setIsResetPasswordDialogOpen(false)
      setActionUser(null)
    } catch (error) {
      console.error('Failed to reset password:', error)
      const errorMsg =
        error.data?.detail ||
        error.message ||
        '비밀번호 초기화에 실패했습니다.'
      alert(errorMsg)
    }
  }

  // 관리자 상태 변경
  const handleToggleAdminStatus = async (adminId, isActive) => {
    try {
      if (isActive) {
        await deactivateAdmin(adminId).unwrap()
      } else {
        await activateAdmin(adminId).unwrap()
      }
    } catch (error) {
      console.error('Failed to toggle admin status:', error)
      const errorMsg =
        error.data?.detail ||
        error.message ||
        '관리자 상태 변경에 실패했습니다.'
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
  if (!stats && !users && !admins) {
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
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight">
          사용자/관리자 관리
        </h2>
        <p className="text-muted-foreground">
          전체 사용자와 관리자를 효율적으로 관리할 수 있습니다.
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
          <Card className="flex flex-col items-center justify-center p-4">
            <Shield className="mb-1 h-7 w-7 text-purple-500" />
            <span className="font-semibold">관리자</span>
            <span className="text-lg font-bold text-purple-700">
              {stats.admins}
            </span>
          </Card>
        </div>
      )}
      {/* 탭/검색 modern 스타일 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="users">사용자</TabsTrigger>
          <TabsTrigger value="admins">관리자</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mb-4 flex items-center justify-between">
        <Input
          placeholder="이메일/닉네임 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 rounded-lg shadow-sm"
        />
        <Button
          onClick={() => setIsCreateAdminDialogOpen(true)}
          className="rounded-lg"
        >
          <UserPlus className="mr-2 h-4 w-4" /> 관리자 추가
        </Button>
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
            {(activeTab === 'users' ? filteredUsers : filteredAdmins).map(
              (item) => (
                <TableRow
                  key={activeTab === 'users' ? item.user_id : item.admin_id}
                  className="transition hover:bg-gray-50"
                >
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.nickname || item.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        activeTab === 'users'
                          ? item.is_active
                            ? 'success'
                            : 'destructive'
                          : item.status === 'ACTIVE'
                            ? 'success'
                            : 'destructive'
                      }
                    >
                      {activeTab === 'users'
                        ? item.is_active
                          ? '활성'
                          : '비활성'
                        : item.status === 'ACTIVE'
                          ? '활성'
                          : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        activeTab === 'users'
                          ? item.is_superuser
                            ? 'success'
                            : 'outline'
                          : 'outline'
                      }
                    >
                      {activeTab === 'users'
                        ? item.is_superuser
                          ? '슈퍼유저'
                          : '일반'
                        : '관리자'}
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
                            setSelectedUser(item)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          상세보기
                        </DropdownMenuItem>

                        {activeTab === 'users' ? (
                          <>
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
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => {
                                console.log(
                                  '관리자 비밀번호 초기화 클릭됨',
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
                                console.log('관리자 상태 변경 클릭됨', item)
                                e.stopPropagation()
                                handleToggleAdminStatus(
                                  item.admin_id,
                                  item.status === 'ACTIVE',
                                )
                              }}
                            >
                              {item.status === 'ACTIVE' ? (
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
                            {/* 슈퍼관리자만 관리자 삭제 가능 */}
                            {user?.email === 'admin@weatherflick.com' && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  console.log('관리자 삭제 클릭됨', item)
                                  e.stopPropagation()
                                  setActionUser(item)
                                  setTimeout(
                                    () => setIsDeleteDialogOpen(true),
                                    0,
                                  )
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                삭제
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      </div>
      {/* 다이얼로그/모달 modern 스타일 (생략, 필요시 추가) */}
      <Dialog
        open={isCreateAdminDialogOpen}
        onOpenChange={setIsCreateAdminDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 관리자 추가</DialogTitle>
            <DialogDescription>새로운 관리자를 등록합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="이메일"
              value={newAdmin.email}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, email: e.target.value })
              }
            />
            <Input
              placeholder="이름"
              value={newAdmin.name}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, name: e.target.value })
              }
            />
            <Input
              placeholder="전화번호"
              value={newAdmin.phone}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, phone: e.target.value })
              }
            />
            <Input
              placeholder="비밀번호"
              type="password"
              value={newAdmin.password}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, password: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateAdminDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleCreateAdmin}>생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 비밀번호 초기화 확인 다이얼로그 */}
      <AlertDialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {activeTab === 'users' ? '사용자' : '관리자'} 비밀번호 초기화
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activeTab === 'users'
                ? `사용자 '${actionUser?.nickname || actionUser?.email}'의 비밀번호를 초기화하시겠습니까?\n\n임시 비밀번호가 사용자의 이메일 주소로 전송됩니다.`
                : `관리자 '${actionUser?.name || actionUser?.email}'의 비밀번호를 초기화하시겠습니까?\n\n임시 비밀번호가 생성되어 화면에 표시됩니다.`}
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
            <AlertDialogTitle>
              {activeTab === 'users' ? '사용자' : '관리자'} 삭제
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activeTab === 'users'
                ? `사용자 '${actionUser?.nickname || actionUser?.email}'를 정말 삭제하시겠습니까?`
                : `관리자 '${actionUser?.name || actionUser?.email}'를 정말 삭제하시겠습니까?`}
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
  )
}
