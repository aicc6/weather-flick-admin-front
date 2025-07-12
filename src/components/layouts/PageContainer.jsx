import { cn } from '../../lib/utils'

/**
 * 페이지 컨테이너 - 일관된 페이지 레이아웃을 위한 래퍼 컴포넌트
 */
export function PageContainer({ children, className }) {
  return (
    <div className={cn('mx-auto max-w-7xl space-y-4 px-4 py-6', className)}>
      {children}
    </div>
  )
}
