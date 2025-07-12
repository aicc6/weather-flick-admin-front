import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertCircle,
  Play,
  Square,
  MoreVertical,
  RefreshCw,
} from 'lucide-react'
import {
  useGetBatchJobsQuery,
  useExecuteBatchJobMutation,
  useStopBatchJobMutation,
  useGetBatchStatisticsQuery,
  BATCH_JOB_STATUS,
  BATCH_JOB_TYPE_LABELS,
  BATCH_JOB_STATUS_LABELS,
  BATCH_JOB_STATUS_COLORS,
} from '@/store/api/batchApi'
import { PageContainer, PageHeader, ContentSection } from '../layouts'

const BatchManagement = () => {
  const [jobTypeFilter, setJobTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedJobType, setSelectedJobType] = useState('')
  const [jobParameters, setJobParameters] = useState('')
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false)

  // API 호출
  const {
    data: jobsData,
    refetch: refetchJobs,
    isLoading: jobsLoading,
  } = useGetBatchJobsQuery({
    job_type: jobTypeFilter === 'all' ? undefined : jobTypeFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit: 10,
  })

  const { data: statsData, refetch: refetchStats } =
    useGetBatchStatisticsQuery()

  const [executeBatchJob] = useExecuteBatchJobMutation()
  const [stopBatchJob] = useStopBatchJobMutation()

  const handleExecuteJob = async () => {
    if (!selectedJobType) return

    try {
      let parameters = {}
      if (jobParameters.trim()) {
        parameters = JSON.parse(jobParameters)
      }

      await executeBatchJob({
        jobType: selectedJobType,
        parameters,
        priority: 5,
      }).unwrap()

      setExecuteDialogOpen(false)
      setSelectedJobType('')
      setJobParameters('')
      refetchJobs()
      refetchStats()
    } catch (error) {
      console.error('배치 작업 실행 실패:', error)
    }
  }

  const handleStopJob = async (jobId) => {
    try {
      await stopBatchJob(jobId).unwrap()
      refetchJobs()
      refetchStats()
    } catch (error) {
      console.error('배치 작업 중단 실패:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR')
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '-'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <PageContainer>
      <PageHeader
        title="배치 관리"
        description="시스템의 배치 작업을 관리하고 모니터링합니다."
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              refetchJobs()
              refetchStats()
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
          <Dialog open={executeDialogOpen} onOpenChange={setExecuteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Play className="mr-2 h-4 w-4" />
                작업 실행
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>배치 작업 실행</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="jobType">작업 유형</Label>
                  <Select
                    value={selectedJobType}
                    onValueChange={setSelectedJobType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="작업 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BATCH_JOB_TYPE_LABELS).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="parameters">매개변수 (JSON)</Label>
                  <Input
                    id="parameters"
                    placeholder='{"key": "value"}'
                    value={jobParameters}
                    onChange={(e) => setJobParameters(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setExecuteDialogOpen(false)}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleExecuteJob}
                    disabled={!selectedJobType}
                  >
                    실행
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <ContentSection>
        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="jobs">작업 목록</TabsTrigger>
            <TabsTrigger value="statistics">통계</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            {/* 필터 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="jobTypeFilter">작업 유형</Label>
                    <Select
                      value={jobTypeFilter}
                      onValueChange={setJobTypeFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="전체" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        {Object.entries(BATCH_JOB_TYPE_LABELS).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="statusFilter">상태</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="전체" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        {Object.entries(BATCH_JOB_STATUS_LABELS).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 작업 목록 */}
            <div className="space-y-4">
              {jobsLoading ? (
                <Card>
                  <CardContent className="py-6">
                    <div className="text-center">로딩 중...</div>
                  </CardContent>
                </Card>
              ) : jobsData?.jobs?.length > 0 ? (
                jobsData.jobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {BATCH_JOB_TYPE_LABELS[job.job_type]}
                            </h3>
                            <Badge
                              className={BATCH_JOB_STATUS_COLORS[job.status]}
                            >
                              {BATCH_JOB_STATUS_LABELS[job.status]}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>작업 ID: {job.id}</div>
                            <div>생성일: {formatDate(job.created_at)}</div>
                            {job.started_at && (
                              <div>시작일: {formatDate(job.started_at)}</div>
                            )}
                            {job.completed_at && (
                              <div>완료일: {formatDate(job.completed_at)}</div>
                            )}
                            {job.duration_seconds && (
                              <div>
                                실행 시간:{' '}
                                {formatDuration(job.duration_seconds)}
                              </div>
                            )}
                            {job.progress > 0 && (
                              <div>진행률: {job.progress.toFixed(1)}%</div>
                            )}
                          </div>
                          {job.error_message && (
                            <div className="flex items-center gap-2 text-sm text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              {job.error_message}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {job.status === BATCH_JOB_STATUS.RUNNING && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStopJob(job.id)}
                            >
                              <Square className="mr-1 h-4 w-4" />
                              중단
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-6">
                    <div className="text-center text-gray-500">
                      배치 작업이 없습니다.
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 페이지네이션 */}
            {jobsData && jobsData.total_pages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  이전
                </Button>
                <span className="flex items-center px-4">
                  {page} / {jobsData.total_pages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === jobsData.total_pages}
                  onClick={() => setPage(page + 1)}
                >
                  다음
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            {statsData && (
              <>
                {/* 전체 통계 */}
                <Card>
                  <CardHeader>
                    <CardTitle>전체 통계</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {statsData.total_jobs}
                        </div>
                        <div className="text-sm text-gray-600">총 작업 수</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {statsData.currently_running?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">실행 중</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {statsData.recent_failures?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">최근 실패</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {statsData.statistics_by_type
                            ?.reduce((sum, stat) => sum + stat.success_rate, 0)
                            ?.toFixed(1) || 0}
                          %
                        </div>
                        <div className="text-sm text-gray-600">평균 성공률</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 작업 유형별 통계 */}
                <Card>
                  <CardHeader>
                    <CardTitle>작업 유형별 통계</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {statsData.statistics_by_type?.map((stat) => (
                        <div
                          key={stat.job_type}
                          className="rounded-lg border p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-semibold">
                              {BATCH_JOB_TYPE_LABELS[stat.job_type]}
                            </h4>
                            <Badge variant="outline">
                              성공률: {stat.success_rate.toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
                            <div>
                              <div className="font-medium">총 작업</div>
                              <div>{stat.total_count}</div>
                            </div>
                            <div>
                              <div className="font-medium">완료</div>
                              <div className="text-green-600">
                                {stat.completed_count}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">실패</div>
                              <div className="text-red-600">
                                {stat.failed_count}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">실행 중</div>
                              <div className="text-blue-600">
                                {stat.running_count}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">평균 시간</div>
                              <div>
                                {formatDuration(stat.average_duration_seconds)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </ContentSection>
    </PageContainer>
  )
}

export default BatchManagement
