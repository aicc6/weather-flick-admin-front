import { useState } from 'react'
import { Link } from 'react-router-dom'
import { REGION_MAP } from '@/constants/region'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Edit2, Trash2 } from 'lucide-react'
import { LoadingState, EmptyState, ErrorState } from '@/components/common'
import {
  useGetTouristAttractionsQuery,
  useSearchTouristAttractionsQuery,
  useDeleteTouristAttractionMutation,
} from '@/store/api/touristAttractionsApi'
import { PageContainer, PageHeader, ContentSection } from '@/layouts'

export default function TouristAttractionList({ onEdit, onCreate }) {
  // 입력값과 실제 검색값을 분리
  const [searchNameInput, setSearchNameInput] = useState('')
  const [searchRegionInput, setSearchRegionInput] = useState('')
  const [searchName, setSearchName] = useState('')
  const [searchRegion, setSearchRegion] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 12

  // 지역 이름을 코드로 변환
  let regionCode = searchRegion
  if (regionCode && isNaN(Number(regionCode))) {
    const found = Object.entries(REGION_MAP).find(
      ([, name]) => name === regionCode,
    )
    regionCode = found ? found[0] : ''
  }

  // RTK Query 훅 - 검색 여부에 따라 다른 쿼리 사용
  const isSearching = searchName || regionCode
  const queryParams = {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    ...(searchName && { name: searchName }),
    ...(regionCode && { region: regionCode }),
  }

  // 일반 목록 조회
  const {
    data: listData,
    isLoading: listLoading,
    error: listError,
    refetch: refetchList,
  } = useGetTouristAttractionsQuery(queryParams, {
    skip: isSearching,
  })

  // 검색 조회
  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchTouristAttractionsQuery(queryParams, {
    skip: !isSearching,
  })

  // 삭제 mutation
  const [deleteTouristAttraction, { isLoading: deleting }] =
    useDeleteTouristAttractionMutation()

  // 현재 사용할 데이터 선택
  const data = isSearching ? searchData : listData
  const loading = isSearching ? searchLoading : listLoading
  const error = isSearching ? searchError : listError
  const refetch = isSearching ? refetchSearch : refetchList

  const handleDelete = async (content_id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    try {
      await deleteTouristAttraction(content_id).unwrap()
      refetch()
    } catch (error) {
      console.error('관광지 삭제 실패:', error)
    }
  }

  const handleRetry = () => {
    refetch()
  }

  const totalPages = Math.ceil((data?.count || 0) / pageSize)
  const renderPagination = () => {
    if (totalPages <= 1) return null
    const pageItems = []
    let start = Math.max(1, page - 2)
    let end = Math.min(totalPages, page + 2)
    if (page <= 3) {
      end = Math.min(5, totalPages)
    } else if (page >= totalPages - 2) {
      start = Math.max(1, totalPages - 4)
    }
    // Previous button
    pageItems.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
          aria-disabled={page === 1}
          tabIndex={page === 1 ? -1 : 0}
        />
      </PaginationItem>,
    )
    // First page and ellipsis
    if (start > 1) {
      pageItems.push(
        <PaginationItem key={1}>
          <PaginationLink isActive={page === 1} onClick={() => setPage(1)}>
            {1}
          </PaginationLink>
        </PaginationItem>,
      )
      if (start > 2) {
        pageItems.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }
    }
    // Page numbers
    for (let i = start; i <= end; i++) {
      pageItems.push(
        <PaginationItem key={i}>
          <PaginationLink isActive={i === page} onClick={() => setPage(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }
    // Last page and ellipsis
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pageItems.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }
      pageItems.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={page === totalPages}
            onClick={() => setPage(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }
    // Next button
    pageItems.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
          aria-disabled={page === totalPages}
          tabIndex={page === totalPages ? -1 : 0}
        />
      </PaginationItem>,
    )
    return (
      <Pagination className="mt-4">
        <PaginationContent>{pageItems}</PaginationContent>
      </Pagination>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="관광지 관리"
        description="관광지 정보를 등록, 수정, 삭제하고 검색할 수 있습니다."
      />

      {/* 에러 알림 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.data?.message || '관광지 데이터를 불러오는데 실패했습니다.'}
          </AlertDescription>
        </Alert>
      )}

      {/* 검색/등록 카드 */}
      <ContentSection>
        <div className="mb-2">
          <div className="text-lg font-bold">검색 및 등록</div>
          <div className="text-sm text-gray-500">
            관광지 정보를 검색하거나 새로 등록하세요.
          </div>
        </div>
        <form
          className="grid grid-cols-1 items-end gap-3 md:grid-cols-5"
          onSubmit={(e) => {
            e.preventDefault()
            setSearchName(searchNameInput)
            setSearchRegion(searchRegionInput)
            setPage(1)
          }}
        >
          <div className="flex flex-col gap-1 md:col-span-2">
            <label htmlFor="search-name" className="mb-1 text-xs text-gray-500">
              관광지명
            </label>
            <input
              id="search-name"
              className="rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              placeholder="관광지명"
              value={searchNameInput}
              onChange={(e) => setSearchNameInput(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label
              htmlFor="search-region"
              className="mb-1 text-xs text-gray-500"
            >
              지역
            </label>
            <select
              id="search-region"
              className="rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              value={searchRegionInput}
              onChange={(e) => setSearchRegionInput(e.target.value)}
            >
              <option value="">전체</option>
              {Object.values(REGION_MAP).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 md:col-span-1 md:justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
            >
              검색
            </button>
            <button
              type="button"
              disabled={loading}
              className="rounded border border-blue-600 px-4 py-2 font-semibold text-blue-600 shadow transition hover:bg-blue-50 disabled:opacity-50"
              onClick={onCreate}
            >
              관광지 등록
            </button>
          </div>
        </form>
      </ContentSection>

      {/* 관광지 목록 카드 */}
      <ContentSection>
        <div className="mb-2">
          <div className="text-lg font-bold">관광지 목록</div>
          <div className="text-sm text-gray-500">
            등록된 관광지 정보를 확인하세요.
          </div>
        </div>
        {/* 카드형 그리드 */}
        {loading ? (
          <LoadingState message="관광지 데이터를 불러오는 중..." />
        ) : error ? (
          <ErrorState 
            error={error} 
            onRetry={handleRetry}
            message="관광지 데이터를 불러올 수 없습니다"
          />
        ) : !data?.results?.length ? (
          <EmptyState 
            type="search"
            message={isSearching ? "검색 결과가 없습니다" : "등록된 관광지가 없습니다"}
            description={isSearching ? "다른 검색어로 시도해보세요" : "새로운 관광지를 등록해주세요"}
            action={
              !isSearching && (
                <button
                  onClick={onCreate}
                  className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  관광지 등록하기
                </button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data?.results.map((a) => (
              <div
                key={a.content_id}
                className="flex h-full flex-col rounded-lg border bg-white p-4 shadow"
              >
                <div className="flex flex-1 flex-col gap-2">
                  <div className="mb-2 flex h-36 w-full items-center justify-center overflow-hidden rounded bg-gray-100">
                    {a.image_url ? (
                      <img
                        src={a.image_url}
                        alt={a.attraction_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">이미지 없음</span>
                    )}
                  </div>
                  <div
                    className="truncate text-lg font-bold text-gray-900"
                    title={a.attraction_name}
                  >
                    <Link
                      to={`/tourist-attractions/${a.content_id}`}
                      className="text-blue-700 hover:underline"
                    >
                      {a.attraction_name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {REGION_MAP[a.region_code] || ''}
                    </span>
                    <span className="ml-auto text-xs text-gray-400">
                      {a.created_at ? a.created_at.split('T')[0] : ''}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    disabled={loading || deleting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-blue-400 bg-gradient-to-r from-blue-50 to-white px-4 py-2 font-semibold text-blue-700 shadow transition hover:from-blue-100 hover:to-blue-200 disabled:opacity-50"
                    onClick={() => onEdit(a.content_id)}
                  >
                    <Edit2 size={18} className="text-blue-600" />
                    <span>수정</span>
                  </button>
                  <button
                    disabled={loading || deleting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-red-400 bg-gradient-to-r from-red-50 to-white px-4 py-2 font-semibold text-red-700 shadow transition hover:from-red-100 hover:to-red-200 disabled:opacity-50"
                    onClick={() => handleDelete(a.content_id)}
                  >
                    <Trash2 size={18} className="text-red-500" />
                    <span>삭제</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* 페이지네이션 */}
        <div className="mt-6 flex justify-center">{renderPagination()}</div>
      </ContentSection>
    </PageContainer>
  )
}
