import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useUpdateAdminStatusMutation,
} from '@/store/api/adminsApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// Card components are imported as Styled versions from common
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash2, Shield, User } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ContentSection, PageContainer, PageHeader } from '@/layouts'
import {
  LoadingState,
  EmptyState,
  ErrorState,
  StyledCard,
  StyledCardHeader,
  StyledCardContent,
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

  const [createAdminMutation] = useCreateAdminMutation()
  const [updateAdminMutation] = useUpdateAdminMutation()
  const [deleteAdminMutation] = useDeleteAdminMutation()
  const [updateAdminStatusMutation] = useUpdateAdminStatusMutation()

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

  const handleStatusChange = async (adminId, newStatus) => {
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
    (admin) =>
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase()),
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

      <div className="flex items-center justify-between">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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

      {/* 검색 영역 */}
      <ContentSection transparent>
        <div className="flex items-center space-x-2">
          <div className="relative max-w-sm flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="관리자 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </ContentSection>

      {/* 관리자 목록 */}
      <ContentSection transparent>
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
              searchTerm ? '검색 결과가 없습니다' : '등록된 관리자가 없습니다'
            }
            description={
              searchTerm
                ? '다른 검색어로 시도해보세요'
                : '새로운 관리자를 추가해주세요'
            }
            action={
              !searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />새 관리자 추가
                </Button>
              )
            }
          />
        ) : (
          <div className="grid gap-4">
            {filteredAdmins.map((admin) => (
              <StyledCard key={admin.admin_id}>
                <StyledCardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {admin.is_superuser ? (
                        <Shield className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <User className="h-5 w-5 text-gray-600" />
                      )}
                      <div>
                        <h3 className="text-lg leading-none font-semibold tracking-tight">
                          {admin.username}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {admin.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={admin.is_active ? 'default' : 'secondary'}
                      >
                        {admin.is_active ? '활성' : '비활성'}
                      </Badge>
                      {admin.is_superuser && (
                        <Badge variant="outline">슈퍼유저</Badge>
                      )}
                    </div>
                  </div>
                </StyledCardHeader>
                <StyledCardContent>
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

                      {!admin.is_superuser && (
                        <>
                          {admin.is_active ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusChange(admin.admin_id, 'INACTIVE')
                              }
                            >
                              비활성화
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusChange(admin.admin_id, 'ACTIVE')
                              }
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
                                  onClick={() =>
                                    handleDeleteAdmin(admin.admin_id)
                                  }
                                >
                                  삭제
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                </StyledCardContent>
              </StyledCard>
            ))}
          </div>
        )}
      </ContentSection>
    </PageContainer>
  )
}
