/**
 * 페이지네이션 정보 표시 컴포넌트
 * 현재 페이지 정보와 전체 정보를 표시
 */

import { useTranslation } from 'react-i18next'
import { formatPaginationInfo } from '../../utils/i18nHelpers'

/**
 * 페이지네이션 정보 컴포넌트
 * @param {Object} props
 * @param {number} props.currentPage - 현재 페이지 (1부터 시작)
 * @param {number} props.totalPages - 전체 페이지 수
 * @param {number} props.totalItems - 전체 항목 수
 * @param {number} props.itemsPerPage - 페이지당 항목 수
 * @param {string} props.className - 추가 CSS 클래스
 */
export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className = '',
}) {
  const { t } = useTranslation()

  if (!totalItems || totalItems === 0) {
    return (
      <div className={`text-muted-foreground text-sm ${className}`}>
        {t('common.no_items')}
      </div>
    )
  }

  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className={`text-muted-foreground text-sm ${className}`}>
      {formatPaginationInfo(
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        t,
      )}
      <div className="mt-1">
        {t('pagination.showing_items', {
          start: startItem,
          end: endItem,
          total: totalItems,
        })}
      </div>
    </div>
  )
}

/**
 * 간단한 페이지네이션 정보 (한 줄)
 */
export function PaginationInfoSimple({
  currentPage,
  totalPages,
  totalItems,
  className = '',
}) {
  const { t } = useTranslation()

  if (!totalItems || totalItems === 0) {
    return (
      <span className={`text-muted-foreground text-sm ${className}`}>
        {t('common.no_items')}
      </span>
    )
  }

  return (
    <span className={`text-muted-foreground text-sm ${className}`}>
      {t('pagination.page_of_total', {
        current: currentPage,
        total: totalPages,
      })}{' '}
      • {t('pagination.total_items', { count: totalItems })}
    </span>
  )
}

/**
 * 페이지 크기 선택 컴포넌트
 */
export function PageSizeSelector({
  pageSize,
  onPageSizeChange,
  options = [10, 20, 50, 100],
  className = '',
}) {
  const { t } = useTranslation()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-muted-foreground text-sm">
        {t('pagination.items_per_page')}:
      </span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="rounded border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  )
}

export default PaginationInfo
