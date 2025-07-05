import { memo, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 로딩 스피너 컴포넌트
 *
 * @param {Object} props - 컴포넌트 props
 * @param {'sm'|'default'|'lg'|'xl'} props.size - 스피너 크기
 * @param {string} props.text - 로딩 텍스트
 * @param {string} props.className - 추가 CSS 클래스
 * @param {boolean} props.showText - 텍스트 표시 여부
 * @param {string} props.minHeight - 최소 높이 클래스
 * @returns {JSX.Element} 로딩 스피너 컴포넌트
 */
export const LoadingSpinner = memo(
  ({
    size = 'default',
    text = '로딩 중...',
    className = '',
    showText = true,
    minHeight = 'h-64',
    ...props
  }) => {
    // 크기별 클래스 매핑 (메모이제이션)
    const sizeClasses = useMemo(
      () => ({
        sm: 'h-4 w-4',
        default: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      }),
      [],
    )

    // 스피너 클래스 계산 (메모이제이션)
    const spinnerClasses = useMemo(
      () => cn(sizeClasses[size], 'animate-spin text-primary'),
      [sizeClasses, size],
    )

    // 컨테이너 클래스 계산 (메모이제이션)
    const containerClasses = useMemo(
      () => cn('flex items-center justify-center', minHeight, className),
      [minHeight, className],
    )

    return (
      <div
        className={containerClasses}
        role="status"
        aria-live="polite"
        aria-label={showText ? text : '로딩 중'}
        {...props}
      >
        <div className="flex items-center gap-3">
          <Loader2 className={spinnerClasses} aria-hidden="true" />
          {showText && <span className="text-muted-foreground">{text}</span>}
        </div>
      </div>
    )
  },
)

// 컴포넌트 displayName 설정 (필수)
LoadingSpinner.displayName = 'LoadingSpinner'
