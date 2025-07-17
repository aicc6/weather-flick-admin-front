import { useState } from 'react'
import {
  useGetRestaurantsQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
  useGetCuisineTypesQuery,
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
  Utensils,
  Phone,
  CreditCard,
  Car,
  Package,
  Truck,
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

function RestaurantSection() {
  const [page, setPage] = useState(1)
  const limit = 15
  const offset = (page - 1) * limit
  const [searchName, setSearchName] = useState('')
  const [searchRegion, setSearchRegion] = useState('')
  const [searchCuisineType, setSearchCuisineType] = useState('all')

  const { data, isLoading, error, refetch } = useGetRestaurantsQuery({
    skip: offset,
    limit,
    restaurant_name: searchName,
    region_code: searchRegion,
    cuisine_type: searchCuisineType === 'all' ? '' : searchCuisineType,
  })

  const { data: cuisineTypes } = useGetCuisineTypesQuery()

  const [createRestaurant] = useCreateRestaurantMutation()
  const [updateRestaurant] = useUpdateRestaurantMutation()
  const [deleteRestaurant] = useDeleteRestaurantMutation()
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({
    restaurant_name: '',
    region_code: '',
    category_code: '',
    sub_category_code: '',
    address: '',
    detail_address: '',
    zipcode: '',
    tel: '',
    homepage: '',
    latitude: '',
    longitude: '',
    cuisine_type: '',
    specialty_dish: '',
    operating_hours: '',
    rest_date: '',
    parking: false,
    credit_card: false,
    smoking: false,
    takeout: false,
    delivery: false,
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
      restaurant_name: '',
      region_code: '',
      category_code: '',
      sub_category_code: '',
      address: '',
      detail_address: '',
      zipcode: '',
      tel: '',
      homepage: '',
      latitude: '',
      longitude: '',
      cuisine_type: '',
      specialty_dish: '',
      operating_hours: '',
      rest_date: '',
      parking: false,
      credit_card: false,
      smoking: false,
      takeout: false,
      delivery: false,
      first_image: '',
      overview: '',
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (row) => {
    setEditData(row)
    setForm({
      restaurant_name: row.restaurant_name || '',
      region_code: row.region_code || '',
      category_code: row.category_code || '',
      sub_category_code: row.sub_category_code || '',
      address: row.address || '',
      detail_address: row.detail_address || '',
      zipcode: row.zipcode || '',
      tel: row.tel || '',
      homepage: row.homepage || '',
      latitude: row.latitude || '',
      longitude: row.longitude || '',
      cuisine_type: row.cuisine_type || '',
      specialty_dish: row.specialty_dish || '',
      operating_hours: row.operating_hours || '',
      rest_date: row.rest_date || '',
      parking: row.parking || false,
      credit_card: row.credit_card || false,
      smoking: row.smoking || false,
      takeout: row.takeout || false,
      delivery: row.delivery || false,
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
      }

      if (editData) {
        await updateRestaurant({
          content_id: editData.content_id,
          data: submitData,
        })
      } else {
        await createRestaurant(submitData)
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
        await deleteRestaurant(deleteId)
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
                <div className="space-y-2">
                  <label
                    htmlFor="search-cuisine"
                    className="text-sm font-medium"
                  >
                    음식 종류
                  </label>
                  <Select
                    value={searchCuisineType}
                    onValueChange={setSearchCuisineType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="전체 종류" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      {cuisineTypes?.map((type) => (
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
                  searchName || searchRegion || searchCuisineType
                    ? '검색 결과가 없습니다'
                    : '등록된 음식점이 없습니다'
                }
                description={
                  searchName || searchRegion || searchCuisineType
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
                    <TableHead>이미지</TableHead>
                    <TableHead>음식점명</TableHead>
                    <TableHead>지역</TableHead>
                    <TableHead>음식 종류</TableHead>
                    <TableHead>대표 메뉴</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>서비스</TableHead>
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
                            alt={row.restaurant_name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-lg">
                            <Utensils className="h-6 w-6" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{row.restaurant_name}</div>
                        <div className="text-muted-foreground max-w-[200px] truncate text-xs">
                          {row.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {REGION_MAP[row.region_code] || row.region_code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {cuisineTypes?.find((t) => t.code === row.cuisine_type)
                          ?.name ||
                          row.cuisine_type ||
                          '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.specialty_dish || '-'}
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
                      <TableCell>
                        <div className="flex gap-1">
                          {row.parking && (
                            <div className="text-green-600" title="주차 가능">
                              <Car className="h-4 w-4" />
                            </div>
                          )}
                          {row.credit_card && (
                            <div className="text-blue-600" title="카드 가능">
                              <CreditCard className="h-4 w-4" />
                            </div>
                          )}
                          {row.takeout && (
                            <div className="text-orange-600" title="포장 가능">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                          {row.delivery && (
                            <div className="text-purple-600" title="배달 가능">
                              <Truck className="h-4 w-4" />
                            </div>
                          )}
                        </div>
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
              {editData ? '음식점 수정' : '음식점 등록'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="restaurant_name"
                  className="text-sm font-medium"
                >
                  음식점명 *
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
                <label htmlFor="cuisine_type" className="text-sm font-medium">
                  음식 종류
                </label>
                <Select
                  value={form.cuisine_type}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, cuisine_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="음식 종류 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuisineTypes?.map((type) => (
                      <SelectItem key={type.code} value={type.code}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="specialty_dish" className="text-sm font-medium">
                  대표 메뉴
                </label>
                <Input
                  id="specialty_dish"
                  name="specialty_dish"
                  value={form.specialty_dish}
                  onChange={handleChange}
                  placeholder="대표 메뉴"
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
                <label
                  htmlFor="operating_hours"
                  className="text-sm font-medium"
                >
                  영업 시간
                </label>
                <Input
                  id="operating_hours"
                  name="operating_hours"
                  value={form.operating_hours}
                  onChange={handleChange}
                  placeholder="예: 10:00-22:00"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="rest_date" className="text-sm font-medium">
                  휴무일
                </label>
                <Input
                  id="rest_date"
                  name="rest_date"
                  value={form.rest_date}
                  onChange={handleChange}
                  placeholder="예: 매주 월요일"
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

            <div className="space-y-4">
              <div className="text-sm font-medium">서비스 옵션</div>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="flex items-center space-x-2">
                  <Switch
                    id="credit_card"
                    checked={form.credit_card}
                    onCheckedChange={(checked) =>
                      setForm((f) => ({ ...f, credit_card: checked }))
                    }
                  />
                  <label
                    htmlFor="credit_card"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    신용카드 가능
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="smoking"
                    checked={form.smoking}
                    onCheckedChange={(checked) =>
                      setForm((f) => ({ ...f, smoking: checked }))
                    }
                  />
                  <label
                    htmlFor="smoking"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    흡연 가능
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="takeout"
                    checked={form.takeout}
                    onCheckedChange={(checked) =>
                      setForm((f) => ({ ...f, takeout: checked }))
                    }
                  />
                  <label
                    htmlFor="takeout"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    포장 가능
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="delivery"
                    checked={form.delivery}
                    onCheckedChange={(checked) =>
                      setForm((f) => ({ ...f, delivery: checked }))
                    }
                  />
                  <label
                    htmlFor="delivery"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    배달 가능
                  </label>
                </div>
              </div>
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
                placeholder="음식점 설명"
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
              이 작업은 되돌릴 수 없습니다. 음식점이 영구적으로 삭제됩니다.
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

export default RestaurantSection
