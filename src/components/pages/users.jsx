import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { apiService } from '../../services/api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { Label } from '../ui/label'
import {
  Search,
  Users,
  UserPlus,
  Shield,
  Activity,
  CalendarDays,
  MoreHorizontal,
  Trash2,
  Eye,
  UserCheck,
  UserX,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

export const UsersPage = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('users')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isCreateAdminDialogOpen, setIsCreateAdminDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    name: '',
    password: '',
    phone: '',
  })

  // 데이터 로드
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('Loading user management data...')

      const [userStats, usersList, adminsList] = await Promise.all([
        apiService.getUserStats(),
        apiService.getUsers(1, 50),
        apiService.getAdmins(1, 50),
      ])

      console.log('User stats:', userStats)
      console.log('Users list:', usersList)
      console.log('Admins list:', adminsList)

      setStats(userStats)
      setUsers(usersList.users || [])
      setAdmins(adminsList.admins || [])

      console.log('Data loaded successfully')
    } catch (error) {
      console.error('Failed to load data:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })

      // 사용자에게 에러 표시
      alert(`데이터 로딩에 실패했습니다: ${error.message}`)
    } finally {
      setLoading(false)
    }
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
      await apiService.createAdmin(newAdmin)
      setIsCreateAdminDialogOpen(false)
      setNewAdmin({ email: '', name: '', password: '', phone: '' })
      loadData()
    } catch (error) {
      console.error('Failed to create admin:', error)
      alert('관리자 생성에 실패했습니다.')
    }
  }

  // 사용자 삭제
  const handleDeleteUser = async (userId) => {
    try {
      await apiService.deleteUser(userId)
      loadData()
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('사용자 삭제에 실패했습니다.')
    }
  }

  // 사용자 비밀번호 초기화
  const handleResetUserPassword = async (userId) => {
    try {
      const response = await apiService.resetUserPassword(userId)
      alert(`비밀번호가 "${response.new_password}"로 초기화되었습니다.`)
      loadData()
    } catch (error) {
      console.error('Failed to reset user password:', error)
      alert('비밀번호 초기화에 실패했습니다.')
    }
  }

  // 관리자 삭제
  const handleDeleteAdmin = async (adminId) => {
    try {
      await apiService.deleteAdminPermanently(adminId)
      loadData()
    } catch (error) {
      console.error('Failed to delete admin:', error)
      alert('관리자 삭제에 실패했습니다.')
    }
  }

  // 관리자 비밀번호 초기화
  const handleResetAdminPassword = async (adminId) => {
    try {
      const response = await apiService.resetAdminPassword(adminId)
      alert(`비밀번호가 "${response.new_password}"로 초기화되었습니다.`)
      loadData()
    } catch (error) {
      console.error('Failed to reset admin password:', error)
      alert('관리자 비밀번호 초기화에 실패했습니다.')
    }
  }

  // 관리자 상태 변경
  const handleToggleAdminStatus = async (adminId, isActive) => {
    try {
      if (isActive) {
        await apiService.deactivateAdmin(adminId)
      } else {
        await apiService.activateAdmin(adminId)
      }
      loadData()
    } catch (error) {
      console.error('Failed to toggle admin status:', error)
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        '관리자 상태 변경에 실패했습니다.'
      alert(errorMsg)
    }
  }

  // 사용자 상태 변경
  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      if (isActive) {
        await apiService.deactivateUser(userId)
      } else {
        await apiService.activateUser(userId)
      }
      loadData()
    } catch (error) {
      console.error('Failed to toggle user status:', error)
      const errorMsg =
        error.response?.data?.detail ||
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
          <Button onClick={loadData}>다시 시도</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">사용자 관리</h2>
        <p className="text-muted-foreground">
          시스템의 모든 사용자와 관리자를 확인하고 관리할 수 있습니다.
        </p>
        {/* 디버깅을 위한 현재 사용자 정보 표시 */}
        {user && (
          <div className="mt-2 text-xs text-gray-500">
            현재 사용자: {user?.email} (ID: {user?.admin_id}, 슈퍼유저:{' '}
            {user?.is_superuser ? '예' : '아니오'})
          </div>
        )}
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
            <p className="text-muted-foreground text-xs">등록된 모든 사용자</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_users || 0}</div>
            <p className="text-muted-foreground text-xs">
              {stats?.total_users > 0
                ? Math.round((stats?.active_users / stats?.total_users) * 100)
                : 0}
              % of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">신규 가입</CardTitle>
            <CalendarDays className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.recent_registrations || 0}
            </div>
            <p className="text-muted-foreground text-xs">
              최근 30일 신규 가입자
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이메일 인증</CardTitle>
            <Shield className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.verified_users || 0}
            </div>
            <p className="text-muted-foreground text-xs">인증된 사용자</p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 액션 바 */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="이메일 또는 닉네임으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px] pl-8"
          />
        </div>
        {user?.is_superuser && (
          <Dialog
            open={isCreateAdminDialogOpen}
            onOpenChange={setIsCreateAdminDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />새 관리자 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 관리자 추가</DialogTitle>
                <DialogDescription>
                  새로운 관리자를 시스템에 추가합니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, email: e.target.value })
                    }
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={newAdmin.name}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, name: e.target.value })
                    }
                    placeholder="관리자 이름"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">전화번호</Label>
                  <Input
                    id="phone"
                    value={newAdmin.phone}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, phone: e.target.value })
                    }
                    placeholder="010-1234-5678"
                  />
                </div>
                <div>
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, password: e.target.value })
                    }
                    placeholder="초기 비밀번호"
                  />
                </div>
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
        )}
      </div>

      {/* 탭으로 구분된 목록 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">
            일반 사용자 ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="admins">
            관리자 ({filteredAdmins.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>사용자 목록</CardTitle>
              <CardDescription>
                시스템에 등록된 모든 일반 사용자입니다. 일반 사용자는 앱을 통해
                가입됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이메일</TableHead>
                    <TableHead>닉네임</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>이메일 인증</TableHead>
                    <TableHead>선호 지역</TableHead>
                    <TableHead>가입일</TableHead>
                    {user?.is_superuser && <TableHead>액션</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((userItem) => (
                    <TableRow key={userItem.user_id}>
                      <TableCell className="font-medium">
                        {userItem.email}
                      </TableCell>
                      <TableCell>{userItem.nickname || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            userItem.role === 'ADMIN' ? 'default' : 'secondary'
                          }
                        >
                          {userItem.role === 'ADMIN' ? '관리자' : '사용자'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            userItem.is_active ? 'default' : 'destructive'
                          }
                        >
                          {userItem.is_active ? '활성' : '비활성'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            userItem.is_email_verified ? 'default' : 'outline'
                          }
                        >
                          {userItem.is_email_verified ? '인증됨' : '미인증'}
                        </Badge>
                      </TableCell>
                      <TableCell>{userItem.preferred_region || '-'}</TableCell>
                      <TableCell>
                        {new Date(userItem.created_at).toLocaleDateString(
                          'ko-KR',
                        )}
                      </TableCell>
                      {user?.is_superuser && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setSelectedUser(userItem)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                상세보기
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleToggleUserStatus(
                                    userItem.user_id,
                                    userItem.is_active,
                                  )
                                }
                              >
                                {userItem.is_active ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    비활성화
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    활성화
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleResetUserPassword(userItem.user_id)
                                }
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                비밀번호 초기화
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    삭제
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      사용자 삭제
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      정말로 이 사용자를 삭제하시겠습니까? 이
                                      작업은 되돌릴 수 없습니다.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteUser(userItem.user_id)
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      삭제
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>관리자 목록</CardTitle>
              <CardDescription>
                시스템 관리자 계정 목록입니다. 슈퍼유저는 새로운 관리자를 추가할
                수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이메일</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead>전화번호</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>권한</TableHead>
                    <TableHead>마지막 로그인</TableHead>
                    <TableHead>생성일</TableHead>
                    {user?.is_superuser && <TableHead>액션</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin.admin_id}>
                      <TableCell className="font-medium">
                        {admin.email}
                      </TableCell>
                      <TableCell>
                        {admin.name || admin.username || '-'}
                      </TableCell>
                      <TableCell>{admin.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={admin.is_active ? 'default' : 'destructive'}
                        >
                          {admin.is_active ? '활성' : '비활성'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={admin.is_superuser ? 'default' : 'secondary'}
                        >
                          {admin.is_superuser ? '슈퍼유저' : '일반 관리자'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {admin.last_login_at
                          ? new Date(admin.last_login_at).toLocaleDateString(
                              'ko-KR',
                            )
                          : '없음'}
                      </TableCell>
                      <TableCell>
                        {new Date(admin.created_at).toLocaleDateString('ko-KR')}
                      </TableCell>
                      {user?.is_superuser && (
                        <TableCell>
                          {/* 자기 자신은 관리할 수 없음 - 더 안전한 비교 */}
                          {admin &&
                          user &&
                          admin.admin_id !== user.admin_id &&
                          admin.email !== user.email ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleToggleAdminStatus(
                                      admin.admin_id,
                                      admin.is_active,
                                    )
                                  }
                                >
                                  {admin.is_active ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4" />
                                      비활성화
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4" />
                                      활성화
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleResetAdminPassword(admin.admin_id)
                                  }
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  비밀번호 초기화
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      삭제
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        관리자 삭제
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        정말로 이 관리자를 삭제하시겠습니까? 이
                                        작업은 되돌릴 수 없습니다.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        취소
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteAdmin(admin.admin_id)
                                        }
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        삭제
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              {admin &&
                              user &&
                              (admin.admin_id === user.admin_id ||
                                admin.email === user.email)
                                ? '본인'
                                : '-'}
                            </span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
