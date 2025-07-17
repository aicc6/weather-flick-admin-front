import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { contactApi } from '@/api/contact'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const ContactList = () => {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [stats, setStats] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    skip: 0,
    limit: 10,
  })

  // 통계 데이터는 최초 1회만 로드
  useEffect(() => {
    loadStats()
  }, [])

  // 문의 목록은 필터 변경 시마다 로드
  useEffect(() => {
    loadContacts()
  }, [filters])

  const loadStats = async () => {
    try {
      setStatsLoading(true)
      const [statsData, categoriesData] = await Promise.all([
        contactApi.getContactStats(),
        contactApi.getCategories(),
      ])

      setStats(statsData)
      setCategories(categoriesData || [])
    } catch (error) {
      console.error('Failed to load stats:', error)
      toast.error('통계 데이터를 불러오는데 실패했습니다.')
    } finally {
      setStatsLoading(false)
    }
  }

  const loadContacts = async () => {
    try {
      setLoading(true)
      const contactsData = await contactApi.getContacts(filters)
      setContacts(contactsData || [])

      // API가 전체 카운트를 반환하지 않으므로 추정값 사용
      // 전체 페이지가 있다고 가정 (다음 페이지가 있는지로 판단)
      if (contactsData && contactsData.length >= filters.limit) {
        setTotalCount((currentPage + 1) * filters.limit)
      } else {
        setTotalCount(filters.skip + (contactsData?.length || 0))
      }
    } catch (error) {
      console.error('Failed to load contacts:', error)
      toast.error('문의 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setCurrentPage(1)
    setFilters((prev) => ({ ...prev, search: value, skip: 0 }))
  }

  const handleCategoryChange = (value) => {
    setCurrentPage(1)
    setFilters((prev) => ({
      ...prev,
      category: value === 'all' ? '' : value,
      skip: 0,
    }))
  }

  const handleStatusChange = (value) => {
    setCurrentPage(1)
    setFilters((prev) => ({
      ...prev,
      status: value === 'all' ? '' : value,
      skip: 0,
    }))
  }

  const handlePageSizeChange = (newSize) => {
    const newPageSize = parseInt(newSize)
    setPageSize(newPageSize)
    setCurrentPage(1)
    setFilters((prev) => ({
      ...prev,
      limit: newPageSize,
      skip: 0,
    }))
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">대기중</Badge>
      case 'PROCESSING':
        return <Badge variant="outline">처리중</Badge>
      case 'COMPLETE':
        return <Badge variant="default">완료</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleContactClick = (id) => {
    navigate(`/contact/${id}`)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    setFilters((prev) => ({
      ...prev,
      skip: (page - 1) * prev.limit,
    }))
  }

  // 로딩 상태를 페이지 전체가 아닌 테이블에만 적용

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">문의</h2>
          <p className="text-muted-foreground">
            고객 문의사항을 확인하고 답변을 관리합니다.
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      {!statsLoading && stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              !filters.status ? 'ring-primary ring-2' : ''
            }`}
            onClick={() => handleStatusChange('all')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 문의</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_count}</div>
              <p className="text-muted-foreground mt-1 text-xs">
                오늘 +{stats.today_count}
              </p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              filters.status === 'PENDING' ? 'ring-primary ring-2' : ''
            }`}
            onClick={() => handleStatusChange('PENDING')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기중</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending_count}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">답변 대기 중</p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              filters.status === 'PROCESSING' ? 'ring-primary ring-2' : ''
            }`}
            onClick={() => handleStatusChange('PROCESSING')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">처리중</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.processing_count}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">답변 작성 중</p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              filters.status === 'COMPLETE' ? 'ring-primary ring-2' : ''
            }`}
            onClick={() => handleStatusChange('COMPLETE')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.complete_count}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">답변 완료</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>문의 목록</CardTitle>
          <CardDescription>
            등록된 문의사항을 검색하고 관리합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <Input
              placeholder="제목, 이름, 이메일로 검색..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={filters.category || 'all'}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="분류 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">번호</TableHead>
                <TableHead className="w-24">분류</TableHead>
                <TableHead>제목</TableHead>
                <TableHead className="w-32">작성자</TableHead>
                <TableHead className="w-24">상태</TableHead>
                <TableHead className="w-20">답변</TableHead>
                <TableHead className="w-40">등록일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="text-lg">로딩중...</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center">
                    문의사항이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleContactClick(contact.id)}
                  >
                    <TableCell>{contact.id}</TableCell>
                    <TableCell>{contact.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {contact.title}
                        {contact.is_private && (
                          <Badge variant="secondary" className="text-xs">
                            비공개
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {contact.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(contact.approval_status)}
                    </TableCell>
                    <TableCell>
                      {contact.has_answer ? (
                        <Badge variant="outline">답변완료</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(contact.created_at), 'PPP', {
                        locale: ko,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 페이지네이션 */}
          {!loading && contacts.length > 0 && (
            <div className="mt-4 flex flex-col gap-4">
              {/* 페이지 크기 선택 및 현재 표시 정보 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    페이지당 표시:
                  </span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-muted-foreground text-sm">
                  {contacts.length > 0 &&
                    `${filters.skip + 1}-${filters.skip + contacts.length}개 표시`}
                </div>
              </div>

              {/* 페이지 네비게이션 */}
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={
                          currentPage === 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    {/* 페이지 번호 표시 - 간단한 로직 */}
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(currentPage)}
                        isActive={true}
                        className="cursor-pointer"
                      >
                        {currentPage}
                      </PaginationLink>
                    </PaginationItem>

                    {/* 다음 페이지가 있을 때만 다음 버튼 활성화 */}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={
                          contacts.length < pageSize
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ContactList
