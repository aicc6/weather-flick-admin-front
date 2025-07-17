import { Badge } from '@/components/ui/badge'
import { getCategoryName, getCategoryColor, getCategoryIcon, getCategoryDescription } from '@/constants/category'

/**
 * 카테고리 뱃지 컴포넌트
 * @param {string} categoryCode - 카테고리 코드
 * @param {string} categoryName - 카테고리 이름 (옵션)
 * @param {boolean} showIcon - 아이콘 표시 여부
 * @param {boolean} showTooltip - 툴팁 표시 여부
 * @param {string} variant - 뱃지 변형 스타일
 * @param {string} size - 뱃지 크기
 * @param {string} className - 추가 CSS 클래스
 */
export const CategoryBadge = ({ 
  categoryCode, 
  categoryName, 
  showIcon = true, 
  showTooltip = true,
  variant = 'secondary',
  size = 'sm',
  className = ''
}) => {
  if (!categoryCode) {
    return (
      <Badge variant="outline" className={`${className}`}>
        미분류
      </Badge>
    )
  }

  const displayName = categoryName || getCategoryName(categoryCode)
  const icon = getCategoryIcon(categoryCode)
  const description = getCategoryDescription(categoryCode)

  return (
    <Badge
      variant={variant}
      className={`${className} inline-flex items-center gap-1`}
      title={showTooltip ? description : undefined}
    >
      {showIcon && <span className="text-xs">{icon}</span>}
      <span>{displayName}</span>
    </Badge>
  )
}

/**
 * 카테고리 칩 컴포넌트 (더 스타일링된 버전)
 */
export const CategoryChip = ({ 
  categoryCode, 
  categoryName, 
  showIcon = true, 
  showTooltip = true,
  className = ''
}) => {
  if (!categoryCode) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
        미분류
      </div>
    )
  }

  const displayName = categoryName || getCategoryName(categoryCode)
  const icon = getCategoryIcon(categoryCode)
  const description = getCategoryDescription(categoryCode)
  const colorClass = getCategoryColor(categoryCode)

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClass} ${className}`}
      title={showTooltip ? description : undefined}
    >
      {showIcon && <span>{icon}</span>}
      <span>{displayName}</span>
    </div>
  )
}

/**
 * 카테고리 선택 옵션 컴포넌트
 */
export const CategoryOption = ({ categoryCode, categoryName, showIcon = true, showDescription = false }) => {
  const displayName = categoryName || getCategoryName(categoryCode)
  const icon = getCategoryIcon(categoryCode)
  const description = getCategoryDescription(categoryCode)

  return (
    <div className="flex items-center gap-2">
      {showIcon && <span className="text-sm">{icon}</span>}
      <div className="flex-1">
        <div className="font-medium">{displayName}</div>
        {showDescription && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>
    </div>
  )
}

export default CategoryBadge