import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

/**
 * 컨텐츠 섹션 - 일관된 컨텐츠 영역을 위한 컴포넌트
 */
export function ContentSection({
  children,
  className,
  noPadding = false,
  transparent = false,
}) {
  if (transparent) {
    return <div className={cn('space-y-4', className)}>{children}</div>
  }

  return (
    <Card className={cn('shadow-sm', !noPadding && 'p-4', className)}>
      {children}
    </Card>
  )
}
