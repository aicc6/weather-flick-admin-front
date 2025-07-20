import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseQuery'

// 관리자 백엔드의 baseQuery를 사용하여 배치 API 생성
// 이제 배치 작업 관리가 관리자 백엔드를 통해 이루어집니다

export const batchApi = createApi({
  reducerPath: 'batchApi',
  baseQuery, // 관리자 백엔드의 baseQuery 사용
  tagTypes: ['BatchJob', 'BatchStats'],
  endpoints: (builder) => ({
    // 배치 작업 목록 조회
    getBatchJobs: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()
        if (params.job_type) queryParams.append('job_type', params.job_type)
        if (params.status) queryParams.append('status', params.status)
        if (params.start_date)
          queryParams.append('start_date', params.start_date)
        if (params.end_date) queryParams.append('end_date', params.end_date)
        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())

        return `/api/batch/jobs?${queryParams.toString()}`
      },
      providesTags: ['BatchJob'],
    }),

    // 배치 작업 실행
    executeBatchJob: builder.mutation({
      query: ({ jobType, parameters = {}, priority = 5 }) => ({
        url: `/api/batch/jobs/${jobType}/execute`,
        method: 'POST',
        body: {
          parameters,
          priority,
        },
      }),
      invalidatesTags: ['BatchJob', 'BatchStats'],
    }),

    // 배치 작업 상세 조회
    getBatchJobDetail: builder.query({
      query: (jobId) => `/api/batch/jobs/${jobId}`,
      providesTags: (result, error, jobId) => [{ type: 'BatchJob', id: jobId }],
    }),

    // 배치 작업 상태 조회
    getBatchJobStatus: builder.query({
      query: (jobId) => `/api/batch/jobs/${jobId}/status`,
      providesTags: (result, error, jobId) => [{ type: 'BatchJob', id: jobId }],
    }),

    // 배치 작업 로그 조회
    getBatchJobLogs: builder.query({
      query: ({ jobId, level, page = 1, limit = 100 }) => {
        const queryParams = new URLSearchParams()
        if (level) queryParams.append('level', level)
        queryParams.append('page', page.toString())
        queryParams.append('limit', limit.toString())

        return `/api/batch/jobs/${jobId}/logs?${queryParams.toString()}`
      },
    }),

    // 배치 작업 중단
    stopBatchJob: builder.mutation({
      query: (jobId) => ({
        url: `/api/batch/jobs/${jobId}/stop`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, jobId) => [
        { type: 'BatchJob', id: jobId },
        'BatchJob',
      ],
    }),

    // 배치 작업 삭제
    deleteBatchJob: builder.mutation({
      query: (jobId) => ({
        url: `/api/batch/jobs/${jobId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BatchJob', 'BatchStats'],
    }),

    // 배치 작업 통계 조회
    getBatchStatistics: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()
        if (params.start_date)
          queryParams.append('start_date', params.start_date)
        if (params.end_date) queryParams.append('end_date', params.end_date)

        return `/api/batch/statistics?${queryParams.toString()}`
      },
      providesTags: ['BatchStats'],
    }),
  }),
})

export const {
  useGetBatchJobsQuery,
  useExecuteBatchJobMutation,
  useGetBatchJobDetailQuery,
  useGetBatchJobStatusQuery,
  useGetBatchJobLogsQuery,
  useStopBatchJobMutation,
  useDeleteBatchJobMutation,
  useGetBatchStatisticsQuery,
} = batchApi

// 배치 작업 타입 상수
export const BATCH_JOB_TYPES = {
  KTO_DATA_COLLECTION: 'KTO_DATA_COLLECTION',
  WEATHER_DATA_COLLECTION: 'WEATHER_DATA_COLLECTION',
  RECOMMENDATION_CALCULATION: 'RECOMMENDATION_CALCULATION',
  DATA_QUALITY_CHECK: 'DATA_QUALITY_CHECK',
  ARCHIVE_BACKUP: 'ARCHIVE_BACKUP',
  SYSTEM_HEALTH_CHECK: 'SYSTEM_HEALTH_CHECK',
  WEATHER_CHANGE_NOTIFICATION: 'WEATHER_CHANGE_NOTIFICATION',
}

// 배치 작업 상태 상수
export const BATCH_JOB_STATUS = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  STOPPED: 'STOPPED',
  STOPPING: 'STOPPING',
}

// 로그 레벨 상수
export const BATCH_LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
}

// 배치 작업 타입 한국어 매핑
export const BATCH_JOB_TYPE_LABELS = {
  [BATCH_JOB_TYPES.KTO_DATA_COLLECTION]: '한국관광공사 데이터 수집',
  [BATCH_JOB_TYPES.WEATHER_DATA_COLLECTION]: '기상청 날씨 데이터 수집',
  [BATCH_JOB_TYPES.RECOMMENDATION_CALCULATION]: '추천 점수 계산',
  [BATCH_JOB_TYPES.DATA_QUALITY_CHECK]: '데이터 품질 검사',
  [BATCH_JOB_TYPES.ARCHIVE_BACKUP]: '아카이빙 및 백업',
  [BATCH_JOB_TYPES.SYSTEM_HEALTH_CHECK]: '시스템 헬스체크',
  [BATCH_JOB_TYPES.WEATHER_CHANGE_NOTIFICATION]: '날씨 변경 알림',
}

// 배치 작업 상태 한국어 매핑
export const BATCH_JOB_STATUS_LABELS = {
  [BATCH_JOB_STATUS.PENDING]: '대기중',
  [BATCH_JOB_STATUS.RUNNING]: '실행중',
  [BATCH_JOB_STATUS.COMPLETED]: '완료',
  [BATCH_JOB_STATUS.FAILED]: '실패',
  [BATCH_JOB_STATUS.STOPPED]: '중단됨',
  [BATCH_JOB_STATUS.STOPPING]: '중단 중',
}

// 상태별 색상 매핑
export const BATCH_JOB_STATUS_COLORS = {
  [BATCH_JOB_STATUS.PENDING]: 'text-yellow-600 bg-yellow-100',
  [BATCH_JOB_STATUS.RUNNING]: 'text-blue-600 bg-blue-100',
  [BATCH_JOB_STATUS.COMPLETED]: 'text-green-600 bg-green-100',
  [BATCH_JOB_STATUS.FAILED]: 'text-red-600 bg-red-100',
  [BATCH_JOB_STATUS.STOPPED]: 'text-gray-600 bg-gray-100',
  [BATCH_JOB_STATUS.STOPPING]: 'text-orange-600 bg-orange-100',
}
