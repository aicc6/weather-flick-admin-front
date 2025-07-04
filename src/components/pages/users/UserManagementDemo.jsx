import { useState } from 'react'
import { Users, Plus } from 'lucide-react'
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from '../../../store/api/usersApi'
import { useAuth } from '../../../contexts/AuthContext'

// 새로운 공통 컴포넌트들 사용
import { LoadingSpinner } from '../../common/LoadingSpinner'
import { ErrorDisplay } from '../../common/ErrorDisplay'
import { PageHeader } from '../../common/PageHeader'
import { StatusBadge } from '../../common/StatusBadge'
import { SearchInput } from '../../common/SearchInput'
import { ConfirmDialog } from '../../common/ConfirmDialog'

import { Button } from '../../ui/button'
import { Card, CardContent } from '../../ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table'

export function UserManagementDemo() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteUserId, setDeleteUserId] = useState(null)

  const { data: usersData, isLoading, error, refetch } = useGetUsersQuery()
  const [deleteUserMutation] = useDeleteUserMutation()

  const users = usersData?.users || []

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteUser = async () => {
    try {
      await deleteUserMutation(deleteUserId).unwrap()
    } catch (error) {
      console.error('삭제 실패:', error)
    }
  }

  // 로딩 상태 - 새로운 LoadingSpinner 사용
  if (isLoading) {
    return <LoadingSpinner text="사용자 목록을 불러오는 중..." />
  }

  // 에러 상태 - 새로운 ErrorDisplay 사용
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={refetch}
        variant="center"
        retryText="다시 불러오기"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* 새로운 PageHeader 사용 */}
      <PageHeader
        title="사용자 관리"
        description="시스템의 모든 사용자를 관리합니다."
        icon={Users}
        action={
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />새 사용자
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          {/* 새로운 SearchInput 사용 */}
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="사용자 검색..."
            className="mb-4"
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사용자</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>권한</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {user.full_name || '이름 없음'}
                      </p>
                      <p className="text-sm text-gray-500">ID: {user.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {/* 새로운 StatusBadge 사용 */}
                    <StatusBadge status={user.is_active} type="active" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.is_superuser} type="role" />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteUserId(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? '검색 결과가 없습니다.' : '사용자가 없습니다.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 새로운 ConfirmDialog 사용 */}
      <ConfirmDialog
        open={!!deleteUserId}
        onOpenChange={(open) => !open && setDeleteUserId(null)}
        title="사용자 삭제"
        description="정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        variant="destructive"
        onConfirm={handleDeleteUser}
      />
    </div>
  )
}
