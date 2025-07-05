import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Server,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Progress } from '../ui/progress'
import { Globe, MapPin, CreditCard } from 'lucide-react'
import { authHttp } from '../../lib/http'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table'
import { Input } from '../ui/input'
import { useGetLogsQuery } from '../../store/api/systemApi'
import { Button } from '../ui/button'

// Polling hook
function usePollingSystemStatus(url, interval = 5000) {
  const [data, setData] = useState(null)
  useEffect(() => {
    let timer
    const fetchData = async () => {
      try {
        const res = await authHttp.GET(url)
        if (!res.ok) {
          // 에러 응답일 때 텍스트로 받아서 콘솔에 출력
          const errorText = await res.text()
          console.error('API Error:', res.status, errorText)
          return
        }
        const json = await res.json()
        setData(json)
      } catch (e) {
        console.error('Fetch error:', e)
      }
      timer = setTimeout(fetchData, interval)
    }
    fetchData()
    return () => clearTimeout(timer)
  }, [url, interval])
  return data
}

// 예시 데이터 구조:
// {
//   server: { status: '정상', uptime: '99.8%' },
//   db: { status: '연결됨', response: '45ms' },
//   api: { avgResponse: '156ms' },
//   error: { rate: '0.02%' },
//   resource: { cpu: 45, memory: 67, disk: 23 },
//   external: { weather: '정상', tour: '정상', map: '정상', payment: '점검중' }
// }

export const SystemPage = () => {
  const status = usePollingSystemStatus('/api/system/status', 8000)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">시스템 관리</h2>
        <p className="text-muted-foreground">
          서버 상태와 시스템 성능을 모니터링할 수 있습니다.
        </p>
      </div>

      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monitoring">실시간 모니터링</TabsTrigger>
          <TabsTrigger value="logs">로그 관리</TabsTrigger>
          <TabsTrigger value="settings">시스템 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">서버 상태</CardTitle>
                <Server className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">
                    {status?.server?.status ?? '...'}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  업타임: {status?.server?.uptime ?? '...'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  데이터베이스
                </CardTitle>
                <Database className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">
                    {status?.db?.status ?? '...'}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  응답시간: {status?.db?.response ?? '...'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">API 성능</CardTitle>
                <Activity className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {status?.api?.avgResponse ?? '...'}
                </div>
                <p className="text-muted-foreground text-xs">평균 응답시간</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">에러율</CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {status?.error?.rate ?? '...'}
                </div>
                <p className="text-muted-foreground text-xs">지난 24시간</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>서버 리소스</CardTitle>
                <Activity className="h-5 w-5 text-blue-400" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CPU 사용률</span>
                    <span className="text-sm font-medium">
                      {status?.resource?.cpu ?? '...'}%
                    </span>
                  </div>
                  <Progress
                    value={status?.resource?.cpu ?? 0}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">메모리 사용률</span>
                    <span className="text-sm font-medium">
                      {status?.resource?.memory ?? '...'}%
                    </span>
                  </div>
                  <Progress
                    value={status?.resource?.memory ?? 0}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">디스크 사용률</span>
                    <span className="text-sm font-medium">
                      {status?.resource?.disk ?? '...'}%
                    </span>
                  </div>
                  <Progress
                    value={status?.resource?.disk ?? 0}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>외부 API 상태</CardTitle>
                <Globe className="h-5 w-5 text-blue-400" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-400" />
                  <span className="text-xs">날씨</span>
                  <Badge
                    variant={
                      status?.external?.weather === '정상'
                        ? 'success'
                        : 'destructive'
                    }
                  >
                    {status?.external?.weather ?? '...'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-400" />
                  <span className="text-xs">관광</span>
                  <Badge
                    variant={
                      status?.external?.tour === '정상'
                        ? 'success'
                        : 'destructive'
                    }
                  >
                    {status?.external?.tour ?? '...'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs">지도</span>
                  <Badge
                    variant={
                      status?.external?.map === '정상'
                        ? 'success'
                        : 'destructive'
                    }
                  >
                    {status?.external?.map ?? '...'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-pink-400" />
                  <span className="text-xs">결제</span>
                  <Badge
                    variant={
                      status?.external?.payment === '정상'
                        ? 'success'
                        : 'destructive'
                    }
                  >
                    {status?.external?.payment ?? '...'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>시스템 로그</CardTitle>
              <CardDescription>
                애플리케이션 로그를 검색하고 분석할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogSearchTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>시스템 설정</CardTitle>
              <CardDescription>
                시스템 환경 설정을 관리할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  시스템 설정 패널이 여기에 표시됩니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LogSearchTable() {
  const [filters, setFilters] = useState({
    level: '',
    source: '',
    message: '',
    page: 1,
    size: 10,
  })
  const { data, isLoading, refetch } = useGetLogsQuery(filters)

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 })
  }
  const handleSearch = (e) => {
    e.preventDefault()
    refetch()
  }
  const handlePage = (newPage) => {
    setFilters({ ...filters, page: newPage })
  }

  return (
    <div>
      <form className="mb-4 flex gap-2" onSubmit={handleSearch}>
        <Input
          name="level"
          placeholder="레벨(INFO, ERROR...)"
          value={filters.level}
          onChange={handleChange}
          className="w-32"
        />
        <Input
          name="source"
          placeholder="소스"
          value={filters.source}
          onChange={handleChange}
          className="w-32"
        />
        <Input
          name="message"
          placeholder="메시지"
          value={filters.message}
          onChange={handleChange}
          className="flex-1"
        />
        <Button type="submit">검색</Button>
      </form>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>시간</TableHead>
              <TableHead>레벨</TableHead>
              <TableHead>소스</TableHead>
              <TableHead>메시지</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>로딩 중...</TableCell>
              </TableRow>
            ) : data && data.items && data.items.length > 0 ? (
              data.items.map((log) => (
                <TableRow key={log.log_id}>
                  <TableCell>
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString()
                      : ''}
                  </TableCell>
                  <TableCell>{log.level}</TableCell>
                  <TableCell>{log.source}</TableCell>
                  <TableCell className="max-w-xs truncate" title={log.message}>
                    {log.message}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>로그가 없습니다.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {data && data.total && (
        <div className="mt-2 flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePage(filters.page - 1)}
            disabled={filters.page <= 1}
          >
            이전
          </Button>
          <span className="text-sm">
            {filters.page} / {Math.ceil(data.total / filters.size)}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePage(filters.page + 1)}
            disabled={filters.page >= Math.ceil(data.total / filters.size)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  )
}
