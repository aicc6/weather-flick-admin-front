import { PermissionGuard } from '@/components/auth/PermissionGuard'
import { CanAccess } from '@/components/auth/CanAccess'
import { USER_PERMISSIONS, ROLES } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

/**
 * 권한 시스템 사용 예시
 */
export const PermissionExample = () => {
  return (
    <div className="space-y-6">
      {/* 1. PermissionGuard 사용 예시 - 전체 섹션 보호 */}
      <PermissionGuard permission={USER_PERMISSIONS.READ}>
        <Card>
          <CardHeader>
            <CardTitle>사용자 관리</CardTitle>
            <CardDescription>
              사용자 읽기 권한이 있는 경우에만 이 섹션이 표시됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>사용자 목록이 여기에 표시됩니다.</p>
          </CardContent>
        </Card>
      </PermissionGuard>

      {/* 2. CanAccess 사용 예시 - 버튼 숨김/표시 */}
      <Card>
        <CardHeader>
          <CardTitle>조건부 UI 렌더링</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline">모두에게 표시</Button>

            <CanAccess permission={USER_PERMISSIONS.WRITE}>
              <Button variant="default">사용자 추가</Button>
            </CanAccess>

            <CanAccess permission={USER_PERMISSIONS.DELETE}>
              <Button variant="destructive">사용자 삭제</Button>
            </CanAccess>
          </div>

          {/* 3. 역할 기반 접근 제어 */}
          <CanAccess role={ROLES.SUPER_ADMIN}>
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-red-800">슈퍼 관리자 전용 기능</p>
            </div>
          </CanAccess>

          {/* 4. 리소스와 액션 기반 접근 제어 */}
          <CanAccess resource="users" action="export">
            <Button variant="secondary">사용자 데이터 내보내기</Button>
          </CanAccess>

          {/* 5. 다중 권한 체크 (OR 조건) */}
          <CanAccess
            permissions={[USER_PERMISSIONS.WRITE, USER_PERMISSIONS.DELETE]}
            requireAll={false}
          >
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-blue-800">
                사용자 쓰기 또는 삭제 권한이 있습니다.
              </p>
            </div>
          </CanAccess>

          {/* 6. 다중 권한 체크 (AND 조건) */}
          <CanAccess
            permissions={[USER_PERMISSIONS.READ, USER_PERMISSIONS.WRITE]}
            requireAll={true}
          >
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-green-800">
                사용자 읽기와 쓰기 권한을 모두 가지고 있습니다.
              </p>
            </div>
          </CanAccess>

          {/* 7. Fallback UI 제공 */}
          <CanAccess
            permission={USER_PERMISSIONS.DELETE}
            fallback={
              <Button variant="ghost" disabled>
                삭제 권한 없음
              </Button>
            }
          >
            <Button variant="destructive">삭제하기</Button>
          </CanAccess>
        </CardContent>
      </Card>

      {/* 8. 중첩된 권한 체크 */}
      <PermissionGuard permissions={[USER_PERMISSIONS.READ]} showError={false}>
        <Card>
          <CardHeader>
            <CardTitle>중첩된 권한 체크</CardTitle>
          </CardHeader>
          <CardContent>
            <p>기본 콘텐츠 (읽기 권한)</p>

            <CanAccess permission={USER_PERMISSIONS.WRITE}>
              <div className="mt-4 rounded bg-yellow-50 p-4">
                <p>추가 콘텐츠 (쓰기 권한)</p>
              </div>
            </CanAccess>
          </CardContent>
        </Card>
      </PermissionGuard>
    </div>
  )
}
