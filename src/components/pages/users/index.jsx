import { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent } from '../../../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs'
import {
  Users,
  Search,
  Filter,
  Edit,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Plus,
  Loader2,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import { apiService } from '../../../services/api'
import { useAuth } from '../../../contexts/AuthContext'

/**
 * URL: '/users'
 */
export function UsersPage() {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('users')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')

  // Users state
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)
  const [userFormData, setUserFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    is_active: true,
  })

  // Admins state
  const [admins, setAdmins] = useState([])
  const [adminsLoading, setAdminsLoading] = useState(true)
  const [adminsError, setAdminsError] = useState(null)
  const [isCreateAdminDialogOpen, setIsCreateAdminDialogOpen] = useState(false)
  const [isEditAdminDialogOpen, setIsEditAdminDialogOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [adminFormData, setAdminFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    is_active: true,
  })

  // 사용자 목록 불러오기
  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getUsers()
      setUsers(data)
    } catch (err) {
      console.error('Failed to load users:', err)
      if (err.message.includes('401') || err.message.includes('403')) {
        setError('권한이 없습니다. 슈퍼유저로 로그인해주세요.')
      } else if (err.message.includes('Failed to fetch')) {
        setError(
          '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.',
        )
      } else {
        setError('사용자 목록을 불러오는데 실패했습니다: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // 관리자 목록 불러오기
  const loadAdmins = async () => {
    try {
      setAdminsLoading(true)
      setAdminsError(null)
      console.log('Loading admins...')
      const data = await apiService.getAdmins()
      console.log('Admins loaded:', data)
      setAdmins(data)
    } catch (err) {
      console.error('Failed to load admins:', err)
      if (err.message.includes('401') || err.message.includes('403')) {
        setAdminsError('권한이 없습니다. 관리자로 로그인해주세요.')
      } else if (err.message.includes('Failed to fetch')) {
        setAdminsError(
          '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.',
        )
      } else {
        setAdminsError('관리자 목록을 불러오는데 실패했습니다: ' + err.message)
      }
    } finally {
      setAdminsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers()
      loadAdmins()
    } else {
      setLoading(false)
      setError('로그인이 필요합니다.')
    }
  }, [isAuthenticated])

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
      console.log('Creating user:', userFormData)
      await apiService.createUser(userFormData)
      setIsCreateUserDialogOpen(false)
      setUserFormData({
        full_name: '',
        email: '',
        username: '',
        password: '',
        is_active: true,
      })
      loadUsers()
    } catch (err) {
      console.error('Failed to create user:', err)
      alert(`사용자 생성에 실패했습니다: ${err.message}`)
    }
  }

  // 사용자 삭제
  const handleDeleteUser = async (userId) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      try {
        await apiService.deleteUser(userId)
        loadUsers()
      } catch (err) {
        console.error('Failed to delete user:', err)
        alert(`사용자 삭제에 실패했습니다: ${err.message}`)
      }
    }
  }

  // 관리자 생성
  const handleCreateAdmin = async () => {
    if (
      !adminFormData.email ||
      !adminFormData.username ||
      !adminFormData.password
    ) {
      alert('이메일, 사용자명, 비밀번호는 필수 입력 항목입니다.')
      return
    }

    try {
      console.log('Creating admin:', adminFormData)
      await apiService.createAdmin(adminFormData)
      setIsCreateAdminDialogOpen(false)
      setAdminFormData({
        full_name: '',
        email: '',
        username: '',
        password: '',
        is_active: true,
      })
      loadAdmins()
    } catch (err) {
      console.error('Failed to create admin:', err)
      alert(`관리자 생성에 실패했습니다: ${err.message}`)
    }
  }

  // 관리자 수정
  const handleUpdateAdmin = async () => {
    if (!adminFormData.email || !adminFormData.username) {
      alert('이메일과 사용자명은 필수 입력 항목입니다.')
      return
    }

    try {
      console.log('Updating admin:', selectedAdmin.id, adminFormData)
      await apiService.updateAdmin(selectedAdmin.id, adminFormData)
      setIsEditAdminDialogOpen(false)
      setSelectedAdmin(null)
      setAdminFormData({
        full_name: '',
        email: '',
        username: '',
        password: '',
        is_active: true,
      })
      loadAdmins()
    } catch (err) {
      console.error('Failed to update admin:', err)
      alert(`관리자 수정에 실패했습니다: ${err.message}`)
    }
  }

  // 관리자 활성화/비활성화
  const handleToggleAdminStatus = async (adminId, currentStatus) => {
    try {
      if (currentStatus) {
        await apiService.deactivateAdmin(adminId)
      } else {
        await apiService.activateAdmin(adminId)
      }
      loadAdmins()
    } catch (err) {
      console.error('Failed to toggle admin status:', err)
      alert(`관리자 상태 변경에 실패했습니다: ${err.message}`)
    }
  }

  // 관리자 삭제
  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('정말로 이 관리자를 삭제하시겠습니까?')) {
      try {
        await apiService.deleteAdmin(adminId)
        loadAdmins()
      } catch (err) {
        console.error('Failed to delete admin:', err)
        alert(`관리자 삭제에 실패했습니다: ${err.message}`)
      }
    }
  }

  // 관리자 수정 다이얼로그 열기
  const openEditAdminDialog = (admin) => {
    setSelectedAdmin(admin)
    setAdminFormData({
      full_name: admin.full_name || '',
      email: admin.email || '',
      username: admin.username || '',
      password: '',
      is_active: admin.is_active,
    })
    setIsEditAdminDialogOpen(true)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active)

    return matchesSearch && matchesStatus
  })

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.username?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && admin.is_active) ||
      (statusFilter === 'inactive' && !admin.is_active)

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800'
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'moderator':
        return 'bg-blue-100 text-blue-800'
      case 'user':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            로그인이 필요합니다
          </h2>
          <p className="mb-4 text-gray-600">
            사용자 관리 페이지에 접근하려면 로그인해주세요.
          </p>
          <Button onClick={() => (window.location.href = '/login')}>
            로그인 페이지로 이동
          </Button>
        </div>
      </div>
    )
  }

  if (loading && adminsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>사용자 목록을 불러오는 중...</span>
        </div>
      </div>
    )
  }

  if (error && adminsError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="mb-4 text-red-600">{error}</p>
          <div className="space-x-2">
            <Button
              onClick={() => {
                setError(null)
                loadUsers()
                loadAdmins()
              }}
            >
              다시 시도
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/login')}
            >
              로그인 페이지로 이동
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  사용자 관리
                </h1>
                <p className="text-gray-600">
                  시스템의 모든 사용자와 관리자를 관리합니다.
                </p>
                {user && (
                  <p className="mt-1 text-sm text-gray-500">
                    현재 로그인: {user.email} (
                    {user.is_superuser ? '슈퍼유저' : '관리자'})
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">총 사용자</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">총 관리자</p>
                    <p className="text-2xl font-bold">{admins.length}</p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">활성 사용자</p>
                    <p className="text-2xl font-bold text-green-600">
                      {users.filter((u) => u.is_active).length}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">활성 관리자</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {admins.filter((a) => a.is_active).length}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="사용자 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                </SelectContent>
              </Select>

              <Button className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                필터 적용
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 탭 UI */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              일반 사용자 ({filteredUsers.length})
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              관리자 ({filteredAdmins.length})
            </TabsTrigger>
          </TabsList>

          {/* 일반 사용자 탭 */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">일반 사용자 목록</h2>
              <Dialog
                open={isCreateUserDialogOpen}
                onOpenChange={setIsCreateUserDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />새 사용자
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 사용자 생성</DialogTitle>
                    <DialogDescription>
                      새로운 일반 사용자를 생성합니다.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">이름</label>
                      <Input
                        value={userFormData.full_name}
                        onChange={(e) =>
                          setUserFormData({
                            ...userFormData,
                            full_name: e.target.value,
                          })
                        }
                        placeholder="전체 이름"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">이메일</label>
                      <Input
                        type="email"
                        value={userFormData.email}
                        onChange={(e) =>
                          setUserFormData({
                            ...userFormData,
                            email: e.target.value,
                          })
                        }
                        placeholder="이메일 주소"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">사용자명</label>
                      <Input
                        value={userFormData.username}
                        onChange={(e) =>
                          setUserFormData({
                            ...userFormData,
                            username: e.target.value,
                          })
                        }
                        placeholder="사용자명"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">비밀번호</label>
                      <Input
                        type="password"
                        value={userFormData.password}
                        onChange={(e) =>
                          setUserFormData({
                            ...userFormData,
                            password: e.target.value,
                          })
                        }
                        placeholder="비밀번호"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="user_is_active"
                        checked={userFormData.is_active}
                        onChange={(e) =>
                          setUserFormData({
                            ...userFormData,
                            is_active: e.target.checked,
                          })
                        }
                      />
                      <label
                        htmlFor="user_is_active"
                        className="text-sm font-medium"
                      >
                        활성 상태
                      </label>
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
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>사용자</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>사용자명</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                              <span className="text-sm font-semibold text-blue-600">
                                {user.full_name?.charAt(0) ||
                                  user.username?.charAt(0) ||
                                  'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">
                                {user.full_name || '이름 없음'}
                              </p>
                              <p className="text-sm text-gray-500">
                                ID: {user.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{user.username}</span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(user.is_active)}`}
                          >
                            {user.is_active ? '활성' : '비활성'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {user.created_at
                                ? new Date(user.created_at).toLocaleDateString()
                                : 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 관리자 탭 */}
          <TabsContent value="admins" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">관리자 목록</h2>
              <Dialog
                open={isCreateAdminDialogOpen}
                onOpenChange={setIsCreateAdminDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />새 관리자
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 관리자 생성</DialogTitle>
                    <DialogDescription>
                      새로운 관리자를 생성합니다.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">이름</label>
                      <Input
                        value={adminFormData.full_name}
                        onChange={(e) =>
                          setAdminFormData({
                            ...adminFormData,
                            full_name: e.target.value,
                          })
                        }
                        placeholder="전체 이름"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">이메일</label>
                      <Input
                        type="email"
                        value={adminFormData.email}
                        onChange={(e) =>
                          setAdminFormData({
                            ...adminFormData,
                            email: e.target.value,
                          })
                        }
                        placeholder="이메일 주소"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">사용자명</label>
                      <Input
                        value={adminFormData.username}
                        onChange={(e) =>
                          setAdminFormData({
                            ...adminFormData,
                            username: e.target.value,
                          })
                        }
                        placeholder="사용자명"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">비밀번호</label>
                      <Input
                        type="password"
                        value={adminFormData.password}
                        onChange={(e) =>
                          setAdminFormData({
                            ...adminFormData,
                            password: e.target.value,
                          })
                        }
                        placeholder="비밀번호"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="admin_is_active"
                        checked={adminFormData.is_active}
                        onChange={(e) =>
                          setAdminFormData({
                            ...adminFormData,
                            is_active: e.target.checked,
                          })
                        }
                      />
                      <label
                        htmlFor="admin_is_active"
                        className="text-sm font-medium"
                      >
                        활성 상태
                      </label>
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
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>관리자</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>사용자명</TableHead>
                      <TableHead>역할</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                              <span className="text-sm font-semibold text-purple-600">
                                {admin.full_name?.charAt(0) ||
                                  admin.username?.charAt(0) ||
                                  'A'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">
                                {admin.full_name || '이름 없음'}
                              </p>
                              <p className="text-sm text-gray-500">
                                ID: {admin.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{admin.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{admin.username}</span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getRoleColor('admin')}`}
                          >
                            관리자
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(admin.is_active)}`}
                          >
                            {admin.is_active ? '활성' : '비활성'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {admin.created_at
                                ? new Date(
                                    admin.created_at,
                                  ).toLocaleDateString()
                                : 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditAdminDialog(admin)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleToggleAdminStatus(
                                  admin.id,
                                  admin.is_active,
                                )
                              }
                            >
                              {admin.is_active ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAdmin(admin.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 관리자 수정 다이얼로그 */}
        <Dialog
          open={isEditAdminDialogOpen}
          onOpenChange={setIsEditAdminDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>관리자 수정</DialogTitle>
              <DialogDescription>관리자 정보를 수정합니다.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">이름</label>
                <Input
                  value={adminFormData.full_name}
                  onChange={(e) =>
                    setAdminFormData({
                      ...adminFormData,
                      full_name: e.target.value,
                    })
                  }
                  placeholder="전체 이름"
                />
              </div>
              <div>
                <label className="text-sm font-medium">이메일</label>
                <Input
                  type="email"
                  value={adminFormData.email}
                  onChange={(e) =>
                    setAdminFormData({
                      ...adminFormData,
                      email: e.target.value,
                    })
                  }
                  placeholder="이메일 주소"
                />
              </div>
              <div>
                <label className="text-sm font-medium">사용자명</label>
                <Input
                  value={adminFormData.username}
                  onChange={(e) =>
                    setAdminFormData({
                      ...adminFormData,
                      username: e.target.value,
                    })
                  }
                  placeholder="사용자명"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  새 비밀번호 (선택사항)
                </label>
                <Input
                  type="password"
                  value={adminFormData.password}
                  onChange={(e) =>
                    setAdminFormData({
                      ...adminFormData,
                      password: e.target.value,
                    })
                  }
                  placeholder="새 비밀번호 (변경하지 않으려면 비워두세요)"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_admin_is_active"
                  checked={adminFormData.is_active}
                  onChange={(e) =>
                    setAdminFormData({
                      ...adminFormData,
                      is_active: e.target.checked,
                    })
                  }
                />
                <label
                  htmlFor="edit_admin_is_active"
                  className="text-sm font-medium"
                >
                  활성 상태
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditAdminDialogOpen(false)}
              >
                취소
              </Button>
              <Button onClick={handleUpdateAdmin}>수정</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
