import { useState } from 'react'
import { PermissionGuard } from '../common/PermissionGuard'
import { PERMISSIONS } from '../../constants/permissions'
import {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
} from '../../store/api/adminsApi'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Plus, Search, Edit, Trash2, Shield, User } from 'lucide-react'
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

export const AdminsPage = () => {
  // RTK Query 훅들
  const {
    data: adminsData,
    isLoading: loading,
    error,
    refetch: _refetchAdmins,
  } = useGetAdminsQuery({ page: 1, size: 50 })

  const [createAdminMutation] = useCreateAdminMutation()
  const [updateAdminMutation] = useUpdateAdminMutation()
  const [deleteAdminMutation] = useDeleteAdminMutation()

  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  })

  // 관리자 목록 (RTK Query 데이터에서 가져오기)
  const admins = adminsData?.admins || []

  const handleCreateAdmin = async () => {
    try {
      await createAdminMutation(formData).unwrap()
      setIsCreateDialogOpen(false)
      setFormData({ email: '', username: '', password: '' })
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
      setFormData({ email: '', username: '', password: '' })
    } catch (error) {
      console.error('관리자 수정에 실패했습니다:', error)
    }
  }

  const handleDeleteAdmin = async (adminId) => {
    try {
      await deleteAdminMutation(adminId).unwrap()
    } catch (error) {
      console.error('관리자 삭제에 실패했습니다:', error)
    }
  }

  const filteredAdmins = (Array.isArray(admins) ? admins : []).filter(
    (admin) =>
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <PermissionGuard
      permission={PERMISSIONS.ADMIN_READ}
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-2 text-lg text-red-600">
              접근 권한이 없습니다
            </div>
            <p className="text-muted-foreground">
              이 페이지는 관리자 권한이 필요합니다.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">관리자 관리</h2>
            <p className="text-muted-foreground">
              시스템의 모든 관리자를 확인하고 관리할 수 있습니다.
            </p>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />새 관리자 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 관리자 추가</DialogTitle>
                <DialogDescription>
                  새로운 관리자 계정을 생성합니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="username">사용자명</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateAdmin}>생성</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder={t('admins.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredAdmins.map((admin) => (
            <Card key={admin.admin_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {admin.is_superuser ? (
                      <Shield className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <User className="h-5 w-5 text-gray-600" />
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {admin.username}
                      </CardTitle>
                      <CardDescription>{admin.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={admin.is_active ? 'default' : 'secondary'}>
                      {admin.is_active ? '활성' : '비활성'}
                    </Badge>
                    {admin.is_superuser && (
                      <Badge variant="outline">슈퍼유저</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">
                    생성일: {new Date(admin.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Dialog
                      open={isEditDialogOpen}
                      onOpenChange={setIsEditDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAdmin(admin)
                            setFormData({
                              email: admin.email,
                              username: admin.username,
                              password: '',
                            })
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>관리자 수정</DialogTitle>
                          <DialogDescription>
                            관리자 정보를 수정합니다.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-email">이메일</Label>
                            <Input
                              id="edit-email"
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  email: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-username">사용자명</Label>
                            <Input
                              id="edit-username"
                              value={formData.username}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  username: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-password">
                              새 비밀번호 (선택사항)
                            </Label>
                            <Input
                              id="edit-password"
                              type="password"
                              value={formData.password}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  password: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleUpdateAdmin}>수정</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {admin.is_active ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.log('비활성화:', admin.admin_id)}
                      >
                        비활성화
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.log('활성화:', admin.admin_id)}
                      >
                        활성화
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>관리자 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            정말로 이 관리자를 삭제하시겠습니까? 이 작업은
                            되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAdmin(admin.admin_id)}
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAdmins.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">관리자가 없습니다.</p>
          </div>
        )}
      </div>
    </PermissionGuard>
  )
}
