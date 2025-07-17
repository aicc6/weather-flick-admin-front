import { useState } from 'react'
import {
  useGetAccommodationsQuery,
  useCreateAccommodationMutation,
  useUpdateAccommodationMutation,
  useDeleteAccommodationMutation,
  useGetAccommodationTypesQuery,
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertCircle,
  Trash2,
  Edit2,
  MoreHorizontal,
  Plus,
  Search,
  Hotel,
  MapPin,
  Phone,
  Car,
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
import { REGION_MAP } from '@/constants/region'
import {
  LoadingState,
  EmptyState,
  ErrorState,
  StyledCard,
  StyledCardContent,
} from '@/components/common'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

const REGION_OPTIONS = Object.entries(REGION_MAP)

function AccommodationSection() {
  const [page, setPage] = useState(1)
  const limit = 15
  const offset = (page - 1) * limit
  const [searchName, setSearchName] = useState('')
  const [searchRegion, setSearchRegion] = useState('')
  const [searchType, setSearchType] = useState('all')

  const { data, isLoading, error, refetch } = useGetAccommodationsQuery({
    skip: offset,
    limit,
    accommodation_name: searchName,
    region_code: searchRegion,
    accommodation_type: searchType === 'all' ? '' : searchType,
  })

  const { data: accommodationTypes } = useGetAccommodationTypesQuery()

  const [createAccommodation] = useCreateAccommodationMutation()
  const [updateAccommodation] = useUpdateAccommodationMutation()
  const [deleteAccommodation] = useDeleteAccommodationMutation()
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({
    accommodation_name: '',
    region_code: '',
    accommodation_type: '',
    address: '',
    detail_address: '',
    zipcode: '',
    tel: '',
    homepage: '',
    latitude: '',
    longitude: '',
    room_count: '',
    parking: false,
    check_in_time: '',
    check_out_time: '',
    amenities: '',
    first_image: '',
    overview: '',
  })
  const [errorMsg, setErrorMsg] = useState(null)

  const total = data?.total || 0
  const totalPages = total ? Math.ceil(total / limit) : 1

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    refetch()
  }

  const handleOpenCreate = () => {
    setEditData(null)
    setForm({
      accommodation_name: '',
      region_code: '',
      accommodation_type: '',
      address: '',
      detail_address: '',
      zipcode: '',
      tel: '',
      homepage: '',
      latitude: '',
      longitude: '',
      room_count: '',
      parking: false,
      check_in_time: '',
      check_out_time: '',
      amenities: '',
      first_image: '',
      overview: '',
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (row) => {
    setEditData(row)
    setForm({
      accommodation_name: row.accommodation_name || '',
      region_code: row.region_code || '',
      accommodation_type: row.accommodation_type || '',
      address: row.address || '',
      detail_address: row.detail_address || '',
      zipcode: row.zipcode || '',
      tel: row.tel || '',
      homepage: row.homepage || '',
      latitude: row.latitude || '',
      longitude: row.longitude || '',
      room_count: row.room_count || '',
      parking: row.parking || false,
      check_in_time: row.check_in_time || '',
      check_out_time: row.check_out_time || '',
      amenities: row.amenities || '',
      first_image: row.first_image || '',
      overview: row.overview || '',
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
      const submitData = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        room_count: form.room_count ? parseInt(form.room_count) : null,
      }

      if (editData) {
        await updateAccommodation({
          content_id: editData.content_id,
          data: submitData,
        })
      } else {
        await createAccommodation(submitData)
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
        await deleteAccommodation(deleteId)
        setDeleteId(null)
        refetch()
      } catch (err) {
        setErrorMsg(err.message || '삭제 실패')
      }
    }
  }

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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
                <div className="space-y-2">
                  <label htmlFor="search-type" className="text-sm font-medium">
                    유형
                  </label>
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger>
                      <SelectValue placeholder="전체 유형" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      {accommodationTypes?.map((type) => (
                        <SelectItem key={type.code} value={type.code}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 lg:items-end">
                  <Button type="submit">
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
                  searchName || searchRegion || searchType
                    ? '검색 결과가 없습니다'
                    : '등록된 숙박시설이 없습니다'
                }
                description={
                  searchName || searchRegion || searchType
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
                    <TableHead>이미지</TableHead>
                    <TableHead>숙박시설명</TableHead>
                    <TableHead>지역</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>주소</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>객실수</TableHead>
                    <TableHead>주차</TableHead>
                    <TableHead className="w-[100px]">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((row) => (
                    <TableRow key={row.content_id}>
                      <TableCell className="w-16">
                        {row.first_image ? (
                          <img
                            src={row.first_image}
                            alt={row.accommodation_name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-lg">
                            <Hotel className="h-6 w-6" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {row.accommodation_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {REGION_MAP[row.region_code] || row.region_code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {accommodationTypes?.find(
                          (t) => t.code === row.accommodation_type,
                        )?.name ||
                          row.accommodation_type ||
                          '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex max-w-[200px] items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{row.address || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.tel ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {row.tel}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.room_count || '-'}
                      </TableCell>
                      <TableCell>
                        {row.parking ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <Car className="h-3 w-3" />
                            <span className="text-xs">가능</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            불가
                          </span>
                        )}
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
                              onClick={() => handleOpenEdit(row)}
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteId(row.content_id)}
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
                    총 {total}개 중 {Math.min(offset + 1, total)}-
                    {Math.min(offset + limit, total)}개 표시
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editData ? '숙박시설 수정' : '숙박시설 등록'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="accommodation_name"
                  className="text-sm font-medium"
                >
                  숙박시설명 *
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
                  지역 *
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
                <label
                  htmlFor="accommodation_type"
                  className="text-sm font-medium"
                >
                  숙박시설 유형
                </label>
                <Select
                  value={form.accommodation_type}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, accommodation_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {accommodationTypes?.map((type) => (
                      <SelectItem key={type.code} value={type.code}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="room_count" className="text-sm font-medium">
                  객실 수
                </label>
                <Input
                  id="room_count"
                  name="room_count"
                  type="number"
                  value={form.room_count}
                  onChange={handleChange}
                  placeholder="객실 수"
                  min="0"
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
                placeholder="주소"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="detail_address" className="text-sm font-medium">
                  상세 주소
                </label>
                <Input
                  id="detail_address"
                  name="detail_address"
                  value={form.detail_address}
                  onChange={handleChange}
                  placeholder="상세 주소"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="zipcode" className="text-sm font-medium">
                  우편번호
                </label>
                <Input
                  id="zipcode"
                  name="zipcode"
                  value={form.zipcode}
                  onChange={handleChange}
                  placeholder="우편번호"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="tel" className="text-sm font-medium">
                  연락처
                </label>
                <Input
                  id="tel"
                  name="tel"
                  value={form.tel}
                  onChange={handleChange}
                  placeholder="연락처"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="homepage" className="text-sm font-medium">
                  홈페이지
                </label>
                <Input
                  id="homepage"
                  name="homepage"
                  value={form.homepage}
                  onChange={handleChange}
                  placeholder="홈페이지 URL"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="latitude" className="text-sm font-medium">
                  위도
                </label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="0.000001"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="위도"
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
                  step="0.000001"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="경도"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="parking"
                  checked={form.parking}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, parking: checked }))
                  }
                />
                <label
                  htmlFor="parking"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  주차 가능
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="amenities" className="text-sm font-medium">
                편의시설
              </label>
              <Textarea
                id="amenities"
                name="amenities"
                value={form.amenities}
                onChange={handleChange}
                placeholder="편의시설 (쉼표로 구분)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="first_image" className="text-sm font-medium">
                대표 이미지 URL
              </label>
              <Input
                id="first_image"
                name="first_image"
                value={form.first_image}
                onChange={handleChange}
                placeholder="이미지 URL"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="overview" className="text-sm font-medium">
                개요
              </label>
              <Textarea
                id="overview"
                name="overview"
                value={form.overview}
                onChange={handleChange}
                placeholder="숙박시설 설명"
                rows={4}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  취소
                </Button>
              </DialogClose>
              <Button type="submit">{editData ? '수정' : '등록'}</Button>
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
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AccommodationSection
