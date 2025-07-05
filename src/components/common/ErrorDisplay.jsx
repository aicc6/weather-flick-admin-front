import { memo, useMemo, useCallback } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

/**
 * 에러 표시 컴포넌트
 *
 * @param {Object} props - 컴포넌트 props
 * @param {string|Error} props.error - 에러 메시지 또는 에러 객체
 * @param {Function} props.onRetry - 재시도 핸들러
 * @param {string} props.retryText - 재시도 버튼 텍스트
 * @param {'alert'|'center'|'simple'} props.variant - 표시 형태
 * @param {string} props.className - 추가 CSS 클래스
 * @returns {JSX.Element} 에러 표시 컴포넌트
 */
export const ErrorDisplay = memo(
  ({
    error,
    onRetry,
    retryText = '다시 시도',
    variant = 'alert',
    className = '',
    ...props
  }) => {
    // 에러 메시지 추출 (메모이제이션)
    const errorMessage = useMemo(() => {
      if (!error) return '알 수 없는 오류가 발생했습니다.'

      if (typeof error === 'string') return error
      if (error?.message) return error.message

      return '알 수 없는 오류가 발생했습니다.'
    }, [error])

    // 재시도 핸들러 (메모이제이션)
    const handleRetry = useCallback(() => {
      onRetry?.()
    }, [onRetry])

    // Alert 형태
    if (variant === 'alert') {
      return (
        <Alert
          variant="destructive"
          className={cn(className)}
          role="alert"
          {...props}
        >
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription className="flex items-center justify-between">
            <span>{errorMessage}</span>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="ml-4 flex-shrink-0"
                aria-label={`${retryText} - ${errorMessage}`}
              >
                {retryText}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )
    }

    // 중앙 정렬 형태
    if (variant === 'center') {
      return (
        <div
          className={cn(
            'flex min-h-[400px] items-center justify-center',
            className,
          )}
          role="alert"
          {...props}
        >
          <div className="text-center">
            <AlertCircle
              className="mx-auto mb-4 h-12 w-12 text-red-500"
              aria-hidden="true"
            />
            <p className="mb-4 text-red-600">{errorMessage}</p>
            {onRetry && (
              <Button
                onClick={handleRetry}
                aria-label={`${retryText} - ${errorMessage}`}
              >
                {retryText}
              </Button>
            )}
          </div>
        </div>
      )
    }

    // 간단한 형태
    return (
      <div className={cn('p-4 text-center', className)} role="alert" {...props}>
        <div className="mb-2 text-red-600">{errorMessage}</div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            aria-label={`${retryText} - ${errorMessage}`}
          >
            {retryText}
          </Button>
        )}
      </div>
    )
  },
)

// 컴포넌트 displayName 설정 (필수)
ErrorDisplay.displayName = 'ErrorDisplay'
