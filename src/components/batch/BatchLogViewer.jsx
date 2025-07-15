import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Download,
  RefreshCw,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useGetBatchJobLogsQuery,
  BATCH_LOG_LEVELS,
} from '@/store/api/batchApi'
import { cn } from '@/lib/utils'

const LOG_LEVEL_COLORS = {
  DEBUG: 'text-gray-600',
  INFO: 'text-blue-600',
  WARNING: 'text-yellow-600',
  ERROR: 'text-red-600',
  CRITICAL: 'text-red-800 font-bold',
}

const LOG_LEVEL_BG_COLORS = {
  DEBUG: 'bg-gray-100',
  INFO: 'bg-blue-100',
  WARNING: 'bg-yellow-100',
  ERROR: 'bg-red-100',
  CRITICAL: 'bg-red-200',
}

const BatchLogViewer = ({ jobId, embedded = false, onClose }) => {
  const [logLevel, setLogLevel] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [page, setPage] = useState(1)
  const scrollAreaRef = useRef(null)

  const {
    data: logsData,
    refetch,
    isLoading,
    isFetching,
  } = useGetBatchJobLogsQuery({
    jobId,
    level: logLevel === 'all' ? undefined : logLevel,
    page,
    limit: 100,
  })

  // 자동 스크롤
  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [logsData, autoScroll])

  // 주기적으로 로그 새로고침 (실행 중인 작업의 경우)
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 5000) // 5초마다 새로고침

    return () => clearInterval(interval)
  }, [refetch])

  const filteredLogs = logsData?.logs?.filter((log) => {
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    return true
  }) || []

  const handleExportLogs = () => {
    const logText = filteredLogs
      .map((log) => `[${new Date(log.timestamp).toLocaleString('ko-KR')}] [${log.level}] ${log.message}`)
      .join('\n')
    
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `batch_log_${jobId}_${new Date().toISOString()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatLogTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    })
  }

  const logContent = (
    <div className="space-y-4">
      {/* 컨트롤 바 */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="로그 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={logLevel} onValueChange={setLogLevel}>
          <SelectTrigger className="w-[140px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="로그 레벨" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {Object.values(BATCH_LOG_LEVELS).map((level) => (
              <SelectItem key={level} value={level}>
                <span className={LOG_LEVEL_COLORS[level]}>{level}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAutoScroll(!autoScroll)}
          className={cn(autoScroll && 'bg-blue-50')}
        >
          {autoScroll ? (
            <>
              <ChevronDown className="mr-1 h-4 w-4" />
              자동 스크롤
            </>
          ) : (
            <>
              <ChevronUp className="mr-1 h-4 w-4" />
              수동 스크롤
            </>
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className={cn('mr-1 h-4 w-4', isFetching && 'animate-spin')} />
          새로고침
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportLogs}>
          <Download className="mr-1 h-4 w-4" />
          내보내기
        </Button>
        {embedded && !isExpanded && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(true)}
          >
            <Maximize2 className="mr-1 h-4 w-4" />
            확대
          </Button>
        )}
      </div>

      {/* 로그 영역 */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <ScrollArea
            ref={scrollAreaRef}
            className={cn(
              'w-full',
              embedded && !isExpanded ? 'h-[400px]' : 'h-[600px]'
            )}
          >
            <div className="p-4 font-mono text-sm">
              {isLoading ? (
                <div className="text-center text-gray-500">로그를 불러오는 중...</div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center text-gray-500">로그가 없습니다.</div>
              ) : (
                <div className="space-y-1">
                  {filteredLogs.map((log, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-start gap-2 p-2 rounded',
                        LOG_LEVEL_BG_COLORS[log.level] || 'bg-gray-50'
                      )}
                    >
                      <span className="text-gray-500 text-xs whitespace-nowrap">
                        {formatLogTime(log.timestamp)}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs px-1.5 py-0',
                          LOG_LEVEL_COLORS[log.level]
                        )}
                      >
                        {log.level}
                      </Badge>
                      <span className={cn('flex-1', LOG_LEVEL_COLORS[log.level])}>
                        {log.message}
                        {log.details && (
                          <pre className="mt-1 text-xs text-gray-600">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {logsData && logsData.total > 100 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            이전
          </Button>
          <span className="flex items-center px-3 text-sm">
            {page} / {Math.ceil(logsData.total / 100)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === Math.ceil(logsData.total / 100)}
            onClick={() => setPage(page + 1)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  )

  if (embedded && !isExpanded) {
    return logContent
  }

  if (isExpanded) {
    return (
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-[90vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>배치 작업 로그 - {jobId}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {logContent}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>배치 작업 로그</span>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              닫기
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>{logContent}</CardContent>
    </Card>
  )
}

export default BatchLogViewer