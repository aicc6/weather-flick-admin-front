import { cn } from '../../lib/utils'

/**
 * 페이지 헤더 - 일관된 페이지 제목과 설명을 위한 컴포넌트
 */
export function PageHeader({
  title,
  description,
  children,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-foreground text-xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex flex-shrink-0 items-center gap-2">{action}</div>
      )}
      {children}
    </div>
  )
}
