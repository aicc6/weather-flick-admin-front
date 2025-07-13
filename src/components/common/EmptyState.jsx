import { FileX, Search, Database, AlertCircle } from 'lucide-react'

export function EmptyState({ 
  type = 'default', 
  message = '데이터가 없습니다.',
  description = null,
  action = null 
}) {
  const icons = {
    default: FileX,
    search: Search,
    database: Database,
    error: AlertCircle,
  }

  const Icon = icons[type] || icons.default

  return (
    <div className="flex-col-center animate-in fade-in duration-300 py-16">
      <Icon className="h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-medium text-foreground">{message}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}

export function ErrorState({ 
  error, 
  onRetry = null,
  message = '오류가 발생했습니다.' 
}) {
  return (
    <div className="flex-col-center animate-in fade-in duration-300 py-16">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h3 className="mt-4 text-lg font-medium text-foreground">{message}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {error?.message || '일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  )
}