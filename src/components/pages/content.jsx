import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { PermissionGuard } from '../common/PermissionGuard'
import { PERMISSIONS } from '../../constants/permissions'
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
  useGetFestivalEventNamesQuery,
  useGetLeisureFacilityNamesQuery,
} from '../../store/api/contentApi'
import {
  useGetTravelPlansQuery,
  useCreateTravelPlanMutation,
  useUpdateTravelPlanMutation,
  useDeleteTravelPlanMutation,
} from '../../store/api/travelPlansApi'
import { Card, CardContent } from '../ui/card'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '../ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../ui/alert-dialog'
import { Link } from 'react-router-dom'
import { REGION_MAP } from '../../constants/region'
const REGION_OPTIONS = Object.entries(REGION_MAP)
import { Alert, AlertDescription } from '../ui/alert'
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '../ui/pagination'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'

const TABS = [
  { key: 'course', label: '여행 코스 관리' },
  { key: 'plan', label: '여행 계획 관리' },
  { key: 'festival', label: '콘텐츠 관리' },
]

export const ContentPage = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('course')
  const [searchCourseName, setSearchCourseName] = useState('')
  const [searchRegion, setSearchRegion] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({ course_name: '', region_code: '' })
  // 페이지네이션 상태 추가
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
  const [suggestions, setSuggestions] = useState([])
  const allCourseNames = data?.items?.map((c) => c.course_name) || []

  function handleCourseNameChange(e) {
    const value = e.target.value
    setSearchCourseName(value)
    if (value.length > 0) {
      setSuggestions(
        allCourseNames
          .filter((name) => name.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 5),
      )
    } else {
      setSuggestions([])
    }
  }

  useEffect(() => {
    setPage(1)
  }, [searchCourseName, searchRegion])

  // 지역명으로 필터링 (API에서 처리하므로 불필요)
  const filtered = data?.items || []

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

  // 페이지네이션 버튼 핸들러
  const handlePrev = () => setPage((p) => Math.max(1, p - 1))
  const handleNext = () => {
    if (data && offset + limit < data.total) setPage((p) => p + 1)
  }

  // 페이지네이션 렌더링 함수 (관광지 관리와 동일 스타일)
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
          <PaginationLink
            isActive={page === 1}
            onClick={() => setPage(1)}
            size="default"
          >
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
          <PaginationLink
            isActive={i === page}
            onClick={() => setPage(i)}
            size="default"
          >
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
            size="default"
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
    <PermissionGuard
      permission={PERMISSIONS.CONTENT_READ}
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-2 text-lg text-red-600">
              접근 권한이 없습니다
            </div>
            <p className="text-muted-foreground">
              이 페이지는 콘텐츠 관리 권한이 필요합니다.
            </p>
          </div>
        </div>
      }
    >
      <div className="mx-auto max-w-5xl space-y-8 py-8">
        {/* 탭 UI */}
        <div className="mb-6 flex gap-2 border-b">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`px-4 py-2 font-semibold transition-colors focus:outline-none ${activeTab === tab.key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* 섹션별 내용 */}
        {activeTab === 'course' && (
          <>
            {/* 상단 제목/설명 */}
            <div className="mb-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                  여행코스 관리
                </h2>
                <p className="mt-1 text-gray-500">
                  여행코스 정보를 등록, 수정, 삭제하고 검색할 수 있습니다.
                </p>
              </div>
              {errorMsg && (
                <Button
                  onClick={() => {
                    setErrorMsg(null)
                    refetch()
                  }}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  재시도
                </Button>
              )}
            </div>
            {/* 에러 알림 */}
            {errorMsg && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}
            {/* 검색/등록 카드 */}
            <Card className="border border-gray-200 shadow-md">
              <CardContent>
                <div className="mb-2">
                  <div className="text-lg font-bold">검색 및 등록</div>
                  <div className="text-sm text-gray-500">
                    여행코스 정보를 검색하거나 새로 등록하세요.
                  </div>
                </div>
                <form
                  className="grid grid-cols-1 items-end gap-3 md:grid-cols-5"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setPage(1)
                    // 검색은 입력값 그대로 사용
                  }}
                >
                  <div className="relative flex flex-col gap-1 md:col-span-2">
                    <label
                      htmlFor="search-course-name"
                      className="mb-1 text-xs text-gray-500"
                    >
                      코스명
                    </label>
                    <input
                      id="search-course-name"
                      className="rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                      placeholder={t('content.course_name_placeholder')}
                      value={searchCourseName}
                      onChange={handleCourseNameChange}
                      autoComplete="off"
                    />
                    {suggestions.length > 0 && (
                      <ul className="absolute top-full right-0 left-0 z-10 mt-1 w-full rounded border bg-white shadow">
                        {suggestions.map((name, idx) => (
                          <li
                            key={idx}
                            className="cursor-pointer px-3 py-1 text-sm hover:bg-blue-100"
                            onClick={() => {
                              setSearchCourseName(name)
                              setSuggestions([])
                            }}
                          >
                            {name}
                          </li>
                        ))}
                      </ul>
                    )}
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
                      value={searchRegion}
                      onChange={(e) => setSearchRegion(e.target.value)}
                    >
                      <option value="">전체</option>
                      {REGION_OPTIONS.map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 md:col-span-1 md:justify-end">
                    <button
                      type="button"
                      disabled={isLoading}
                      className="rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
                      onClick={() => {
                        setPage(1)
                        refetch()
                      }}
                    >
                      검색
                    </button>
                    <Dialog open={addOpen} onOpenChange={setAddOpen}>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          disabled={isLoading}
                          className="rounded border border-blue-600 px-4 py-2 font-semibold text-blue-600 shadow transition hover:bg-blue-50 disabled:opacity-50"
                        >
                          여행코스 등록
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>여행코스 추가</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4">
                          <Input
                            required
                            placeholder={t('content.course_name_placeholder')}
                            value={form.course_name}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                course_name: e.target.value,
                              }))
                            }
                          />
                          <Input
                            required
                            placeholder="지역코드"
                            value={form.region_code}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                region_code: e.target.value,
                              }))
                            }
                          />
                          <DialogFooter>
                            <Button type="submit" disabled={isCreating}>
                              추가
                            </Button>
                            <DialogClose asChild>
                              <Button type="button" variant="outline">
                                취소
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </form>
              </CardContent>
            </Card>
            {/* 여행코스 목록 카드 */}
            <Card className="border border-gray-200 shadow-md">
              <CardContent>
                <div className="mb-2">
                  <div className="text-lg font-bold">여행코스 목록</div>
                  <div className="text-sm text-gray-500">
                    등록된 여행코스 정보를 확인하세요.
                  </div>
                </div>
                {/* 카드형 그리드 */}
                {isLoading && (!filtered || filtered.length === 0) ? (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                    <span className="text-gray-500">
                      데이터를 불러오는 중...
                    </span>
                  </div>
                ) : !isLoading && (!filtered || filtered.length === 0) ? (
                  <div className="py-8 text-center text-gray-400">
                    {errorMsg
                      ? '데이터를 불러올 수 없습니다.'
                      : '데이터가 없습니다.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.slice(0, 15).map((course) => (
                      <div
                        key={course.content_id}
                        className="flex h-full flex-col rounded-lg border bg-white p-4 shadow"
                      >
                        <div className="flex flex-1 flex-col gap-2">
                          <div className="mb-2 flex h-36 w-full items-center justify-center overflow-hidden rounded bg-gray-100">
                            {course.first_image ? (
                              <img
                                src={course.first_image}
                                alt={course.course_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-400">이미지 없음</span>
                            )}
                          </div>
                          <div
                            className="truncate text-lg font-bold text-gray-900"
                            title={course.course_name}
                          >
                            <Link
                              to={`/content/${course.content_id}`}
                              className="text-blue-700 hover:underline"
                            >
                              {course.course_name}
                            </Link>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="inline-block rounded border border-blue-300 bg-white px-2 py-0.5 text-xs text-blue-700">
                              {REGION_MAP[course.region_code] ||
                                course.region_code}
                            </span>
                            <span className="ml-auto text-xs text-gray-400">
                              {course.created_at
                                ? course.created_at.split('T')[0]
                                : ''}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            disabled={isLoading}
                            className="flex items-center justify-center gap-1 rounded border border-red-400 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 shadow transition hover:bg-red-100 disabled:opacity-50"
                            style={{ minWidth: 0, minHeight: 0 }}
                            onClick={() => setDeleteId(course.content_id)}
                          >
                            <Trash2 size={14} className="text-red-500" />
                            <span>삭제</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* 페이지네이션 */}
                <div className="mt-6 flex justify-center">
                  {renderPagination()}
                </div>
              </CardContent>
            </Card>
            {/* 삭제 다이얼로그 */}
            <AlertDialog
              open={!!deleteId}
              onOpenChange={(open) => {
                if (!open) setDeleteId(null)
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말 삭제할까요?</AlertDialogTitle>
                  <AlertDialogDescription>
                    이 작업은 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} autoFocus>
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
        {activeTab === 'plan' && <TravelPlansSection />}
        {activeTab === 'festival' && (
          <Card className="border border-gray-200 shadow-md">
            <CardContent>
              <Tabs defaultValue="event" className="w-full">
                <TabsList>
                  <TabsTrigger value="event">축제 이벤트</TabsTrigger>
                  <TabsTrigger value="leisure">레저 스포츠</TabsTrigger>
                </TabsList>
                <TabsContent value="event">
                  <FestivalEventSection />
                </TabsContent>
                <TabsContent value="leisure">
                  <LeisureSportsSection />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </PermissionGuard>
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
  const [suggestions, setSuggestions] = useState([])
  const { data: autoNames, refetch: refetchAuto } =
    useGetFestivalEventNamesQuery(searchName, { skip: !searchName })
  useEffect(() => {
    if (searchName && autoNames) {
      setSuggestions(autoNames)
    } else {
      setSuggestions([])
    }
  }, [searchName, autoNames])

  // 페이지네이션
  const total = data?.total || 0
  const totalPages = total ? Math.ceil(total / limit) : 1

  // 검색 핸들러
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
  const handleCloseModal = () => {
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
    if (!window.confirm('정말 삭제할까요?')) return
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
          <PaginationLink
            isActive={page === 1}
            onClick={() => setPage(1)}
            size="default"
          >
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
          <PaginationLink
            isActive={i === page}
            onClick={() => setPage(i)}
            size="default"
          >
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
            size="default"
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
      <Pagination className="mt-6 flex justify-center">
        <PaginationContent>{pageItems}</PaginationContent>
      </Pagination>
    )
  }
  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8">
      <div className="mb-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            축제 이벤트 관리
          </h2>
          <p className="mt-1 text-gray-500">
            축제 이벤트 정보를 등록, 수정, 삭제하고 검색할 수 있습니다.
          </p>
        </div>
        {errorMsg && (
          <Button
            onClick={() => {
              setErrorMsg(null)
              refetch()
            }}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            재시도
          </Button>
        )}
      </div>
      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
      <Card className="border border-gray-200 shadow-md">
        <CardContent>
          <div className="mb-2">
            <div className="text-lg font-bold">검색 및 등록</div>
            <div className="text-sm text-gray-500">
              축제 이벤트를 검색하거나 새로 등록하세요.
            </div>
          </div>
          <form
            className="grid grid-cols-1 items-end gap-3 md:grid-cols-5"
            onSubmit={handleSearch}
          >
            <div className="flex flex-col gap-1 md:col-span-2">
              <label
                htmlFor="search-event-name"
                className="mb-1 text-xs text-gray-500"
              >
                축제명
              </label>
              <input
                id="search-event-name"
                className="rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                placeholder="축제명"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                autoComplete="off"
                onFocus={() => searchName && refetchAuto()}
              />
              {suggestions.length > 0 && (
                <ul className="absolute top-full right-0 left-0 z-10 mt-1 w-full rounded border bg-white shadow">
                  {suggestions.map((name, idx) => (
                    <li
                      key={idx}
                      className="cursor-pointer px-3 py-1 text-sm hover:bg-blue-100"
                      onClick={() => {
                        setSearchName(name)
                        setSuggestions([])
                      }}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
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
                value={searchRegion}
                onChange={(e) => setSearchRegion(e.target.value)}
              >
                <option value="">전체</option>
                {REGION_OPTIONS.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 md:col-span-1 md:justify-end">
              <Button type="submit">검색</Button>
              <Button type="button" onClick={handleOpenCreate}>
                등록
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card className="border border-gray-200 shadow-md">
        <CardContent>
          <div className="mb-2">
            <div className="text-lg font-bold">축제 이벤트 목록</div>
            <div className="text-sm text-gray-500">
              등록된 축제 이벤트 정보를 확인하세요.
            </div>
          </div>
          {isLoading && (!data?.items || data.items.length === 0) ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
              <span className="text-gray-500">데이터를 불러오는 중...</span>
            </div>
          ) : !isLoading && (!data?.items || data.items.length === 0) ? (
            <div className="py-8 text-center text-gray-400">
              {errorMsg ? '데이터를 불러올 수 없습니다.' : '데이터가 없습니다.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((row) => (
                <div
                  key={row.content_id}
                  className="flex h-full flex-col rounded-lg border bg-white p-4 shadow"
                >
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="mb-2 flex h-36 w-full items-center justify-center overflow-hidden rounded bg-gray-100">
                      {row.first_image ? (
                        <img
                          src={row.first_image}
                          alt={row.event_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400">이미지 없음</span>
                      )}
                    </div>
                    <div
                      className="truncate text-lg font-bold text-gray-900"
                      title={row.event_name}
                    >
                      {row.event_name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="inline-block rounded border border-blue-300 bg-white px-2 py-0.5 text-xs text-blue-700">
                        {REGION_MAP[row.region_code] || row.region_code}
                      </span>
                      <span className="ml-auto text-xs text-gray-400">
                        {row.event_start_date} ~ {row.event_end_date}
                      </span>
                    </div>
                    <div className="truncate text-xs text-gray-500">
                      {row.event_place}
                    </div>
                    <div className="truncate text-xs text-gray-500">
                      {row.tel}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(row)}
                    >
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(row.content_id)}
                      style={{ minWidth: 0, minHeight: 0 }}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex justify-center">{renderPagination()}</div>
        </CardContent>
      </Card>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editData ? '축제 이벤트 수정' : '축제 이벤트 등록'}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="max-h-[60vh] space-y-2 overflow-y-auto pr-2"
          >
            <div className="grid grid-cols-2 gap-2">
              <Input
                name="event_name"
                value={form.event_name}
                onChange={handleChange}
                placeholder="축제명"
                required
              />
              <Input
                name="region_code"
                value={form.region_code}
                onChange={handleChange}
                placeholder="지역 코드"
                required
              />
              <Input
                name="event_start_date"
                value={form.event_start_date}
                onChange={handleChange}
                placeholder="시작일 (YYYY-MM-DD)"
              />
              <Input
                name="event_end_date"
                value={form.event_end_date}
                onChange={handleChange}
                placeholder="종료일 (YYYY-MM-DD)"
              />
              <Input
                name="event_place"
                value={form.event_place}
                onChange={handleChange}
                placeholder="장소"
              />
              <Input
                name="tel"
                value={form.tel}
                onChange={handleChange}
                placeholder="전화번호"
              />
              <Input
                name="first_image"
                value={form.first_image}
                onChange={handleChange}
                placeholder="대표이미지 URL"
              />
            </div>
            <DialogFooter>
              <Button type="submit">저장</Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  취소
                </Button>
              </DialogClose>
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
  const [suggestions, setSuggestions] = useState([])
  const { data: autoNames, refetch: refetchAuto } =
    useGetLeisureFacilityNamesQuery(searchName, { skip: !searchName })
  useEffect(() => {
    if (searchName && autoNames) {
      setSuggestions(autoNames)
    } else {
      setSuggestions([])
    }
  }, [searchName, autoNames])

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
  const handleCloseModal = () => {
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
    if (!window.confirm('정말 삭제할까요?')) return
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
          tabIndex={page === 1 ? -1 : 0}
        />
      </PaginationItem>,
    )
    if (start > 1) {
      pageItems.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={page === 1}
            onClick={() => setPage(1)}
            size="default"
          >
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
    for (let i = start; i <= end; i++) {
      pageItems.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === page}
            onClick={() => setPage(i)}
            size="default"
          >
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
            isActive={page === totalPages}
            onClick={() => setPage(totalPages)}
            size="default"
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
          tabIndex={page === totalPages ? -1 : 0}
        />
      </PaginationItem>,
    )
    return (
      <Pagination className="mt-6 flex justify-center">
        <PaginationContent>{pageItems}</PaginationContent>
      </Pagination>
    )
  }
  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8">
      <div className="mb-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            레저 스포츠 관리
          </h2>
          <p className="mt-1 text-gray-500">
            레저 스포츠 시설 정보를 등록, 수정, 삭제하고 검색할 수 있습니다.
          </p>
        </div>
        {errorMsg && (
          <Button
            onClick={() => {
              setErrorMsg(null)
              refetch()
            }}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            재시도
          </Button>
        )}
      </div>
      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
      <Card className="border border-gray-200 shadow-md">
        <CardContent>
          <div className="mb-2">
            <div className="text-lg font-bold">검색 및 등록</div>
            <div className="text-sm text-gray-500">
              레저 스포츠 시설을 검색하거나 새로 등록하세요.
            </div>
          </div>
          <form
            className="grid grid-cols-1 items-end gap-3 md:grid-cols-5"
            onSubmit={handleSearch}
          >
            <div className="flex flex-col gap-1 md:col-span-2">
              <label
                htmlFor="search-leisure-name"
                className="mb-1 text-xs text-gray-500"
              >
                시설명
              </label>
              <input
                id="search-leisure-name"
                className="rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                placeholder="시설명"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                autoComplete="off"
                onFocus={() => searchName && refetchAuto()}
              />
              {suggestions.length > 0 && (
                <ul className="absolute top-full right-0 left-0 z-10 mt-1 w-full rounded border bg-white shadow">
                  {suggestions.map((name, idx) => (
                    <li
                      key={idx}
                      className="cursor-pointer px-3 py-1 text-sm hover:bg-blue-100"
                      onClick={() => {
                        setSearchName(name)
                        setSuggestions([])
                      }}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label
                htmlFor="search-leisure-region"
                className="mb-1 text-xs text-gray-500"
              >
                지역
              </label>
              <select
                id="search-leisure-region"
                className="rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                value={searchRegion}
                onChange={(e) => setSearchRegion(e.target.value)}
              >
                <option value="">전체</option>
                {REGION_OPTIONS.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 md:col-span-1 md:justify-end">
              <Button type="submit">검색</Button>
              <Button type="button" onClick={handleOpenCreate}>
                등록
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card className="border border-gray-200 shadow-md">
        <CardContent>
          <div className="mb-2">
            <div className="text-lg font-bold">레저 스포츠 시설 목록</div>
            <div className="text-sm text-gray-500">
              등록된 레저 스포츠 시설 정보를 확인하세요.
            </div>
          </div>
          {isLoading && (!data?.items || data.items.length === 0) ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
              <span className="text-gray-500">데이터를 불러오는 중...</span>
            </div>
          ) : !isLoading && (!data?.items || data.items.length === 0) ? (
            <div className="py-8 text-center text-gray-400">
              {errorMsg ? '데이터를 불러올 수 없습니다.' : '데이터가 없습니다.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((row) => (
                <div
                  key={row.content_id}
                  className="flex h-full flex-col rounded-lg border bg-white p-4 shadow"
                >
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="mb-2 flex h-36 w-full items-center justify-center overflow-hidden rounded bg-gray-100">
                      {row.first_image ? (
                        <img
                          src={row.first_image}
                          alt={row.facility_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400">이미지 없음</span>
                      )}
                    </div>
                    <div
                      className="truncate text-lg font-bold text-gray-900"
                      title={row.facility_name}
                    >
                      {row.facility_name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="inline-block rounded border border-blue-300 bg-white px-2 py-0.5 text-xs text-blue-700">
                        {REGION_MAP[row.region_code] || row.region_code}
                      </span>
                      <span className="ml-auto text-xs text-gray-400">
                        {row.sports_type}
                      </span>
                    </div>
                    <div className="truncate text-xs text-gray-500">
                      {row.admission_fee}
                    </div>
                    <div className="truncate text-xs text-gray-500">
                      {row.tel}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(row)}
                    >
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(row.content_id)}
                      style={{ minWidth: 0, minHeight: 0 }}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex justify-center">{renderPagination()}</div>
        </CardContent>
      </Card>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editData ? '레저 스포츠 시설 수정' : '레저 스포츠 시설 등록'}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="max-h-[60vh] space-y-2 overflow-y-auto pr-2"
          >
            <div className="grid grid-cols-2 gap-2">
              <Input
                name="facility_name"
                value={form.facility_name}
                onChange={handleChange}
                placeholder="시설명"
                required
              />
              <Input
                name="region_code"
                value={form.region_code}
                onChange={handleChange}
                placeholder="지역 코드"
                required
              />
              <Input
                name="sports_type"
                value={form.sports_type}
                onChange={handleChange}
                placeholder="스포츠 종류"
              />
              <Input
                name="admission_fee"
                value={form.admission_fee}
                onChange={handleChange}
                placeholder="입장료"
              />
              <Input
                name="parking_info"
                value={form.parking_info}
                onChange={handleChange}
                placeholder="주차 정보"
              />
              <Input
                name="tel"
                value={form.tel}
                onChange={handleChange}
                placeholder="전화번호"
              />
              <Input
                name="first_image"
                value={form.first_image}
                onChange={handleChange}
                placeholder="대표이미지 URL"
              />
            </div>
            <DialogFooter>
              <Button type="submit">저장</Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  취소
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TravelPlansSection() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const limit = 12
  const skip = (page - 1) * limit
  const {
    data: plansResponse = { data: [], meta: { total: 0, total_pages: 1 } },
    isLoading,
    refetch,
  } = useGetTravelPlansQuery({ skip, limit })

  const plans = plansResponse.data || []
  const totalPages = plansResponse.meta?.total_pages || 1
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
  const handleCloseModal = () => {
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
        // 현재 로그인한 사용자 ID 사용
        if (!user?.id && !user?.user_id) {
          throw new Error('로그인이 필요합니다.')
        }
        await createTravelPlan({
          ...form,
          user_id: user?.id || user?.user_id,
        })
      }
      setModalOpen(false)
      refetch()
    } catch (err) {
      setErrorMsg(err.message || '저장 실패')
    }
  }
  const handleDelete = async (plan_id) => {
    if (!window.confirm('정말 삭제할까요?')) return
    try {
      await deleteTravelPlan(plan_id)
      refetch()
    } catch (err) {
      setErrorMsg(err.message || '삭제 실패')
    }
  }
  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8">
      <div className="mb-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            여행 계획 관리
          </h2>
          <p className="mt-1 text-gray-500">
            여행 계획을 등록, 수정, 삭제하고 관리할 수 있습니다.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>여행 계획 추가</Button>
      </div>
      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
      <Card className="border border-gray-200 shadow-md">
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
              <span className="text-gray-500">데이터를 불러오는 중...</span>
            </div>
          ) : !plans.length ? (
            <div className="py-8 text-center text-gray-400">
              데이터가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.plan_id}
                  className="flex h-full flex-col rounded-lg border bg-white p-4 shadow"
                >
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="mb-2 flex h-24 w-full items-center justify-center overflow-hidden rounded bg-gray-100">
                      <span className="text-2xl font-bold text-blue-600">
                        {plan.title}
                      </span>
                    </div>
                    <div
                      className="truncate text-base font-bold text-gray-900"
                      title={plan.title}
                    >
                      {plan.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {plan.description}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="inline-block rounded border border-blue-300 bg-white px-2 py-0.5 text-xs text-blue-700">
                        {plan.status}
                      </span>
                      <span className="ml-auto text-xs text-gray-400">
                        {plan.start_date} ~ {plan.end_date}
                      </span>
                    </div>
                    <div className="truncate text-xs text-gray-500">
                      예산: {plan.budget ?? '-'}
                    </div>
                    <div className="truncate text-xs text-gray-500">
                      참여인원: {plan.participants ?? '-'}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(plan)}
                    >
                      상세/수정
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(plan.plan_id)}
                      style={{ minWidth: 0, minHeight: 0 }}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editData ? '여행 계획 수정' : '여행 계획 등록'}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="max-h-[60vh] space-y-2 overflow-y-auto pr-2"
          >
            <div className="grid grid-cols-2 gap-2">
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="제목"
                required
              />
              <Input
                name="status"
                value={form.status}
                onChange={handleChange}
                placeholder="상태"
                required
              />
              <Input
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                placeholder="시작일 (YYYY-MM-DD)"
                required
              />
              <Input
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                placeholder="종료일 (YYYY-MM-DD)"
                required
              />
              <Input
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="예산"
              />
              <Input
                name="participants"
                value={form.participants}
                onChange={handleChange}
                placeholder="참여 인원"
              />
              <Input
                name="transportation"
                value={form.transportation}
                onChange={handleChange}
                placeholder="교통수단"
              />
              <Input
                name="start_location"
                value={form.start_location}
                onChange={handleChange}
                placeholder="출발지"
              />
            </div>
            <div>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="설명"
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <DialogFooter>
              <Button type="submit">{editData ? '수정' : '등록'}</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  취소
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
