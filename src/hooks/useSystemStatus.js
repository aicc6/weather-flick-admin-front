/**
 * 시스템 상태 실시간 업데이트 훅
 * 주기적으로 시스템 상태를 체크하고 자동 업데이트 제공
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { authHttp } from '../lib/http'
import { normalizeStatusData } from '../utils/systemUtils'

/**
 * 시스템 상태 실시간 업데이트 훅
 * @param {Object} options - 설정 옵션
 * @param {number} options.refreshInterval - 새로고침 간격 (밀리초, 기본: 30초)
 * @param {boolean} options.autoRefresh - 자동 새로고침 활성화 (기본: true)
 * @param {number} options.retryDelay - 오류 시 재시도 지연 시간 (밀리초, 기본: 5초)
 * @param {number} options.maxRetries - 최대 재시도 횟수 (기본: 3)
 * @returns {Object} 시스템 상태 데이터 및 제어 함수
 */
export const useSystemStatus = (options = {}) => {
  const {
    refreshInterval = 30000, // 30초
    autoRefresh = true,
    retryDelay = 5000, // 5초
    maxRetries = 3,
  } = options

  const [systemStatus, setSystemStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  // useRef로 interval과 timeout ID 관리
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)
  const mountedRef = useRef(true)

  /**
   * 시스템 상태 조회 함수
   */
  const fetchSystemStatus = useCallback(
    async (isRetry = false) => {
      try {
        if (!isRetry) {
          setLoading(true)
        }

        const response = await authHttp.GET('/api/system/status')
        const data = await response.json()

        if (!mountedRef.current) return

        if (data.success) {
          const normalizedData = normalizeStatusData(data.data)
          setSystemStatus(normalizedData)
          setError(null)
          setRetryCount(0)
          setLastUpdated(new Date())
        } else {
          throw new Error(
            data.error?.message ||
              data.message ||
              '시스템 상태를 불러오지 못했습니다.',
          )
        }
      } catch (err) {
        if (!mountedRef.current) return

        console.error('System status fetch error:', err)
        setError(err.message || '시스템 상태를 불러오지 못했습니다.')

        // 재시도 로직
        if (retryCount < maxRetries) {
          setRetryCount((prev) => prev + 1)
          timeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              fetchSystemStatus(true)
            }
          }, retryDelay)
        }
      } finally {
        if (mountedRef.current && !isRetry) {
          setLoading(false)
        }
      }
    },
    [retryCount, maxRetries, retryDelay],
  )

  /**
   * 수동 새로고침 함수
   */
  const refresh = useCallback(() => {
    setRetryCount(0)
    fetchSystemStatus()
  }, [fetchSystemStatus])

  /**
   * 자동 새로고침 시작
   */
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        fetchSystemStatus(true)
      }
    }, refreshInterval)
  }, [refreshInterval, fetchSystemStatus])

  /**
   * 자동 새로고침 중지
   */
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    mountedRef.current = true
    fetchSystemStatus()

    return () => {
      mountedRef.current = false
    }
  }, [fetchSystemStatus])

  // 자동 새로고침 설정
  useEffect(() => {
    if (autoRefresh && !loading && !error) {
      startAutoRefresh()
    } else {
      stopAutoRefresh()
    }

    return stopAutoRefresh
  }, [autoRefresh, loading, error, startAutoRefresh, stopAutoRefresh])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopAutoRefresh()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [stopAutoRefresh])

  // 페이지 가시성 변경에 따른 자동 새로고침 제어
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoRefresh()
      } else if (autoRefresh && !loading && !error) {
        startAutoRefresh()
        // 페이지가 다시 보일 때 즉시 한 번 새로고침
        fetchSystemStatus(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [
    autoRefresh,
    loading,
    error,
    startAutoRefresh,
    stopAutoRefresh,
    fetchSystemStatus,
  ])

  return {
    // 상태 데이터
    systemStatus,
    loading,
    error,
    lastUpdated,
    retryCount,

    // 제어 함수
    refresh,
    startAutoRefresh,
    stopAutoRefresh,

    // 상태 정보
    isAutoRefreshing: !!intervalRef.current,
    maxRetries,
    refreshInterval,
  }
}

/**
 * 시스템 상태 간단 버전 훅 (자동 새로고침 없음)
 * @returns {Object} 시스템 상태 데이터
 */
export const useSystemStatusSimple = () => {
  return useSystemStatus({
    autoRefresh: false,
    refreshInterval: 0,
  })
}

/**
 * 시스템 상태 실시간 모니터링 훅 (짧은 간격)
 * @returns {Object} 시스템 상태 데이터
 */
export const useSystemStatusRealtime = () => {
  return useSystemStatus({
    refreshInterval: 10000, // 10초
    autoRefresh: true,
    retryDelay: 2000, // 2초
    maxRetries: 5,
  })
}

export default useSystemStatus
