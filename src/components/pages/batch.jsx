/**
 * 배치 관리 페이지
 * 배치 작업 실행, 모니터링, 관리 기능 제공
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
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
import { Alert, AlertDescription } from '../ui/alert'
import {
  Play,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Settings,
  Database,
  BarChart3,
  StopCircle,
} from 'lucide-react'

export const BatchPage = () => {
  const { t } = useTranslation()

  // 상태 관리
  const [batchJobs, setBatchJobs] = useState([])
  const [jobHistory, setJobHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedJob, setSelectedJob] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)

  // 배치 작업 목록
  const BATCH_JOBS = [
    {
      id: 'weather_update',
      name: '날씨 데이터 업데이트',
      description: '실시간 날씨 데이터를 수집하고 업데이트합니다',
      icon: <Database className="h-4 w-4" />,
      category: 'data',
    },
    {
      id: 'destination_sync',
      name: '여행지 정보 동기화',
      description: '여행지 정보를 외부 API에서 동기화합니다',
      icon: <RefreshCw className="h-4 w-4" />,
      category: 'data',
    },
    {
      id: 'comprehensive_tourism_sync',
      name: '종합 관광정보 수집',
      description: '전체 관광정보를 수집하고 처리합니다',
      icon: <Database className="h-4 w-4" />,
      category: 'data',
    },
    {
      id: 'recommendation_update',
      name: '추천 점수 계산',
      description: '날씨 기반 여행지 추천 점수를 계산합니다',
      icon: <BarChart3 className="h-4 w-4" />,
      category: 'business',
    },
    {
      id: 'data_quality_check',
      name: '데이터 품질 검사',
      description: '데이터 무결성과 품질을 검사합니다',
      icon: <CheckCircle className="h-4 w-4" />,
      category: 'maintenance',
    },
    {
      id: 'log_cleanup',
      name: '로그 정리 및 아카이빙',
      description: '오래된 로그를 정리하고 아카이빙합니다',
      icon: <Settings className="h-4 w-4" />,
      category: 'maintenance',
    },
  ]

  /**
   * 배치 작업 실행
   */
  const executeBatchJob = useCallback(
    async (jobId) => {
      try {
        setIsExecuting(true)
        setError(null)

        const response = await authHttp.POST('/api/batch/execute', {
          job_id: jobId,
        })

        const data = await response.json()

        if (data.success) {
          // 성공 메시지 표시
          setError(null)
          // 작업 히스토리 새로고침
          await fetchJobHistory()
        } else {
          throw new Error(data.message || t('batch.execution_failed'))
        }
      } catch (err) {
        console.error('배치 작업 실행 실패:', err)
        setError(err.message || t('batch.execution_error'))
      } finally {
        setIsExecuting(false)
      }
    },
    [t],
  )

  /**
   * 배치 작업 상태 조회
   */
  const fetchBatchStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await authHttp.GET('/api/batch/status')
      const data = await response.json()

      if (data.success) {
        setBatchJobs(data.data || [])
      } else {
        throw new Error(data.message || t('batch.status_fetch_failed'))
      }
    } catch (err) {
      console.error('배치 상태 조회 실패:', err)
      setError(err.message || t('batch.status_error'))
    } finally {
      setLoading(false)
    }
  }, [t])

  /**
   * 배치 작업 히스토리 조회
   */
  const fetchJobHistory = useCallback(async () => {
    try {
      const response = await authHttp.GET('/api/batch/history?limit=20')
      const data = await response.json()

      if (data.success) {
        setJobHistory(data.data || [])
      } else {
        console.warn('배치 히스토리 조회 실패:', data.message)
      }
    } catch (err) {
      console.error('배치 히스토리 조회 실패:', err)
    }
  }, [])

  /**
   * 작업 상태에 따른 뱃지 속성
   */
  const getStatusBadge = (status) => {
    switch (status) {
      case 'running':
      case 'in_progress':
        return { variant: 'default', icon: <Activity className="h-3 w-3" /> }
      case 'completed':
      case 'success':
        return { variant: 'success', icon: <CheckCircle className="h-3 w-3" /> }
      case 'failed':
      case 'error':
        return { variant: 'destructive', icon: <XCircle className="h-3 w-3" /> }
      case 'cancelled':
        return {
          variant: 'secondary',
          icon: <StopCircle className="h-3 w-3" />,
        }
      default:
        return { variant: 'outline', icon: <Clock className="h-3 w-3" /> }
    }
  }

  /**
   * 작업 카테고리별 색상
   */
  const getCategoryColor = (category) => {
    switch (category) {
      case 'data':
        return 'text-blue-600 bg-blue-50'
      case 'business':
        return 'text-green-600 bg-green-50'
      case 'maintenance':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  // 초기 데이터 로드
  useEffect(() => {
    fetchBatchStatus()
    fetchJobHistory()
  }, [fetchBatchStatus, fetchJobHistory])

  // 주기적 상태 업데이트 (30초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBatchStatus()
      fetchJobHistory()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchBatchStatus, fetchJobHistory])

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('batch.title', '배치 관리')}
          </h2>
          <p className="text-muted-foreground">
            {t(
              'batch.description',
              '배치 작업을 수동으로 실행하고 모니터링합니다',
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchBatchStatus()
            fetchJobHistory()
          }}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
          />
          {t('common.refresh', '새로고침')}
        </Button>
      </div>

      {/* 오류 표시 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 배치 작업 실행 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('batch.execute_job', '배치 작업 실행')}</CardTitle>
          <CardDescription>
            {t(
              'batch.select_and_execute',
              '실행할 배치 작업을 선택하고 즉시 실행합니다',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedJob} onValueChange={setSelectedJob}>
              <SelectTrigger className="w-80">
                <SelectValue
                  placeholder={t('batch.select_job', '작업을 선택하세요')}
                />
              </SelectTrigger>
              <SelectContent>
                {BATCH_JOBS.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    <div className="flex items-center gap-2">
                      {job.icon}
                      <span>{job.name}</span>
                      <span
                        className={`ml-2 rounded px-2 py-1 text-xs ${getCategoryColor(job.category)}`}
                      >
                        {job.category}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => selectedJob && executeBatchJob(selectedJob)}
              disabled={!selectedJob || isExecuting}
              className="flex items-center gap-2"
            >
              {isExecuting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isExecuting
                ? t('batch.executing', '실행 중...')
                : t('batch.execute', '실행')}
            </Button>
          </div>

          {/* 선택된 작업 설명 */}
          {selectedJob && (
            <div className="bg-muted/50 mt-4 rounded-lg border p-3">
              {(() => {
                const job = BATCH_JOBS.find((j) => j.id === selectedJob)
                return job ? (
                  <div className="flex items-start gap-3">
                    {job.icon}
                    <div>
                      <h4 className="font-medium">{job.name}</h4>
                      <p className="text-muted-foreground text-sm">
                        {job.description}
                      </p>
                    </div>
                  </div>
                ) : null
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 최근 실행 히스토리 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('batch.execution_history', '실행 히스토리')}</CardTitle>
          <CardDescription>
            {t('batch.recent_executions', '최근 배치 작업 실행 기록입니다')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobHistory.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              {t('batch.no_history', '실행 히스토리가 없습니다')}
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('batch.job_name', '작업명')}</TableHead>
                    <TableHead>{t('batch.status', '상태')}</TableHead>
                    <TableHead>{t('batch.start_time', '시작 시간')}</TableHead>
                    <TableHead>{t('batch.duration', '소요 시간')}</TableHead>
                    <TableHead>{t('batch.message', '메시지')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobHistory.map((job, index) => {
                    const statusBadge = getStatusBadge(job.status)
                    const duration =
                      job.end_time && job.start_time
                        ? Math.round(
                            (new Date(job.end_time) -
                              new Date(job.start_time)) /
                              1000,
                          )
                        : null

                    return (
                      <TableRow key={`${job.job_id}-${index}`}>
                        <TableCell className="font-medium">
                          {BATCH_JOBS.find((j) => j.id === job.job_id)?.name ||
                            job.job_id}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusBadge.variant}
                            className="flex w-fit items-center gap-1"
                          >
                            {statusBadge.icon}
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {job.start_time
                            ? new Date(job.start_time).toLocaleString()
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {duration ? `${duration}초` : '-'}
                        </TableCell>
                        <TableCell className="max-w-md truncate text-sm">
                          {job.message || '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default BatchPage
