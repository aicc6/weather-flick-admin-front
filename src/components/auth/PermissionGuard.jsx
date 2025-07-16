import { usePermissions } from '@/hooks/usePermissions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, ShieldOff } from 'lucide-react'

export const PermissionGuard = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback,
  showError = true,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } =
    usePermissions()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  } else {
    // 권한이 지정되지 않은 경우 접근 허용
    hasAccess = true
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showError) {
      return (
        <Alert variant="destructive" className="m-4">
          <ShieldOff className="h-4 w-4" />
          <AlertTitle>접근 권한이 없습니다</AlertTitle>
          <AlertDescription>
            이 페이지를 보려면 추가 권한이 필요합니다. 관리자에게 문의하세요.
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  return <>{children}</>
}
