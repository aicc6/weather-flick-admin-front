import { useState } from 'react'
import {
  useGetTravelCoursesQuery,
  useCreateTravelCourseMutation,
  useDeleteTravelCourseMutation,
} from '../../store/api/contentApi'
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

export const ContentPage = () => {
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
  })
  const [createTravelCourse, { isLoading: isCreating }] =
    useCreateTravelCourseMutation()
  const [deleteTravelCourse, { isLoading: isDeleting }] =
    useDeleteTravelCourseMutation()
  const [errorMsg, setErrorMsg] = useState(null)

  // 지역명으로 필터링
  const filtered = data?.items?.filter((c) => {
    const courseNameMatch = c.course_name
      .toLowerCase()
      .includes(searchCourseName.toLowerCase())
    const regionName = REGION_MAP[c.region_code] || ''
    // 입력값이 비어있거나, 지역명이 입력값을 포함하면 통과
    const regionMatch = searchRegion ? regionName.includes(searchRegion) : true
    return courseNameMatch && regionMatch
  })

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
    <div className="mx-auto max-w-5xl space-y-8 py-8">
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
            <div className="flex flex-col gap-1 md:col-span-2">
              <label
                htmlFor="search-course-name"
                className="mb-1 text-xs text-gray-500"
              >
                코스명
              </label>
              <input
                id="search-course-name"
                className="rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                placeholder="코스명"
                value={searchCourseName}
                onChange={(e) => setSearchCourseName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label
                htmlFor="search-region"
                className="mb-1 text-xs text-gray-500"
              >
                지역
              </label>
              <input
                id="search-region"
                className="rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                placeholder="지역명"
                value={searchRegion}
                onChange={(e) => setSearchRegion(e.target.value)}
              />
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
                      placeholder="코스명"
                      value={form.course_name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, course_name: e.target.value }))
                      }
                    />
                    <Input
                      required
                      placeholder="지역코드"
                      value={form.region_code}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, region_code: e.target.value }))
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
              <span className="text-gray-500">데이터를 불러오는 중...</span>
            </div>
          ) : !isLoading && (!filtered || filtered.length === 0) ? (
            <div className="py-8 text-center text-gray-400">
              {errorMsg ? '데이터를 불러올 수 없습니다.' : '데이터가 없습니다.'}
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
                      <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {REGION_MAP[course.region_code] || course.region_code}
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
                      className="flex flex-1 items-center justify-center gap-2 rounded-full border border-red-400 bg-gradient-to-r from-red-50 to-white px-4 py-2 font-semibold text-red-700 shadow transition hover:from-red-100 hover:to-red-200 disabled:opacity-50"
                      onClick={() => setDeleteId(course.content_id)}
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
    </div>
  )
}
