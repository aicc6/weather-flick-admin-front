import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useDeleteAdminPermanentlyMutation,
  useUpdateAdminStatusMutation,
  useGetRolesQuery,
} from '@/store/api/adminsApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Shield, User } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { ContentSection, PageContainer, PageHeader } from '@/layouts'
import {
  LoadingState,
  EmptyState,
  ErrorState,
  StandardInput,
} from '@/components/common'

export const AdminsPage = () => {
  const { user } = useAuth()

  // RTK Query 훅들
  const {
    data: adminsData,
    isLoading: loading,
    error,
    refetch: _refetchAdmins,
  } = useGetAdminsQuery({ page: 1, size: 50 })

  const { data: rolesData } = useGetRolesQuery()

  const [createAdminMutation] = useCreateAdminMutation()
  const [updateAdminMutation] = useUpdateAdminMutation()
  const [deleteAdminMutation] = useDeleteAdminMutation()
  const [deleteAdminPermanentlyMutation] = useDeleteAdminPermanentlyMutation()
  const [updateAdminStatusMutation] = useUpdateAdminStatusMutation()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    is_superuser: false,
    role_ids: [],
  })

  // 관리자 목록 (RTK Query 데이터에서 가져오기)
  const admins = adminsData?.admins || []
  const roles = rolesData?.roles || []

  const handleCreateAdmin = async () => {
    try {
      await createAdminMutation(formData).unwrap()
      setIsCreateDialogOpen(false)
      setFormData({
        email: '',
        name: '',
        password: '',
        is_superuser: false,
        role_ids: [],
      })
    } catch (error) {
      console.error('관리자 생성에 실패했습니다:', error)
    }
  }

  const handleUpdateAdmin = async () => {
    try {
      await updateAdminMutation({
        adminId: selectedAdmin.admin_id,
        data: formData,
      }).unwrap()
      setIsEditDialogOpen(false)
      setSelectedAdmin(null)
      setFormData({
        email: '',
        name: '',
        password: '',
        is_superuser: false,
        role_ids: [],
      })
    } catch (error) {
      console.error('관리자 수정에 실패했습니다:', error)
    }
  }

  const handleDeleteAdmin = async () => {
    try {
      // 슈퍼관리자는 영구 삭제, 일반 관리자는 비활성화
      if (user?.is_superuser) {
        await deleteAdminPermanentlyMutation(selectedAdmin.admin_id).unwrap()
      } else {
        await deleteAdminMutation(selectedAdmin.admin_id).unwrap()
      }
      setIsDeleteDialogOpen(false)
      setSelectedAdmin(null)
    } catch (error) {
      console.error('관리자 삭제에 실패했습니다:', error)
      // 에러 메시지가 있으면 표시
      if (error?.data?.detail) {
        alert(error.data.detail)
      }
    }
  }

  const _handleStatusChange = async (adminId, newStatus) => {
    try {
      await updateAdminStatusMutation({
        adminId,
        status: newStatus,
      }).unwrap()
    } catch (error) {
      console.error('관리자 상태 변경에 실패했습니다:', error)
      // 에러 메시지가 있으면 표시
      if (error?.data?.detail) {
        alert(error.data.detail)
      }
    }
  }

  const filteredAdmins = (Array.isArray(admins) ? admins : []).filter(
    (admin) => {
      const matchesSearch =
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.username?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && admin.is_active) ||
        (statusFilter === 'inactive' && !admin.is_active) ||
        (statusFilter === 'superuser' && admin.is_superuser)

      return matchesSearch && matchesStatus
    },
  )

  // 슈퍼유저가 아닌 경우 접근 거부
  if (!user?.is_superuser) {
    return (
      <PageContainer>
        <ErrorState
          message="접근 권한이 없습니다"
          error={{ message: '이 페이지는 슈퍼유저만 접근할 수 있습니다.' }}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="관리자 관리"
        description="시스템의 모든 관리자를 확인하고 관리할 수 있습니다."
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 관리자 목록 */}
      <ContentSection title="관리자 목록">
        {/* 검색 및 필터 영역 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              placeholder="이메일, 사용자명 검색..."
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
                <SelectItem value="superuser">슈퍼유저</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />새 관리자 추가
          </Button>
        </div>

        {loading ? (
          <LoadingState message="관리자 목록을 불러오는 중..." />
        ) : error ? (
          <ErrorState
            error={error}
            onRetry={() => _refetchAdmins()}
            message="관리자 목록을 불러올 수 없습니다"
          />
        ) : filteredAdmins.length === 0 ? (
          <EmptyState
            type="search"
            message={
              searchTerm || statusFilter !== 'all'
                ? '검색 결과가 없습니다'
                : '등록된 관리자가 없습니다'
            }
            description={
              searchTerm || statusFilter !== 'all'
                ? '다른 검색 조건으로 시도해보세요'
                : '새로운 관리자를 추가해주세요'
            }
            action={
              !(searchTerm || statusFilter !== 'all') && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />새 관리자 추가
                </Button>
              )
            }
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이메일</TableHead>
                  <TableHead>사용자명</TableHead>
                  <TableHead>권한</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <TableRow key={admin.admin_id}>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {admin.is_superuser ? (
                          <Shield className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <User className="h-4 w-4 text-gray-600" />
                        )}
                        <span>{admin.name || admin.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {admin.is_superuser ? (
                        <Badge variant="destructive">슈퍼유저</Badge>
                      ) : (
                        <Badge variant="secondary">일반 관리자</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.is_active ? 'default' : 'outline'}>
                        {admin.is_active ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAdmin(admin)
                          setFormData({
                            email: admin.email,
                            name: admin.name || admin.username,
                            password: '',
                            is_superuser: admin.is_superuser,
                            role_ids: [],
                          })
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAdmin(admin)
                          setIsDeleteDialogOpen(true)
                        }}
                        disabled={
                          admin.is_superuser &&
                          admin.admin_id === user?.admin_id
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </ContentSection>

      {/* 관리자 생성 다이얼로그 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 관리자 추가</DialogTitle>
            <DialogDescription>
              새로운 관리자 계정을 생성합니다.
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
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                사용자명
              </Label>
              <StandardInput
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                비밀번호
              </Label>
              <StandardInput
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>

            {/* 권한 선택 */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="pt-2 text-right">권한</Label>
              <div className="col-span-3 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_superuser"
                    checked={formData.is_superuser}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        is_superuser: checked,
                        role_ids: checked ? [] : formData.role_ids,
                      })
                    }
                  />
                  <Label
                    htmlFor="is_superuser"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    슈퍼관리자 권한
                  </Label>
                </div>

                {!formData.is_superuser && (
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">
                      일반 관리자 역할 선택:
                    </Label>
                    <div className="max-h-32 space-y-2 overflow-y-auto rounded border p-2">
                      {roles.map((role) => (
                        <div
                          key={role.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`role_${role.id}`}
                            checked={formData.role_ids.includes(role.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  role_ids: [...formData.role_ids, role.id],
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  role_ids: formData.role_ids.filter(
                                    (id) => id !== role.id,
                                  ),
                                })
                              }
                            }}
                          />
                          <Label
                            htmlFor={`role_${role.id}`}
                            className="text-sm"
                          >
                            {role.display_name}
                            {role.description && (
                              <span className="block text-xs text-gray-500">
                                {role.description}
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                      {roles.length === 0 && (
                        <p className="text-sm text-gray-500">
                          사용 가능한 역할이 없습니다.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleCreateAdmin}>생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 관리자 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>관리자 정보 수정</DialogTitle>
            <DialogDescription>
              관리자 계정 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                이메일
              </Label>
              <StandardInput
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                사용자명
              </Label>
              <StandardInput
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">
                새 비밀번호
              </Label>
              <StandardInput
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="col-span-3"
                placeholder="변경하지 않으려면 비워두세요"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleUpdateAdmin}>수정</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              관리자 {user?.is_superuser ? '영구 삭제' : '비활성화'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAdmin?.name ||
                selectedAdmin?.username ||
                selectedAdmin?.email}{' '}
              관리자를{' '}
              {user?.is_superuser
                ? '영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 관련 데이터가 삭제됩니다.'
                : '비활성화하시겠습니까? 비활성화된 관리자는 로그인할 수 없습니다.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdmin}
              className={
                user?.is_superuser ? 'bg-red-600 hover:bg-red-700' : ''
              }
            >
              {user?.is_superuser ? '영구 삭제' : '비활성화'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}

export default AdminsPage
