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
                <TableRow key={item.id} className="transition hover:bg-gray-50">
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
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setSelectedUser(item)}
                        title="상세보기"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteUser(item.id)}
                        title="삭제"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      {/* 기타 액션 버튼들 */}
                    </div>
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
    </div>
  )
}
