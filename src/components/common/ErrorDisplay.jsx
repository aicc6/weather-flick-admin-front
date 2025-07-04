import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'

export function ErrorDisplay({ 
  error, 
  onRetry, 
  retryText = '다시 시도',
  variant = 'alert',
  className = ''
}) {
  const errorMessage = error?.message || error || '알 수 없는 오류가 발생했습니다.'

  if (variant === 'alert') {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{errorMessage}</span>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="ml-4"
            >
              {retryText}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  if (variant === 'center') {
    return (
      <div className={`flex min-h-[400px] items-center justify-center ${className}`}>
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="mb-4 text-red-600">{errorMessage}</p>
          {onRetry && (
            <Button onClick={onRetry}>{retryText}</Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`text-center p-4 ${className}`}>
      <div className="text-red-600 mb-2">{errorMessage}</div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryText}
        </Button>
      )}
    </div>
  )
}