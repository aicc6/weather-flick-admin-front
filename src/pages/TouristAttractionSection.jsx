import { useState } from 'react'
import {
  useGetTouristAttractionsQuery,
  useSearchTouristAttractionsQuery,
  useCreateTouristAttractionMutation,
  useUpdateTouristAttractionMutation,
  useDeleteTouristAttractionMutation,
} from '@/store/api/touristAttractionsApi'
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
import { REGION_MAP } from '@/constants/region'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertCircle,
  Trash2,
  Edit2,
  MoreHorizontal,
  Plus,
  Search,
  MapPin,
  Image,
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
} from '@/components/common'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const REGION_OPTIONS = Object.entries(REGION_MAP)

const CATEGORY_OPTIONS = [
  { value: 'A01', label: '자연' },
  { value: 'A02', label: '문화시설' },
  { value: 'A03', label: '축제공연행사' },
  { value: 'A04', label: '여행코스' },
  { value: 'A05', label: '레포츠' },
  { value: 'B02', label: '숙박' },
  { value: 'C01', label: '쇼핑' },
]

function TouristAttractionSection() {
  const [page, setPage] = useState(1)
  const limit = 15
  const offset = (page - 1) * limit
  const [searchName, setSearchName] = useState('')
  const [searchRegion, setSearchRegion] = useState('all')
  const [isSearching, setIsSearching] = useState(false)

  // 검색 여부에 따라 다른 쿼리 사용
  const queryParams = {
    limit,
    offset,
    ...(searchName && { name: searchName }),
    ...(searchRegion &&
      searchRegion !== 'all' && { region_code: searchRegion }),
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

  const [createTouristAttraction] = useCreateTouristAttractionMutation()
  const [updateTouristAttraction] = useUpdateTouristAttractionMutation()
  const [deleteTouristAttraction] = useDeleteTouristAttractionMutation()

  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({
    content_id: '',
    attraction_name: '',
    description: '',
    address: '',
    image_url: '',
    latitude: '',
    longitude: '',
    category: '',
    region_code: '',
    detail_address: '',
    tel: '',
    zip_code: '',
    overview: '',
    directions: '',
    created_time: '',
    modified_time: '',
    map_level: '',
    booktour: false,
    first_image: '',
    first_image2: '',
    readcount: 0,
    sido_code: '',
    gugun_code: '',
  })
  const [errorMsg, setErrorMsg] = useState(null)

  // 현재 사용할 데이터 선택
  const data = isSearching ? searchData : listData
  const loading = isSearching ? searchLoading : listLoading
  const error = isSearching ? searchError : listError
  const refetch = isSearching ? refetchSearch : refetchList

  // 페이지네이션
  const total = data?.count || data?.total || 0
  const totalPages = total ? Math.ceil(total / limit) : 1

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setIsSearching(!!searchName || (!!searchRegion && searchRegion !== 'all'))
    refetch()
  }

  const handleReset = () => {
    setSearchName('')
    setSearchRegion('all')
    setIsSearching(false)
    setPage(1)
    refetchList()
  }

  const handleOpenCreate = () => {
    setEditData(null)
    setForm({
      content_id: '',
      attraction_name: '',
      description: '',
      address: '',
      image_url: '',
      latitude: '',
      longitude: '',
      category: '',
      region_code: '',
      detail_address: '',
      tel: '',
      zip_code: '',
      overview: '',
      directions: '',
      created_time: '',
      modified_time: '',
      map_level: '',
      booktour: false,
      first_image: '',
      first_image2: '',
      readcount: 0,
      sido_code: '',
      gugun_code: '',
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditData(item)
    setForm({
      content_id: item.content_id || '',
      attraction_name: item.attraction_name || '',
      description: item.description || '',
      address: item.address || '',
      image_url: item.image_url || item.first_image || '',
      latitude: item.latitude || '',
      longitude: item.longitude || '',
      category: item.category || '',
      region_code: item.region_code || '',
      detail_address: item.detail_address || '',
      tel: item.tel || '',
      zip_code: item.zip_code || '',
      overview: item.overview || '',
      directions: item.directions || '',
      created_time: item.created_time || '',
      modified_time: item.modified_time || '',
      map_level: item.map_level || '',
      booktour: item.booktour || false,
      first_image: item.first_image || '',
      first_image2: item.first_image2 || '',
      readcount: item.readcount || 0,
      sido_code: item.sido_code || '',
      gugun_code: item.gugun_code || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        readcount: parseInt(form.readcount) || 0,
      }

      if (editData) {
        await updateTouristAttraction({
          contentId: editData.content_id,
          data: submitData,
        }).unwrap()
      } else {
        await createTouristAttraction(submitData).unwrap()
      }
      setModalOpen(false)
      refetch()
    } catch (err) {
      setErrorMsg(err.data?.detail || err.message || '저장 실패')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteTouristAttraction(deleteId).unwrap()
      setDeleteId(null)
      refetch()
    } catch (err) {
      setErrorMsg(err.data?.detail || err.message || '삭제 실패')
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

    // Previous button
    pageItems.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
          className={page === 1 ? 'pointer-events-none opacity-50' : ''}
        />
      </PaginationItem>,
    )

    // First page and ellipsis
    if (start > 1) {
      pageItems.push(
        <PaginationItem key={1}>
          <PaginationLink isActive={page === 1} onClick={() => setPage(1)}>
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
          className={
            page === totalPages ? 'pointer-events-none opacity-50' : ''
          }
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
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  <Search className="mr-2 h-4 w-4" />
                  검색
                </Button>
                {(searchName || (searchRegion && searchRegion !== 'all')) && (
                  <Button type="button" variant="outline" onClick={handleReset}>
                    초기화
                  </Button>
                )}
              </div>
            </form>
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              관광지 추가
            </Button>
          </div>
        </StyledCardContent>
      </StyledCard>

      {/* 콘텐츠 */}
      {loading && <LoadingState />}
      {error && (
        <ErrorState
          message={error.data?.detail || '데이터를 불러오는데 실패했습니다.'}
          onRetry={refetch}
        />
      )}
      {!loading && !error && data && (
        <>
          {data.results?.length === 0 || data.items?.length === 0 ? (
            <EmptyState
              title="관광지가 없습니다"
              description="새로운 관광지를 추가해보세요."
              actionLabel="관광지 추가"
              onAction={handleOpenCreate}
            />
          ) : (
            <StyledCard>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">관광지명</TableHead>
                      <TableHead className="min-w-[100px]">카테고리</TableHead>
                      <TableHead className="min-w-[100px]">지역</TableHead>
                      <TableHead className="min-w-[200px]">주소</TableHead>
                      <TableHead className="text-center">이미지</TableHead>
                      <TableHead className="text-center">조회수</TableHead>
                      <TableHead className="w-[100px] text-center">
                        액션
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data.results || data.items || []).map((item) => (
                      <TableRow key={item.content_id}>
                        <TableCell className="font-medium">
                          {item.attraction_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {CATEGORY_OPTIONS.find(
                              (cat) => cat.value === item.category,
                            )?.label || item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {REGION_MAP[item.region_code] || item.region_code}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.address}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.first_image || item.image_url ? (
                            <Image className="mx-auto h-4 w-4 text-green-600" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.readcount || 0}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(item)}
                              >
                                <Edit2 className="mr-2 h-4 w-4" />
                                수정
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteId(item.content_id)}
                                className="text-red-600"
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
              </div>
            </StyledCard>
          )}
          {renderPagination()}
        </>
      )}

      {/* 추가/수정 모달 */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editData ? '관광지 수정' : '관광지 추가'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content_id">콘텐츠 ID</Label>
                <Input
                  id="content_id"
                  value={form.content_id}
                  onChange={(e) =>
                    setForm({ ...form, content_id: e.target.value })
                  }
                  placeholder="콘텐츠 ID"
                  required
                  disabled={editData}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attraction_name">관광지명</Label>
                <Input
                  id="attraction_name"
                  value={form.attraction_name}
                  onChange={(e) =>
                    setForm({ ...form, attraction_name: e.target.value })
                  }
                  placeholder="관광지명"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="관광지 설명"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    setForm({ ...form, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region_code">지역</Label>
                <Select
                  value={form.region_code}
                  onValueChange={(value) =>
                    setForm({ ...form, region_code: value })
                  }
                  required
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">주소</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="주소"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">위도</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  value={form.latitude}
                  onChange={(e) =>
                    setForm({ ...form, latitude: e.target.value })
                  }
                  placeholder="위도"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">경도</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  value={form.longitude}
                  onChange={(e) =>
                    setForm({ ...form, longitude: e.target.value })
                  }
                  placeholder="경도"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">이미지 URL</Label>
              <Input
                id="image_url"
                value={form.image_url}
                onChange={(e) =>
                  setForm({ ...form, image_url: e.target.value })
                }
                placeholder="이미지 URL"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tel">전화번호</Label>
                <Input
                  id="tel"
                  value={form.tel}
                  onChange={(e) => setForm({ ...form, tel: e.target.value })}
                  placeholder="전화번호"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">우편번호</Label>
                <Input
                  id="zip_code"
                  value={form.zip_code}
                  onChange={(e) =>
                    setForm({ ...form, zip_code: e.target.value })
                  }
                  placeholder="우편번호"
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  취소
                </Button>
              </DialogClose>
              <Button type="submit">{editData ? '수정' : '추가'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>관광지 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 관광지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default TouristAttractionSection
