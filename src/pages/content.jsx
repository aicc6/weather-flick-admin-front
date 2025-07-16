import { useState, useEffect } from 'react'
import {
  useGetTravelCoursesQuery,
  useCreateTravelCourseMutation,
  useDeleteTravelCourseMutation,
  useGetFestivalEventsQuery,
  useCreateFestivalEventMutation,
  useUpdateFestivalEventMutation,
  useDeleteFestivalEventMutation,
  useGetLeisureSportsQuery,
  useCreateLeisureSportMutation,
  useUpdateLeisureSportMutation,
  useDeleteLeisureSportMutation,
} from '@/store/api/contentApi'
import {
  useGetTravelPlansQuery,
  useCreateTravelPlanMutation,
  useUpdateTravelPlanMutation,
  useDeleteTravelPlanMutation,
} from '@/store/api/travelPlansApi'
import TouristAttractionSection from './TouristAttractionSection'

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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageContainer, PageHeader } from '@/layouts'
import {
  LoadingState,
  EmptyState,
  ErrorState,
  StyledCard,
  StyledCardContent,
} from '@/components/common'

const REGION_OPTIONS = Object.entries(REGION_MAP)

const TABS = [
  { key: 'course', label: '여행 코스 관리' },
  { key: 'plan', label: '여행 계획 관리' },
  { key: 'festival', label: '콘텐츠 관리' },
]

export const ContentPage = () => {
  const [activeTab, setActiveTab] = useState('course')

  return (
    <PageContainer>
      <PageHeader
        title="콘텐츠 관리"
        description="여행 코스, 여행 계획, 축제 이벤트 및 레저 스포츠 시설을 관리합니다."
      />

      {/* 탭 네비게이션 */}
      <div className="mb-6">
        <div className="border-border border-b">
          <nav className="-mb-px flex space-x-8">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground border-transparent hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'course' && <TravelCoursesSection />}
      {activeTab === 'plan' && <TravelPlansSection />}
      {activeTab === 'festival' && (
        <Tabs defaultValue="event" className="space-y-6">
          <TabsList>
            <TabsTrigger value="event">축제 이벤트</TabsTrigger>
            <TabsTrigger value="leisure">레저 스포츠</TabsTrigger>
            <TabsTrigger value="attraction">관광지</TabsTrigger>
          </TabsList>
          <TabsContent value="event">
            <FestivalEventSection />
          </TabsContent>
          <TabsContent value="leisure">
            <LeisureSportsSection />
          </TabsContent>
          <TabsContent value="attraction">
            <TouristAttractionSection />
          </TabsContent>
        </Tabs>
      )}
    </PageContainer>
  )
}

function TravelCoursesSection() {
  const [searchCourseName, setSearchCourseName] = useState('')
  const [searchRegion, setSearchRegion] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({ course_name: '', region_code: '' })
  const [page, setPage] = useState(1)
  const limit = 20
  const offset = (page - 1) * limit

  const { data, isLoading, error, refetch } = useGetTravelCoursesQuery({
    limit,
    offset,
    course_name: searchCourseName,
    region: searchRegion,
  })
  const [createTravelCourse, { isLoading: isCreating }] =
    useCreateTravelCourseMutation()
  const [deleteTravelCourse, { isLoading: isDeleting }] =
    useDeleteTravelCourseMutation()
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    setPage(1)
  }, [searchCourseName, searchRegion])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    refetch()
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await createTravelCourse(form)
      setForm({ course_name: '', region_code: '' })
      setAddOpen(false)
      refetch()
    } catch (err) {
      setErrorMsg(err.message || '추가 실패')
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteTravelCourse(deleteId)
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
                    코스명
                  </label>
                  <Input
                    id="search-name"
                    placeholder="코스명 검색..."
                    value={searchCourseName}
                    onChange={(e) => setSearchCourseName(e.target.value)}
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

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  코스 등록
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>여행코스 등록</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="course-name"
                      className="text-sm font-medium"
                    >
                      코스명
                    </label>
                    <Input
                      id="course-name"
                      placeholder="코스명을 입력하세요"
                      value={form.course_name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, course_name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="region-code"
                      className="text-sm font-medium"
                    >
                      지역
                    </label>
                    <Select
                      value={form.region_code}
                      onValueChange={(value) =>
                        setForm((f) => ({ ...f, region_code: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="지역을 선택하세요" />
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
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        취소
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isCreating}>
                      등록
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </StyledCardContent>
      </StyledCard>

      {/* 테이블 */}
      <StyledCard>
        <StyledCardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <LoadingState message="여행코스 데이터를 불러오는 중..." />
            </div>
          ) : error ? (
            <div className="p-8">
              <ErrorState
                error={error}
                onRetry={refetch}
                message="여행코스 데이터를 불러올 수 없습니다"
              />
            </div>
          ) : !data?.items?.length ? (
            <div className="p-8">
              <EmptyState
                type="search"
                message={
                  searchCourseName || searchRegion
                    ? '검색 결과가 없습니다'
                    : '등록된 여행코스가 없습니다'
                }
                description={
                  searchCourseName || searchRegion
                    ? '다른 검색어로 시도해보세요'
                    : '새로운 여행코스를 등록해주세요'
                }
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">이미지</TableHead>
                    <TableHead className="min-w-[200px]">코스명</TableHead>
                    <TableHead>지역</TableHead>
                    <TableHead>테마</TableHead>
                    <TableHead>거리</TableHead>
                    <TableHead>소요시간</TableHead>
                    <TableHead>난이도</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead className="w-[100px]">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((course) => (
                    <TableRow key={course.content_id}>
                      <TableCell className="w-16">
                        {course.first_image ? (
                          <img
                            src={course.first_image}
                            alt={course.course_name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-lg text-xs">
                            이미지 없음
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Link
                            to={`/content/${course.content_id}`}
                            className="text-primary font-medium hover:underline"
                          >
                            {course.course_name}
                          </Link>
                          {course.overview && (
                            <p className="text-muted-foreground line-clamp-2 max-w-[300px] text-xs">
                              {course.overview.length > 80
                                ? `${course.overview.substring(0, 80)}...`
                                : course.overview}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {REGION_MAP[course.region_code] || course.region_code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {course.course_theme || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {course.course_distance || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {course.required_time || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {course.difficulty_level ? (
                          <Badge
                            variant={
                              course.difficulty_level === '쉬움'
                                ? 'default'
                                : course.difficulty_level === '보통'
                                  ? 'secondary'
                                  : course.difficulty_level === '어려움'
                                    ? 'destructive'
                                    : 'outline'
                            }
                          >
                            {course.difficulty_level}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {course.created_at
                          ? course.created_at.split('T')[0]
                          : '-'}
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
                              onClick={() => setDeleteId(course.content_id)}
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

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 여행코스가 영구적으로 삭제됩니다.
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

function TravelPlansSection() {
  const [page, setPage] = useState(1)
  const [searchTitle, setSearchTitle] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
  const limit = 12
  const skip = (page - 1) * limit

  const {
    data: plans = [],
    isLoading,
    error,
    refetch,
  } = useGetTravelPlansQuery({ skip, limit })
  const [createTravelPlan] = useCreateTravelPlanMutation()
  const [updateTravelPlan] = useUpdateTravelPlanMutation()
  const [deleteTravelPlan] = useDeleteTravelPlanMutation()
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: '',
    status: 'PLANNING',
    participants: '',
    transportation: '',
    start_location: '',
  })

  // 검색 필터링
  const filteredPlans = plans.filter((plan) => {
    const matchesTitle =
      !searchTitle ||
      plan.title.toLowerCase().includes(searchTitle.toLowerCase())
    const matchesStatus = !searchStatus || plan.status === searchStatus
    return matchesTitle && matchesStatus
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    refetch()
  }

  const handleOpenCreate = () => {
    setEditData(null)
    setForm({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      budget: '',
      status: 'PLANNING',
      participants: '',
      transportation: '',
      start_location: '',
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (plan) => {
    setEditData(plan)
    setForm({
      ...plan,
      start_date: plan.start_date?.slice(0, 10) || '',
      end_date: plan.end_date?.slice(0, 10) || '',
      budget: plan.budget ?? '',
      participants: plan.participants ?? '',
    })
    setModalOpen(true)
  }

  const _handleCloseModal = () => {
    setModalOpen(false)
    setEditData(null)
    setErrorMsg(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editData) {
        await updateTravelPlan({ plan_id: editData.plan_id, data: form })
      } else {
        await createTravelPlan({
          ...form,
          user_id: 'd6809797-2fe2-4ed1-a87a-3eea5db278d2',
        })
      }
      setModalOpen(false)
      refetch()
    } catch (err) {
      setErrorMsg(err.message || '저장 실패')
    }
  }

  const handleDelete = async (plan_id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    try {
      await deleteTravelPlan(plan_id)
      refetch()
    } catch (err) {
      setErrorMsg(err.message || '삭제 실패')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNING':
        return 'bg-blue-100 text-blue-800'
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PLANNING':
        return '계획중'
      case 'CONFIRMED':
        return '확정'
      case 'COMPLETED':
        return '완료'
      case 'CANCELLED':
        return '취소'
      default:
        return status
    }
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
                  <label htmlFor="search-title" className="text-sm font-medium">
                    제목
                  </label>
                  <Input
                    id="search-title"
                    placeholder="제목 검색..."
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="search-status"
                    className="text-sm font-medium"
                  >
                    상태
                  </label>
                  <Select value={searchStatus} onValueChange={setSearchStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="전체 상태" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="PLANNING">계획중</SelectItem>
                      <SelectItem value="CONFIRMED">확정</SelectItem>
                      <SelectItem value="COMPLETED">완료</SelectItem>
                      <SelectItem value="CANCELLED">취소</SelectItem>
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
              계획 등록
            </Button>
          </div>
        </StyledCardContent>
      </StyledCard>

      {/* 테이블 */}
      <StyledCard>
        <StyledCardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <LoadingState message="여행 계획 데이터를 불러오는 중..." />
            </div>
          ) : error ? (
            <div className="p-8">
              <ErrorState
                error={error}
                onRetry={refetch}
                message="여행 계획 데이터를 불러올 수 없습니다"
              />
            </div>
          ) : !filteredPlans.length ? (
            <div className="p-8">
              <EmptyState
                type="search"
                message={
                  searchTitle || searchStatus
                    ? '검색 결과가 없습니다'
                    : '등록된 여행 계획이 없습니다'
                }
                description={
                  searchTitle || searchStatus
                    ? '다른 검색어로 시도해보세요'
                    : '새로운 여행 계획을 등록해주세요'
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제목</TableHead>
                  <TableHead>기간</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>예산</TableHead>
                  <TableHead>참여인원</TableHead>
                  <TableHead className="w-[100px]">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.plan_id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{plan.title}</div>
                        {plan.description && (
                          <div className="text-muted-foreground line-clamp-2 text-sm">
                            {plan.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {plan.start_date} ~ {plan.end_date}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(plan.status)}>
                        {getStatusLabel(plan.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {plan.budget || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {plan.participants || '-'}
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
                            onClick={() => handleOpenEdit(plan)}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(plan.plan_id)}
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
          )}
        </StyledCardContent>
      </StyledCard>

      {/* 등록/수정 다이얼로그 */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editData ? '여행 계획 수정' : '여행 계획 등록'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  제목
                </label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="여행 제목"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  상태
                </label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">계획중</SelectItem>
                    <SelectItem value="CONFIRMED">확정</SelectItem>
                    <SelectItem value="COMPLETED">완료</SelectItem>
                    <SelectItem value="CANCELLED">취소</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="start_date" className="text-sm font-medium">
                  시작일
                </label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="end_date" className="text-sm font-medium">
                  종료일
                </label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="budget" className="text-sm font-medium">
                  예산
                </label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="예산 (원)"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="participants" className="text-sm font-medium">
                  참여인원
                </label>
                <Input
                  id="participants"
                  name="participants"
                  type="number"
                  value={form.participants}
                  onChange={handleChange}
                  placeholder="참여인원 (명)"
                />
              </div>
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
                placeholder="여행 계획에 대한 설명을 입력하세요"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
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
    </div>
  )
}

function FestivalEventSection() {
  const [page, setPage] = useState(1)
  const limit = 15
  const offset = (page - 1) * limit
  const [searchName, setSearchName] = useState('')
  const [searchRegion, setSearchRegion] = useState('')

  const { data, isLoading, error, refetch } = useGetFestivalEventsQuery({
    skip: offset,
    limit,
    event_name: searchName,
    region_code: searchRegion,
  })

  const [createFestivalEvent] = useCreateFestivalEventMutation()
  const [updateFestivalEvent] = useUpdateFestivalEventMutation()
  const [deleteFestivalEvent] = useDeleteFestivalEventMutation()
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState({
    event_name: '',
    region_code: '',
    event_start_date: '',
    event_end_date: '',
    event_place: '',
    tel: '',
    first_image: '',
  })
  const [errorMsg, setErrorMsg] = useState(null)

  // 페이지네이션
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
      event_name: '',
      region_code: '',
      event_start_date: '',
      event_end_date: '',
      event_place: '',
      tel: '',
      first_image: '',
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (row) => {
    setEditData(row)
    setForm({ ...row })
    setModalOpen(true)
  }

  const _handleCloseModal = () => {
    setModalOpen(false)
    setEditData(null)
    setErrorMsg(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editData) {
        await updateFestivalEvent({
          content_id: editData.content_id,
          data: form,
        })
      } else {
        await createFestivalEvent(form)
      }
      setModalOpen(false)
      refetch()
    } catch (err) {
      setErrorMsg(err.message || '저장 실패')
    }
  }

  const handleDelete = async (content_id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    try {
      await deleteFestivalEvent(content_id)
      refetch()
    } catch (err) {
      setErrorMsg(err.message || '삭제 실패')
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label
                    htmlFor="search-event-name"
                    className="text-sm font-medium"
                  >
                    축제명
                  </label>
                  <Input
                    id="search-event-name"
                    placeholder="축제명 검색..."
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
                  <Button type="submit">
                    <Search className="mr-2 h-4 w-4" />
                    검색
                  </Button>
                </div>
              </div>
            </form>

            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              축제 등록
            </Button>
          </div>
        </StyledCardContent>
      </StyledCard>

      {/* 테이블 */}
      <StyledCard>
        <StyledCardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <LoadingState message="축제 이벤트 데이터를 불러오는 중..." />
            </div>
          ) : error ? (
            <div className="p-8">
              <ErrorState
                error={error}
                onRetry={refetch}
                message="축제 이벤트 데이터를 불러올 수 없습니다"
              />
            </div>
          ) : !data?.items?.length ? (
            <div className="p-8">
              <EmptyState
                type="search"
                message={
                  searchName || searchRegion
                    ? '검색 결과가 없습니다'
                    : '등록된 축제 이벤트가 없습니다'
                }
                description={
                  searchName || searchRegion
                    ? '다른 검색어로 시도해보세요'
                    : '새로운 축제 이벤트를 등록해주세요'
                }
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이미지</TableHead>
                    <TableHead>축제명</TableHead>
                    <TableHead>지역</TableHead>
                    <TableHead>기간</TableHead>
                    <TableHead>장소</TableHead>
                    <TableHead>연락처</TableHead>
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
                            alt={row.event_name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-lg text-xs">
                            이미지 없음
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/content/festival/${row.content_id}`}
                          className="text-primary font-medium hover:underline"
                        >
                          {row.event_name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {REGION_MAP[row.region_code] || row.region_code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.event_start_date && row.event_end_date
                          ? `${row.event_start_date} ~ ${row.event_end_date}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.event_place || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.tel || '-'}
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
                              onClick={() => handleDelete(row.content_id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editData ? '축제 이벤트 수정' : '축제 이벤트 등록'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="event_name" className="text-sm font-medium">
                  축제명
                </label>
                <Input
                  id="event_name"
                  name="event_name"
                  value={form.event_name}
                  onChange={handleChange}
                  placeholder="축제명"
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
                <label
                  htmlFor="event_start_date"
                  className="text-sm font-medium"
                >
                  시작일
                </label>
                <Input
                  id="event_start_date"
                  name="event_start_date"
                  type="date"
                  value={form.event_start_date}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="event_end_date" className="text-sm font-medium">
                  종료일
                </label>
                <Input
                  id="event_end_date"
                  name="event_end_date"
                  type="date"
                  value={form.event_end_date}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="event_place" className="text-sm font-medium">
                  장소
                </label>
                <Input
                  id="event_place"
                  name="event_place"
                  value={form.event_place}
                  onChange={handleChange}
                  placeholder="행사 장소"
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
                  placeholder="연락처"
                />
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
    </div>
  )
}

function LeisureSportsSection() {
  const [page, setPage] = useState(1)
  const limit = 15
  const offset = (page - 1) * limit
  const [searchName, setSearchName] = useState('')
  const [searchRegion, setSearchRegion] = useState('')

  const { data, isLoading, error, refetch } = useGetLeisureSportsQuery({
    skip: offset,
    limit,
    facility_name: searchName,
    region_code: searchRegion,
  })

  const [createLeisureSport] = useCreateLeisureSportMutation()
  const [updateLeisureSport] = useUpdateLeisureSportMutation()
  const [deleteLeisureSport] = useDeleteLeisureSportMutation()
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState({
    facility_name: '',
    region_code: '',
    sports_type: '',
    admission_fee: '',
    parking_info: '',
    tel: '',
    first_image: '',
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
      facility_name: '',
      region_code: '',
      sports_type: '',
      admission_fee: '',
      parking_info: '',
      tel: '',
      first_image: '',
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (row) => {
    setEditData(row)
    setForm({ ...row })
    setModalOpen(true)
  }

  const _handleCloseModal = () => {
    setModalOpen(false)
    setEditData(null)
    setErrorMsg(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editData) {
        await updateLeisureSport({
          content_id: editData.content_id,
          data: form,
        })
      } else {
        await createLeisureSport(form)
      }
      setModalOpen(false)
      refetch()
    } catch (err) {
      setErrorMsg(err.message || '저장 실패')
    }
  }

  const handleDelete = async (content_id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    try {
      await deleteLeisureSport(content_id)
      refetch()
    } catch (err) {
      setErrorMsg(err.message || '삭제 실패')
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label
                    htmlFor="search-facility-name"
                    className="text-sm font-medium"
                  >
                    시설명
                  </label>
                  <Input
                    id="search-facility-name"
                    placeholder="시설명 검색..."
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
                  <Button type="submit">
                    <Search className="mr-2 h-4 w-4" />
                    검색
                  </Button>
                </div>
              </div>
            </form>

            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              시설 등록
            </Button>
          </div>
        </StyledCardContent>
      </StyledCard>

      {/* 테이블 */}
      <StyledCard>
        <StyledCardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <LoadingState message="레저 스포츠 데이터를 불러오는 중..." />
            </div>
          ) : error ? (
            <div className="p-8">
              <ErrorState
                error={error}
                onRetry={refetch}
                message="레저 스포츠 데이터를 불러올 수 없습니다"
              />
            </div>
          ) : !data?.items?.length ? (
            <div className="p-8">
              <EmptyState
                type="search"
                message={
                  searchName || searchRegion
                    ? '검색 결과가 없습니다'
                    : '등록된 레저 스포츠 시설이 없습니다'
                }
                description={
                  searchName || searchRegion
                    ? '다른 검색어로 시도해보세요'
                    : '새로운 레저 스포츠 시설을 등록해주세요'
                }
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이미지</TableHead>
                    <TableHead>시설명</TableHead>
                    <TableHead>지역</TableHead>
                    <TableHead>스포츠 종류</TableHead>
                    <TableHead>입장료</TableHead>
                    <TableHead>연락처</TableHead>
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
                            alt={row.facility_name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-lg text-xs">
                            이미지 없음
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{row.facility_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {REGION_MAP[row.region_code] || row.region_code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.sports_type || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.admission_fee || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.tel || '-'}
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
                              onClick={() => handleDelete(row.content_id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editData ? '레저 스포츠 시설 수정' : '레저 스포츠 시설 등록'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="facility_name" className="text-sm font-medium">
                  시설명
                </label>
                <Input
                  id="facility_name"
                  name="facility_name"
                  value={form.facility_name}
                  onChange={handleChange}
                  placeholder="시설명"
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
                <label htmlFor="sports_type" className="text-sm font-medium">
                  스포츠 종류
                </label>
                <Input
                  id="sports_type"
                  name="sports_type"
                  value={form.sports_type}
                  onChange={handleChange}
                  placeholder="스포츠 종류"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="admission_fee" className="text-sm font-medium">
                  입장료
                </label>
                <Input
                  id="admission_fee"
                  name="admission_fee"
                  value={form.admission_fee}
                  onChange={handleChange}
                  placeholder="입장료"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="parking_info" className="text-sm font-medium">
                  주차 정보
                </label>
                <Input
                  id="parking_info"
                  name="parking_info"
                  value={form.parking_info}
                  onChange={handleChange}
                  placeholder="주차 정보"
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
                  placeholder="연락처"
                />
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
    </div>
  )
}
export default ContentPage
