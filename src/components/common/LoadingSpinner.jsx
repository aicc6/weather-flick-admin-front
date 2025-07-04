import { Loader2 } from 'lucide-react'

export function LoadingSpinner({
  size = 'default',
  text = '로딩 중...',
  className = '',
  showText = true,
  minHeight = 'h-64',
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  return (
    <div
      className={`flex ${minHeight} items-center justify-center ${className}`}
    >
      <div className="flex items-center gap-3">
        <Loader2 className={`${sizeClasses[size]} animate-spin`} />
        {showText && <span className="text-muted-foreground">{text}</span>}
      </div>
    </div>
  )
}
