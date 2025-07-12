import { memo, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Badge } from '../ui/badge'
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
        className={cn('transition-all duration-200 hover:shadow-md', className)}
        {...props}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className={cn('rounded-lg p-2 bg-primary/10')}>
            <Icon className={iconClasses} aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex-between gap-standard">
            {/* 총 개수 */}
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground text-xs">총</span>
              <span className={totalClasses}>
                {total?.toLocaleString() || 0}
              </span>
            </div>

            {/* 활성 개수 - active가 undefined가 아닐 때만 표시 */}
            {active !== undefined && (
              <div className="flex flex-col items-center">
                <Badge variant="success" className="mb-1">
                  활성 ({activePercentage}%)
                </Badge>
                <span className="font-bold text-green-600">
                  {active?.toLocaleString() || 0}
                </span>
              </div>
            )}

            {/* 비활성 개수 - inactive가 undefined가 아닐 때만 표시 */}
            {inactive !== undefined && (
              <div className="flex flex-col items-center">
                <Badge variant="destructive" className="mb-1">
                  비활성
                </Badge>
                <span className="font-bold text-gray-500">
                  {inactive?.toLocaleString() || 0}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  },
)

// 컴포넌트 displayName 설정 (필수)
StatsCard.displayName = 'StatsCard'
