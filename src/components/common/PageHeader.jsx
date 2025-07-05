import { memo, useMemo } from 'react'
import { cn } from '@/lib/utils'

/**
 * 페이지 헤더 컴포넌트
 *
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.title - 페이지 제목
 * @param {string} props.description - 페이지 설명
 * @param {React.ReactNode} props.action - 액션 버튼/요소
 * @param {React.ComponentType} props.icon - 아이콘 컴포넌트
 * @param {string} props.className - 추가 CSS 클래스
 * @returns {JSX.Element} 페이지 헤더 컴포넌트
 */
export const PageHeader = memo(
  ({ title, description, action, icon: Icon, className = '', ...props }) => {
    // 아이콘 섹션 메모이제이션
    const iconSection = useMemo(() => {
      if (!Icon) return null

      return (
        <div className="rounded-lg bg-blue-100 p-2">
          <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
        </div>
      )
    }, [Icon])

    // 타이틀 섹션 메모이제이션
    const titleSection = useMemo(
      () => (
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      ),
      [title, description],
    )

    // Early Return - 필수 props 검증 (Hooks 후에 위치)
    if (!title) {
      return null
    }

    // 액션이 있는 경우와 없는 경우 분기
    if (action) {
      return (
        <div
          className={cn('flex items-center justify-between', className)}
          {...props}
        >
          <div className="flex items-center gap-3">
            {iconSection}
            {titleSection}
          </div>
          <div className="flex-shrink-0">{action}</div>
        </div>
      )
    }

    return (
      <div className={cn(className)} {...props}>
        <div className="flex items-center gap-3">
          {iconSection}
          {titleSection}
        </div>
      </div>
    )
  },
)

// 컴포넌트 displayName 설정 (필수)
PageHeader.displayName = 'PageHeader'
