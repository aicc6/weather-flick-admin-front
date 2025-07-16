import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  useGetPermissionsMatrixQuery,
  useGetPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useUpdateAdminRolesMutation,
  useGetAdminsQuery,
} from '@/store/api/adminsApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Edit, Trash2, Users, Shield } from 'lucide-react'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

export const PermissionsPage = () => {
  const { user } = useAuth()

  // RTK Query 훅들
  const {
    data: matrixData,
    isLoading: matrixLoading,
    error: matrixError,
  } = useGetPermissionsMatrixQuery()

  const {
    data: permissionsData,
    isLoading: permissionsLoading,
  } = useGetPermissionsQuery()

  const {
    data: adminsData,
    isLoading: adminsLoading,
  } = useGetAdminsQuery({ page: 1, size: 100 })

  const [createRoleMutation] = useCreateRoleMutation()
  const [updateRoleMutation] = useUpdateRoleMutation()
  const [deleteRoleMutation] = useDeleteRoleMutation()
  const [updateAdminRolesMutation] = useUpdateAdminRolesMutation()

  // 상태 관리
  const [activeTab, setActiveTab] = useState('roles')
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isDeleteRoleDialogOpen, setIsDeleteRoleDialogOpen] = useState(false)
  const [isAdminRoleDialogOpen, setIsAdminRoleDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [editMode, setEditMode] = useState(false)

  const [roleFormData, setRoleFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    permission_ids: [],
  })

  const [adminRoleFormData, setAdminRoleFormData] = useState({
    is_superuser: false,
    role_ids: [],
  })

  // 데이터 가져오기
  const roles = matrixData?.roles || []
  const allPermissions = matrixData?.all_permissions || []
  const permissions = permissionsData?.permissions || []
  const admins = adminsData?.admins || []

  const handleCreateRole = async () => {
    try {
      await createRoleMutation(roleFormData).unwrap()
      setIsRoleDialogOpen(false)
      setRoleFormData({ name: '', display_name: '', description: '', permission_ids: [] })
    } catch (error) {
      console.error('역할 생성 실패:', error)
    }
  }

  const handleUpdateRole = async () => {
    try {
      await updateRoleMutation({
        roleId: selectedRole.role_id,
        data: roleFormData,
      }).unwrap()
      setIsRoleDialogOpen(false)
      setSelectedRole(null)
      setEditMode(false)
      setRoleFormData({ name: '', display_name: '', description: '', permission_ids: [] })
    } catch (error) {
      console.error('역할 수정 실패:', error)
    }
  }

  const handleDeleteRole = async () => {
    try {
      await deleteRoleMutation(selectedRole.role_id).unwrap()
      setIsDeleteRoleDialogOpen(false)
      setSelectedRole(null)
    } catch (error) {
      console.error('역할 삭제 실패:', error)
    }
  }

  const handleUpdateAdminRoles = async () => {
    try {
      await updateAdminRolesMutation({
        adminId: selectedAdmin.admin_id,
        roleData: adminRoleFormData,
      }).unwrap()
      setIsAdminRoleDialogOpen(false)
      setSelectedAdmin(null)
      setAdminRoleFormData({ is_superuser: false, role_ids: [] })
    } catch (error) {
      console.error('관리자 권한 수정 실패:', error)
    }
  }

  const openRoleDialog = (role = null, isEdit = false) => {
    if (role && isEdit) {
      setSelectedRole(role)
      setEditMode(true)
      setRoleFormData({
        name: role.role_name,
        display_name: role.display_name,
        description: role.description,
        permission_ids: permissions
          .filter((p) => role.permissions.includes(p.name))
          .map((p) => p.id),
      })
    } else {
      setSelectedRole(null)
      setEditMode(false)
      setRoleFormData({ name: '', display_name: '', description: '', permission_ids: [] })
    }
    setIsRoleDialogOpen(true)
  }

  const openAdminRoleDialog = (admin) => {
    setSelectedAdmin(admin)
    setAdminRoleFormData({
      is_superuser: admin.is_superuser,
      role_ids: [], // 현재 역할 정보를 가져올 수 있으면 여기에 설정
    })
    setIsAdminRoleDialogOpen(true)
  }

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
        title="권한 관리"
        description="시스템의 역할과 권한을 관리하고 관리자에게 할당할 수 있습니다."
      />

      {(matrixError) && (
        <Alert variant="destructive">
          <AlertDescription>{matrixError?.message || '데이터를 불러오는 중 오류가 발생했습니다'}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles">역할 관리</TabsTrigger>
          <TabsTrigger value="admin-roles">관리자 권한</TabsTrigger>
        </TabsList>

        {/* 역할 관리 탭 */}
        <TabsContent value="roles">
          <ContentSection title="역할 관리">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                시스템의 역할을 생성, 수정, 삭제할 수 있습니다.
              </p>
              <Button onClick={() => openRoleDialog()}>
                <Plus className="mr-2 h-4 w-4" />새 역할 추가
              </Button>
            </div>

            {matrixLoading ? (
              <LoadingState message="역할 목록을 불러오는 중..." />
            ) : roles.length === 0 ? (
              <EmptyState
                type="data"
                message="등록된 역할이 없습니다"
                description="새로운 역할을 추가해주세요"
                action={
                  <Button onClick={() => openRoleDialog()}>
                    <Plus className="mr-2 h-4 w-4" />새 역할 추가
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.role_id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {role.is_system && <Shield className="h-4 w-4 text-blue-600" />}
                        <h3 className="font-medium">{role.display_name}</h3>
                        {role.is_system && (
                          <Badge variant="outline" className="text-xs">시스템</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRoleDialog(role, true)}
                          disabled={role.is_system}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRole(role)
                            setIsDeleteRoleDialogOpen(true)
                          }}
                          disabled={role.is_system}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {role.description && (
                      <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ContentSection>
        </TabsContent>

        {/* 관리자 권한 탭 */}
        <TabsContent value="admin-roles">
          <ContentSection title="관리자 권한 설정">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                각 관리자의 권한을 개별적으로 관리할 수 있습니다.
              </p>
            </div>

            {adminsLoading ? (
              <LoadingState message="관리자 목록을 불러오는 중..." />
            ) : admins.length === 0 ? (
              <EmptyState
                type="data"
                message="등록된 관리자가 없습니다"
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>관리자</TableHead>
                      <TableHead>현재 권한</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.admin_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{admin.name || admin.email}</div>
                            <div className="text-sm text-gray-500">{admin.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {admin.is_superuser ? (
                            <Badge variant="destructive">슈퍼관리자</Badge>
                          ) : (
                            <Badge variant="secondary">일반 관리자</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={admin.is_active ? 'default' : 'outline'}>
                            {admin.is_active ? '활성' : '비활성'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAdminRoleDialog(admin)}
                            disabled={admin.admin_id === user?.admin_id}
                          >
                            <Users className="h-4 w-4 mr-1" />
                            권한 수정
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </ContentSection>
        </TabsContent>
      </Tabs>

      {/* 역할 생성/수정 다이얼로그 */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editMode ? '역할 수정' : '새 역할 추가'}</DialogTitle>
            <DialogDescription>
              {editMode ? '역할 정보와 권한을 수정합니다.' : '새로운 역할을 생성하고 권한을 설정합니다.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role-name" className="text-right">
                역할 코드
              </Label>
              <StandardInput
                id="role-name"
                value={roleFormData.name}
                onChange={(e) =>
                  setRoleFormData({ ...roleFormData, name: e.target.value })
                }
                className="col-span-3"
                placeholder="예: content_manager"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role-display-name" className="text-right">
                표시 이름
              </Label>
              <StandardInput
                id="role-display-name"
                value={roleFormData.display_name}
                onChange={(e) =>
                  setRoleFormData({ ...roleFormData, display_name: e.target.value })
                }
                className="col-span-3"
                placeholder="예: 콘텐츠 관리자"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="role-description" className="text-right pt-2">
                설명
              </Label>
              <Textarea
                id="role-description"
                value={roleFormData.description}
                onChange={(e) =>
                  setRoleFormData({ ...roleFormData, description: e.target.value })
                }
                className="col-span-3"
                placeholder="역할에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">권한</Label>
              <div className="col-span-3 space-y-2 max-h-48 overflow-y-auto border rounded p-3">
                {permissionsLoading ? (
                  <p className="text-sm text-gray-500">권한 목록을 불러오는 중...</p>
                ) : permissions.length === 0 ? (
                  <p className="text-sm text-gray-500">사용 가능한 권한이 없습니다.</p>
                ) : (
                  permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`permission_${permission.id}`}
                        checked={roleFormData.permission_ids.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setRoleFormData({
                              ...roleFormData,
                              permission_ids: [...roleFormData.permission_ids, permission.id]
                            })
                          } else {
                            setRoleFormData({
                              ...roleFormData,
                              permission_ids: roleFormData.permission_ids.filter(id => id !== permission.id)
                            })
                          }
                        }}
                      />
                      <Label htmlFor={`permission_${permission.id}`} className="text-sm">
                        <span className="font-medium">{permission.name}</span>
                        {permission.description && (
                          <span className="text-gray-500 text-xs block">
                            {permission.description}
                          </span>
                        )}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={editMode ? handleUpdateRole : handleCreateRole}>
              {editMode ? '수정' : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 역할 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={isDeleteRoleDialogOpen}
        onOpenChange={setIsDeleteRoleDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>역할 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              '{selectedRole?.display_name}' 역할을 삭제하시겠습니까? 
              이 작업은 되돌릴 수 없으며, 해당 역할을 가진 관리자가 있으면 삭제할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 관리자 권한 수정 다이얼로그 */}
      <Dialog open={isAdminRoleDialogOpen} onOpenChange={setIsAdminRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>관리자 권한 수정</DialogTitle>
            <DialogDescription>
              {selectedAdmin?.name || selectedAdmin?.email} 관리자의 권한을 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin-is-superuser"
                  checked={adminRoleFormData.is_superuser}
                  onCheckedChange={(checked) =>
                    setAdminRoleFormData({ 
                      ...adminRoleFormData, 
                      is_superuser: checked,
                      role_ids: checked ? [] : adminRoleFormData.role_ids
                    })
                  }
                />
                <Label htmlFor="admin-is-superuser">슈퍼관리자 권한</Label>
              </div>
              
              {!adminRoleFormData.is_superuser && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">일반 관리자 역할 선택:</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                    {roles.filter(role => !role.is_system).map((role) => (
                      <div key={role.role_id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`admin_role_${role.role_id}`}
                          checked={adminRoleFormData.role_ids.includes(role.role_id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAdminRoleFormData({
                                ...adminRoleFormData,
                                role_ids: [...adminRoleFormData.role_ids, role.role_id]
                              })
                            } else {
                              setAdminRoleFormData({
                                ...adminRoleFormData,
                                role_ids: adminRoleFormData.role_ids.filter(id => id !== role.role_id)
                              })
                            }
                          }}
                        />
                        <Label htmlFor={`admin_role_${role.role_id}`} className="text-sm">
                          {role.display_name}
                          {role.description && (
                            <span className="text-gray-500 text-xs block">
                              {role.description}
                            </span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAdminRoleDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleUpdateAdminRoles}>수정</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

export default PermissionsPage