import { memo, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { cn } from '@/lib/utils'

/**
 * 통계 카드 컴포넌트
 *
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.title - 카드 제목
 * @param {string} props.description - 카드 설명
 * @param {React.ComponentType} props.icon - 아이콘 컴포넌트
 * @param {string} props.iconColor - 아이콘 색상 클래스
 * @param {number} props.total - 총 개수
 * @param {number} props.active - 활성 개수
 * @param {number} props.inactive - 비활성 개수
 * @param {string} props.totalColor - 총 개수 텍스트 색상 클래스
 * @param {string} props.className - 추가 CSS 클래스
 * @returns {JSX.Element} 통계 카드 컴포넌트
 */
export const StatsCard = memo(
  ({
    title,
    description,
    icon: Icon,
    iconColor,
    total,
    active,
    inactive,
    totalColor,
    className,
    ...props
  }) => {
    // 아이콘 클래스 메모이제이션
    const iconClasses = useMemo(() => cn('h-6 w-6', iconColor), [iconColor])

    // 총 개수 텍스트 클래스 메모이제이션
    const totalClasses = useMemo(
      () => cn('text-lg font-bold', totalColor),
      [totalColor],
    )

    // 활성화 상태 계산
    const activePercentage = useMemo(() => {
      if (!total || total === 0) return 0
      return Math.round((active / total) * 100)
    }, [active, total])

    // Early Return - 필수 props 검증 (Hooks 후에 위치)
    if (!title || !Icon) {
      return (
        <Card className={cn('p-6', className)}>
          <div className="text-muted-foreground text-center">
            데이터를 불러올 수 없습니다
          </div>
        </Card>
      )
    }

    return (
      <Card
        className={cn('admin-card transition-all duration-200', className)}
        {...props}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs">
                {description}
              </CardDescription>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <Icon className={iconClasses} aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            {/* 총 개수 */}
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">총</span>
              <div className={totalClasses}>{total?.toLocaleString() || 0}</div>
            </div>

            {/* 활성 개수 */}
            <div className="space-y-1">
              <span className="status-success rounded-full px-2 py-1 text-xs">
                활성 ({activePercentage}%)
              </span>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {active?.toLocaleString() || 0}
              </div>
            </div>

            {/* 비활성 개수 */}
            <div className="space-y-1">
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                비활성
              </span>
              <div className="text-lg font-bold text-gray-500 dark:text-gray-400">
                {inactive?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  },
)

// 컴포넌트 displayName 설정 (필수)
StatsCard.displayName = 'StatsCard'
