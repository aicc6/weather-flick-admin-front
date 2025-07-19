import { useState, useEffect } from 'react'
import {
  useGetTouristAttractionsQuery,
  useCreateTouristAttractionMutation,
  useUpdateTouristAttractionMutation,
  useDeleteTouristAttractionMutation,
  useGetAccommodationsQuery,
  useCreateAccommodationMutation,
  useUpdateAccommodationMutation,
  useDeleteAccommodationMutation,
  useGetRestaurantsQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
} from '@/store/api/contentApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link } from 'react-router-dom'
import { REGION_MAP } from '@/constants/region'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatTableValue, formatAddress, formatDate, formatTel } from '@/utils/dataHelpers'
import {
  AlertCircle,
  Trash2,
  Edit2,
  MoreHorizontal,
  Plus,
  Search,
} from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import {
  LoadingState,
  EmptyState,
  ErrorState,
  StyledCard,
  StyledCardContent,
  CategoryBadge,
} from '@/components/common'

const REGION_OPTIONS = Object.entries(REGION_MAP)

// 유효한 데이터인지 확인하는 헬퍼 함수
const hasValidData = (item) => {
  // 필수 필드가 있는지 확인
  if (!item.content_id) return false
  
  // 이름이 비어있지 않은지 확인
  const nameField = item.attraction_name || item.accommodation_name || item.restaurant_name
  if (!nameField || nameField.trim() === '') return false
  
  // 최소한 하나의 의미있는 정보가 있는지 확인
  const hasInfo = 
    (item.address && item.address.trim() !== '') ||
    (item.description && item.description.trim() !== '') ||
    (item.tel && item.tel.trim() !== '') ||
    (item.image_url && item.image_url.trim() !== '') ||
    item.latitude || 
    item.longitude
  
  return hasInfo
}

// 관광지 섹션
export function TouristAttractionsSection() {
  const [page, setPage] = useState(1)
  const limit = 20
  const offset = (page - 1) * limit
  const [searchName, setSearchName] = useState('')
  const [searchRegion, setSearchRegion] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  
  const [form, setForm] = useState({
    attraction_name: '',
    description: '',
    address: '',
    image_url: '',
    latitude: '',
    longitude: '',
    category_code: '',
    category_name: '',
    region_code: '',
  })

  const { data, isLoading, error, refetch } = useGetTouristAttractionsQuery({
    limit,
    offset,
    attraction_name: searchName || undefined,
    region_code: searchRegion && searchRegion !== 'all' ? searchRegion : undefined,
  })

  const [createTouristAttraction, { isLoading: isCreating }] = useCreateTouristAttractionMutation()
  const [updateTouristAttraction, { isLoading: isUpdating }] = useUpdateTouristAttractionMutation()
  const [deleteTouristAttraction, { isLoading: isDeleting }] = useDeleteTouristAttractionMutation()

  useEffect(() => {
    setPage(1)
  }, [searchName, searchRegion])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    refetch()
  }

  const handleOpenCreate = () => {
    setEditData(null)
    setForm({
      attraction_name: '',
      description: '',
      address: '',
      image_url: '',
      latitude: '',
      longitude: '',
      category_code: '',
      category_name: '',
      region_code: '',
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (attraction) => {
    setEditData(attraction)
    setForm({
      attraction_name: attraction.attraction_name || '',
      description: attraction.description || '',
      address: attraction.address || '',
      image_url: attraction.image_url || '',
      latitude: attraction.latitude || '',
      longitude: attraction.longitude || '',
      category_code: attraction.category_code || '',
      category_name: attraction.category_name || '',
      region_code: attraction.region_code || '',
    })
    setModalOpen(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      }
      
      if (editData) {
        await updateTouristAttraction({ 
          content_id: editData.content_id, 
          data: formData 
        }).unwrap()
      } else {
        await createTouristAttraction(formData).unwrap()
      }
      setModalOpen(false)
      refetch()
    } catch (err) {
      setErrorMsg(err.message || '저장 실패')
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteTouristAttraction(deleteId).unwrap()
        setDeleteId(null)
        refetch()
      } catch (err) {
        setErrorMsg(err.message || '삭제 실패')
      }
    }
  }

  // 필터링된 데이터 개수 계산
  const filteredItems = data?.items ? data.items.filter(hasValidData) : []
  const hiddenCount = data?.items ? data.items.length - filteredItems.length : 0
  
  const totalPages = data ? Math.ceil(data.total / limit) : 1
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

    pageItems.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
          aria-disabled={page === 1}
          className={
            page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
          }
        />
      </PaginationItem>,
    )

    if (start > 1) {
      pageItems.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => setPage(1)} isActive={page === 1}>
            1
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

    for (let i = start; i <= end; i++) {
      pageItems.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => setPage(i)} isActive={i === page}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

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
            onClick={() => setPage(totalPages)}
            isActive={page === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    pageItems.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
          aria-disabled={page === totalPages}
          className={
            page === totalPages
              ? 'pointer-events-none opacity-50'
              : 'cursor-pointer'
          }
        />
      </PaginationItem>,
    )

    return (
      <Pagination className="justify-center">
        <PaginationContent>{pageItems}</PaginationContent>
      </Pagination>
    )
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* 검색 및 액션 바 */}
      <StyledCard>
        <StyledCardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-4 lg:flex-row lg:items-end"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="search-name" className="text-sm font-medium">
                    관광지명
                  </label>
                  <Input
                    id="search-name"
                    placeholder="관광지명 검색..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="search-region"
                    className="text-sm font-medium"
                  >
                    지역
                  </label>
                  <Select value={searchRegion} onValueChange={setSearchRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="전체 지역" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      {REGION_OPTIONS.map(([code, name]) => (
                        <SelectItem key={code} value={code}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 lg:items-end">
                  <Button type="submit" disabled={isLoading}>
                    <Search className="mr-2 h-4 w-4" />
                    검색
                  </Button>
                </div>
              </div>
            </form>

            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              관광지 등록
            </Button>
          </div>
        </StyledCardContent>
      </StyledCard>

      {/* 테이블 */}
      <StyledCard>
        <StyledCardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <LoadingState message="관광지 데이터를 불러오는 중..." />
            </div>
          ) : error ? (
            <div className="p-8">
              <ErrorState
                error={error}
                onRetry={refetch}
                message="관광지 데이터를 불러올 수 없습니다"
              />
            </div>
          ) : !data?.items?.length ? (
            <div className="p-8">
              <EmptyState
                type="search"
                message={
                  searchName || searchRegion
                    ? '검색 결과가 없습니다'
                    : '등록된 관광지가 없습니다'
                }
                description={
                  searchName || searchRegion
                    ? '다른 검색어로 시도해보세요'
                    : '새로운 관광지를 등록해주세요'
                }
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">관광지명</TableHead>
                    <TableHead>지역</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead>주소</TableHead>
                    <TableHead className="w-[100px]">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.filter(hasValidData).map((attraction) => (
                    <TableRow key={attraction.content_id}>
                      <TableCell>
                        <div className="space-y-1">
                          <Link
                            to={`/tourist-attractions/${attraction.content_id}`}
                            className="text-primary font-medium hover:underline"
                          >
                            {formatTableValue(attraction.attraction_name)}
                          </Link>
                          {attraction.description && (
                            <p className="text-muted-foreground line-clamp-2 max-w-[300px] text-xs">
                              {attraction.description.length > 80
                                ? `${attraction.description.substring(0, 80)}...`
                                : attraction.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {REGION_MAP[attraction.region_code] || attraction.region_code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {attraction.category_info ? (
                          <CategoryBadge
                            categoryCode={attraction.category_info.category_code}
                            categoryName={attraction.category_info.category_name}
                            showIcon={true}
                            showTooltip={true}
                          />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatAddress(attraction.address)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(attraction)}
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteId(attraction.content_id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 페이지네이션 */}
              <div className="border-t p-4">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">
                    총 {data?.total || 0}개 중{' '}
                    {Math.min(offset + 1, data?.total || 0)}-
                    {Math.min(offset + limit, data?.total || 0)}개 표시
                  </div>
                  {renderPagination()}
                </div>
              </div>
            </>
          )}
        </StyledCardContent>
      </StyledCard>

      {/* 등록/수정 다이얼로그 */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editData ? '관광지 수정' : '관광지 등록'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="attraction_name" className="text-sm font-medium">
                  관광지명
                </label>
                <Input
                  id="attraction_name"
                  name="attraction_name"
                  value={form.attraction_name}
                  onChange={handleChange}
                  placeholder="관광지명"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="region_code" className="text-sm font-medium">
                  지역
                </label>
                <Select
                  value={form.region_code}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, region_code: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="지역 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGION_OPTIONS.map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="category_code" className="text-sm font-medium">
                  카테고리 코드
                </label>
                <Input
                  id="category_code"
                  name="category_code"
                  value={form.category_code}
                  onChange={handleChange}
                  placeholder="예: A0101"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="category_name" className="text-sm font-medium">
                  카테고리명
                </label>
                <Input
                  id="category_name"
                  name="category_name"
                  value={form.category_name}
                  onChange={handleChange}
                  placeholder="예: 자연관광지"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="latitude" className="text-sm font-medium">
                  위도
                </label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="37.5665"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="longitude" className="text-sm font-medium">
                  경도
                </label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="126.9780"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">
                주소
              </label>
              <Input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="전체 주소"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                설명
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="관광지에 대한 설명을 입력하세요"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="image_url" className="text-sm font-medium">
                대표 이미지 URL
              </label>
              <Input
                id="image_url"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="이미지 URL"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  취소
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {editData ? '수정' : '등록'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 관광지가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// 숙박시설 섹션
export function AccommodationsSection() {
  const [page, setPage] = useState(1)
  const limit = 20
  const offset = (page - 1) * limit
  const [searchName, setSearchName] = useState('')
  const [searchRegion, setSearchRegion] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  
  const [form, setForm] = useState({
    accommodation_name: '',
    description: '',
    address: '',
    image_url: '',
    latitude: '',
    longitude: '',
    room_type: '',
    check_in_time: '',
    check_out_time: '',
    price_range: '',
    category_code: '',
    category_name: '',
    region_code: '',
  })

  const { data, isLoading, error, refetch } = useGetAccommodationsQuery({
    limit,
    offset,
    accommodation_name: searchName || undefined,
    region_code: searchRegion && searchRegion !== 'all' ? searchRegion : undefined,
  })

  const [createAccommodation, { isLoading: isCreating }] = useCreateAccommodationMutation()
  const [updateAccommodation, { isLoading: isUpdating }] = useUpdateAccommodationMutation()
  const [deleteAccommodation, { isLoading: isDeleting }] = useDeleteAccommodationMutation()

  useEffect(() => {
    setPage(1)
  }, [searchName, searchRegion])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    refetch()
  }

  const handleOpenCreate = () => {
    setEditData(null)
    setForm({
      accommodation_name: '',
      description: '',
      address: '',
      image_url: '',
      latitude: '',
      longitude: '',
      room_type: '',
      check_in_time: '',
      check_out_time: '',
      price_range: '',
      category_code: '',
      category_name: '',
      region_code: '',
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (accommodation) => {
    setEditData(accommodation)
    setForm({
      accommodation_name: accommodation.accommodation_name || '',
      description: accommodation.description || '',
      address: accommodation.address || '',
      image_url: accommodation.image_url || '',
      latitude: accommodation.latitude || '',
      longitude: accommodation.longitude || '',
      room_type: accommodation.room_type || '',
      check_in_time: accommodation.check_in_time || '',
      check_out_time: accommodation.check_out_time || '',
      price_range: accommodation.price_range || '',
      category_code: accommodation.category_code || '',
      category_name: accommodation.category_name || '',
      region_code: accommodation.region_code || '',
    })
    setModalOpen(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      }
      
      if (editData) {
        await updateAccommodation({ 
          content_id: editData.content_id, 
          data: formData 
        }).unwrap()
      } else {
        await createAccommodation(formData).unwrap()
      }
      setModalOpen(false)
      refetch()
    } catch (err) {
      setErrorMsg(err.message || '저장 실패')
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteAccommodation(deleteId).unwrap()
        setDeleteId(null)
        refetch()
      } catch (err) {
        setErrorMsg(err.message || '삭제 실패')
      }
    }
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 1
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

    pageItems.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
          aria-disabled={page === 1}
          className={
            page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
          }
        />
      </PaginationItem>,
    )

    if (start > 1) {
      pageItems.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => setPage(1)} isActive={page === 1}>
            1
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

    for (let i = start; i <= end; i++) {
      pageItems.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => setPage(i)} isActive={i === page}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

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
            onClick={() => setPage(totalPages)}
            isActive={page === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    pageItems.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
          aria-disabled={page === totalPages}
          className={
            page === totalPages
              ? 'pointer-events-none opacity-50'
              : 'cursor-pointer'
          }
        />
      </PaginationItem>,
    )

    return (
      <Pagination className="justify-center">
        <PaginationContent>{pageItems}</PaginationContent>
      </Pagination>
    )
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* 검색 및 액션 바 */}
      <StyledCard>
        <StyledCardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-4 lg:flex-row lg:items-end"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="search-name" className="text-sm font-medium">
                    숙박시설명
                  </label>
                  <Input
                    id="search-name"
                    placeholder="숙박시설명 검색..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="search-region"
                    className="text-sm font-medium"
                  >
                    지역
                  </label>
                  <Select value={searchRegion} onValueChange={setSearchRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="전체 지역" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      {REGION_OPTIONS.map(([code, name]) => (
                        <SelectItem key={code} value={code}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 lg:items-end">
                  <Button type="submit" disabled={isLoading}>
                    <Search className="mr-2 h-4 w-4" />
                    검색
                  </Button>
                </div>
              </div>
            </form>

            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              숙박시설 등록
            </Button>
          </div>
        </StyledCardContent>
      </StyledCard>

      {/* 테이블 */}
      <StyledCard>
        <StyledCardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <LoadingState message="숙박시설 데이터를 불러오는 중..." />
            </div>
          ) : error ? (
            <div className="p-8">
              <ErrorState
                error={error}
                onRetry={refetch}
                message="숙박시설 데이터를 불러올 수 없습니다"
              />
            </div>
          ) : !data?.items?.length ? (
            <div className="p-8">
              <EmptyState
                type="search"
                message={
                  searchName || searchRegion
                    ? '검색 결과가 없습니다'
                    : '등록된 숙박시설이 없습니다'
                }
                description={
                  searchName || searchRegion
                    ? '다른 검색어로 시도해보세요'
                    : '새로운 숙박시설을 등록해주세요'
                }
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">숙박시설명</TableHead>
                    <TableHead>지역</TableHead>
                    <TableHead>객실 유형</TableHead>
                    <TableHead>가격대</TableHead>
                    <TableHead>주소</TableHead>
                    <TableHead className="w-[100px]">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.filter(hasValidData).map((accommodation) => (
                    <TableRow key={accommodation.content_id}>
                      <TableCell>
                        <div className="space-y-1">
                          <Link
                            to={`/accommodations/${accommodation.content_id}`}
                            className="text-primary font-medium hover:underline"
                          >
                            {formatTableValue(accommodation.accommodation_name)}
                          </Link>
                          {accommodation.description && (
                            <p className="text-muted-foreground line-clamp-2 max-w-[300px] text-xs">
                              {accommodation.description.length > 80
                                ? `${accommodation.description.substring(0, 80)}...`
                                : accommodation.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {REGION_MAP[accommodation.region_code] || accommodation.region_code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {accommodation.room_type || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatTableValue(accommodation.price_range)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatAddress(accommodation.address)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(accommodation)}
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteId(accommodation.content_id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 페이지네이션 */}
              <div className="border-t p-4">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">
                    총 {data?.total || 0}개 중{' '}
                    {Math.min(offset + 1, data?.total || 0)}-
                    {Math.min(offset + limit, data?.total || 0)}개 표시
                  </div>
                  {renderPagination()}
                </div>
              </div>
            </>
          )}
        </StyledCardContent>
      </StyledCard>

      {/* 등록/수정 다이얼로그 */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editData ? '숙박시설 수정' : '숙박시설 등록'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="accommodation_name" className="text-sm font-medium">
                  숙박시설명
                </label>
                <Input
                  id="accommodation_name"
                  name="accommodation_name"
                  value={form.accommodation_name}
                  onChange={handleChange}
                  placeholder="숙박시설명"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="region_code" className="text-sm font-medium">
                  지역
                </label>
                <Select
                  value={form.region_code}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, region_code: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="지역 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGION_OPTIONS.map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="room_type" className="text-sm font-medium">
                  객실 유형
                </label>
                <Input
                  id="room_type"
                  name="room_type"
                  value={form.room_type}
                  onChange={handleChange}
                  placeholder="예: 디럭스, 스탠다드"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="price_range" className="text-sm font-medium">
                  가격대
                </label>
                <Input
                  id="price_range"
                  name="price_range"
                  value={form.price_range}
                  onChange={handleChange}
                  placeholder="예: 10만원~15만원"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="check_in_time" className="text-sm font-medium">
                  체크인 시간
                </label>
                <Input
                  id="check_in_time"
                  name="check_in_time"
                  value={form.check_in_time}
                  onChange={handleChange}
                  placeholder="예: 15:00"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="check_out_time" className="text-sm font-medium">
                  체크아웃 시간
                </label>
                <Input
                  id="check_out_time"
                  name="check_out_time"
                  value={form.check_out_time}
                  onChange={handleChange}
                  placeholder="예: 11:00"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="latitude" className="text-sm font-medium">
                  위도
                </label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="37.5665"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="longitude" className="text-sm font-medium">
                  경도
                </label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="126.9780"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">
                주소
              </label>
              <Input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="전체 주소"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                설명
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="숙박시설에 대한 설명을 입력하세요"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="image_url" className="text-sm font-medium">
                대표 이미지 URL
              </label>
              <Input
                id="image_url"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="이미지 URL"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  취소
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {editData ? '수정' : '등록'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 숙박시설이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// 음식점 섹션
export function RestaurantsSection() {
  const [page, setPage] = useState(1)
  const limit = 20
  const offset = (page - 1) * limit
  const [searchName, setSearchName] = useState('')
  const [searchRegion, setSearchRegion] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  
  const [form, setForm] = useState({
    restaurant_name: '',
    description: '',
    address: '',
    image_url: '',
    latitude: '',
    longitude: '',
    menu: '',
    business_hours: '',
    tel: '',
    price_range: '',
    category_code: '',
    category_name: '',
    region_code: '',
  })

  const { data, isLoading, error, refetch } = useGetRestaurantsQuery({
    limit,
    offset,
    restaurant_name: searchName || undefined,
    region_code: searchRegion && searchRegion !== 'all' ? searchRegion : undefined,
  })

  const [createRestaurant, { isLoading: isCreating }] = useCreateRestaurantMutation()
  const [updateRestaurant, { isLoading: isUpdating }] = useUpdateRestaurantMutation()
  const [deleteRestaurant, { isLoading: isDeleting }] = useDeleteRestaurantMutation()

  useEffect(() => {
    setPage(1)
  }, [searchName, searchRegion])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    refetch()
  }

  const handleOpenCreate = () => {
    setEditData(null)
    setForm({
      restaurant_name: '',
      description: '',
      address: '',
      image_url: '',
      latitude: '',
      longitude: '',
      menu: '',
      business_hours: '',
      tel: '',
      price_range: '',
      category_code: '',
      category_name: '',
      region_code: '',
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (restaurant) => {
    setEditData(restaurant)
    setForm({
      restaurant_name: restaurant.restaurant_name || '',
      description: restaurant.description || '',
      address: restaurant.address || '',
      image_url: restaurant.image_url || '',
      latitude: restaurant.latitude || '',
      longitude: restaurant.longitude || '',
      menu: restaurant.menu || '',
      business_hours: restaurant.business_hours || '',
      tel: restaurant.tel || '',
      price_range: restaurant.price_range || '',
      category_code: restaurant.category_code || '',
      category_name: restaurant.category_name || '',
      region_code: restaurant.region_code || '',
    })
    setModalOpen(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      }
      
      if (editData) {
        await updateRestaurant({ 
          content_id: editData.content_id, 
          data: formData 
        }).unwrap()
      } else {
        await createRestaurant(formData).unwrap()
      }
      setModalOpen(false)
      refetch()
    } catch (err) {
      setErrorMsg(err.message || '저장 실패')
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteRestaurant(deleteId).unwrap()
        setDeleteId(null)
        refetch()
      } catch (err) {
        setErrorMsg(err.message || '삭제 실패')
      }
    }
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 1
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

    pageItems.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
          aria-disabled={page === 1}
          className={
            page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
          }
        />
      </PaginationItem>,
    )

    if (start > 1) {
      pageItems.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => setPage(1)} isActive={page === 1}>
            1
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

    for (let i = start; i <= end; i++) {
      pageItems.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => setPage(i)} isActive={i === page}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

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
            onClick={() => setPage(totalPages)}
            isActive={page === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    pageItems.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
          aria-disabled={page === totalPages}
          className={
            page === totalPages
              ? 'pointer-events-none opacity-50'
              : 'cursor-pointer'
          }
        />
      </PaginationItem>,
    )

    return (
      <Pagination className="justify-center">
        <PaginationContent>{pageItems}</PaginationContent>
      </Pagination>
    )
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* 검색 및 액션 바 */}
      <StyledCard>
        <StyledCardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-4 lg:flex-row lg:items-end"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="search-name" className="text-sm font-medium">
                    음식점명
                  </label>
                  <Input
                    id="search-name"
                    placeholder="음식점명 검색..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="search-region"
                    className="text-sm font-medium"
                  >
                    지역
                  </label>
                  <Select value={searchRegion} onValueChange={setSearchRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="전체 지역" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      {REGION_OPTIONS.map(([code, name]) => (
                        <SelectItem key={code} value={code}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 lg:items-end">
                  <Button type="submit" disabled={isLoading}>
                    <Search className="mr-2 h-4 w-4" />
                    검색
                  </Button>
                </div>
              </div>
            </form>

            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              음식점 등록
            </Button>
          </div>
        </StyledCardContent>
      </StyledCard>

      {/* 테이블 */}
      <StyledCard>
        <StyledCardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <LoadingState message="음식점 데이터를 불러오는 중..." />
            </div>
          ) : error ? (
            <div className="p-8">
              <ErrorState
                error={error}
                onRetry={refetch}
                message="음식점 데이터를 불러올 수 없습니다"
              />
            </div>
          ) : !data?.items?.length ? (
            <div className="p-8">
              <EmptyState
                type="search"
                message={
                  searchName || searchRegion
                    ? '검색 결과가 없습니다'
                    : '등록된 음식점이 없습니다'
                }
                description={
                  searchName || searchRegion
                    ? '다른 검색어로 시도해보세요'
                    : '새로운 음식점을 등록해주세요'
                }
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">음식점명</TableHead>
                    <TableHead>지역</TableHead>
                    <TableHead>영업시간</TableHead>
                    <TableHead>가격대</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead className="w-[100px]">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.filter(hasValidData).map((restaurant) => (
                    <TableRow key={restaurant.content_id}>
                      <TableCell>
                        <div className="space-y-1">
                          <Link
                            to={`/restaurants/${restaurant.content_id}`}
                            className="text-primary font-medium hover:underline"
                          >
                            {formatTableValue(restaurant.restaurant_name)}
                          </Link>
                          {restaurant.description && (
                            <p className="text-muted-foreground line-clamp-2 max-w-[300px] text-xs">
                              {restaurant.description.length > 80
                                ? `${restaurant.description.substring(0, 80)}...`
                                : restaurant.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {REGION_MAP[restaurant.region_code] || restaurant.region_code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {restaurant.business_hours || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatTableValue(restaurant.price_range)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatTel(restaurant.tel)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(restaurant)}
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteId(restaurant.content_id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 페이지네이션 */}
              <div className="border-t p-4">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">
                    총 {data?.total || 0}개 중{' '}
                    {Math.min(offset + 1, data?.total || 0)}-
                    {Math.min(offset + limit, data?.total || 0)}개 표시
                  </div>
                  {renderPagination()}
                </div>
              </div>
            </>
          )}
        </StyledCardContent>
      </StyledCard>

      {/* 등록/수정 다이얼로그 */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editData ? '음식점 수정' : '음식점 등록'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="restaurant_name" className="text-sm font-medium">
                  음식점명
                </label>
                <Input
                  id="restaurant_name"
                  name="restaurant_name"
                  value={form.restaurant_name}
                  onChange={handleChange}
                  placeholder="음식점명"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="region_code" className="text-sm font-medium">
                  지역
                </label>
                <Select
                  value={form.region_code}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, region_code: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="지역 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGION_OPTIONS.map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="business_hours" className="text-sm font-medium">
                  영업시간
                </label>
                <Input
                  id="business_hours"
                  name="business_hours"
                  value={form.business_hours}
                  onChange={handleChange}
                  placeholder="예: 11:00~22:00"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="tel" className="text-sm font-medium">
                  연락처
                </label>
                <Input
                  id="tel"
                  name="tel"
                  value={form.tel}
                  onChange={handleChange}
                  placeholder="예: 02-1234-5678"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="price_range" className="text-sm font-medium">
                  가격대
                </label>
                <Input
                  id="price_range"
                  name="price_range"
                  value={form.price_range}
                  onChange={handleChange}
                  placeholder="예: 1만원~2만원"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="category_name" className="text-sm font-medium">
                  음식 종류
                </label>
                <Input
                  id="category_name"
                  name="category_name"
                  value={form.category_name}
                  onChange={handleChange}
                  placeholder="예: 한식, 중식, 일식"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="latitude" className="text-sm font-medium">
                  위도
                </label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="37.5665"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="longitude" className="text-sm font-medium">
                  경도
                </label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="126.9780"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">
                주소
              </label>
              <Input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="전체 주소"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="menu" className="text-sm font-medium">
                대표 메뉴
              </label>
              <Input
                id="menu"
                name="menu"
                value={form.menu}
                onChange={handleChange}
                placeholder="예: 갈비탕, 비빔밥, 김치찌개"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                설명
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="음식점에 대한 설명을 입력하세요"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="image_url" className="text-sm font-medium">
                대표 이미지 URL
              </label>
              <Input
                id="image_url"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="이미지 URL"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  취소
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {editData ? '수정' : '등록'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 음식점이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}