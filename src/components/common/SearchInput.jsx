import { memo, useCallback } from 'react'
import { Search } from 'lucide-react'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'

/**
 * 검색 입력 컴포넌트
 *
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.value - 입력 값
 * @param {Function} props.onChange - 값 변경 핸들러
 * @param {string} props.placeholder - 플레이스홀더 텍스트
 * @param {string} props.className - 추가 CSS 클래스
 * @param {Function} props.onEnter - Enter 키 입력 핸들러
 * @returns {JSX.Element} 검색 입력 컴포넌트
 */
export const SearchInput = memo(
  ({
    value,
    onChange,
    placeholder = '검색...',
    className = '',
    onEnter,
    ...props
  }) => {
    // Enter 키 처리 핸들러 (메모이제이션)
    const handleKeyDown = useCallback(
      (e) => {
        if (e.key === 'Enter' && onEnter) {
          e.preventDefault()
          onEnter(value)
        }
      },
      [onEnter, value],
    )

    return (
      <div className={cn('relative', className)}>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className="pl-10"
          aria-label={placeholder}
          {...props}
        />
      </div>
    )
  },
)

// 컴포넌트 displayName 설정 (필수)
SearchInput.displayName = 'SearchInput'
