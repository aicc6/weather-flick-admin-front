import { Loader2 } from 'lucide-react'

export function LoadingState({ message = '데이터를 불러오는 중...' }) {
  return (
    <div className="flex-col-center animate-in fade-in py-8 duration-300">
      <Loader2 className="text-primary h-8 w-8 animate-spin" />
      <span className="text-muted-foreground mt-2 text-sm">{message}</span>
    </div>
  )
}

export function LoadingSpinner({ size = 'default', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <Loader2
      className={`text-primary animate-spin ${sizeClasses[size]} ${className}`}
    />
  )
}

export function LoadingOverlay({ message = '처리 중...' }) {
  return (
    <div className="flex-center bg-background/80 absolute inset-0 z-50 backdrop-blur-sm">
      <div className="flex-col-center gap-2">
        <LoadingSpinner size="lg" />
        <span className="text-muted-foreground text-sm">{message}</span>
      </div>
    </div>
  )
}
