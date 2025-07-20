import { useMemo } from 'react'
import {
  useGetWeatherSummaryQuery,
  useGetUserStatsQuery,
  useGetAdminStatsQuery,
  useGetTravelCourseRegionCountQuery,
  useGetTouristAttractionsSummaryQuery,
} from '../store/api/dashboardApi'
import { useGetSystemStatusQuery } from '../store/api/systemApi'
import { useGetUsersQuery } from '../store/api/usersApi'

export function useDashboardData() {
  // 사용자 전체 목록 가져오기 (limit를 충분히 크게)
  const { data: usersData = {}, isLoading: usersLoading } = useGetUsersQuery({
    limit: 9999,
  })
  const users = usersData?.users || []

  // 기존 쿼리들 유지
  const { data: weatherResponse = null, isLoading: weatherLoading } =
    useGetWeatherSummaryQuery()
  
  // API 응답에서 regions 배열 추출
  const weatherData = weatherResponse?.regions || []
  const { data: adminStats = null, isLoading: adminLoading } =
    useGetAdminStatsQuery()
  const { data: regionCountData = null, isLoading: regionLoading } =
    useGetTravelCourseRegionCountQuery()
  const { data: tourSummary = null, isLoading: tourLoading } =
    useGetTouristAttractionsSummaryQuery()
  const { data: systemStatus = null, isLoading: systemLoading } =
    useGetSystemStatusQuery()

  // 전체 로딩 상태
  const isLoading =
    usersLoading ||
    weatherLoading ||
    adminLoading ||
    regionLoading ||
    tourLoading ||
    systemLoading

  // 데이터 정규화 및 기본값 설정
  const normalizedData = useMemo(() => {
    // 사용자 통계 직접 계산
    const total = users.length
    const active = users.filter((u) => u.is_active).length
    const inactive = total - active

    return {
      // 날씨 데이터 (배열 형태)
      weatherData: weatherData || [],

      // 사용자 통계 (직접 계산)
      userSummary: {
        total,
        active,
        inactive,
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
    users,
    adminStats,
    tourSummary,
    regionCountData,
    systemStatus,
  ])

  return { ...normalizedData, isLoading }
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
