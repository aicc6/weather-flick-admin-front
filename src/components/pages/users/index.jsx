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
  Users,
  Search,
  Filter,
  UserCheck,
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

  // 사용자 목록 불러오기
  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getUsers()
      // 항상 배열로 세팅
      setUsers(Array.isArray(data) ? data : data.users || [])
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

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers()
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

  const getStatusColor = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800'
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>사용자 목록을 불러오는 중...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="mb-4 text-red-600">{error}</p>
          <div className="space-x-2">
            <Button
              onClick={() => {
                setError(null)
                loadUsers()
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
    <div className="min-h-screen">
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
          <div className="mx-auto mb-6 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
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
                    <p className="text-sm text-gray-600">활성 사용자</p>
                    <p className="text-2xl font-bold text-green-600">
                      {users.filter((u) => u.is_active).length}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
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

        {/* 사용자 목록 */}
        <div className="space-y-4">
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
        </div>
      </div>
    </div>
  )
}
