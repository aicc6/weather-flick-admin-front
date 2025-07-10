/**
 * 개선된 페이지네이션 컨트롤 컴포넌트
 * 페이지네이션과 정보 표시를 결합한 완전한 솔루션
 */

import { useMemo } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '../ui/pagination'
import { PaginationInfoSimple, PageSizeSelector } from './PaginationInfo'

/**
 * 완전한 페이지네이션 컨트롤
 * @param {Object} props
 * @param {number} props.currentPage - 현재 페이지 (1부터 시작)
 * @param {number} props.totalPages - 전체 페이지 수
 * @param {number} props.totalItems - 전체 항목 수
 * @param {number} props.itemsPerPage - 페이지당 항목 수
 * @param {Function} props.onPageChange - 페이지 변경 핸들러
 * @param {Function} props.onPageSizeChange - 페이지 크기 변경 핸들러 (선택사항)
 * @param {Array} props.pageSizeOptions - 페이지 크기 옵션
 * @param {boolean} props.showInfo - 페이지네이션 정보 표시 여부
 * @param {boolean} props.showPageSizeSelector - 페이지 크기 선택기 표시 여부
 * @param {number} props.maxVisiblePages - 표시할 최대 페이지 수
 * @param {string} props.className - 추가 CSS 클래스
 */
export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showInfo = true,
  showPageSizeSelector = false,
  maxVisiblePages = 7,
  className = '',
}) {

  // 페이지 번호 범위 계산
  const pageNumbers = useMemo(() => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const half = Math.floor(maxVisiblePages / 2)
    let start = Math.max(currentPage - half, 1)
    let end = Math.min(start + maxVisiblePages - 1, totalPages)

    if (end - start < maxVisiblePages - 1) {
      start = Math.max(end - maxVisiblePages + 1, 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [currentPage, totalPages, maxVisiblePages])

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  if (totalPages <= 1 && !showInfo && !showPageSizeSelector) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 상단 정보 및 설정 */}
      {(showInfo || showPageSizeSelector) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {showInfo && (
            <PaginationInfoSimple
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
            />
          )}
          {showPageSizeSelector && onPageSizeChange && (
            <PageSizeSelector
              pageSize={itemsPerPage}
              onPageSizeChange={onPageSizeChange}
              options={pageSizeOptions}
            />
          )}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination className="justify-center">
          <PaginationContent>
            {/* 이전 페이지 */}
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageClick(currentPage - 1)}
                aria-disabled={currentPage === 1}
                className={
                  currentPage === 1
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>

            {/* 첫 페이지 (필요한 경우) */}
            {pageNumbers[0] > 1 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageClick(1)}
                    className="cursor-pointer"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                {pageNumbers[0] > 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
              </>
            )}

            {/* 페이지 번호들 */}
            {pageNumbers.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageClick(page)}
                  isActive={page === currentPage}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {/* 마지막 페이지 (필요한 경우) */}
            {pageNumbers[pageNumbers.length - 1] < totalPages && (
              <>
                {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageClick(totalPages)}
                    className="cursor-pointer"
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            {/* 다음 페이지 */}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageClick(currentPage + 1)}
                aria-disabled={currentPage === totalPages}
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

/**
 * 간단한 페이지네이션 (정보 없음)
 */
export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  className = '',
}) {
  return (
    <PaginationControls
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={0}
      itemsPerPage={0}
      onPageChange={onPageChange}
      showInfo={false}
      showPageSizeSelector={false}
      maxVisiblePages={maxVisiblePages}
      className={className}
    />
  )
}

/**
 * 모바일 친화적인 페이지네이션
 */
export function MobilePagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) {
  const { t } = useTranslation()

  if (totalPages <= 1) return null

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('common.previous')}
      </button>

      <span className="text-sm text-gray-700">
        {t('pagination.page_of_total', {
          current: currentPage,
          total: totalPages,
        })}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('common.next')}
      </button>
    </div>
  )
}

export default PaginationControls
