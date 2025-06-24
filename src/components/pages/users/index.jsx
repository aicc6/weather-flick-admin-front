import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
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
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  MapPin,
} from 'lucide-react'

/**
 * URL: '/users'
 */
export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')

  // 임시 사용자 데이터
  const users = [
    {
      id: 1,
      name: '장한결',
      email: 'hangeol1829@gmail.com',
      role: '관리자',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-03-20 14:30',
      location: '서울',
      avatar: 'KC',
    },
    {
      id: 2,
      name: '이영희',
      email: 'lee@example.com',
      role: 'admin',
      status: 'active',
      joinDate: '2024-02-01',
      lastLogin: '2024-03-20 16:45',
      location: '부산',
      avatar: 'LY',
    },
    {
      id: 3,
      name: '박민수',
      email: 'park@example.com',
      role: 'user',
      status: 'inactive',
      joinDate: '2024-01-20',
      lastLogin: '2024-03-15 09:20',
      location: '대구',
      avatar: 'PM',
    },
    {
      id: 4,
      name: '정수진',
      email: 'jung@example.com',
      role: 'moderator',
      status: 'active',
      joinDate: '2024-02-10',
      lastLogin: '2024-03-20 12:15',
      location: '인천',
      avatar: 'JS',
    },
    {
      id: 5,
      name: '최동현',
      email: 'choi@example.com',
      role: 'user',
      status: 'suspended',
      joinDate: '2024-01-25',
      lastLogin: '2024-03-10 11:30',
      location: '광주',
      avatar: 'CD',
    },
  ]

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
              <p className="text-gray-600">
                시스템의 모든 사용자를 관리합니다.
              </p>
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
                    <p className="text-sm text-gray-600">활성 사용자</p>
                    <p className="text-2xl font-bold text-green-600">
                      {users.filter((u) => u.status === 'active').length}
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
                    <p className="text-sm text-gray-600">관리자</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {users.filter((u) => u.role === 'admin').length}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">정지된 사용자</p>
                    <p className="text-2xl font-bold text-red-600">
                      {users.filter((u) => u.status === 'suspended').length}
                    </p>
                  </div>
                  <UserX className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                  <SelectItem value="suspended">정지</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="역할 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 역할</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                  <SelectItem value="moderator">모더레이터</SelectItem>
                  <SelectItem value="user">일반 사용자</SelectItem>
                </SelectContent>
              </Select>

              <Button className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                필터 적용
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 사용자 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle>사용자 목록</CardTitle>
            <CardDescription>
              총 {filteredUsers.length}명의 사용자가 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사용자</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead>마지막 로그인</TableHead>
                  <TableHead>위치</TableHead>
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
                            {user.avatar}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">ID: {user.id}</p>
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
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getRoleColor(user.role)}`}
                      >
                        {user.role === 'admin'
                          ? '관리자'
                          : user.role === 'moderator'
                            ? '모더레이터'
                            : '일반 사용자'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(user.status)}`}
                      >
                        {user.status === 'active'
                          ? '활성'
                          : user.status === 'inactive'
                            ? '비활성'
                            : '정지'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{user.joinDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {user.lastLogin}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{user.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 최근 활동 섹션 */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                최근 활동
              </CardTitle>
              <CardDescription>
                시스템에서 발생한 최근 사용자 관련 활동입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">새 사용자 등록</p>
                    <p className="text-sm text-gray-600">
                      user@example.com이 가입했습니다.
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">2분 전</span>
                </div>

                <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">권한 변경 요청</p>
                    <p className="text-sm text-gray-600">
                      사용자 권한이 관리자로 승격되었습니다.
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">15분 전</span>
                </div>

                <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                  <div className="rounded-full bg-red-100 p-2">
                    <UserX className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">계정 정지</p>
                    <p className="text-sm text-gray-600">
                      위반 사항으로 인해 계정이 정지되었습니다.
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">1시간 전</span>
                </div>

                <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                  <div className="rounded-full bg-yellow-100 p-2">
                    <Edit className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">프로필 업데이트</p>
                    <p className="text-sm text-gray-600">
                      사용자가 프로필 정보를 수정했습니다.
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">2시간 전</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
