import { useEffect, useState } from 'react'
import { authHttp } from '../../lib/http'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '../ui/pagination'
import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function TouristAttractionList({ onEdit, onCreate }) {
  const [data, setData] = useState({ items: [], total: 0 })
  const [search, setSearch] = useState({ name: '', category: '', region: '' })
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchList = async (pageNum = page) => {
    setLoading(true)
    setError(null)
    try {
      let endpoint = '/api/tourist-attractions/'
      const queryParams = {
        limit: pageSize,
        offset: (pageNum - 1) * pageSize,
      }

      if (search.name || search.category || search.region) {
        endpoint = '/api/tourist-attractions/search/'
        if (search.name) queryParams.name = search.name
        if (search.category) queryParams.category = search.category
        if (search.region) queryParams.region = search.region
      }

      const res = await authHttp.GET(endpoint, {
        params: { query: queryParams },
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('관광지 데이터 로딩 실패:', error)
      setError(error.message || '관광지 데이터를 불러오는데 실패했습니다.')
      setData({ items: [], total: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
    // eslint-disable-next-line
  }, [page])

  const handleDelete = async (content_id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    setLoading(true)
    try {
      const res = await authHttp.DELETE(
        `/api/tourist-attractions/${content_id}`,
      )
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      fetchList()
    } catch (error) {
      console.error('관광지 삭제 실패:', error)
      setError(error.message || '삭제에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    fetchList()
  }

  const totalPages = Math.ceil(data.total / pageSize)
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
      {/* 상단 제목/설명 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">관광지 관리</h2>
          <p className="text-muted-foreground">
            관광지 정보를 등록, 수정, 삭제하고 검색할 수 있습니다.
          </p>
        </div>
        {error && (
          <Button
            onClick={handleRetry}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            재시도
          </Button>
        )}
      </div>

      {/* 에러 알림 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 검색/등록 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>검색 및 등록</CardTitle>
          <CardDescription>
            관광지 정보를 검색하거나 새로 등록하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid grid-cols-1 items-end gap-3 md:grid-cols-5"
            onSubmit={(e) => {
              e.preventDefault()
              setPage(1)
              fetchList(1)
            }}
          >
            <div className="flex flex-col gap-1">
              <input
                id="search-name"
                className="input rounded border px-2 py-1"
                placeholder="관광지명"
                value={search.name}
                onChange={(e) => setSearch({ ...search, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <input
                id="search-category"
                className="input rounded border px-2 py-1"
                placeholder="카테고리"
                value={search.category}
                onChange={(e) =>
                  setSearch({ ...search, category: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <input
                id="search-region"
                className="input rounded border px-2 py-1"
                placeholder="지역코드"
                value={search.region}
                onChange={(e) =>
                  setSearch({ ...search, region: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary rounded bg-blue-600 px-4 py-1 text-white disabled:opacity-50"
              >
                {loading ? '검색 중...' : '검색'}
              </button>
              <button
                type="button"
                disabled={loading}
                className="btn btn-secondary rounded border border-blue-600 px-4 py-1 text-blue-600 disabled:opacity-50"
                onClick={onCreate}
              >
                관광지 등록
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 관광지 목록 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>관광지 목록</CardTitle>
          <CardDescription>등록된 관광지 정보를 확인하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 text-center">관광지명</th>
                <th className="text-center">카테고리</th>
                <th className="text-center">지역</th>
                <th className="text-center">등록일</th>
                <th className="text-center">관리</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                      <span className="text-gray-500">
                        데이터를 불러오는 중...
                      </span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && data.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-400">
                    {error
                      ? '데이터를 불러올 수 없습니다.'
                      : '데이터가 없습니다.'}
                  </td>
                </tr>
              )}
              {data.items.map((a) => (
                <tr key={a.content_id} className="border-t">
                  <td className="py-2 text-center">{a.attraction_name}</td>
                  <td className="text-center">{a.category_name}</td>
                  <td className="text-center">{a.region_code}</td>
                  <td className="text-center">
                    {a.created_at ? a.created_at.split('T')[0] : ''}
                  </td>
                  <td className="text-center">
                    <button
                      disabled={loading}
                      className="btn btn-sm btn-outline mr-2 rounded border px-2 py-1 disabled:opacity-50"
                      onClick={() => onEdit(a.content_id)}
                    >
                      수정
                    </button>
                    <button
                      disabled={loading}
                      className="btn btn-sm btn-destructive rounded border border-red-400 px-4 py-1 text-red-600 disabled:opacity-50"
                      onClick={() => handleDelete(a.content_id)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* 페이지네이션 */}
          <div className="mt-4 flex justify-center">{renderPagination()}</div>
        </CardContent>
      </Card>
    </div>
  )
}
