import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Users,
  UserCheck,
  UserX,
  UserMinus,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
} from '@/store/api/usersApi'
import { ContentSection, PageContainer, PageHeader } from '@/layouts'
import {
  LoadingState,
  EmptyState,
  ErrorState,
  StandardButton,
  StandardInput,
  StandardSelect,
} from '@/components/common'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'

/**
 * URL: '/users'
 */
export function UsersPage() {
  const { isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // RTK Query 훅들
  const {
    data: usersData,
    isLoading: loading,
    error,
    refetch: refetchUsers,
  } = useGetUsersQuery(undefined, { skip: !isAuthenticated })

  const [createUserMutation] = useCreateUserMutation()
  const [deleteUserMutation] = useDeleteUserMutation()

  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)
  const [userFormData, setUserFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    is_active: true,
  })

  // 사용자 목록 (RTK Query 데이터에서 가져오기)
  const users = usersData?.users || []

  // 사용자 생성
  const handleCreateUser = async () => {
    if (
      !userFormData.email ||
      !userFormData.username ||
      !userFormData.password
    ) {
      alert('이메일, 사용자명, 비밀번호는 필수 입력 항목입니다.')
      return
    }

    try {
      await createUserMutation(userFormData).unwrap()
      setIsCreateUserDialogOpen(false)
      setUserFormData({
        full_name: '',
        email: '',
        username: '',
        password: '',
        is_active: true,
      })
    } catch (err) {
      console.error('Failed to create user:', err)
      alert(`사용자 생성에 실패했습니다: ${err.message}`)
    }
  }

  // 사용자 삭제
  const handleDeleteUser = async (userId) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      try {
        await deleteUserMutation(userId).unwrap()
      } catch (err) {
        console.error('Failed to delete user:', err)
        alert(`사용자 삭제에 실패했습니다: ${err.message}`)
      }
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active) ||
      (statusFilter === 'withdrawn' && user.is_withdrawn)

    return matchesSearch && matchesStatus
  })

  // 페이지네이션
  const totalPages = Math.ceil(filteredUsers.length / pageSize)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // 통계 계산
  const activeCount = users.filter((u) => u.is_active).length
  const inactiveCount = users.filter((u) => !u.is_active && !u.is_withdrawn).length
  const withdrawnCount = users.filter((u) => u.is_withdrawn).length

  if (!isAuthenticated) {
    return (
      <PageContainer>
        <ErrorState
          message="로그인이 필요합니다"
          error={{ message: '사용자 관리 페이지에 접근하려면 로그인해주세요.' }}
          action={
            <StandardButton onClick={() => (window.location.href = '/login')}>
              로그인 페이지로 이동
            </StandardButton>
          }
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="사용자 관리"
        description="전체 사용자를 효율적으로 관리할 수 있습니다."
      />

      {/* 통계 카드 */}
      <ContentSection title="사용자 통계">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">총 사용자</p>
                <p className="text-2xl font-bold">{users.length}명</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">활성 사용자</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}명</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">비활성 사용자</p>
                <p className="text-2xl font-bold text-yellow-600">{inactiveCount}명</p>
              </div>
              <UserX className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">탈퇴 사용자</p>
                <p className="text-2xl font-bold text-red-600">{withdrawnCount}명</p>
              </div>
              <UserMinus className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      </ContentSection>

      {/* 사용자 목록 */}
      <ContentSection title="사용자 목록">
        {/* 검색 및 필터 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              placeholder="이메일 또는 닉네임으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
                <SelectItem value="withdrawn">탈퇴</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsCreateUserDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            새 사용자 추가
          </Button>
        </div>

        {loading ? (
          <LoadingState message="사용자 목록을 불러오는 중..." />
        ) : error ? (
          <ErrorState
            error={error}
            onRetry={() => refetchUsers()}
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
                ? '다른 검색 조건으로 시도해보세요'
                : '새로운 사용자를 추가해주세요'
            }
            action={
              !(searchTerm || statusFilter !== 'all') && (
                <Button onClick={() => setIsCreateUserDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  새 사용자 추가
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이메일</TableHead>
                    <TableHead>닉네임/이름</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>권한</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.username || user.full_name || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.is_active
                              ? 'default'
                              : user.is_withdrawn
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {user.is_active
                            ? '활성'
                            : user.is_withdrawn
                            ? '탈퇴'
                            : '비활성'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">일반</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => console.log('Edit user:', user.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">페이지당 표시:</span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => {
                        setPageSize(Number(value))
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-sm text-gray-600">
                    총 {filteredUsers.length}명 중 {(currentPage - 1) * pageSize + 1}-
                    {Math.min(currentPage * pageSize, filteredUsers.length)}명 표시
                  </span>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </ContentSection>

      {/* 사용자 생성 다이얼로그 */}
      <Dialog
        open={isCreateUserDialogOpen}
        onOpenChange={setIsCreateUserDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 사용자 생성</DialogTitle>
            <DialogDescription>
              새로운 일반 사용자를 생성합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                이메일
              </Label>
              <StandardInput
                id="email"
                type="email"
                value={userFormData.email}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, email: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                사용자명
              </Label>
              <StandardInput
                id="username"
                value={userFormData.username}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, username: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                전체 이름
              </Label>
              <StandardInput
                id="full_name"
                value={userFormData.full_name}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, full_name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                비밀번호
              </Label>
              <StandardInput
                id="password"
                type="password"
                value={userFormData.password}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, password: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active" className="text-right">
                활성 상태
              </Label>
              <div className="col-span-3">
                <Checkbox
                  id="is_active"
                  checked={userFormData.is_active}
                  onCheckedChange={(checked) =>
                    setUserFormData({ ...userFormData, is_active: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateUserDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleCreateUser}>생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

export default UsersPage