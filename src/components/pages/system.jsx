/**
 * 시스템 상태 상세 페이지
 * 시스템 상태 변경 히스토리 및 상세 로그 표시
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSystemStatus } from '../../hooks/useSystemStatus'
import { authHttp } from '../../lib/http'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '../ui/pagination'
import { Alert, AlertDescription } from '../ui/alert'
import {
  Activity,
  RefreshCw,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Database,
  Globe,
} from 'lucide-react'
import {
  getStatusText,
  getStatusIcon,
  getStatusBadgeProps,
  formatResponseTime,
  formatUptime,
  formatLastCheck,
} from '../../utils/systemUtils'

export const SystemPage = () => {
  const { t } = useTranslation()

  // 시스템 상태 실시간 모니터링
  const {
    systemStatus,
    loading: statusLoading,
    error: statusError,
    refresh: refreshStatus,
    lastUpdated,
    isAutoRefreshing,
  } = useSystemStatus({
    refreshInterval: 15000, // 15초마다 업데이트
    autoRefresh: true,
  })

  // 시스템 로그 상태
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logsError, setLogsError] = useState(null)
  const [totalLogs, setTotalLogs] = useState(0)

  // 필터 및 페이지네이션
  const [filters, setFilters] = useState({
    level: '',
    source: '',
    message: '',
    page: 1,
    size: 10,
  })

  // 로그 레벨 옵션
  const logLevels = [
    { value: '', label: t('common.all') },
    { value: 'CRITICAL', label: t('system.critical') },
    { value: 'ERROR', label: t('common.error') },
    { value: 'WARNING', label: t('system.warning') },
    { value: 'INFO', label: t('system.info') },
    { value: 'DEBUG', label: 'Debug' },
  ]

  /**
   * 시스템 로그 조회
   */
  const fetchLogs = useCallback(async () => {
    try {
      setLogsLoading(true)
      setLogsError(null)

      const params = new URLSearchParams()
      if (filters.level) params.append('level', filters.level)
      if (filters.source) params.append('source', filters.source)
      if (filters.message) params.append('message', filters.message)
      params.append('page', filters.page)
      params.append('size', filters.size)

      const response = await authHttp.GET(`/api/system/logs?${params}`)
      const data = await response.json()

      if (data.success) {
        setLogs(data.data.items || [])
        setTotalLogs(data.data.total || 0)
      } else {
        throw new Error(data.message || t('system.log_error'))
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err)
      setLogsError(err.message || t('system.log_error'))
    } finally {
      setLogsLoading(false)
    }
  }, [filters, t])

  // 필터 변경 핸들러
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // 필터 변경 시 첫 페이지로
    }))
  }

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  // 로그 레벨에 따른 아이콘
  const getLogLevelIcon = (level) => {
    switch (level) {
      case 'CRITICAL':
      case 'ERROR':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'INFO':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'DEBUG':
        return <CheckCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  // 로그 레벨에 따른 Badge variant
  const getLogLevelVariant = (level) => {
    switch (level) {
      case 'CRITICAL':
      case 'ERROR':
        return 'destructive'
      case 'WARNING':
        return 'warning'
      case 'INFO':
        return 'secondary'
      case 'DEBUG':
        return 'outline'
      default:
        return 'outline'
    }
  }

  // 초기 로드 및 필터 변경 시 로그 조회
  useEffect(() => {
    fetchLogs()
  }, [filters, fetchLogs])

  const totalPages = Math.ceil(totalLogs / filters.size)

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('system.title')}
          </h2>
          <p className="text-muted-foreground">{t('system.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-muted-foreground text-sm">
              {t('system.last_updated')}: {formatLastCheck(lastUpdated)}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStatus}
            disabled={statusLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${statusLoading ? 'animate-spin' : ''}`}
            />
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* 시스템 상태 요약 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('system.system_overview')}
            </CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {statusLoading ? (
                <div className="bg-muted h-2 w-16 animate-pulse rounded" />
              ) : statusError ? (
                <Badge variant="destructive">{t('common.error')}</Badge>
              ) : systemStatus ? (
                <Badge
                  variant={
                    getStatusBadgeProps(systemStatus.overall_status).variant
                  }
                >
                  {getStatusIcon(systemStatus.overall_status)}{' '}
                  {getStatusText(systemStatus.overall_status)}
                </Badge>
              ) : (
                <Badge variant="outline">{t('common.unknown')}</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {systemStatus?.message || t('system.status_error')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('system.uptime')}
            </CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStatus ? formatUptime(systemStatus.uptime_seconds) : '-'}
            </div>
            <p className="text-muted-foreground text-xs">
              {t('system.continuous_uptime')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('system.auto_refresh')}
            </CardTitle>
            <Server className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={isAutoRefreshing ? 'success' : 'secondary'}>
                {isAutoRefreshing
                  ? t('system.monitoring_active')
                  : t('system.monitoring_inactive')}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              {t('system.auto_update_every', { interval: 15 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 상세 시스템 상태 */}
      {systemStatus && (
        <Card>
          <CardHeader>
            <CardTitle>{t('system.detailed_status')}</CardTitle>
            <CardDescription>{t('system.component_status')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* 데이터베이스 상태 */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-medium">
                  <Database className="h-4 w-4" />
                  {t('system.database')}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>{t('system.status')}:</span>
                    <Badge
                      variant={
                        getStatusBadgeProps(systemStatus.database?.status)
                          .variant
                      }
                    >
                      {getStatusText(systemStatus.database?.status)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('system.response_time')}:</span>
                    <span>
                      {formatResponseTime(systemStatus.database?.response_time)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('system.last_check')}:</span>
                    <span>
                      {formatLastCheck(systemStatus.database?.last_check)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 외부 API 상태 */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-medium">
                  <Globe className="h-4 w-4" />
                  {t('system.external_apis')}
                </h4>
                <div className="space-y-2 text-sm">
                  {systemStatus.external_apis?.weather_api && (
                    <div className="flex items-center justify-between">
                      <span>{t('system.weather_api')}:</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            getStatusBadgeProps(
                              systemStatus.external_apis.weather_api.status,
                            ).variant
                          }
                          className="text-xs"
                        >
                          {getStatusText(
                            systemStatus.external_apis.weather_api.status,
                          )}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {formatResponseTime(
                            systemStatus.external_apis.weather_api
                              .response_time,
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                  {systemStatus.external_apis?.tourism_api && (
                    <div className="flex items-center justify-between">
                      <span>{t('system.tourism_api')}:</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            getStatusBadgeProps(
                              systemStatus.external_apis.tourism_api.status,
                            ).variant
                          }
                          className="text-xs"
                        >
                          {getStatusText(
                            systemStatus.external_apis.tourism_api.status,
                          )}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {formatResponseTime(
                            systemStatus.external_apis.tourism_api
                              .response_time,
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                  {systemStatus.external_apis?.google_places && (
                    <div className="flex items-center justify-between">
                      <span>{t('system.google_maps')}:</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            getStatusBadgeProps(
                              systemStatus.external_apis.google_places.status,
                            ).variant
                          }
                          className="text-xs"
                        >
                          {getStatusText(
                            systemStatus.external_apis.google_places.status,
                          )}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {formatResponseTime(
                            systemStatus.external_apis.google_places
                              .response_time,
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 시스템 리소스 */}
            {systemStatus.details &&
              Object.keys(systemStatus.details).length > 0 && (
                <div className="mt-6 border-t pt-6">
                  <h4 className="mb-3 font-medium">
                    {t('system.system_resources')}
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {systemStatus.details.cpu_percent !== undefined && (
                      <div className="rounded-lg border p-3 text-center">
                        <div className="text-2xl font-bold">
                          {systemStatus.details.cpu_percent.toFixed(1)}%
                        </div>
                        <div className="text-muted-foreground">
                          {t('system.cpu_usage')}
                        </div>
                      </div>
                    )}
                    {systemStatus.details.memory_percent !== undefined && (
                      <div className="rounded-lg border p-3 text-center">
                        <div className="text-2xl font-bold">
                          {systemStatus.details.memory_percent.toFixed(1)}%
                        </div>
                        <div className="text-muted-foreground">
                          {t('system.memory_usage')}
                        </div>
                      </div>
                    )}
                    {systemStatus.details.disk_percent !== undefined && (
                      <div className="rounded-lg border p-3 text-center">
                        <div className="text-2xl font-bold">
                          {systemStatus.details.disk_percent.toFixed(1)}%
                        </div>
                        <div className="text-muted-foreground">
                          {t('system.disk_usage')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* 시스템 로그 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('system.logs')}</CardTitle>
          <CardDescription>{t('system.system_event_logs')}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 로그 필터 */}
          <div className="mb-4 flex flex-wrap gap-4">
            <Select
              value={filters.level}
              onValueChange={(value) => handleFilterChange('level', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('system.log_level')} />
              </SelectTrigger>
              <SelectContent>
                {logLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder={t('system.log_source') + '...'}
              value={filters.source}
              onChange={(e) => handleFilterChange('source', e.target.value)}
              className="w-40"
            />

            <Input
              placeholder={t('system.search_logs') + '...'}
              value={filters.message}
              onChange={(e) => handleFilterChange('message', e.target.value)}
              className="w-60"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={logsLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${logsLoading ? 'animate-spin' : ''}`}
              />
              {t('common.refresh')}
            </Button>
          </div>

          {/* 로그 오류 표시 */}
          {logsError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{logsError}</AlertDescription>
            </Alert>
          )}

          {/* 로그 테이블 */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">
                    {t('system.log_level')}
                  </TableHead>
                  <TableHead className="w-32">
                    {t('system.log_source')}
                  </TableHead>
                  <TableHead>{t('system.log_message')}</TableHead>
                  <TableHead className="w-40">{t('system.log_time')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {t('system.loading_logs')}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground py-8 text-center"
                    >
                      {t('system.no_logs_found')}
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.log_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLogLevelIcon(log.level)}
                          <Badge
                            variant={getLogLevelVariant(log.level)}
                            className="text-xs"
                          >
                            {log.level}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.source}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md truncate" title={log.message}>
                          {log.message}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                {t('pagination.showing', {
                  start: (filters.page - 1) * filters.size + 1,
                  end: Math.min(filters.page * filters.size, totalLogs),
                  total: totalLogs,
                })}
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, filters.page - 1))
                      }
                      className={
                        filters.page === 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>

                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={page === filters.page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, filters.page + 1))
                      }
                      className={
                        filters.page === totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SystemPage
