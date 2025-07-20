import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
import { AlertCircle, Play, RefreshCw } from 'lucide-react'
import {
  useGetBatchJobsQuery,
  useExecuteBatchJobMutation,
  useStopBatchJobMutation,
  useDeleteBatchJobMutation,
  useGetBatchStatisticsQuery,
  BATCH_JOB_STATUS,
  BATCH_JOB_TYPE_LABELS,
  BATCH_JOB_STATUS_LABELS,
  BATCH_JOB_STATUS_COLORS,
} from '@/store/api/batchApi'
import { PageContainer, PageHeader, ContentSection } from '@/layouts'
import BatchLogViewer from '@/components/batch/BatchLogViewer'
import BatchJobActions from '@/components/batch/BatchJobActions'

const BatchManagement = () => {
  const [jobTypeFilter, setJobTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedJobType, setSelectedJobType] = useState('')
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false)
  const [selectedJobForLogs, setSelectedJobForLogs] = useState(null)

  // 개별 파라미터 상태
  const [jobParams, setJobParams] = useState({
    // 공통 파라미터
    priority: 5,

    // WEATHER_DATA_COLLECTION 파라미터
    weather_regions: [],
    weather_days_back: 7,
    weather_forecast_days: 3,

    // KTO_DATA_COLLECTION 파라미터
    kto_content_types: [],
    kto_area_codes: [],
    kto_include_new_apis: true,
    kto_store_raw: true,

    // DATA_QUALITY_CHECK 파라미터
    quality_tables: [],
    quality_check_types: [],

    // RECOMMENDATION_CALCULATION 파라미터
    rec_calculation_type: 'full',
    rec_region_filter: [],

    // ARCHIVE_BACKUP 파라미터
    archive_backup_type: 'incremental',
    archive_retain_days: 30,

    // SYSTEM_HEALTH_CHECK 파라미터
    health_check_level: 'basic',
    health_notification_email: '',

    // WEATHER_CHANGE_NOTIFICATION 파라미터
    weather_notification_force_check: false,
    weather_notification_email: '',
    weather_notification_regions: [],
  })

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

  // 실행 중인 작업이 있는지 확인
  const hasRunningJobs = jobsData?.jobs?.some(
    (job) =>
      job.status === BATCH_JOB_STATUS.RUNNING ||
      job.status === BATCH_JOB_STATUS.PENDING,
  )

  const [executeBatchJob] = useExecuteBatchJobMutation()
  const [stopBatchJob] = useStopBatchJobMutation()
  const [deleteBatchJob, { isLoading: isDeleting }] =
    useDeleteBatchJobMutation()

  const handleExecuteJob = async () => {
    if (!selectedJobType) return

    try {
      // 작업 유형에 따라 파라미터 구성
      const parameters = buildParametersForJobType(selectedJobType, jobParams)

      await executeBatchJob({
        jobType: selectedJobType,
        parameters,
        priority: jobParams.priority,
      }).unwrap()

      setExecuteDialogOpen(false)
      setSelectedJobType('')
      // 파라미터 초기화
      setJobParams((prev) => ({
        ...prev,
        priority: 5,
      }))
      refetchJobs()
      refetchStats()
    } catch (error) {
      console.error('배치 작업 실행 실패:', error)
    }
  }

  // 작업 유형별 파라미터 구성 함수
  const buildParametersForJobType = (jobType, params) => {
    const baseParams = { priority: params.priority }

    switch (jobType) {
      case 'WEATHER_DATA_COLLECTION':
        return {
          ...baseParams,
          regions: params.weather_regions,
          days_back: params.weather_days_back,
          forecast_days: params.weather_forecast_days,
        }

      case 'KTO_DATA_COLLECTION':
        return {
          ...baseParams,
          content_types: params.kto_content_types,
          area_codes: params.kto_area_codes,
          include_new_apis: params.kto_include_new_apis,
          store_raw: params.kto_store_raw,
        }

      case 'DATA_QUALITY_CHECK':
        return {
          ...baseParams,
          tables: params.quality_tables,
          check_types: params.quality_check_types,
        }

      case 'RECOMMENDATION_CALCULATION':
        return {
          ...baseParams,
          calculation_type: params.rec_calculation_type,
          region_filter: params.rec_region_filter,
        }

      case 'ARCHIVE_BACKUP':
        return {
          ...baseParams,
          backup_type: params.archive_backup_type,
          retain_days: params.archive_retain_days,
        }

      case 'SYSTEM_HEALTH_CHECK':
        return {
          ...baseParams,
          check_level: params.health_check_level,
          notification_email: params.health_notification_email,
        }

      case 'WEATHER_CHANGE_NOTIFICATION':
        return {
          ...baseParams,
          force_check: params.weather_notification_force_check,
          notification_email: params.weather_notification_email,
          regions: params.weather_notification_regions,
        }

      default:
        return baseParams
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

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteBatchJob(jobId).unwrap()
      refetchJobs()
      refetchStats()
    } catch (error) {
      console.error('배치 작업 삭제 실패:', error)
      throw error
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
        <div className="flex items-center gap-4">
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
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
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

                {/* 공통 파라미터 */}
                <div>
                  <Label htmlFor="priority">우선순위 (1-10)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={jobParams.priority}
                    onChange={(e) =>
                      setJobParams((prev) => ({
                        ...prev,
                        priority: parseInt(e.target.value) || 5,
                      }))
                    }
                  />
                </div>

                {/* 작업 유형별 파라미터 */}
                {selectedJobType === 'WEATHER_DATA_COLLECTION' && (
                  <WeatherParametersForm
                    jobParams={jobParams}
                    setJobParams={setJobParams}
                  />
                )}

                {selectedJobType === 'KTO_DATA_COLLECTION' && (
                  <KtoParametersForm
                    jobParams={jobParams}
                    setJobParams={setJobParams}
                  />
                )}

                {selectedJobType === 'DATA_QUALITY_CHECK' && (
                  <QualityParametersForm
                    jobParams={jobParams}
                    setJobParams={setJobParams}
                  />
                )}

                {selectedJobType === 'RECOMMENDATION_CALCULATION' && (
                  <RecommendationParametersForm
                    jobParams={jobParams}
                    setJobParams={setJobParams}
                  />
                )}

                {selectedJobType === 'ARCHIVE_BACKUP' && (
                  <ArchiveParametersForm
                    jobParams={jobParams}
                    setJobParams={setJobParams}
                  />
                )}

                {selectedJobType === 'SYSTEM_HEALTH_CHECK' && (
                  <HealthCheckParametersForm
                    jobParams={jobParams}
                    setJobParams={setJobParams}
                  />
                )}

                {selectedJobType === 'WEATHER_CHANGE_NOTIFICATION' && (
                  <WeatherNotificationParametersForm
                    jobParams={jobParams}
                    setJobParams={setJobParams}
                  />
                )}

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
                              <div className="flex items-center gap-2">
                                <span>진행률:</span>
                                <div className="h-2 w-32 rounded-full bg-gray-200">
                                  <div
                                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                    style={{ width: `${job.progress}%` }}
                                  />
                                </div>
                                <span className="text-sm">
                                  {job.progress.toFixed(1)}%
                                </span>
                              </div>
                            )}
                            {job.current_step && (
                              <div className="text-sm text-blue-600">
                                <span className="font-medium">현재 단계:</span>{' '}
                                {job.current_step}
                              </div>
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
                          <BatchJobActions
                            job={job}
                            onViewLogs={setSelectedJobForLogs}
                            onStopJob={handleStopJob}
                            onDeleteJob={handleDeleteJob}
                            isDeleting={isDeleting}
                          />
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

        {/* 로그 뷰어 다이얼로그 */}
        <Dialog
          open={!!selectedJobForLogs}
          onOpenChange={(open) => !open && setSelectedJobForLogs(null)}
        >
          <DialogContent className="max-h-[90vh] w-full max-w-[80vw] overflow-hidden">
            <DialogHeader>
              <DialogTitle>배치 작업 로그</DialogTitle>
            </DialogHeader>
            {selectedJobForLogs && (
              <div className="h-[70vh] overflow-hidden">
                <BatchLogViewer
                  jobId={selectedJobForLogs}
                  jobType={
                    jobsData?.jobs?.find((job) => job.id === selectedJobForLogs)
                      ?.job_type
                  }
                  onClose={() => setSelectedJobForLogs(null)}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </ContentSection>
    </PageContainer>
  )
}

// 날씨 데이터 수집 파라미터 폼
const WeatherParametersForm = ({ jobParams, setJobParams }) => {
  const regionOptions = [
    { value: 'seoul', label: '서울' },
    { value: 'busan', label: '부산' },
    { value: 'daegu', label: '대구' },
    { value: 'incheon', label: '인천' },
    { value: 'gwangju', label: '광주' },
    { value: 'daejeon', label: '대전' },
    { value: 'ulsan', label: '울산' },
    { value: 'sejong', label: '세종' },
    { value: 'gyeonggi', label: '경기' },
    { value: 'gangwon', label: '강원' },
    { value: 'chungbuk', label: '충북' },
    { value: 'chungnam', label: '충남' },
    { value: 'jeonbuk', label: '전북' },
    { value: 'jeonnam', label: '전남' },
    { value: 'gyeongbuk', label: '경북' },
    { value: 'gyeongnam', label: '경남' },
    { value: 'jeju', label: '제주' },
  ]

  const handleRegionChange = (regionValue, checked) => {
    setJobParams((prev) => ({
      ...prev,
      weather_regions: checked
        ? [...prev.weather_regions, regionValue]
        : prev.weather_regions.filter((r) => r !== regionValue),
    }))
  }

  return (
    <div className="space-y-4 rounded border p-4">
      <h4 className="font-semibold">날씨 데이터 수집 설정</h4>

      <div>
        <Label>수집할 지역 (다중 선택 가능)</Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {regionOptions.map((region) => (
            <div key={region.value} className="flex items-center space-x-2">
              <Checkbox
                id={`weather-region-${region.value}`}
                checked={jobParams.weather_regions.includes(region.value)}
                onCheckedChange={(checked) =>
                  handleRegionChange(region.value, checked)
                }
              />
              <label
                htmlFor={`weather-region-${region.value}`}
                className="text-sm"
              >
                {region.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="weather_days_back">과거 데이터 수집 일수</Label>
        <Input
          id="weather_days_back"
          type="number"
          min="1"
          max="30"
          value={jobParams.weather_days_back}
          onChange={(e) =>
            setJobParams((prev) => ({
              ...prev,
              weather_days_back: parseInt(e.target.value) || 7,
            }))
          }
        />
      </div>

      <div>
        <Label htmlFor="weather_forecast_days">예보 수집 일수</Label>
        <Input
          id="weather_forecast_days"
          type="number"
          min="1"
          max="7"
          value={jobParams.weather_forecast_days}
          onChange={(e) =>
            setJobParams((prev) => ({
              ...prev,
              weather_forecast_days: parseInt(e.target.value) || 3,
            }))
          }
        />
      </div>
    </div>
  )
}

// KTO 데이터 수집 파라미터 폼
const KtoParametersForm = ({ jobParams, setJobParams }) => {
  const contentTypeOptions = [
    { value: '12', label: '관광지' },
    { value: '14', label: '문화시설' },
    { value: '15', label: '축제공연행사' },
    { value: '25', label: '여행코스' },
    { value: '28', label: '레포츠' },
    { value: '32', label: '숙박' },
    { value: '38', label: '쇼핑' },
    { value: '39', label: '음식점' },
  ]

  const areaCodeOptions = [
    { value: '1', label: '서울' },
    { value: '2', label: '인천' },
    { value: '3', label: '대전' },
    { value: '4', label: '대구' },
    { value: '5', label: '광주' },
    { value: '6', label: '부산' },
    { value: '7', label: '울산' },
    { value: '8', label: '세종' },
    { value: '31', label: '경기도' },
    { value: '32', label: '강원특별자치도' },
    { value: '33', label: '충청북도' },
    { value: '34', label: '충청남도' },
    { value: '35', label: '경상북도' },
    { value: '36', label: '경상남도' },
    { value: '37', label: '전라북도' },
    { value: '38', label: '전라남도' },
    { value: '39', label: '제주도' },
  ]

  const handleContentTypeChange = (value, checked) => {
    setJobParams((prev) => ({
      ...prev,
      kto_content_types: checked
        ? [...prev.kto_content_types, value]
        : prev.kto_content_types.filter((t) => t !== value),
    }))
  }

  const handleAreaCodeChange = (value, checked) => {
    setJobParams((prev) => ({
      ...prev,
      kto_area_codes: checked
        ? [...prev.kto_area_codes, value]
        : prev.kto_area_codes.filter((a) => a !== value),
    }))
  }

  return (
    <div className="space-y-4 rounded border p-4">
      <h4 className="font-semibold">KTO 데이터 수집 설정</h4>

      <div>
        <Label>콘텐츠 타입 (다중 선택 가능)</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {contentTypeOptions.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={`kto-content-${type.value}`}
                checked={jobParams.kto_content_types.includes(type.value)}
                onCheckedChange={(checked) =>
                  handleContentTypeChange(type.value, checked)
                }
              />
              <label htmlFor={`kto-content-${type.value}`} className="text-sm">
                {type.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>지역 코드 (다중 선택 가능)</Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {areaCodeOptions.map((area) => (
            <div key={area.value} className="flex items-center space-x-2">
              <Checkbox
                id={`kto-area-${area.value}`}
                checked={jobParams.kto_area_codes.includes(area.value)}
                onCheckedChange={(checked) =>
                  handleAreaCodeChange(area.value, checked)
                }
              />
              <label htmlFor={`kto-area-${area.value}`} className="text-sm">
                {area.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="kto_include_new_apis"
          checked={jobParams.kto_include_new_apis}
          onCheckedChange={(checked) =>
            setJobParams((prev) => ({
              ...prev,
              kto_include_new_apis: checked,
            }))
          }
        />
        <Label htmlFor="kto_include_new_apis">신규 API 포함</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="kto_store_raw"
          checked={jobParams.kto_store_raw}
          onCheckedChange={(checked) =>
            setJobParams((prev) => ({
              ...prev,
              kto_store_raw: checked,
            }))
          }
        />
        <Label htmlFor="kto_store_raw">원본 데이터 저장</Label>
      </div>
    </div>
  )
}

// 데이터 품질 검사 파라미터 폼
const QualityParametersForm = ({ jobParams, setJobParams }) => {
  const tableOptions = [
    { value: 'tourist_attractions', label: '관광지' },
    { value: 'accommodations', label: '숙박시설' },
    { value: 'restaurants', label: '음식점' },
    { value: 'festivals_events', label: '축제/행사' },
    { value: 'weather_forecasts', label: '날씨 예보' },
    { value: 'regions', label: '지역 정보' },
  ]

  const checkTypeOptions = [
    { value: 'completeness', label: '완성도 검사' },
    { value: 'accuracy', label: '정확성 검사' },
    { value: 'consistency', label: '일관성 검사' },
    { value: 'duplicates', label: '중복 검사' },
    { value: 'validity', label: '유효성 검사' },
  ]

  const handleTableChange = (value, checked) => {
    setJobParams((prev) => ({
      ...prev,
      quality_tables: checked
        ? [...prev.quality_tables, value]
        : prev.quality_tables.filter((t) => t !== value),
    }))
  }

  const handleCheckTypeChange = (value, checked) => {
    setJobParams((prev) => ({
      ...prev,
      quality_check_types: checked
        ? [...prev.quality_check_types, value]
        : prev.quality_check_types.filter((c) => c !== value),
    }))
  }

  return (
    <div className="space-y-4 rounded border p-4">
      <h4 className="font-semibold">데이터 품질 검사 설정</h4>

      <div>
        <Label>검사할 테이블 (다중 선택 가능)</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {tableOptions.map((table) => (
            <div key={table.value} className="flex items-center space-x-2">
              <Checkbox
                id={`quality-table-${table.value}`}
                checked={jobParams.quality_tables.includes(table.value)}
                onCheckedChange={(checked) =>
                  handleTableChange(table.value, checked)
                }
              />
              <label
                htmlFor={`quality-table-${table.value}`}
                className="text-sm"
              >
                {table.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>검사 유형 (다중 선택 가능)</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {checkTypeOptions.map((check) => (
            <div key={check.value} className="flex items-center space-x-2">
              <Checkbox
                id={`quality-check-${check.value}`}
                checked={jobParams.quality_check_types.includes(check.value)}
                onCheckedChange={(checked) =>
                  handleCheckTypeChange(check.value, checked)
                }
              />
              <label
                htmlFor={`quality-check-${check.value}`}
                className="text-sm"
              >
                {check.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 추천 계산 파라미터 폼
const RecommendationParametersForm = ({ jobParams, setJobParams }) => {
  const calculationTypeOptions = [
    { value: 'full', label: '전체 재계산' },
    { value: 'incremental', label: '증분 계산' },
    { value: 'specific', label: '특정 지역만' },
  ]

  const regionOptions = [
    { value: 'seoul', label: '서울' },
    { value: 'busan', label: '부산' },
    { value: 'jeju', label: '제주' },
    { value: 'gangwon', label: '강원' },
    { value: 'gyeonggi', label: '경기' },
  ]

  const handleRegionFilterChange = (value, checked) => {
    setJobParams((prev) => ({
      ...prev,
      rec_region_filter: checked
        ? [...prev.rec_region_filter, value]
        : prev.rec_region_filter.filter((r) => r !== value),
    }))
  }

  return (
    <div className="space-y-4 rounded border p-4">
      <h4 className="font-semibold">추천 계산 설정</h4>

      <div>
        <Label htmlFor="rec_calculation_type">계산 유형</Label>
        <Select
          value={jobParams.rec_calculation_type}
          onValueChange={(value) =>
            setJobParams((prev) => ({
              ...prev,
              rec_calculation_type: value,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {calculationTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {jobParams.rec_calculation_type === 'specific' && (
        <div>
          <Label>대상 지역 (다중 선택 가능)</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {regionOptions.map((region) => (
              <div key={region.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`rec-region-${region.value}`}
                  checked={jobParams.rec_region_filter.includes(region.value)}
                  onCheckedChange={(checked) =>
                    handleRegionFilterChange(region.value, checked)
                  }
                />
                <label
                  htmlFor={`rec-region-${region.value}`}
                  className="text-sm"
                >
                  {region.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 아카이브 백업 파라미터 폼
const ArchiveParametersForm = ({ jobParams, setJobParams }) => {
  const backupTypeOptions = [
    { value: 'full', label: '전체 백업' },
    { value: 'incremental', label: '증분 백업' },
    { value: 'differential', label: '차등 백업' },
  ]

  return (
    <div className="space-y-4 rounded border p-4">
      <h4 className="font-semibold">아카이브 백업 설정</h4>

      <div>
        <Label htmlFor="archive_backup_type">백업 유형</Label>
        <Select
          value={jobParams.archive_backup_type}
          onValueChange={(value) =>
            setJobParams((prev) => ({
              ...prev,
              archive_backup_type: value,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {backupTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="archive_retain_days">보관 기간 (일)</Label>
        <Input
          id="archive_retain_days"
          type="number"
          min="1"
          max="365"
          value={jobParams.archive_retain_days}
          onChange={(e) =>
            setJobParams((prev) => ({
              ...prev,
              archive_retain_days: parseInt(e.target.value) || 30,
            }))
          }
        />
      </div>
    </div>
  )
}

// 시스템 헬스체크 파라미터 폼
const HealthCheckParametersForm = ({ jobParams, setJobParams }) => {
  const checkLevelOptions = [
    { value: 'basic', label: '기본 검사' },
    { value: 'comprehensive', label: '종합 검사' },
    { value: 'critical', label: '중요 시스템만' },
  ]

  return (
    <div className="space-y-4 rounded border p-4">
      <h4 className="font-semibold">시스템 헬스체크 설정</h4>

      <div>
        <Label htmlFor="health_check_level">검사 수준</Label>
        <Select
          value={jobParams.health_check_level}
          onValueChange={(value) =>
            setJobParams((prev) => ({
              ...prev,
              health_check_level: value,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {checkLevelOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="health_notification_email">
          알림 이메일 (선택사항)
        </Label>
        <Input
          id="health_notification_email"
          type="email"
          placeholder="admin@example.com"
          value={jobParams.health_notification_email}
          onChange={(e) =>
            setJobParams((prev) => ({
              ...prev,
              health_notification_email: e.target.value,
            }))
          }
        />
      </div>
    </div>
  )
}

// 날씨 변경 알림 파라미터 폼
const WeatherNotificationParametersForm = ({ jobParams, setJobParams }) => {
  const regionOptions = [
    { value: 'seoul', label: '서울' },
    { value: 'busan', label: '부산' },
    { value: 'daegu', label: '대구' },
    { value: 'incheon', label: '인천' },
    { value: 'gwangju', label: '광주' },
    { value: 'daejeon', label: '대전' },
    { value: 'ulsan', label: '울산' },
    { value: 'sejong', label: '세종' },
    { value: 'gyeonggi', label: '경기' },
    { value: 'gangwon', label: '강원' },
    { value: 'chungbuk', label: '충북' },
    { value: 'chungnam', label: '충남' },
    { value: 'jeonbuk', label: '전북' },
    { value: 'jeonnam', label: '전남' },
    { value: 'gyeongbuk', label: '경북' },
    { value: 'gyeongnam', label: '경남' },
    { value: 'jeju', label: '제주' },
  ]

  const handleRegionChange = (regionValue, checked) => {
    setJobParams((prev) => ({
      ...prev,
      weather_notification_regions: checked
        ? [...prev.weather_notification_regions, regionValue]
        : prev.weather_notification_regions.filter((r) => r !== regionValue),
    }))
  }

  return (
    <div className="space-y-4 rounded border p-4">
      <h4 className="font-semibold">날씨 변경 알림 설정</h4>

      <div className="rounded bg-blue-50 p-3 text-sm text-gray-600">
        <p>
          📢 이 작업은 활성 여행 플랜의 날씨 변화를 감지하고 사용자에게 알림을
          전송합니다.
        </p>
        <p>• 온도 변화 5도 이상 또는 강수 확률 30% 이상 변화 시 알림</p>
        <p>• 하루에 한 번만 알림 (중복 방지)</p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="weather_notification_force_check"
          checked={jobParams.weather_notification_force_check}
          onCheckedChange={(checked) =>
            setJobParams((prev) => ({
              ...prev,
              weather_notification_force_check: checked,
            }))
          }
        />
        <Label htmlFor="weather_notification_force_check">
          강제 체크 (24시간 제한 무시)
        </Label>
      </div>

      <div>
        <Label>특정 지역만 체크 (선택사항, 미선택 시 전체 지역)</Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {regionOptions.map((region) => (
            <div key={region.value} className="flex items-center space-x-2">
              <Checkbox
                id={`weather-notification-region-${region.value}`}
                checked={jobParams.weather_notification_regions.includes(
                  region.value,
                )}
                onCheckedChange={(checked) =>
                  handleRegionChange(region.value, checked)
                }
              />
              <label
                htmlFor={`weather-notification-region-${region.value}`}
                className="text-sm"
              >
                {region.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="weather_notification_email">
          추가 알림 이메일 (선택사항)
        </Label>
        <Input
          id="weather_notification_email"
          type="email"
          placeholder="admin@example.com"
          value={jobParams.weather_notification_email}
          onChange={(e) =>
            setJobParams((prev) => ({
              ...prev,
              weather_notification_email: e.target.value,
            }))
          }
        />
        <div className="mt-1 text-sm text-gray-500">
          사용자 외에 추가로 알림을 받을 관리자 이메일
        </div>
      </div>
    </div>
  )
}

export default BatchManagement
