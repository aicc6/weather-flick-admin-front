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
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Edit2, Trash2, Plus, Dog } from 'lucide-react'
import { LoadingState, EmptyState, ErrorState } from '@/components/common'
import { ContentSection } from '@/layouts/ContentSection'
import {
  useGetTouristAttractionsQuery,
  useSearchTouristAttractionsQuery,
  useDeleteTouristAttractionMutation,
} from '@/store/api/touristAttractionsApi'

export default function TouristAttractionList({ onEdit, onCreate }) {
  // 입력값과 실제 검색값을 분리
  const [searchNameInput, setSearchNameInput] = useState('')
  const [searchRegionInput, setSearchRegionInput] = useState('all')
  const [petFriendlyInput, setPetFriendlyInput] = useState('all')
  const [searchName, setSearchName] = useState('')
  const [searchRegion, setSearchRegion] = useState('')
  const [petFriendly, setPetFriendly] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 12

  // 지역 이름을 코드로 변환
  let regionCode = searchRegion === 'all' ? '' : searchRegion
  if (regionCode && isNaN(Number(regionCode))) {
    const found = Object.entries(REGION_MAP).find(
      ([, name]) => name === regionCode,
    )
    regionCode = found ? found[0] : ''
  }

  // RTK Query 훅 - 검색 여부에 따라 다른 쿼리 사용
  const isSearching = searchName || regionCode || petFriendly === 'yes'
  const queryParams = {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    ...(searchName && { name: searchName }),
    ...(regionCode && { region_code: regionCode }), // region → region_code로 변경
    ...(petFriendly === 'yes' && { pet_friendly: true }),
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
  const [deleteTouristAttraction, { isLoading: _deleting }] =
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
    <div className="space-y-6">
      {/* 에러 알림 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.data?.message || '관광지 데이터를 불러오는데 실패했습니다.'}
          </AlertDescription>
        </Alert>
      )}

      <ContentSection title="관광지 목록">
        {/* 검색 및 액션 바 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              placeholder="관광지명 검색..."
              value={searchNameInput}
              onChange={(e) => setSearchNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  setSearchName(searchNameInput)
                  setSearchRegion(searchRegionInput)
                  setPage(1)
                }
              }}
              className="w-64"
            />
            <Select
              value={searchRegionInput}
              onValueChange={(value) => {
                setSearchRegionInput(value)
                setSearchRegion(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="전체 지역" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {Object.entries(REGION_MAP).map(([code, name]) => (
                  <SelectItem key={code} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={petFriendlyInput}
              onValueChange={(value) => {
                setPetFriendlyInput(value)
                setPetFriendly(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="반려동물 동반" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="yes">반려동물 동반 가능</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            관광지 등록
          </Button>
        </div>

        {/* 관광지 테이블 */}
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
            message={
              isSearching ? '검색 결과가 없습니다' : '등록된 관광지가 없습니다'
            }
            description={
              isSearching
                ? '다른 검색어로 시도해보세요'
                : '새로운 관광지를 등록해주세요'
            }
            action={
              !isSearching && (
                <Button onClick={onCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  관광지 등록
                </Button>
              )
            }
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">이미지</TableHead>
                  <TableHead className="min-w-[200px]">관광지명</TableHead>
                  <TableHead>지역</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((a) => (
                  <TableRow key={a.content_id}>
                    <TableCell>
                      {a.image_url ? (
                        <img
                          src={a.image_url}
                          alt={a.attraction_name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-md text-xs">
                          이미지 없음
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/attractions/${a.content_id}`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {a.attraction_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {REGION_MAP[a.region_code] || ''}
                        </Badge>
                        {a.is_pet_friendly && (
                          <Badge variant="outline" className="gap-1">
                            <Dog className="h-3 w-3" />
                            반려동물
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {a.created_at ? a.created_at.split('T')[0] : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(a.content_id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(a.content_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* 페이지네이션 */}
        {renderPagination()}
      </ContentSection>
    </div>
  )
}
