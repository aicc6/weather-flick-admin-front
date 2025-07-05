import { useState, useEffect, useCallback, useMemo } from 'react'
import { authHttp } from '../lib/http'

/**
 * 대시보드 데이터를 관리하는 커스텀 훅
 *
 * @returns {Object} 대시보드 데이터 및 상태
 */
export function useDashboardData() {
  // 관광지 대시보드 요약 데이터
  const [tourSummary, setTourSummary] = useState({ items: [], total: 0 })

  // 사용자/관리자 요약 데이터
  const [userSummary, setUserSummary] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  })

  const [adminSummary, setAdminSummary] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  })

  // DB 기반 날씨 요약 데이터
  const [weatherData, setWeatherData] = useState({})
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [weatherError, setWeatherError] = useState('')
  const [weatherLastUpdated, setWeatherLastUpdated] = useState(null)

  // 시스템 상태 요약 데이터
  const [systemStatus, setSystemStatus] = useState(null)

  // 날씨 데이터 조회 함수 (메모이제이션)
  const fetchWeatherData = useCallback(async () => {
    try {
      setWeatherLoading(true)
      setWeatherError('')

      const res = await authHttp.GET('/api/weather/summary-db')

      // Early Return - 응답 검증
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()

      // Early Return - 데이터 검증
      if (!data || !Array.isArray(data.regions)) {
        throw new Error('잘못된 데이터 형식입니다')
      }

      // Convert to { code: data } map for compatibility
      const regionMap = {}
      data.regions.forEach((region) => {
        if (!region) return

        const key = region.city_code || region.city_name
        if (!key) return

        regionMap[key] = {
          ...region,
          region_name: region.city_name,
          temperature: region.temperature,
          humidity: region.humidity,
          wind_speed: region.wind_speed,
          sky_condition: region.sky_condition,
        }
      })

      setWeatherData(regionMap)
      setWeatherLastUpdated(
        data.summary?.last_updated
          ? new Date(data.summary.last_updated)
          : new Date(),
      )
    } catch (error) {
      console.error('날씨 데이터 조회 실패:', error)
      setWeatherError(error.message || '날씨 데이터를 불러오는데 실패했습니다.')
      setWeatherData({})
    } finally {
      setWeatherLoading(false)
    }
  }, [])

  // 관광지 데이터 조회 함수 (메모이제이션)
  const fetchTourData = useCallback(async () => {
    try {
      const tourRes = await authHttp.GET('/api/tourist-attractions/', {
        params: { query: { limit: 3, offset: 0 } },
      })

      if (!tourRes.ok) {
        throw new Error(`HTTP ${tourRes.status}: ${tourRes.statusText}`)
      }

      const tourData = await tourRes.json()
      setTourSummary(tourData || { items: [], total: 0 })
    } catch (error) {
      console.error('관광지 데이터 로딩 실패:', error)
      setTourSummary({ items: [], total: 0 })
    }
  }, [])

  // 사용자 통계 조회 함수 (메모이제이션)
  const fetchUserStats = useCallback(async () => {
    try {
      const userRes = await authHttp.GET('/api/users/stats')

      if (!userRes.ok) {
        throw new Error(`HTTP ${userRes.status}: ${userRes.statusText}`)
      }

      const userData = await userRes.json()

      // 표준 응답 형식 또는 기존 형식 지원
      const stats = userData.success ? userData.data : userData
      setUserSummary({
        total: stats.total_users ?? stats.total ?? 0,
        active: stats.active_users ?? stats.active ?? 0,
        inactive: stats.inactive ?? 0,
      })
    } catch (error) {
      console.error('사용자 통계 로딩 실패:', error)
      setUserSummary({ total: 0, active: 0, inactive: 0 })
    }
  }, [])

  // 관리자 통계 조회 함수 (메모이제이션)
  const fetchAdminStats = useCallback(async () => {
    try {
      const adminRes = await authHttp.GET('/api/admins/stats')

      if (!adminRes.ok) {
        throw new Error(`HTTP ${adminRes.status}: ${adminRes.statusText}`)
      }

      const adminData = await adminRes.json()

      // 표준 응답 형식 또는 기존 형식 지원
      const stats = adminData.success ? adminData.data : adminData
      setAdminSummary({
        total: stats.total ?? 0,
        active: stats.active ?? 0,
        inactive: stats.inactive ?? 0,
      })
    } catch (error) {
      console.error('관리자 통계 로딩 실패:', error)
      setAdminSummary({ total: 0, active: 0, inactive: 0 })
    }
  }, [])

  // 시스템 상태 조회 함수 (메모이제이션)
  const fetchSystemStatus = useCallback(async () => {
    try {
      const systemRes = await authHttp.GET('/api/system/status')

      if (!systemRes.ok) {
        throw new Error(`HTTP ${systemRes.status}: ${systemRes.statusText}`)
      }

      const systemData = await systemRes.json()

      // 표준 응답 형식 지원
      if (systemData.success) {
        setSystemStatus(systemData.data)
      } else {
        // 기존 형식 지원
        setSystemStatus(systemData)
      }
    } catch (error) {
      console.error('시스템 상태 로딩 실패:', error)
      setSystemStatus(null)
    }
  }, [])

  // 전체 데이터 새로고침 함수 (메모이제이션)
  const refreshAllData = useCallback(async () => {
    await Promise.allSettled([
      fetchTourData(),
      fetchUserStats(),
      fetchAdminStats(),
      fetchSystemStatus(),
      fetchWeatherData(),
    ])
  }, [
    fetchTourData,
    fetchUserStats,
    fetchAdminStats,
    fetchSystemStatus,
    fetchWeatherData,
  ])

  // 초기 데이터 로딩
  useEffect(() => {
    refreshAllData()
  }, [refreshAllData])

  // 요약 통계 계산 (메모이제이션)
  const summaryStats = useMemo(
    () => ({
      totalUsers: userSummary.total + adminSummary.total,
      totalActiveUsers: userSummary.active + adminSummary.active,
      totalTouristAttractions: tourSummary.total,
      weatherRegionsCount: Object.keys(weatherData).length,
    }),
    [userSummary, adminSummary, tourSummary.total, weatherData],
  )

  return {
    // 기본 데이터
    tourSummary,
    userSummary,
    adminSummary,
    weatherData,
    weatherLoading,
    weatherError,
    weatherLastUpdated,
    systemStatus,

    // 계산된 통계
    summaryStats,

    // 액션 함수들
    refetchWeatherData: fetchWeatherData,
    refetchTourData: fetchTourData,
    refetchUserStats: fetchUserStats,
    refetchAdminStats: fetchAdminStats,
    refetchSystemStatus: fetchSystemStatus,
    refreshAllData,
  }
}
