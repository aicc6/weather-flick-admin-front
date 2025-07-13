import { Loader2 } from 'lucide-react'

export function LoadingState({ message = '데이터를 불러오는 중...' }) {
  return (
    <div className="flex-col-center animate-in fade-in duration-300 py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="mt-2 text-sm text-muted-foreground">{message}</span>
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
      className={`animate-spin text-primary ${sizeClasses[size]} ${className}`} 
    />
  )
}

export function LoadingOverlay({ message = '처리 중...' }) {
  return (
    <div className="absolute inset-0 z-50 flex-center bg-background/80 backdrop-blur-sm">
      <div className="flex-col-center gap-2">
        <LoadingSpinner size="lg" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    </div>
  )
}