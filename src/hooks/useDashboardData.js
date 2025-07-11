import { useMemo } from 'react'
import {
  useGetWeatherSummaryQuery,
  useGetUserStatsQuery,
  useGetAdminStatsQuery,
  useGetTravelCourseRegionCountQuery,
  useGetTouristAttractionsSummaryQuery,
} from '../store/api/dashboardApi'
import { useGetSystemStatusQuery } from '../store/api/systemApi'

export function useDashboardData() {
  // RTK Query 훅들 사용
  const { data: weatherData = null } = useGetWeatherSummaryQuery()
  const { data: userStats = null } = useGetUserStatsQuery()
  const { data: adminStats = null } = useGetAdminStatsQuery()
  const { data: regionCountData = null } = useGetTravelCourseRegionCountQuery()
  const { data: tourSummary = null } = useGetTouristAttractionsSummaryQuery()
  const { data: systemStatus = null } = useGetSystemStatusQuery()

  // 데이터 정규화 및 기본값 설정
  const normalizedData = useMemo(() => {
    return {
      // 날씨 데이터 (객체 형태로 변환됨)
      weatherData: weatherData || {},

      // 사용자 통계
      userSummary: {
        total: userStats?.total || 0,
        active: userStats?.active || 0,
        inactive: userStats?.inactive || 0,
      },

      // 관리자 통계
      adminSummary: {
        total: adminStats?.total || 0,
        active: adminStats?.active || 0,
        inactive: adminStats?.inactive || 0,
      },

      // 관광지 요약
      tourSummary: {
        total: tourSummary?.total || 0,
        recentItem: tourSummary?.recentItem || null,
      },

      // 지역 수
      regionCount: regionCountData?.count || regionCountData || 0,

      // 시스템 상태
      systemStatus: systemStatus || {
        service_status: '알 수 없음',
        database: { status: '알 수 없음' },
        external_apis: {},
      },
    }
  }, [
    weatherData,
    userStats,
    adminStats,
    tourSummary,
    regionCountData,
    systemStatus,
  ])

  return normalizedData
}

// 새로고침 기능을 위한 추가 훅
export function useDashboardRefresh() {
  const { refetch: refetchWeather } = useGetWeatherSummaryQuery()
  const { refetch: refetchUsers } = useGetUserStatsQuery()
  const { refetch: refetchAdmins } = useGetAdminStatsQuery()
  const { refetch: refetchRegions } = useGetTravelCourseRegionCountQuery()
  const { refetch: refetchTours } = useGetTouristAttractionsSummaryQuery()
  const { refetch: refetchSystem } = useGetSystemStatusQuery()

  const refetchAll = () => {
    refetchWeather()
    refetchUsers()
    refetchAdmins()
    refetchRegions()
    refetchTours()
    refetchSystem()
  }

  return { refetchAll }
}
